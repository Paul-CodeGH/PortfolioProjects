# LinuxDock

A lightweight, modern dock for Linux Wayland compositors, built with Rust and GTK4.

LinuxDock uses GTK4 Layer Shell to provide a polished, smooth, and highly integrated desktop experience.

## Features

- **Window Tracking**: Automatically detects and displays icons for currently open applications.
- **Pinned Applications**: "Keep in Dock" functionality to keep your favorite apps accessible even when closed.
- **Interactive UI**: Click icons to launch or focus applications; right-click for a professional context menu.
- **Layer Shell Integration**: Stays anchored to the bottom of your screen and reserves space from the window manager.
- **Modern Design**: Glassmorphism aesthetic with semi-transparent backgrounds, blurs, and smooth animations.
- **Persistence**: Remembers your pinned applications across reboots.

## Compositor Compatibility

LinuxDock relies on specific Wayland protocols (`wlr-layer-shell` and `wlr-foreign-toplevel-management`) to function as a system component.

| Compositor | Status | Notes |
| :--- | :--- | :--- |
| **Hyprland** | ✅ Supported | Full support, works perfectly. |
| **Sway** | ✅ Supported | Full support, works perfectly. |
| **KDE Plasma 6** | ✅ Supported | Full support (ensure you are on version 6+). |
| **Wayfire / River** | ✅ Supported | Works well with wlroots-based compositors. |
| **GNOME** | ⚠️ Partial | Will appear as a normal window (Mutter lacks Layer Shell). |
| **X11** | ❌ Unsupported | Wayland session is strictly required. |

## Prerequisites

### Runtime Dependencies
To run the pre-built binary, you must have these libraries installed on your system:
- **GTK4**
- **GTK4 Layer Shell**
- **Wayland Client Libraries**
- **Standard C Library (libc)**

On most modern Wayland-based distributions, these are already present. If they are missing, you can install them using your package manager (e.g., `libgtk-4-1` and `libgtk4-layer-shell-0` on Debian/Ubuntu).

### Build-time Dependencies
If you are compiling from source, you need the following:

#### Rust
Install the Rust toolchain:
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### System Libraries
The project requires GTK4, GTK4 Layer Shell, and Wayland development headers.

#### Fedora / RHEL
```bash
sudo dnf groupinstall "Development Tools"
sudo dnf install gtk4-devel gtk4-layer-shell-devel libwayland-client-devel pkg-config
```

#### Debian / Ubuntu / Mint
```bash
sudo apt update
sudo apt install build-essential libgtk-4-dev libgtk4-layer-shell-dev libwayland-dev pkg-config
```

#### Arch Linux
```bash
sudo pacman -S base-devel gtk4 gtk4-layer-shell wayland pkgconf
```

## Getting Started

### 1. Clone and Enter
```bash
git clone https://github.com/Paul-CodeGH/LinuxDock.git
cd LinuxDock
```

### 2. Build and Run
The easiest way to start the dock is using Cargo:
```bash
cargo run --release
```

### 3. Installation & Autostart
To install the dock to your system and make it launch automatically on login, run the provided install script:
```bash
chmod +x install.sh
./install.sh
```

### 4. Uninstallation
To remove the dock and its autostart configuration from your system:
```bash
chmod +x uninstall.sh
./uninstall.sh
```

> **Note**: LinuxDock requires a Wayland compositor that supports the Layer Shell protocol (like Hyprland, Sway, or KDE Plasma 6). It will not function correctly on GNOME or X11.

## Configuration

LinuxDock can be customized via a JSON configuration file located at:
`~/.config/linuxdock/config.json`

The file is automatically created with default values on the first run.

### Available Settings

| Key | Description | Default |
| :--- | :--- | :--- |
| `pinned` | List of application IDs to keep permanently in the dock. | `[]` |
| `icon_size` | The pixel size of the application icons. | `48` |
| `dock_height` | The total height of the dock window. | `84` |
| `margin_bottom` | The distance between the dock and the bottom of the screen. | `12` |
| `exclusive_zone` | Space reserved from the window manager (prevents maximized windows from overlapping). | `96` |
| `spacing` | Internal spacing between elements inside the dock. | `4` |
| `button_margin` | Horizontal margin between application buttons. | `6` |
| `zoom_enabled` | Whether to enable the icon zoom effect on hover. | `true` |
| `min_scale` | Minimum scale factor for icons. | `1.0` |
| `max_scale` | Maximum scale factor for icons. | `1.3` |
| `zoom_proximity` | The distance (in pixels) at which the zoom effect starts. | `120.0` |

You can manually edit this file or use the right-click menu within the dock to manage pinned applications.

## License

This project is licensed under the MIT License - see the LICENSE file for details (if applicable).
