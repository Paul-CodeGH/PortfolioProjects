use gtk4::prelude::*;
use gtk4::{Application, ApplicationWindow, Box, Button, CssProvider, Image, Orientation, GestureClick, Popover, Label, Separator, EventControllerMotion};
use gtk4_layer_shell::{Edge, Layer, LayerShell};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::PathBuf;
use serde::{Serialize, Deserialize};
use wayland_client::protocol::{wl_registry, wl_seat};
use wayland_client::{
    event_created_child, Connection, Dispatch, EventQueue, Proxy, QueueHandle,
};
use wayland_protocols_wlr::foreign_toplevel::v1::client::{
    zwlr_foreign_toplevel_handle_v1, zwlr_foreign_toplevel_manager_v1,
};

#[derive(Debug)]
enum WindowUpdate {
    Added(String, String),   // id, app_id
    Removed(String),        // id
    TogglePin(String),      // app_id
    MoveLeft(String),       // app_id
    MoveRight(String),      // app_id
}

#[derive(Debug)]
enum WaylandCommand {
    _Activate(String), // window id
}

struct WaylandState {
    tx: async_channel::Sender<WindowUpdate>,
    handles: HashMap<String, zwlr_foreign_toplevel_handle_v1::ZwlrForeignToplevelHandleV1>,
    seat: Option<wl_seat::WlSeat>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Config {
    pub pinned: Vec<String>,
    #[serde(default = "default_icon_size")]
    pub icon_size: i32,
    #[serde(default = "default_dock_height")]
    pub dock_height: i32,
    #[serde(default = "default_margin_bottom")]
    pub margin_bottom: i32,
    #[serde(default = "default_exclusive_zone")]
    pub exclusive_zone: i32,
    #[serde(default = "default_spacing")]
    pub spacing: i32,
    #[serde(default = "default_button_margin")]
    pub button_margin: i32,
    #[serde(default = "default_zoom_enabled")]
    pub zoom_enabled: bool,
    #[serde(default = "default_min_scale")]
    pub min_scale: f64,
    #[serde(default = "default_max_scale")]
    pub max_scale: f64,
    #[serde(default = "default_zoom_proximity")]
    pub zoom_proximity: f64,
}

fn default_icon_size() -> i32 { 48 }
fn default_dock_height() -> i32 { 100 }
fn default_margin_bottom() -> i32 { 12 }
fn default_exclusive_zone() -> i32 { 110 }
fn default_spacing() -> i32 { 4 }
fn default_button_margin() -> i32 { 6 }
fn default_zoom_enabled() -> bool { true }
fn default_min_scale() -> f64 { 1.0 }
fn default_max_scale() -> f64 { 1.3 }
fn default_zoom_proximity() -> f64 { 120.0 }

impl Default for Config {
    fn default() -> Self {
        Self {
            pinned: Vec::new(),
            icon_size: 48,
            dock_height: 100,
            margin_bottom: 12,
            exclusive_zone: 110,
            spacing: 4,
            button_margin: 6,
            zoom_enabled: true,
            min_scale: 1.0,
            max_scale: 1.3,
            zoom_proximity: 120.0,
        }
    }
}

impl Config {
    fn load() -> Self {
        let path = config_path();
        fs::read_to_string(path).map_or_else(
            |_| {
                let default = Self::default();
                default.save();
                default
            },
            |content| {
                let config: Self = serde_json::from_str(&content).unwrap_or_default();
                config.save();
                config
            },
        )
    }

    fn save(&self) {
        let path = config_path();
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        if let Ok(content) = serde_json::to_string_pretty(self) {
            let _ = fs::write(path, content);
        }
    }
}

fn config_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    PathBuf::from(home).join(".config/linuxdock/config.json")
}

impl Dispatch<wl_registry::WlRegistry, ()> for WaylandState {
    fn event(
        state: &mut Self,
        registry: &wl_registry::WlRegistry,
        event: wl_registry::Event,
        (): &(),
        _: &Connection,
        qh: &QueueHandle<Self>,
    ) {
        if let wl_registry::Event::Global {
            name,
            interface,
            version,
        } = event
        {
            if interface == "zwlr_foreign_toplevel_manager_v1" {
                registry.bind::<zwlr_foreign_toplevel_manager_v1::ZwlrForeignToplevelManagerV1, _, _>(
                    name,
                    version,
                    qh,
                    (),
                );
            } else if interface == "wl_seat" {
                let seat = registry.bind::<wl_seat::WlSeat, _, _>(name, version, qh, ());
                state.seat = Some(seat);
            }
        }
    }
}

