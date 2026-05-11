import SwiftUI

/// Digital human role displayed in the coach picker and used to tune mock replies.
struct CoachCharacter: Identifiable, Hashable {
    let id: String
    let name: String
    let localizedName: String
    let emoji: String
    let gradientColors: [Color]
    let speakingStyle: String
    let recommendedScenario: String
    let greeting: String

    static let all: [CoachCharacter] = [
        CoachCharacter(
            id: "cheerfulCoach",
            name: "Cheerful Coach",
            localizedName: "活泼教练",
            emoji: "🌟",
            gradientColors: [Color(hex: 0x5EEAD4), Color(hex: 0x3B82F6)],
            speakingStyle: "Upbeat, energetic, and encouraging with short corrections.",
            recommendedScenario: "Daily confidence building and quick speaking warmups.",
            greeting: "Amazing to see you! Say anything in English and I’ll help you sound brighter."
        ),
        CoachCharacter(
            id: "gentleTutor",
            name: "Gentle Tutor",
            localizedName: "温柔老师",
            emoji: "🫶",
            gradientColors: [Color(hex: 0xF9A8D4), Color(hex: 0xA78BFA)],
            speakingStyle: "Calm, patient, and precise with gentle explanations.",
            recommendedScenario: "Grammar polish, pronunciation confidence, and slower practice.",
            greeting: "Take your time. I’ll guide you sentence by sentence with clear feedback."
        ),
        CoachCharacter(
            id: "businessPartner",
            name: "Business Partner",
            localizedName: "商务伙伴",
            emoji: "💼",
            gradientColors: [Color(hex: 0x38BDF8), Color(hex: 0x0F172A)],
            speakingStyle: "Concise, professional, and meeting-ready.",
            recommendedScenario: "Presentations, interviews, emails, and cross-border meetings.",
            greeting: "Let’s make your English polished, confident, and boardroom-ready."
        ),
        CoachCharacter(
            id: "comedyFriend",
            name: "Comedy Friend",
            localizedName: "喜剧朋友",
            emoji: "🎭",
            gradientColors: [Color(hex: 0xF97316), Color(hex: 0xEC4899)],
            speakingStyle: "Playful, witty, and improvisational while staying useful.",
            recommendedScenario: "Comedy improv, casual banter, and creative speaking drills.",
            greeting: "Give me a line and I’ll bounce back with English that has sparkle."
        )
    ]

    static let fallback = all[0]
}

/// Practice themes shown on Home and Practice tabs.
struct PracticeMode: Identifiable, Hashable {
    let id: String
    let title: String
    let localizedTitle: String
    let icon: String
    let color: Color
    let promptHint: String
    let description: String

    static let all: [PracticeMode] = [
        PracticeMode(id: "dailyChat", title: "Daily Chat", localizedTitle: "日常对话", icon: "bubble.left.and.bubble.right.fill", color: Color(hex: 0x22C55E), promptHint: "Tell me about your day in three sentences.", description: "Build natural small-talk fluency for everyday life."),
        PracticeMode(id: "travelEnglish", title: "Travel English", localizedTitle: "旅行英语", icon: "airplane.departure", color: Color(hex: 0x06B6D4), promptHint: "Practice checking in at a hotel.", description: "Role-play airports, hotels, restaurants, and directions."),
        PracticeMode(id: "businessEnglish", title: "Business English", localizedTitle: "商务英语", icon: "briefcase.fill", color: Color(hex: 0x6366F1), promptHint: "Summarize a project update for a meeting.", description: "Sharpen workplace phrases for meetings and presentations."),
        PracticeMode(id: "comedyImprov", title: "Comedy Improv", localizedTitle: "喜剧即兴", icon: "theatermasks.fill", color: Color(hex: 0xF97316), promptHint: "Start a funny scene in a coffee shop.", description: "Practice quick reactions, humor, and expressive delivery."),
        PracticeMode(id: "pronunciationDrill", title: "Pronunciation Drill", localizedTitle: "发音训练", icon: "waveform.circle.fill", color: Color(hex: 0xEC4899), promptHint: "Try: The cheerful teacher chose a tricky challenge.", description: "Repeat focused sentences with rhythm and clarity."),
        PracticeMode(id: "listeningPractice", title: "Listening Practice", localizedTitle: "听力训练", icon: "ear.fill", color: Color(hex: 0xA855F7), promptHint: "Ask me to read a short listening question.", description: "Listen, answer, and request slower or faster playback."),
    ]

    static let fallback = all[0]
}

/// A single chat bubble in the local prototype conversation.
struct ChatMessage: Identifiable, Hashable {
    enum Sender: Hashable {
        case user
        case coach
    }

    let id = UUID()
    let sender: Sender
    let text: String
    let timestamp: Date
}

/// Lightweight wrapper around AVSpeechSynthesisVoice for filtering and display.
struct VoiceOption: Identifiable, Hashable {
    let identifier: String
    let name: String
    let language: String
    let gender: String
    let quality: String

    var id: String { identifier }
}

extension Color {
    /// Convenience initializer for design-token style hex colors.
    init(hex: UInt, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xFF) / 255,
            green: Double((hex >> 8) & 0xFF) / 255,
            blue: Double(hex & 0xFF) / 255,
            opacity: alpha
        )
    }
}
