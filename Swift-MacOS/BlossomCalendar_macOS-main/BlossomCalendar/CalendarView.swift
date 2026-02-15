//
//  CalendarView.swift
//  BlossomCalendar
//
//  Created by Paul-Adrian Moldovan on 25.01.26.
//

import SwiftUI

// MARK: - Professional Blossom Themes
enum CalendarTheme: String, CaseIterable, Identifiable, Codable {
    case cherry = "Cherry Blossom"
    case ninja = "Ninja Blossom"
    case cipher = "Cipher Blossom"
    
    var id: String { self.rawValue }
    
    var accent: Color {
        switch self {
        case .cherry: return Color(red: 0.8, green: 0.25, blue: 0.4)
        case .ninja: return Color(red: 1.0, green: 0.2, blue: 0.4)
        case .cipher: return Color(red: 1.0, green: 0.3, blue: 0.7) // Electric Sakura (Neon Pink)
        }
    }
    
    var highlight: Color {
        switch self {
        case .cherry: return Color(red: 0.9, green: 0.4, blue: 0.55)
        case .ninja: return Color(red: 0.3, green: 0.05, blue: 0.1)
        case .cipher: return Color(red: 0.0, green: 0.6, blue: 0.4) // Muted Cyber Green
        }
    }
    
    var background: Color {
        switch self {
        case .cherry: return Color(red: 1.0, green: 0.98, blue: 0.985)
        case .ninja: return Color(red: 0.08, green: 0.08, blue: 0.1)
        case .cipher: return Color(red: 0.02, green: 0.03, blue: 0.03) // Deep Obsidian
        }
    }
    
    var text: Color {
        switch self {
        case .cherry: return Color(red: 0.2, green: 0.1, blue: 0.15)
        case .ninja: return Color(red: 0.95, green: 0.95, blue: 1.0)
        case .cipher: return Color(red: 0.8, green: 1.0, blue: 0.9) // Soft Glow Text
        }
    }
    
    var cardBackground: Color {
        switch self {
        case .cherry: return Color.white.opacity(0.5)
        case .ninja: return Color.black.opacity(0.3)
        case .cipher: return Color(red: 0.05, green: 0.1, blue: 0.1).opacity(0.4)
        }
    }
}

struct CalendarView: View {
    @AppStorage("selectedTheme") private var currentTheme: CalendarTheme = .cherry
    @StateObject private var calendarManager = CalendarManager()
    @State private var currentDate = Date()
    @State private var selectedDate = Date()
    
    // For Adding Events
    @State private var showAddEventPopover = false
    @State private var newEventTitle = ""
    @State private var newEventTime = Date()
    @State private var eventToDelete: BlossomEvent?
    @State private var showSettings = false
    
    private let calendar = Calendar.current
    private let daysOfWeek = Calendar.current.shortWeekdaySymbols