impl Dispatch<wl_seat::WlSeat, ()> for WaylandState {
    fn event(
        _state: &mut Self,
        _seat: &wl_seat::WlSeat,
        _event: wl_seat::Event,
        (): &(),
        _: &Connection,
        _qh: &QueueHandle<Self>,
    ) {
    }
}

impl Dispatch<zwlr_foreign_toplevel_manager_v1::ZwlrForeignToplevelManagerV1, ()> for WaylandState {
    fn event(
        _state: &mut Self,
        _proxy: &zwlr_foreign_toplevel_manager_v1::ZwlrForeignToplevelManagerV1,
        _event: zwlr_foreign_toplevel_manager_v1::Event,
        (): &(),
        _: &Connection,
        _qh: &QueueHandle<Self>,
    ) {
    }

    event_created_child!(WaylandState, zwlr_foreign_toplevel_manager_v1::ZwlrForeignToplevelManagerV1, [
        zwlr_foreign_toplevel_manager_v1::EVT_TOPLEVEL_OPCODE => (zwlr_foreign_toplevel_handle_v1::ZwlrForeignToplevelHandleV1, ())
    ]);
}

impl Dispatch<zwlr_foreign_toplevel_handle_v1::ZwlrForeignToplevelHandleV1, ()> for WaylandState {
    fn event(
        state: &mut Self,
        proxy: &zwlr_foreign_toplevel_handle_v1::ZwlrForeignToplevelHandleV1,
        event: zwlr_foreign_toplevel_handle_v1::Event,
        (): &(),
        _: &Connection,
        _: &QueueHandle<Self>,
    ) {
        let id = format!("{:?}", proxy.id());
        match event {
            zwlr_foreign_toplevel_handle_v1::Event::AppId { app_id } => {
                state.handles.insert(id.clone(), proxy.clone());
                let _ = state.tx.send_blocking(WindowUpdate::Added(id, app_id));
            }
            zwlr_foreign_toplevel_handle_v1::Event::Closed => {
                state.handles.remove(&id);
                let _ = state.tx.send_blocking(WindowUpdate::Removed(id));
            }
            _ => {}
        }
    }
}

fn main() {
    let app = Application::builder()
        .application_id("com.example.linuxdock")
        .build();

    app.connect_activate(build_ui);
    app.run();
}

struct AppData {
    window_ids: HashSet<String>,
    button: Button,
    indicator: gtk4::Box,
    is_pinned: bool,
}

fn create_dock_button(app_id: &str, is_open: bool, icon_size: i32) -> (Button, gtk4::Box) {
    let btn = Button::new();
    let item_box = Box::builder()
        .orientation(Orientation::Vertical)
        .halign(gtk4::Align::Center)
        .valign(gtk4::Align::Center)
        .build();

    let icon_name = app_id.to_lowercase();
    let image = Image::from_icon_name(&icon_name);
    image.set_pixel_size(icon_size);
    
    let indicator = gtk4::Box::new(Orientation::Horizontal, 0);
    indicator.add_css_class("indicator");
    indicator.set_halign(gtk4::Align::Center);
    indicator.set_visible(is_open);

    item_box.append(&image);
    item_box.append(&indicator);
    
    btn.set_child(Some(&item_box));
    btn.set_tooltip_text(Some(app_id));
    
    (btn, indicator)
}

fn launch_app(app_id: &str) {
    let app_id = app_id.to_string();
    std::thread::spawn(move || {
        if let Some(app_info) = gtk4::gio::DesktopAppInfo::new(&format!("{app_id}.desktop")) {
            let _ = app_info.launch(&[], gtk4::gio::AppLaunchContext::NONE);
            return;
        }
        let lower = app_id.to_lowercase();
        if let Some(app_info) = gtk4::gio::DesktopAppInfo::new(&format!("{lower}.desktop")) {
            let _ = app_info.launch(&[], gtk4::gio::AppLaunchContext::NONE);
            return;
        }
        let _ = std::process::Command::new(&app_id).spawn();
    });
}

