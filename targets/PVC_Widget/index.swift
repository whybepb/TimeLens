import WidgetKit
import SwiftUI

// MARK: - Shared Data Model
struct PVCData: Codable {
    let score: Int
    let level: String
    let stepsToday: Int
    let focusMinutes: Int
    let lastUpdated: Date
    
    static var placeholder: PVCData {
        PVCData(
            score: 72,
            level: "High Focus",
            stepsToday: 6234,
            focusMinutes: 165,
            lastUpdated: Date()
        )
    }
    
    static func load() -> PVCData {
        guard let userDefaults = UserDefaults(suiteName: "group.com.timelenses.productivity"),
              let data = userDefaults.data(forKey: "pvc_widget_data"),
              let decoded = try? JSONDecoder().decode(PVCData.self, from: data) else {
            return .placeholder
        }
        return decoded
    }
}

// MARK: - Timeline Provider
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> PVCEntry {
        PVCEntry(date: Date(), data: .placeholder)
    }

    func getSnapshot(in context: Context, completion: @escaping (PVCEntry) -> Void) {
        let entry = PVCEntry(date: Date(), data: PVCData.load())
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PVCEntry>) -> Void) {
        let currentDate = Date()
        let data = PVCData.load()
        let entry = PVCEntry(date: currentDate, data: data)
        
        // Refresh every 15 minutes
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: currentDate)!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
}

// MARK: - Timeline Entry
struct PVCEntry: TimelineEntry {
    let date: Date
    let data: PVCData
}

// MARK: - Widget View
struct PVCWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family
    
    var scoreColor: Color {
        let score = entry.data.score
        if score >= 70 { return Color(red: 0, green: 0.9, blue: 0.47) } // Green
        if score >= 40 { return Color(red: 1, green: 0.67, blue: 0) }   // Orange
        return Color(red: 1, green: 0.32, blue: 0.32)                   // Red
    }
    
    var body: some View {
        VStack(spacing: 8) {
            // Score Circle
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.1), lineWidth: 6)
                    .frame(width: 70, height: 70)
                
                Circle()
                    .trim(from: 0, to: CGFloat(entry.data.score) / 100)
                    .stroke(
                        LinearGradient(
                            colors: [scoreColor, scoreColor.opacity(0.7)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 6, lineCap: .round)
                    )
                    .frame(width: 70, height: 70)
                    .rotationEffect(.degrees(-90))
                
                VStack(spacing: 0) {
                    Text("\(entry.data.score)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("PVC")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(.white.opacity(0.5))
                }
            }
            
            // Level Label
            Text(entry.data.level)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(.white.opacity(0.7))
                .lineLimit(1)
            
            // Mini Stats (for medium/large widgets)
            if family != .systemSmall {
                HStack(spacing: 16) {
                    StatItem(icon: "figure.walk", value: "\(entry.data.stepsToday)", label: "Steps")
                    StatItem(icon: "brain.head.profile", value: "\(entry.data.focusMinutes)m", label: "Focus")
                }
                .padding(.top, 4)
            }
        }
        .padding()
        .containerBackground(for: .widget) {
            // Background gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.07, green: 0.07, blue: 0.08),
                    Color(red: 0.05, green: 0.05, blue: 0.06)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

// MARK: - Stat Item Component
struct StatItem: View {
    let icon: String
    let value: String
    let label: String
    
    var body: some View {
        VStack(spacing: 2) {
            Image(systemName: icon)
                .font(.system(size: 12))
                .foregroundColor(Color(red: 0.1, green: 0.63, blue: 1)) // Electric blue
            Text(value)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.white)
            Text(label)
                .font(.system(size: 9))
                .foregroundColor(.white.opacity(0.5))
        }
    }
}

// MARK: - Widget Configuration
@main
struct PVC_Widget: Widget {
    let kind: String = "PVC_Widget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            PVCWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("PVC Score")
        .description("Your Productivity-Vitality Score at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
        .contentMarginsDisabled()
    }
}

// MARK: - Preview
#Preview(as: .systemSmall) {
    PVC_Widget()
} timeline: {
    PVCEntry(date: .now, data: .placeholder)
}