    var body: some View {
        ZStack {
            // Solid, high-contrast background with a tiny warmth
            currentTheme.background
                .edgesIgnoringSafeArea(.all)
            
            VStack(spacing: 0) {
                // MARK: - Header
                HStack {
                    // Elegant Serif Font for the Title
                    Text(monthYearString(from: currentDate))
                        .font(.system(size: 18, weight: .bold, design: .serif))
                        .foregroundColor(currentTheme.text)

                    Spacer()

                    // Navigation Arrows
                    HStack(spacing: 16) {
                        Button(action: { 
                            withAnimation { changeMonth(by: -1) }
                        }) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(currentTheme.accent)
                        }
                        .buttonStyle(.plain)

                        Button(action: { 
                            withAnimation { changeMonth(by: 1) }
                        }) {
                            Image(systemName: "chevron.right")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(currentTheme.accent)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 16)
                .background(currentTheme.cardBackground)

                Divider()
                    .background(currentTheme.accent.opacity(0.2))

                // MARK: - Calendar Content
                VStack(spacing: 12) {
                    // Days of Week
                    HStack {
                        ForEach(daysOfWeek, id: \.self) { day in
                            Text(day.uppercased())
                                .font(.system(size: 10, weight: .bold, design: .default))
                                .tracking(1) // Letter spacing for professional look
                                .foregroundColor(currentTheme.accent.opacity(0.8))
                                .frame(maxWidth: .infinity)
                        }
                    }
                    .padding(.top, 14)

                    // Calendar Grid
                    let days = daysInMonth(for: currentDate)
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 7), spacing: 8) {
                        ForEach(days.indices, id: \.self) { index in
                            if let date = days[index] {
                                DayCell(
                                    date: date,
                                    isSelected: isSameDay(date, selectedDate),
                                    isToday: isToday(date),
                                    hasEvents: calendarManager.hasEvents(for: date),
                                    theme: currentTheme
                                )
                                .onTapGesture {
                                    withAnimation(.easeOut(duration: 0.15)) {
                                        selectedDate = date
                                    }
                                }
                            } else {
                                Text("")
                                    .frame(height: 32)
                            }
                        }
                    }
                }
                .padding(.horizontal, 16)
                
                Spacer().frame(height: 16)

                Divider()
                    .background(currentTheme.accent.opacity(0.2))
                
                // MARK: - Events Section
                VStack(spacing: 0) {
                    // Section Header
                    HStack(alignment: .center) {
                        Text(dateString(from: selectedDate))
                            .font(.system(size: 14, weight: .medium, design: .serif))
                            .foregroundColor(currentTheme.text)
                        
                        Spacer()
                        
                        // Add Button
                        Button(action: {
                            newEventTitle = ""
                            newEventTime = Date()
                            showAddEventPopover = true
                        }) {
                            HStack(spacing: 4) {
                                Image(systemName: "plus")
                                    .font(.system(size: 10, weight: .bold))
                                Text("Add Event")
                                    .font(.system(size: 10, weight: .semibold))
                            }
                            .foregroundColor(.white)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(Capsule().fill(currentTheme.highlight))
                        }
                        .buttonStyle(.plain)
                        .popover(isPresented: $showAddEventPopover) {
                            AddEventView(title: $newEventTitle, time: $newEventTime, theme: currentTheme) {
                                addEvent()
                            }
                        }
                    }
                    .padding(16)
                    
                    // Event List
                    ScrollView {
                        VStack(spacing: 6) {
                            let events = calendarManager.events(for: selectedDate)
                                .sorted(by: { $0.date < $1.date })
                            if events.isEmpty {
                                Text("No events scheduled")
                                    .font(.system(size: 13, design: .default))
                                    .italic()
                                    .foregroundColor(currentTheme.text.opacity(0.5))
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.horizontal, 16)
                                    .padding(.bottom, 16)
                            } else {
                                ForEach(events) { event in
                                    EventRow(event: event, theme: currentTheme) {
                                        eventToDelete = event
                                    }
                                }
                            }
                        }
                    }
                    .frame(height: 90)
                }
                .background(currentTheme.cardBackground)

                Divider()
                    .background(currentTheme.accent.opacity(0.2))

                // MARK: - Footer
                HStack(spacing: 12) {
                    Spacer()
                    
                    // Settings Button
                    Button(action: {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.8)) {
                            showSettings.toggle()
                        }
                    }) {
                        Image(systemName: "gearshape.fill")
                            .font(.system(size: 12))
                            .foregroundColor(currentTheme == .cipher ? currentTheme.highlight : currentTheme.accent.opacity(0.6))
                            .padding(8)
                            .background(Circle().fill((currentTheme == .cipher ? currentTheme.highlight : currentTheme.accent).opacity(0.05)))
                    }
                    .buttonStyle(.plain)

