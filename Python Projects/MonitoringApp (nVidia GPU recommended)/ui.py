import tkinter as tk
from tkinter import ttk
import asyncio
import threading
from monitor import SystemMonitor
from graph import GraphCanvas

class SystemMonitorApp:
    def __init__(self):
        self.monitor = SystemMonitor()

        self.root = tk.Tk()
        self.root.title("System Monitor Python App")
        self.root.geometry("600x400")
        self.root.resizable(False, False)
        
        

        self.title_bar = tk.Frame(self.root, bg="gray", relief="raised", bd=2)
        self.title_bar.pack(fill=tk.X)
        

        self.cpu_label = ttk.Label(self.root, text="CPU Usage: 0%", font=("Arial", 12))
        self.cpu_label.pack()
        
        self.ram_label = ttk.Label(self.root, text="RAM Usage: 0%", font=("Arial", 12))
        self.ram_label.pack()
        
        self.gpu_label = ttk.Label(self.root, text="GPU Usage: 0%", font=("Arial", 12))
        self.gpu_label.pack()

        self.disk_labels = []
        self.disk_bars = []
        for i in range(3):
            label = ttk.Label(self.root, text="Disk: ", font=("Arial", 10))
            label.pack()
            bar = ttk.Progressbar(self.root, length=200, mode='determinate')
            bar.pack()
            self.disk_labels.append(label)
            self.disk_bars.append(bar)

        self.graph_canvas = GraphCanvas(self.root)

        threading.Thread(target=self.run_async_loop, daemon=True).start()
        

    def update_ui(self, data):
        self.cpu_label.config(text=f"CPU Usage: {data['cpu']}%")
        self.ram_label.config(text=f"RAM Usage: {data['ram']}%")
        self.gpu_label.config(text=f"GPU Usage: {data['gpu']}%")

        for i, (disk, usage) in enumerate(data['disk']):
            if i < len(self.disk_labels):
                self.disk_labels[i].config(text=f"{disk} Free: {100 - usage:.2f}%")
                self.disk_bars[i]['value'] = usage

        self.graph_canvas.update_graph(data['cpu'], data['ram'], data['gpu'])

    def run_async_loop(self):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(self.monitor.monitor_loop(self.update_ui))

    def run(self):
        self.root.mainloop()
