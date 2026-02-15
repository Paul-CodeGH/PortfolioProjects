#!/bin/bash

# LinuxDock Installation Script
set -e

echo "🚀 Starting LinuxDock installation..."

# 1. Check for dependencies
if ! command -v cargo &> /dev/null; then
    echo "❌ Error: 'cargo' is not installed. Please install Rust first: https://sh.rustup.rs"
    exit 1
fi

# 2. Build the project
echo "🛠️  Building in release mode (this may take a minute)..."
cargo build --release

# 3. Install the binary
echo "📂 Installing binary to /usr/local/bin/linuxdock (may ask for sudo password)..."
sudo cp target/release/LinuxDock /usr/local/bin/linuxdock
sudo chmod +x /usr/local/bin/linuxdock

# 4. Setup Autostart
echo "🔄 Setting up launch on login..."
mkdir -p "$HOME/.config/autostart"
cat <<EOF > "$HOME/.config/autostart/linuxdock.desktop"
[Desktop Entry]
Type=Application
Exec=/usr/local/bin/linuxdock
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Name=LinuxDock
Comment=Modern Wayland Dock
EOF

# 5. Success message
echo "✅ Installation complete!"
echo "✨ You can now start the dock by typing 'linuxdock' in your terminal."
echo "🌅 It will also start automatically every time you log in."