                    Button(action: {
                        NSApplication.shared.terminate(nil)
                    }) {
                        HStack(spacing: 6) {
                            Image(systemName: "power")
                                .font(.system(size: 9, weight: .bold))
                            Text("Quit Blossom")
                                .font(.system(size: 10, weight: .bold))
                                .textCase(.uppercase)
                                .tracking(0.5)
                        }
                        .foregroundColor(currentTheme == .cipher ? currentTheme.highlight : currentTheme.accent.opacity(0.8))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            Capsule()
                                .fill((currentTheme == .cipher ? currentTheme.highlight : currentTheme.accent).opacity(0.05))
                        )
                        .overlay(
                            Capsule()
                                .stroke((currentTheme == .cipher ? currentTheme.highlight : currentTheme.accent).opacity(0.2), lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)
                }
                .padding(.vertical, 16)
                .padding(.trailing, 20)
            }
        }
        .frame(width: 330)
        .fixedSize(horizontal: true, vertical: true)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(currentTheme.accent.opacity(0.2), lineWidth: 1)
        )
        .overlay {
            if showSettings {
                ZStack {
                    Color.black.opacity(0.2)
                        .onTapGesture { showSettings = false }
                    
                    SettingsView(selectedTheme: $currentTheme)
                        .transition(.move(edge: .bottom).combined(with: .opacity))
                }
            }
        }
        .overlay {
            if let event = eventToDelete {
                ZStack {
                    Color.black.opacity(0.15)
                    
                    VStack(spacing: 12) {
                        Text("Delete Event")
                            .font(.system(size: 13, weight: .bold))
                            .foregroundColor(currentTheme.text)
                        
                        Text("Delete '\(event.title)'?")
                            .font(.system(size: 12))
                            .foregroundColor(currentTheme.text.opacity(0.8))
                        
                        HStack(spacing: 10) {
                            Button(action: { eventToDelete = nil }) {
                                Text("Cancel")
                                    .font(.system(size: 11, weight: .medium))
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 4)
                                    .background(currentTheme.text.opacity(0.05))
                                    .cornerRadius(4)
                            }
                            .buttonStyle(.plain)
                            
                            Button(action: {
                                withAnimation {
                                    calendarManager.deleteEvent(event)
                                    eventToDelete = nil
                                }
                            }) {
                                Text("Delete")
                                    .font(.system(size: 11, weight: .semibold))
                                    .foregroundColor(.white)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 4)
                                    .background(Color.red.opacity(0.8))
                                    .cornerRadius(4)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(16)
                    .background(currentTheme.background)
                    .cornerRadius(12)
                    .shadow(color: Color.black.opacity(0.2), radius: 10)
                }
                .transition(.opacity)
            }
        }
    }

    // MARK: - Logic Helpers

    private func addEvent() {
        if !newEventTitle.isEmpty {
            // Combine selectedDate (day) with newEventTime (hours/minutes)
            let combinedDate = calendar.date(
                bySettingHour: calendar.component(.hour, from: newEventTime),
                minute: calendar.component(.minute, from: newEventTime),
                second: 0,
                of: selectedDate
            ) ?? selectedDate
            
            calendarManager.addEvent(title: newEventTitle, date: combinedDate)
            showAddEventPopover = false
        }
    }

    private func isSameDay(_ date1: Date, _ date2: Date) -> Bool {
        calendar.isDate(date1, inSameDayAs: date2)
    }
    
    private func dateString(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .full
        return formatter.string(from: date)
    }

    private func changeMonth(by value: Int) {
        if let newDate = calendar.date(byAdding: .month, value: value, to: currentDate) {
            currentDate = newDate
        }
    }

    private func monthYearString(from date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM yyyy"
        return formatter.string(from: date)
    }

    private func isToday(_ date: Date) -> Bool {
        calendar.isDate(date, inSameDayAs: Date())
    }

    private func daysInMonth(for date: Date) -> [Date?] {
        guard let range = calendar.range(of: .day, in: .month, for: date),
              let firstDayOfMonth = calendar.date(from: calendar.dateComponents([.year, .month], from: date))
        else { return [] }

        let firstWeekday = calendar.component(.weekday, from: firstDayOfMonth)
        let offset = firstWeekday - 1 
        
        var days: [Date?] = Array(repeating: nil, count: offset)

        for day in range {
            if let date = calendar.date(byAdding: .day, value: day - 1, to: firstDayOfMonth) {
                days.append(date)
            }
        }
        
        while days.count < 42 {
            days.append(nil)
        }

        return days
    }
}

// MARK: - Subviews

struct DayCell: View {
    let date: Date
    let isSelected: Bool
    let isToday: Bool
    let hasEvents: Bool
    let theme: CalendarTheme
    
    private let calendar = Calendar.current
    
