#!/bin/bash

# LinuxDock Uninstallation Script
set -e

echo "🗑️  Starting LinuxDock uninstallation..."

# 1. Remove the binary
if [ -f /usr/local/bin/linuxdock ]; then
    echo "📂 Removing binary from /usr/local/bin/linuxdock (may ask for sudo password)..."
    sudo rm /usr/local/bin/linuxdock
else
    echo "ℹ️  Binary not found in /usr/local/bin/linuxdock, skipping."
fi

# 2. Remove Autostart entry
if [ -f "$HOME/.config/autostart/linuxdock.desktop" ]; then
    echo "🔄 Removing autostart entry..."
    rm "$HOME/.config/autostart/linuxdock.desktop"
else
    echo "ℹ️  Autostart entry not found, skipping."
fi

# 3. Success message
echo "✅ Uninstallation complete!"
echo "✨ LinuxDock has been removed from your system."
