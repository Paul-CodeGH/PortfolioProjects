//
//  CalendarManager.swift
//  BlossomCalendar
//
//  Created by Paul-Adrian Moldovan on 25.01.26.
//

import Foundation
import Combine
import SwiftUI

struct BlossomEvent: Codable, Identifiable {
    var id = UUID()
    var title: String
    var date: Date
}

class CalendarManager: ObservableObject {
    @Published var events: [BlossomEvent] = []
    
    private var eventsFileURL: URL? {
        guard let documentsDirectory = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else { return nil }
        return documentsDirectory.appendingPathComponent("blossom_events.json")
    }
    
    init() {
        loadEvents()
    }
    
    func addEvent(title: String, date: Date) {
        let newEvent = BlossomEvent(title: title, date: date)
        events.append(newEvent)
        saveEvents()
    }
    
    func deleteEvent(_ event: BlossomEvent) {
        events.removeAll { $0.id == event.id }
        saveEvents()
    }
    
    func events(for date: Date) -> [BlossomEvent] {
        let calendar = Calendar.current
        return events.filter { calendar.isDate($0.date, inSameDayAs: date) }
    }
    
    // Helper for dots
    func hasEvents(for date: Date) -> Bool {
        let calendar = Calendar.current
        return events.contains { calendar.isDate($0.date, inSameDayAs: date) }
    }
    
    private func saveEvents() {
        guard let url = eventsFileURL else { return }
        do {
            let data = try JSONEncoder().encode(events)
            try data.write(to: url)
        } catch {
            print("Error saving events: \(error)")
        }
    }
    
    private func loadEvents() {
        guard let url = eventsFileURL, FileManager.default.fileExists(atPath: url.path) else { return }
        do {
            let data = try Data(contentsOf: url)
            events = try JSONDecoder().decode([BlossomEvent].self, from: data)
        } catch {
            print("Error loading events: \(error)")
        }
    }
}