import AVFoundation
import Foundation

/// Handles native iOS speech discovery, persistence, and playback for digital human replies.
final class SpeechService: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
    @Published private(set) var englishVoices: [VoiceOption] = []
    @Published var selectedVoiceIdentifier: String {
        didSet {
            UserDefaults.standard.set(selectedVoiceIdentifier, forKey: Self.selectedVoiceKey)
        }
    }
    @Published private(set) var isSpeaking = false

    static let selectedVoiceKey = "selectedVoiceIdentifier"

    private let synthesizer = AVSpeechSynthesizer()

    override init() {
        let savedIdentifier = UserDefaults.standard.string(forKey: Self.selectedVoiceKey) ?? ""
        selectedVoiceIdentifier = savedIdentifier
        super.init()
        synthesizer.delegate = self
        refreshVoices()
        chooseDefaultVoiceIfNeeded()
    }

    /// Reads all system English voices from AVSpeechSynthesisVoice.
    func refreshVoices() {
        englishVoices = AVSpeechSynthesisVoice.speechVoices()
            .filter { $0.language.lowercased().hasPrefix("en") }
            .sorted { lhs, rhs in
                if lhs.language == rhs.language { return lhs.name < rhs.name }
                return lhs.language < rhs.language
            }
            .map { voice in
                VoiceOption(
                    identifier: voice.identifier,
                    name: voice.name,
                    language: voice.language,
                    gender: Self.genderLabel(for: voice),
                    quality: Self.qualityLabel(for: voice)
                )
            }
    }

    /// Stores the selected voice identifier for future app launches.
    func selectVoice(_ voice: VoiceOption) {
        selectedVoiceIdentifier = voice.identifier
    }

    /// Speaks text using the selected AVSpeechSynthesisVoice when available.
    func speak(_ text: String) {
        guard !text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else { return }

        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }

        let utterance = AVSpeechUtterance(string: text)
        utterance.voice = selectedAVVoice() ?? AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = AVSpeechUtteranceDefaultSpeechRate * 0.94
        utterance.pitchMultiplier = 1.02
        utterance.volume = 1.0
        synthesizer.speak(utterance)
    }

    func stop() {
        synthesizer.stopSpeaking(at: .immediate)
    }

    func selectedVoiceName() -> String {
        englishVoices.first(where: { $0.identifier == selectedVoiceIdentifier })?.name ?? "System English Voice"
    }

    private func chooseDefaultVoiceIfNeeded() {
        guard selectedVoiceIdentifier.isEmpty || !englishVoices.contains(where: { $0.identifier == selectedVoiceIdentifier }) else { return }
        if let preferred = englishVoices.first(where: { $0.language == "en-US" }) ?? englishVoices.first {
            selectedVoiceIdentifier = preferred.identifier
        }
    }

    private func selectedAVVoice() -> AVSpeechSynthesisVoice? {
        AVSpeechSynthesisVoice.speechVoices().first(where: { $0.identifier == selectedVoiceIdentifier })
    }

    private static func genderLabel(for voice: AVSpeechSynthesisVoice) -> String {
        switch voice.gender {
        case .male:
            return "Male"
        case .female:
            return "Female"
        case .unspecified:
            return "Neutral"
        @unknown default:
            return "Neutral"
        }
    }

    private static func qualityLabel(for voice: AVSpeechSynthesisVoice) -> String {
        switch voice.quality {
        case .default:
            return "Default"
        case .enhanced:
            return "Enhanced"
        case .premium:
            return "Premium"
        @unknown default:
            return "System"
        }
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
        isSpeaking = true
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        isSpeaking = false
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        isSpeaking = false
    }
}
