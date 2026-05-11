import Foundation

/// Shared app state for the prototype: selected coach, practice mode, and local mock chat.
final class AppViewModel: ObservableObject {
    @Published var selectedCharacter: CoachCharacter {
        didSet { UserDefaults.standard.set(selectedCharacter.id, forKey: Self.selectedCharacterKey) }
    }
    @Published var selectedPracticeMode: PracticeMode {
        didSet { UserDefaults.standard.set(selectedPracticeMode.id, forKey: Self.selectedPracticeModeKey) }
    }
    @Published var messages: [ChatMessage]
    @Published var draftMessage = ""

    static let selectedCharacterKey = "selectedCharacter"
    static let selectedPracticeModeKey = "selectedPracticeMode"

    init() {
        let characterID = UserDefaults.standard.string(forKey: Self.selectedCharacterKey)
        selectedCharacter = CoachCharacter.all.first(where: { $0.id == characterID }) ?? .fallback

        let practiceID = UserDefaults.standard.string(forKey: Self.selectedPracticeModeKey)
        selectedPracticeMode = PracticeMode.all.first(where: { $0.id == practiceID }) ?? .fallback

        messages = [
            ChatMessage(sender: .coach, text: selectedCharacter.greeting, timestamp: Date())
        ]
    }

    /// Adds the user's sentence and generates a local coach response.
    func sendCurrentDraft() {
        let trimmed = draftMessage.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        messages.append(ChatMessage(sender: .user, text: trimmed, timestamp: Date()))
        draftMessage = ""

        let response = mockResponse(for: trimmed)
        messages.append(ChatMessage(sender: .coach, text: response, timestamp: Date()))
    }

    func applyPromptHint() {
        draftMessage = selectedPracticeMode.promptHint
    }

    private func mockResponse(for text: String) -> String {
        let correction: String
        if text.split(separator: " ").count < 5 {
            correction = "Try expanding it with one detail: who, where, or why."
        } else if text.last == "." || text.last == "!" || text.last == "?" {
            correction = "Your sentence is clear. Now practice saying it with a smoother rhythm."
        } else {
            correction = "Nice idea. Add punctuation at the end to make it feel complete."
        }

        switch selectedCharacter.id {
        case "gentleTutor":
            return "Good work. A natural version could be: \"\(polishedSentence(from: text))\". \(correction)"
        case "businessPartner":
            return "Professional upgrade: \"\(polishedSentence(from: text))\". Keep it concise, confident, and specific."
        case "comedyFriend":
            return "Yes! I’d punch it up as: \"\(polishedSentence(from: text))\". Now add a surprising twist and keep the scene moving."
        default:
            return "Great energy! Try this smoother line: \"\(polishedSentence(from: text))\". \(correction)"
        }
    }

    private func polishedSentence(from text: String) -> String {
        var sentence = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !sentence.isEmpty else { return text }
        sentence = sentence.prefix(1).uppercased() + String(sentence.dropFirst())
        if let last = sentence.last, !".!?".contains(last) {
            sentence.append(".")
        }
        return sentence
    }
}