    var body: some View {
        ZStack {
            if isSelected {
                // Selected state: Solid deep blossom highlight
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(theme.highlight)
                    .shadow(color: theme.highlight.opacity(0.3), radius: 2, x: 0, y: 1)
            } else if isToday {
                // Today state: Ring
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .stroke(theme.accent.opacity(0.4), lineWidth: 1.5)
            } else if hasEvents {
                // Event state: Soft blossom tint background
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(theme.highlight.opacity(0.15))
            }
            
            VStack(spacing: 2) {
                Text("\(calendar.component(.day, from: date))")
                    .font(.system(size: 13, weight: isSelected || hasEvents ? .semibold : .regular, design: .default))
                    .foregroundColor(isSelected ? .white : (hasEvents ? theme.accent : theme.text))
                
                // Small dot for extra clarity on event days
                if hasEvents {
                    Circle()
                        .fill(isSelected ? .white.opacity(0.9) : theme.accent)
                        .frame(width: 3, height: 3)
                } else {
                    Spacer().frame(height: 3)
                }
            }
        }
        .frame(height: 32)
        .contentShape(Rectangle())
    }
}

struct EventRow: View {
    let event: BlossomEvent
    let theme: CalendarTheme
    let onDelete: () -> Void
    
    @State private var isHovering = false
    
    private var timeString: String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: event.date)
    }
    
    var body: some View {
        HStack(spacing: 12) {
            // Refined indicator: Solid blossom dot with soft glow
            VStack(spacing: 4) {
                ZStack {
                    Circle()
                        .fill(theme.accent.opacity(0.3))
                        .frame(width: 12, height: 12)
                    Circle()
                        .fill(theme.accent)
                        .frame(width: 6, height: 6)
                }
                
                Text(timeString)
                    .font(.system(size: 9, weight: .bold))
                    .foregroundColor(theme.accent.opacity(0.8))
            }
            .frame(width: 45)
            
            Text(event.title)
                .font(.system(size: 13, weight: .medium, design: .default))
                .foregroundColor(theme.text)
            
            Spacer()
            
            if isHovering {
                Button(action: onDelete) {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 14))
                        .foregroundColor(theme.accent.opacity(0.7))
                }
                .buttonStyle(.plain)
                .transition(.opacity.combined(with: .scale))
            }
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 12)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(isHovering ? theme.accent.opacity(0.08) : theme.cardBackground)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .stroke(theme.accent.opacity(0.05), lineWidth: 1)
        )
        .padding(.horizontal, 16)
        .onHover { hover in
            withAnimation(.easeInOut(duration: 0.2)) {
                isHovering = hover
            }
        }
    }
}

struct AddEventView: View {
    @Binding var title: String
    @Binding var time: Date
    let theme: CalendarTheme
    var onAdd: () -> Void
    
    @State private var showTimePicker = false
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Create Event")
                .font(.system(size: 16, weight: .bold, design: .serif))
                .foregroundColor(theme.text)
            
            VStack(alignment: .leading, spacing: 12) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Title")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(theme.accent.opacity(0.8))
                        .textCase(.uppercase)
                    
                    TextField("What's happening?", text: $title)
                        .textFieldStyle(.plain)
                        .padding(10)
                        .background(Color.white.opacity(theme == .cherry ? 1.0 : 0.1))
                        .foregroundColor(theme.text)
                        .cornerRadius(8)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(theme.highlight.opacity(0.2), lineWidth: 1))
                }
                
                VStack(alignment: .leading, spacing: 4) {
                    Text("Time")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(theme.accent.opacity(0.8))
                        .textCase(.uppercase)
                    
                    Button(action: { 
                        withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                            showTimePicker.toggle() 
                        }
                    }) {
                        HStack {
                            Image(systemName: "clock.fill")
                                .font(.system(size: 14))
                                .foregroundColor(theme.highlight)
                            
                            Text(timeFormatter.string(from: time))
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(theme.text)
                            
                            Spacer()
                            
                            Image(systemName: showTimePicker ? "chevron.up" : "chevron.down")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(theme.highlight.opacity(0.6))
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 8)
                        .background(Color.white.opacity(theme == .cherry ? 1.0 : 0.1))
                        .cornerRadius(8)
                        .overlay(RoundedRectangle(cornerRadius: 8).stroke(theme.highlight.opacity(0.2), lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                    
                    if showTimePicker {
                        DigitalClockPicker(selection: $time, theme: theme)
                            .transition(.move(edge: .top).combined(with: .opacity))
                            .padding(.top, 4)
                    }
                }
            }
            .frame(width: 220)
            .onSubmit { onAdd() }
            
            Button(action: onAdd) {
                Text("Save Event")
                    .font(.system(size: 13, weight: .bold))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .background(
                        LinearGradient(
                            gradient: Gradient(colors: theme == .cipher ? [theme.highlight, theme.highlight] : [theme.highlight, theme.accent]),
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .foregroundColor(.white)
                    .cornerRadius(8)
                    .shadow(color: theme.accent.opacity(0.3), radius: 4, x: 0, y: 2)
            }
            .buttonStyle(.plain)
        }
        .padding(20)
        .background(theme.background)
        .cornerRadius(16)
    }
    
    private var timeFormatter: DateFormatter {
        let f = DateFormatter()
        f.timeStyle = .short
        return f
    }
}

