import SwiftUI

/// Native iOS voice browser backed by AVSpeechSynthesisVoice.speechVoices().
struct VoicePickerView: View {
    @EnvironmentObject private var speechService: SpeechService
    @State private var searchText = ""
    @State private var selectedGender = "All"
    @State private var selectedLanguage = "All"

    private let genderFilters = ["All", "Female", "Male", "Neutral"]

    private var languages: [String] {
        ["All"] + Array(Set(speechService.englishVoices.map(\.language))).sorted()
    }

    private var filteredVoices: [VoiceOption] {
        speechService.englishVoices.filter { voice in
            let matchesSearch = searchText.isEmpty || voice.name.localizedCaseInsensitiveContains(searchText) || voice.language.localizedCaseInsensitiveContains(searchText)
            let matchesGender = selectedGender == "All" || voice.gender == selectedGender
            let matchesLanguage = selectedLanguage == "All" || voice.language == selectedLanguage
            return matchesSearch && matchesGender && matchesLanguage
        }
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackground()
                List {
                    Section {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Voice Picker / 音色选择")
                                .font(.title2.weight(.bold))
                            Text("Choose an English system voice for your digital human. The selection is saved locally and used when playing coach replies.")
                                .foregroundStyle(.secondary)
                            Button {
                                speechService.speak("Hello, I am your Xiren English Coach. Let's practice English together.")
                            } label: {
                                Label("Preview Current Voice", systemImage: "speaker.wave.2.fill")
                            }
                            .buttonStyle(.borderedProminent)
                        }
                        .padding(.vertical, 6)
                    }
                    .listRowBackground(Color.clear)

                    Section("Filters") {
                        Picker("Gender", selection: $selectedGender) {
                            ForEach(genderFilters, id: \.self) { Text($0) }
                        }
                        Picker("Language", selection: $selectedLanguage) {
                            ForEach(languages, id: \.self) { Text($0) }
                        }
                    }

                    Section("English Voices") {
                        ForEach(filteredVoices) { voice in
                            VoiceRow(voice: voice, isSelected: voice.identifier == speechService.selectedVoiceIdentifier) {
                                speechService.selectVoice(voice)
                            } preview: {
                                speechService.selectVoice(voice)
                                speechService.speak("Hi, this is \(voice.name). I can read digital human replies for you.")
                            }
                        }
                    }
                }
                .scrollContentBackground(.hidden)
                .searchable(text: $searchText, prompt: "Search voice name or language code")
            }
            .navigationTitle("Voices")
            .toolbar {
                Button("Refresh") { speechService.refreshVoices() }
            }
        }
    }
}

private struct VoiceRow: View {
    let voice: VoiceOption
    let isSelected: Bool
    let select: () -> Void
    let preview: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            Button(action: select) {
                Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                    .font(.title3)
                    .foregroundStyle(isSelected ? .green : .secondary)
            }
            .buttonStyle(.plain)

            VStack(alignment: .leading, spacing: 5) {
                Text(voice.name)
                    .font(.headline)
                HStack {
                    MetadataChip(icon: "globe", text: voice.language, tint: .blue)
                    MetadataChip(icon: "person.wave.2", text: voice.gender, tint: .purple)
                    MetadataChip(icon: "sparkle", text: voice.quality, tint: .orange)
                }
            }
            Spacer()
            Button(action: preview) {
                Image(systemName: "play.circle.fill")
                    .font(.title2)
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, 6)
    }
}
