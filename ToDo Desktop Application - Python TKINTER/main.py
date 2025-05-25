import tkinter as tk
from tkinter import messagebox
import sqlite3

# === Main Window Setup ===
root = tk.Tk()  # Create the main application window
root.title("To-Do App")  # Set the window title
root.geometry("1000x500")  # Give the window an initial size

# --- Sidebar (Dashboard) ---
dashboard_frame = tk.Frame(root, width=200, bg="lightgray")  # A fixed-width panel on the left
dashboard_frame.pack(side="left", fill="y")  # Stick it to the left edge, full height

# --- Canvas Area for Tasks ---
canvas_frame = tk.Frame(root)  # Container for canvas + scrollbars
canvas_frame.pack(side="right", fill="both", expand=True)  # Fill remaining space

# The canvas is where we'll render draggable task cards and the input form
content_canvas = tk.Canvas(canvas_frame, bg="white")
content_canvas.pack(side="left", fill="both", expand=True)

# Vertical scrollbar for up/down scrolling
v_scrollbar = tk.Scrollbar(canvas_frame, orient="vertical", command=content_canvas.yview)
v_scrollbar.pack(side="right", fill="y")

# Horizontal scrollbar for left/right scrolling
h_scrollbar = tk.Scrollbar(root, orient="horizontal", command=content_canvas.xview)
h_scrollbar.pack(side="bottom", fill="x")

# Link scrollbars to the canvas view
content_canvas.configure(
    yscrollcommand=v_scrollbar.set,
    xscrollcommand=h_scrollbar.set
)

# === Zoom State ===
current_scale = 1.0  # Tracks the current zoom level (1.0 = 100%)

def update_scrollregion(_=None):
    """
    Recalculates the canvas's scrollable area to include all items.
    Called whenever the canvas size or contents change.
    """
    content_canvas.configure(scrollregion=content_canvas.bbox("all"))

# Ensure scrollregion updates when the canvas itself is resized
content_canvas.bind("<Configure>", update_scrollregion)

# === Mouse Wheel Scrolling ===
def on_mousewheel(event):
    """
    Scrolls the canvas vertically or horizontally.
    Holding Shift (state bit 0x0001) switches to horizontal scrolling.
    """
    if event.state & 0x0001:  # Shift key held?
        content_canvas.xview_scroll(int(-1 * (event.delta / 120)), "units")
    else:
        content_canvas.yview_scroll(int(-1 * (event.delta / 120)), "units")

# Bind the wheel events when the mouse enters/exits the canvas frame
canvas_frame.bind("<Enter>", lambda e: content_canvas.bind_all("<MouseWheel>", on_mousewheel))
canvas_frame.bind("<Leave>", lambda e: content_canvas.unbind_all("<MouseWheel>"))

# === Zooming with Ctrl + Mouse Wheel ===
def on_zoom(event):
    """
    Scales all canvas items around the mouse pointer.
    Zooms in if wheel delta > 0, out if delta < 0.
    """
    global current_scale
    factor = 1.1 if event.delta > 0 else 0.9  # Zoom in/out factor
    current_scale *= factor

    # Convert the mouse position to canvas coordinates
    x = content_canvas.canvasx(event.x)
    y = content_canvas.canvasy(event.y)

    # Scale everything on the canvas relative to (x, y)
    content_canvas.scale("all", x, y, factor, factor)
    update_scrollregion()  # Refresh scrollable bounds

    return "break"  # Prevent the default scroll behavior

# Bind Ctrl+Wheel to the zoom handler
content_canvas.bind("<Control-MouseWheel>", on_zoom)

# === Database Setup ===
conn = sqlite3.connect('todo.db')  # Connect to (or create) the SQLite file
c = conn.cursor()
c.execute('''
    CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        position INTEGER,
        x INTEGER DEFAULT 10,
        y INTEGER DEFAULT 100
    )
''')
conn.commit()  # Save any changes (e.g., new table)

# === Drag-and-Drop State ===
drag_data = {
    "win_id": None,    # Canvas window item identifier
    "start_x": 0,      # Mouse X at drag start
    "start_y": 0,      # Mouse Y at drag start
    "orig_x": 0,       # Original item X before drag
    "orig_y": 0        # Original item Y before drag
}

# === Core Functions to Build UI ===

def show_actual_todo():
    """
    Clears the canvas and draws:
      1. The "Actual To Do" title
      2. The add-task form
      3. All pending tasks as draggable cards
    """
    content_canvas.delete("all")

    # Draw the heading label
    lbl = tk.Label(content_canvas, text="Actual To Do", font=("Arial", 20))
    content_canvas.create_window((10 * current_scale, 10 * current_scale),
                                 window=lbl, anchor="nw")

    # Build the input form for new tasks
    input_frame = tk.Frame(content_canvas, bd=2, relief="groove", padx=10, pady=10)
    content_canvas.create_window((10 * current_scale, 50 * current_scale),
                                 window=input_frame, anchor="nw")

    # Title entry field
    title_entry = tk.Entry(input_frame, width=30)
    title_entry.pack(pady=5)
    title_entry.insert(0, "Title")

    # Description entry field
    desc_entry = tk.Entry(input_frame, width=30)
    desc_entry.pack(pady=5)
    desc_entry.insert(0, "Description")

    # Button to add the new task into the DB
    tk.Button(input_frame, text="Add Task",
              command=lambda: add_task(title_entry.get(), desc_entry.get())
    ).pack(pady=10)

    # Finally, load any existing tasks
    load_actual_todos()


def show_history_todo():
    """
    Clears the canvas and draws finished tasks under "History To Do".
    """
    content_canvas.delete("all")

    # Heading for history
    lbl = tk.Label(content_canvas, text="History To Do", font=("Arial", 20))
    content_canvas.create_window((10 * current_scale, 10 * current_scale),
                                 window=lbl, anchor="nw")

    load_history_todos()