struct DigitalClockPicker: View {
    @Binding var selection: Date
    let theme: CalendarTheme
    
    @Environment(\.calendar) var calendar
    
    var body: some View {
        VStack(spacing: 12) {
            HStack(spacing: 15) {
                // Hour
                clockColumn(value: hour, range: 0...23, label: "HR") { newValue in
                    updateTime(hour: newValue)
                }
                
                Text(":")
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(theme.text.opacity(0.3))
                    .padding(.top, 10)
                
                // Minute
                clockColumn(value: minute, range: stride(from: 0, through: 55, by: 5).map { $0 }, label: "MIN") { newValue in
                    updateTime(minute: newValue)
                }
            }
        }
        .padding(12)
        .background(theme.cardBackground)
        .cornerRadius(12)
    }
    
    private var hour: Int {
        calendar.component(.hour, from: selection)
    }
    
    private var minute: Int {
        calendar.component(.minute, from: selection)
    }
    
    private func clockColumn(value: Int, range: [Int], label: String, onSelect: @escaping (Int) -> Void) -> some View {
        VStack(spacing: 4) {
            Text(label)
                .font(.system(size: 8, weight: .black))
                .foregroundColor(theme.text.opacity(0.4))
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 4) {
                    ForEach(range, id: \.self) { item in
                        Text(String(format: "%02d", item))
                            .font(.system(size: 14, weight: item == value ? .bold : .medium, design: .monospaced))
                            .foregroundColor(item == value ? .white : theme.text)
                            .frame(width: 35, height: 28)
                            .background(item == value ? theme.highlight : Color.black.opacity(0.2))
                            .cornerRadius(6)
                            .onTapGesture {
                                onSelect(item)
                            }
                    }
                }
                .padding(4)
            }
            .frame(height: 100)
            .background(Color.black.opacity(0.1))
            .cornerRadius(8)
        }
    }
    
    // Overload for ranges
    private func clockColumn(value: Int, range: ClosedRange<Int>, label: String, onSelect: @escaping (Int) -> Void) -> some View {
        clockColumn(value: value, range: Array(range), label: label, onSelect: onSelect)
    }
    
    private func updateTime(hour: Int? = nil, minute: Int? = nil) {
        var components = calendar.dateComponents([.year, .month, .day, .hour, .minute], from: selection)
        if let h = hour { components.hour = h }
        if let m = minute { components.minute = m }
        if let newDate = calendar.date(from: components) {
            selection = newDate
        }
    }
}

struct SettingsView: View {
    @Binding var selectedTheme: CalendarTheme
    
    var body: some View {
        VStack(spacing: 16) {
            Text("Select Theme")
                .font(.system(size: 14, weight: .bold, design: .serif))
                .foregroundColor(selectedTheme.text)
            
            VStack(spacing: 8) {
                ForEach(CalendarTheme.allCases) { theme in
                    Button(action: { 
                        withAnimation { selectedTheme = theme }
                    }) {
                        HStack {
                            Circle()
                                .fill(theme.accent)
                                .frame(width: 12, height: 12)
                            
                            Text(theme.rawValue)
                                .font(.system(size: 13, weight: .medium))
                                .foregroundColor(theme.text)
                            
                            Spacer()
                            
                            if selectedTheme == theme {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(theme.accent)
                            }
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 10)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(theme.background)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 10)
                                        .stroke(theme.accent.opacity(selectedTheme == theme ? 1 : 0.1), lineWidth: 1.5)
                                )
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 20)
            
            Spacer().frame(height: 4)
        }
        .padding(.vertical, 24)
        .frame(width: 240)
        .background(selectedTheme.background)
        .cornerRadius(16)
        .shadow(color: Color.black.opacity(0.3), radius: 20)
    }
}

#Preview {
    CalendarView()
}