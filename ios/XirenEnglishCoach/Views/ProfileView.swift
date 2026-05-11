import SwiftUI

/// Profile and roadmap page for the local-first prototype.
struct ProfileView: View {
    @EnvironmentObject private var viewModel: AppViewModel
    @EnvironmentObject private var speechService: SpeechService

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackground()
                ScrollView {
                    VStack(spacing: 18) {
                        GlassCard {
                            VStack(spacing: 14) {
                                AvatarBadge(emoji: viewModel.selectedCharacter.emoji, colors: viewModel.selectedCharacter.gradientColors, size: 88)
                                Text("Xiren English Coach")
                                    .font(.title2.weight(.black))
                                Text("喜人樾聊 Digital Human")
                                    .foregroundStyle(.secondary)
                                HStack {
                                    MetadataChip(icon: "person.fill", text: viewModel.selectedCharacter.name, tint: .purple)
                                    MetadataChip(icon: viewModel.selectedPracticeMode.icon, text: viewModel.selectedPracticeMode.title, tint: viewModel.selectedPracticeMode.color)
                                }
                            }
                            .frame(maxWidth: .infinity)
                        }

                        GlassCard {
                            VStack(alignment: .leading, spacing: 12) {
                                Label("Saved Locally", systemImage: "lock.shield.fill")
                                    .font(.headline.weight(.bold))
                                Text("Selected voice identifier, digital human role, and practice mode are stored with UserDefaults on this device.")
                                    .foregroundStyle(.secondary)
                                Text("Current voice: \(speechService.selectedVoiceName())")
                                    .font(.callout.weight(.semibold))
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                        }

                        GlassCard {
                            VStack(alignment: .leading, spacing: 12) {
                                Label("API Ready Placeholder", systemImage: "point.3.connected.trianglepath.dotted")
                                    .font(.headline.weight(.bold))
                                Text("Chat replies are mocked for now. Add an AI provider client here later for OpenAI, Claude, Gemini, or a custom backend without changing the core UI flow.")
                                    .foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                        }
                    }
                    .padding()
                    .frame(maxWidth: 760)
                    .frame(maxWidth: .infinity)
                }
            }
            .navigationTitle("Profile")
        }
    }
}
