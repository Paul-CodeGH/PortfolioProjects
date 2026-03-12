//
//  BlossomCalendarApp.swift
//  BlossomCalendar
//
//  Created by Paul-Adrian Moldovan on 25.01.26.
//

import SwiftUI
#if os(macOS)
import AppKit
#endif

@main
struct BlossomCalendarApp: App {
    #if os(macOS)
    init() {
        NSApplication.shared.setActivationPolicy(.accessory)
    }
    #endif

    var body: some Scene {
        #if os(macOS)
        MenuBarExtra("BlossomCalendar", systemImage: "calendar") {
            CalendarView()
        }
        .menuBarExtraStyle(.window)
        #endif
    }
}