def add_task(title, description):
    """
    Inserts a new "pending" task into the database at the next position.
    If the title is empty, shows a warning.
    """
    if not title.strip():
        messagebox.showwarning("Input Error", "Title cannot be empty")
        return

    # Find highest existing position, defaulting to 0
    c.execute("SELECT MAX(position) FROM todos WHERE status='pending'")
    max_pos = c.fetchone()[0] or 0

    # Insert the new record with default x,y coordinates
    c.execute("""
        INSERT INTO todos (title, description, status, position, x, y)
        VALUES (?, ?, 'pending', ?, 10, 100)
    """, (title, description, max_pos + 1))
    conn.commit()

    # Refresh the main view
    show_actual_todo()


def finish_task(tid):
    """
    Marks a task as finished (moves it to history) by its ID.
    """
    c.execute("UPDATE todos SET status='finished' WHERE id=?", (tid,))
    conn.commit()
    show_actual_todo()


def delete_task(tid):
    """
    Removes a task from the database entirely.
    """
    c.execute("DELETE FROM todos WHERE id=?", (tid,))
    conn.commit()
    show_actual_todo()


def load_actual_todos():
    """
    Queries all pending tasks, then for each:
      - Creates a frame with labels/buttons
      - Places it at its stored (x, y) scaled by current zoom
      - Hooks up drag & drop handlers
    """
    c.execute("""
        SELECT id, title, description, x, y
        FROM todos
        WHERE status='pending'
        ORDER BY position
    """)
    for tid, title, desc, base_x, base_y in c.fetchall():
        # Compute where it should appear on the zoomed canvas
        zx, zy = base_x * current_scale, base_y * current_scale

        # Build the card frame
        frame = tk.Frame(content_canvas, bd=2, relief="groove", padx=10, pady=10)
        tk.Label(frame, text=title, font=("Arial", 14, "bold")).pack(anchor="w")
        tk.Label(frame, text=desc, font=("Arial", 12)).pack(anchor="w")

        # Buttons to finish or delete
        btnf = tk.Frame(frame)
        btnf.pack(anchor="w", pady=5)
        tk.Button(btnf, text="Finish", command=lambda t=tid: finish_task(t)).pack(side="left", padx=5)
        tk.Button(btnf, text="Delete", command=lambda t=tid: delete_task(t)).pack(side="left", padx=5)

        # Place the frame on the canvas and keep references
        win_id = content_canvas.create_window((zx, zy), window=frame, anchor="nw")
        frame.win_id = win_id
        frame.todo_id = tid

        # Bind drag events so user can freely move the card
        frame.bind("<Button-1>", on_drag_start)
        frame.bind("<B1-Motion>", on_drag_motion)
        frame.bind("<ButtonRelease-1>", on_drag_release)


def load_history_todos():
    """
    Queries all finished tasks and lays them out in a row.
    """
    x = 10 * current_scale
    for tid, title, desc in c.execute("SELECT id, title, description FROM todos WHERE status='finished'"):
        frame = tk.Frame(content_canvas, bd=2, relief="groove", padx=10, pady=10)
        tk.Label(frame, text=title, font=("Arial", 14, "bold")).pack(anchor="w")
        tk.Label(frame, text=desc, font=("Arial", 12)).pack(anchor="w")
        tk.Button(frame, text="Delete", command=lambda t=tid: delete_task(t)).pack(anchor="w", pady=5)

        # Each finished card is just laid out horizontally
        content_canvas.create_window((x, 50 * current_scale), window=frame, anchor="nw")
        x += 220 * current_scale


# === Drag & Drop Handlers ===

def on_drag_start(event):
    """
    Captures which canvas window item is being dragged,
    along with the starting mouse & item positions.
    """
    w = event.widget
    # If we clicked inside a nested widget, walk up to the frame
    while not hasattr(w, "win_id"):
        w = w.master
    drag_data["win_id"] = w.win_id
    drag_data["start_x"] = event.x_root
    drag_data["start_y"] = event.y_root
    drag_data["orig_x"], drag_data["orig_y"] = content_canvas.coords(w.win_id)


def on_drag_motion(event):
    """
    Moves the selected canvas window item as the mouse moves.
    """
    dx = event.x_root - drag_data["start_x"]
    dy = event.y_root - drag_data["start_y"]
    new_x = drag_data["orig_x"] + dx
    new_y = drag_data["orig_y"] + dy
    content_canvas.coords(drag_data["win_id"], new_x, new_y)


def on_drag_release(event):
    """
    When the mouse button is released, compute the card’s new
    position in the “base” coordinate system, update the DB, and clear drag state.
    """
    win_id = drag_data["win_id"]
    if win_id is None:
        return

    # Get final canvas coords, then convert back to unscaled values
    x, y = content_canvas.coords(win_id)
    base_x = x / current_scale
    base_y = y / current_scale

    # Find the associated task ID from the frame widget
    widget = content_canvas.nametowidget(content_canvas.itemcget(win_id, "window"))
    tid = widget.todo_id

    # Persist new position
    c.execute("UPDATE todos SET x=?, y=? WHERE id=?", (int(base_x), int(base_y), tid))
    conn.commit()

    # Reset drag data
    drag_data["win_id"] = None


# === Dashboard Buttons ===
tk.Button(dashboard_frame, text="Actual To Do", command=show_actual_todo).pack(pady=10)
tk.Button(dashboard_frame, text="History To Do", command=show_history_todo).pack(pady=10)

# Initial display
show_actual_todo()

# Start the application’s event loop
root.mainloop()
conn.close()