fn setup_css(config: &Config) {
    let provider = CssProvider::new();
    provider.load_from_data(&format!("
        window, .background {{
            background-color: transparent;
            background-image: none;
            box-shadow: none;
            border: none;
            margin: 0;
            padding: 0;
        }}
        .dock-container {{
            background-color: rgba(255, 255, 255, 0.15);
            border-radius: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 4px 16px;
        }}
        button {{
            background: none;
            background-color: transparent;
            border: none;
            box-shadow: none;
            outline: none;
            margin: 0px {}px;
            padding: 8px;
            transition: background-color 200ms ease-out;
        }}
        button:hover {{
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
        }}
        image {{
            /* No transition to keep icon zoom snappy and smooth */
        }}
        .indicator {{
            background-color: white;
            border-radius: 50%;
            margin-top: 4px;
            min-width: 5px;
            min-height: 5px;
            box-shadow: 0 0 4px rgba(255, 255, 255, 0.8);
        }}
        popover contents {{
            background-color: rgba(30, 30, 46, 0.98);
            padding: 8px;
            border-radius: 18px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
        }}
        .popover-header {{
            color: #89b4fa;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 6px 12px;
            opacity: 0.8;
        }}
        .popover-item {{
            padding: 10px 16px;
            border-radius: 10px;
            color: #cdd6f4;
            font-size: 14px;
            font-weight: 500;
            background: none;
            border: none;
            text-shadow: none;
            box-shadow: none;
        }}
        .popover-item:hover {{
            background-color: rgba(255, 255, 255, 0.08);
            transform: none;
        }}
        separator {{
            background-color: rgba(255, 255, 255, 0.05);
            margin: 4px 8px;
        }}
    ", config.button_margin));

    if let Some(display) = gtk4::gdk::Display::default() {
        gtk4::style_context_add_provider_for_display(
            &display,
            &provider,
            gtk4::STYLE_PROVIDER_PRIORITY_APPLICATION,
        );
    }
}

fn setup_motion_controller(event_widget: &Box, content_box: &Box, config: &Config) {
    let motion_controller = EventControllerMotion::new();
    let content_box_clone = content_box.clone();
    let event_widget_clone = event_widget.clone();
    let config_motion = config.clone();
    
    motion_controller.connect_motion(move |_, x, y| {
        if !config_motion.zoom_enabled { return; }
        
        let mut child = content_box_clone.first_child();
        while let Some(widget) = child {
            if let Some(btn) = widget.downcast_ref::<Button>()
                && let Some(item_box) = btn.child().and_then(|c| c.downcast::<Box>().ok())
                    && let Some(image) = item_box.first_child().and_then(|c| c.downcast::<Image>().ok()) {
                        let width = f64::from(widget.width());
                        let height = f64::from(widget.height());
                        
                        // Translate button center coordinates to event_widget coordinate space
                        let (bx, by) = widget.translate_coordinates(&event_widget_clone, width / 2.0, height / 2.0).unwrap_or((0.0, 0.0));
                        
                        let dx = x - bx;
                        let dy = y - by;
                        let dist = (dx*dx + dy*dy).sqrt();
                        
                        let scale = if dist < config_motion.zoom_proximity {
                            let factor = (1.0 - dist / config_motion.zoom_proximity).powf(1.2);
                            config_motion.min_scale + (config_motion.max_scale - config_motion.min_scale) * factor
                        } else {
                            config_motion.min_scale
                        };
                        
                        #[allow(clippy::cast_possible_truncation)]
                        image.set_pixel_size((f64::from(config_motion.icon_size) * scale) as i32);
                    }
            child = widget.next_sibling();
        }
    });

    let content_box_leave = content_box.clone();
    let config_leave = config.clone();
    motion_controller.connect_leave(move |_| {
        if !config_leave.zoom_enabled { return; }
        let mut child = content_box_leave.first_child();
        while let Some(widget) = child {
            if let Some(btn) = widget.downcast_ref::<Button>()
                && let Some(item_box) = btn.child().and_then(|c| c.downcast::<Box>().ok())
                    && let Some(image) = item_box.first_child().and_then(|c| c.downcast::<Image>().ok()) {
                        image.set_pixel_size(config_leave.icon_size);
                    }
            child = widget.next_sibling();
        }
    });
    
    event_widget.add_controller(motion_controller);
}

fn load_pinned_apps(
    content_box: &Box,
    config: &Config,
    tx_update: &async_channel::Sender<WindowUpdate>,
    tx_cmd: &async_channel::Sender<WaylandCommand>,
    apps: &mut HashMap<String, AppData>,
) {
    for app_id in &config.pinned {
        let (btn, indicator) = create_dock_button(app_id, false, config.icon_size);
        content_box.append(&btn);
        setup_button_signals(&btn, app_id.clone(), tx_update, tx_cmd);
        apps.insert(app_id.clone(), AppData {
            window_ids: HashSet::new(),
            button: btn,
            indicator,
            is_pinned: true,
        });
    }
}

fn setup_wayland_thread(
    tx_update: async_channel::Sender<WindowUpdate>,
    rx_cmd: async_channel::Receiver<WaylandCommand>,
) {
    std::thread::spawn(move || {
        let conn = Connection::connect_to_env().expect("Failed to connect to Wayland");
        let display = conn.display();
        let mut event_queue: EventQueue<WaylandState> = conn.new_event_queue();
        let qh = event_queue.handle();
        let _registry = display.get_registry(&qh, ());
        let mut state = WaylandState {
            tx: tx_update,
            handles: HashMap::new(),
            seat: None,
        };
        loop {
            while let Ok(_cmd) = rx_cmd.try_recv() {}
            event_queue.blocking_dispatch(&mut state).expect("Wayland dispatch failed");
        }
    });
}

fn setup_update_loop(
    window: ApplicationWindow,
    content_box: Box,
    tx_update: async_channel::Sender<WindowUpdate>,
    rx_update: async_channel::Receiver<WindowUpdate>,
    tx_cmd: async_channel::Sender<WaylandCommand>,
    mut apps: HashMap<String, AppData>,
) {
    let mut window_to_app: HashMap<String, String> = HashMap::new();
    
    glib::MainContext::default().spawn_local(async move {
        while let Ok(update) = rx_update.recv().await {
            let config = Config::load();
            match update {
                WindowUpdate::Added(id, app_id) => {
                    window_to_app.insert(id.clone(), app_id.clone());
                    if let Some(data) = apps.get_mut(&app_id) {
                        data.window_ids.insert(id);
                        data.indicator.set_visible(true);
                    } else {
                        let (btn, indicator) = create_dock_button(&app_id, true, config.icon_size);
                        content_box.append(&btn);
                        setup_button_signals(&btn, app_id.clone(), &tx_update, &tx_cmd);
                        let mut window_ids = HashSet::new();
                        window_ids.insert(id);
                        apps.insert(app_id, AppData {
                            window_ids,
                            button: btn,
                            indicator,
                            is_pinned: false,
                        });
                    }
                }
                WindowUpdate::Removed(id) => {
                    if let Some(app_id) = window_to_app.remove(&id)
                        && let Some(data) = apps.get_mut(&app_id) {
                            data.window_ids.remove(&id);
                            if data.window_ids.is_empty() {
                                if data.is_pinned {
                                    data.indicator.set_visible(false);
                                } else if let Some(data) = apps.remove(&app_id) {
                                    content_box.remove(&data.button);
                                }
                            }
                    }
                }
                WindowUpdate::TogglePin(app_id) => {
                    let mut config = Config::load();
                    if let Some(data) = apps.get_mut(&app_id) {
                        data.is_pinned = !data.is_pinned;
                        if data.is_pinned {
                            if !config.pinned.contains(&app_id) {
                                config.pinned.push(app_id.clone());
                            }
                        } else {
                            config.pinned.retain(|x| x != &app_id);
                            if data.window_ids.is_empty() && let Some(data) = apps.remove(&app_id) {
                                content_box.remove(&data.button);
                            }
                        }
                        config.save();
                    }
                }
                WindowUpdate::MoveLeft(app_id) => {
                    let mut config = Config::load();
                    if let Some(pos) = config.pinned.iter().position(|x| x == &app_id)
                        && pos > 0 {
                            config.pinned.swap(pos, pos - 1);
                            config.save();
                            rebuild_dock(&content_box, &mut apps, &window_to_app, &tx_update, &tx_cmd);
                    }
                }
                WindowUpdate::MoveRight(app_id) => {
                    let mut config = Config::load();
                    if let Some(pos) = config.pinned.iter().position(|x| x == &app_id)
                        && pos < config.pinned.len() - 1 {
                            config.pinned.swap(pos, pos + 1);
                            config.save();
                            rebuild_dock(&content_box, &mut apps, &window_to_app, &tx_update, &tx_cmd);
                    }
                }
            }
            window.queue_resize();
        }
    });
}

fn build_ui(app: &Application) {
    let config = Config::load();
    let window = ApplicationWindow::builder()
        .application(app)
        .title("Linux Dock")
        .decorated(false)
        .build();

    window.init_layer_shell();
    window.set_namespace(Some("dock"));
    window.set_layer(Layer::Top);
    window.set_anchor(Edge::Bottom, true);
    window.set_anchor(Edge::Left, true);
    window.set_anchor(Edge::Right, true);
    window.set_margin(Edge::Bottom, 0); // Remove window margin, handle internally
    
    window.set_default_size(1, config.dock_height);
    window.set_height_request(config.dock_height);
    window.set_exclusive_zone(config.exclusive_zone);

    setup_css(&config);

    let wrapper_box = Box::builder()
        .orientation(Orientation::Horizontal)
        .hexpand(true)
        .halign(gtk4::Align::Fill)
        .valign(gtk4::Align::Fill)
        .margin_bottom(config.margin_bottom) // Move margin here
        .build();

    let dock_box = Box::builder()
        .orientation(Orientation::Horizontal)
        .halign(gtk4::Align::Center)
        .valign(gtk4::Align::End)
        .hexpand(true)
        .build();
    dock_box.add_css_class("dock-container");

    let content_box = Box::builder()
        .orientation(Orientation::Horizontal)
        .halign(gtk4::Align::Center)
        .valign(gtk4::Align::Center)
        .hexpand(false)
        .spacing(config.spacing)
        .build();

    dock_box.append(&content_box);
    wrapper_box.append(&dock_box);
    window.set_child(Some(&wrapper_box));

    setup_motion_controller(&wrapper_box, &content_box, &config);

    let (tx_update, rx_update) = async_channel::unbounded::<WindowUpdate>();
    let (tx_cmd, rx_cmd) = async_channel::unbounded::<WaylandCommand>();

    let mut apps: HashMap<String, AppData> = HashMap::new();
    load_pinned_apps(&content_box, &config, &tx_update, &tx_cmd, &mut apps);

    setup_update_loop(window.clone(), content_box, tx_update.clone(), rx_update, tx_cmd, apps);
    setup_wayland_thread(tx_update, rx_cmd);

    window.present();
}

fn rebuild_dock(
    content_box: &gtk4::Box,
    apps: &mut HashMap<String, AppData>,
    window_to_app: &HashMap<String, String>,
    tx_update: &async_channel::Sender<WindowUpdate>,
    tx_cmd: &async_channel::Sender<WaylandCommand>,
) {
    let mut child = content_box.first_child();
    while let Some(c) = child {
        let next = c.next_sibling();
        content_box.remove(&c);
        child = next;
    }

    let config = Config::load();
    content_box.set_spacing(config.spacing);
    let mut processed_apps = HashSet::new();

    for app_id in &config.pinned {
        let is_open = window_to_app.values().any(|x| x == app_id);
        let (btn, indicator) = create_dock_button(app_id, is_open, config.icon_size);
        content_box.append(&btn);
        setup_button_signals(&btn, app_id.clone(), tx_update, tx_cmd);
        
        let window_ids = window_to_app.iter()
            .filter(|(_, aid)| **aid == *app_id)
            .map(|(wid, _)| wid.clone())
            .collect();

        apps.insert(app_id.clone(), AppData {
            window_ids,
            button: btn,
            indicator,
            is_pinned: true,
        });
        processed_apps.insert(app_id.clone());
    }

    let mut open_unpinned: Vec<String> = window_to_app.values()
        .filter(|aid| !processed_apps.contains(*aid))
        .cloned()
        .collect();
    open_unpinned.dedup();

    for app_id in open_unpinned {
        let (btn, indicator) = create_dock_button(&app_id, true, config.icon_size);
        content_box.append(&btn);
        setup_button_signals(&btn, app_id.clone(), tx_update, tx_cmd);
        
        let window_ids = window_to_app.iter()
            .filter(|(_, aid)| **aid == *app_id)
            .map(|(wid, _)| wid.clone())
            .collect();

        apps.insert(app_id.clone(), AppData {
            window_ids,
            button: btn,
            indicator,
            is_pinned: false,
        });
    }
}

fn setup_button_signals(btn: &Button, app_id: String, tx_update: &async_channel::Sender<WindowUpdate>, _tx_cmd: &async_channel::Sender<WaylandCommand>) {
    let gesture_right = GestureClick::new();
    gesture_right.set_button(3);
    let app_id_clone = app_id.clone();
    let tx_update_clone = tx_update.clone();
    let btn_weak = btn.downgrade();
    gesture_right.connect_pressed(move |_, _, x, y| {
        if let Some(btn) = btn_weak.upgrade() {
            let popover = Popover::new();
            popover.set_parent(&btn);
            #[allow(clippy::cast_possible_truncation)]
            popover.set_pointing_to(Some(&gtk4::gdk::Rectangle::new(x as i32, y as i32, 1, 1)));
            popover.set_has_arrow(true);
            
            let menu_box = Box::new(Orientation::Vertical, 0);
            
            let header = Label::builder()
                .label(app_id_clone.to_uppercase())
                .halign(gtk4::Align::Start)
                .build();
            header.add_css_class("popover-header");
            
            let separator = Separator::new(Orientation::Horizontal);
            
            let config = Config::load();
            let is_pinned = config.pinned.contains(&app_id_clone);
            
            let item_hbox = Box::new(Orientation::Horizontal, 12);
            let icon_name = if is_pinned { "list-remove-symbolic" } else { "bookmark-new-symbolic" };
            let action_icon = Image::from_icon_name(icon_name);
            let action_label = Label::new(Some(if is_pinned { "Remove from Dock" } else { "Keep in Dock" }));
            
            item_hbox.append(&action_icon);
            item_hbox.append(&action_label);
            
            let menu_btn = Button::new();
            menu_btn.set_child(Some(&item_hbox));
            menu_btn.add_css_class("popover-item");
            
            let pop_weak = popover.downgrade();
            let aid = app_id_clone.clone();
            let tx_up = tx_update_clone.clone();

            menu_btn.connect_clicked(move |_| {
                let _ = tx_up.send_blocking(WindowUpdate::TogglePin(aid.clone()));
                if let Some(pop) = pop_weak.upgrade() {
                    pop.popdown();
                }
            });

            menu_box.append(&header);
            menu_box.append(&separator);
            menu_box.append(&menu_btn);

            if is_pinned {
                let left_hbox = Box::new(Orientation::Horizontal, 12);
                left_hbox.append(&Image::from_icon_name("go-previous-symbolic"));
                left_hbox.append(&Label::new(Some("Move Left")));
                let left_btn = Button::new();
                left_btn.set_child(Some(&left_hbox));
                left_btn.add_css_class("popover-item");
                let tx_l = tx_update_clone.clone();
                let aid_l = app_id_clone.clone();
                let pop_l = popover.downgrade();
                left_btn.connect_clicked(move |_| {
                    let _ = tx_l.send_blocking(WindowUpdate::MoveLeft(aid_l.clone()));
                    if let Some(p) = pop_l.upgrade() { p.popdown(); }
                });

                let right_hbox = Box::new(Orientation::Horizontal, 12);
                right_hbox.append(&Image::from_icon_name("go-next-symbolic"));
                right_hbox.append(&Label::new(Some("Move Right")));
                let right_btn = Button::new();
                right_btn.set_child(Some(&right_hbox));
                right_btn.add_css_class("popover-item");
                let tx_r = tx_update_clone.clone();
                let aid_r = app_id_clone.clone();
                let pop_r = popover.downgrade();
                right_btn.connect_clicked(move |_| {
                    let _ = tx_r.send_blocking(WindowUpdate::MoveRight(aid_r.clone()));
                    if let Some(p) = pop_r.upgrade() { p.popdown(); }
                });

                menu_box.append(&left_btn);
                menu_box.append(&right_btn);
            }
            
            let pop_weak_closed = popover.downgrade();
            popover.connect_closed(move |_| {
                if let Some(p) = pop_weak_closed.upgrade() {
                    p.unparent();
                }
            });

            popover.set_child(Some(&menu_box));
            popover.popup();
        }
    });
    btn.add_controller(gesture_right);
    btn.connect_clicked(move |_| {
        launch_app(&app_id);
    });
}