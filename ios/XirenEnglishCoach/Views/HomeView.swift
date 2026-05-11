import SwiftUI

/// Landing page with hero CTA and the current digital human setup.
struct HomeView: View {
    @EnvironmentObject private var viewModel: AppViewModel
    @EnvironmentObject private var speechService: SpeechService
    @State private var showChat = false

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackground()
                ScrollView {
                    VStack(alignment: .leading, spacing: 22) {
                        heroCard
                        currentSetupCard
                        characterCarousel
                    }
                    .padding()
                    .frame(maxWidth: 860)
                    .frame(maxWidth: .infinity)
                }
            }
            .navigationTitle("Xiren English Coach")
            .navigationDestination(isPresented: $showChat) { ChatView() }
        }
    }

    private var heroCard: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 18) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("喜人樾聊 Digital Human")
                            .font(.subheadline.weight(.bold))
                            .foregroundStyle(.secondary)
                        Text("Speak English with a coach that feels alive.")
                            .font(.system(.largeTitle, design: .rounded).weight(.black))
                            .minimumScaleFactor(0.7)
                    }
                    Spacer()
                    AvatarBadge(emoji: viewModel.selectedCharacter.emoji, colors: viewModel.selectedCharacter.gradientColors, size: 76)
                }

                Text("Practice real English conversations, hear every digital human reply, and switch characters, voices, and modes anytime.")
                    .foregroundStyle(.secondary)
                    .font(.body)

                Button {
                    showChat = true
                } label: {
                    Label("Start Conversation / 开始对话", systemImage: "play.fill")
                        .font(.headline.weight(.bold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                }
                .buttonStyle(.borderedProminent)
                .buttonBorderShape(.roundedRectangle(radius: 20))
                .tint(Color(hex: 0x6366F1))
            }
        }
    }

    private var currentSetupCard: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 14) {
                Text("Current Setup")
                    .font(.title3.weight(.bold))
                FlowLayout(spacing: 8) {
                    MetadataChip(icon: "person.fill", text: viewModel.selectedCharacter.name, tint: .purple)
                    MetadataChip(icon: "speaker.wave.2.fill", text: speechService.selectedVoiceName(), tint: .blue)
                    MetadataChip(icon: viewModel.selectedPracticeMode.icon, text: viewModel.selectedPracticeMode.title, tint: viewModel.selectedPracticeMode.color)
                }
                Text(viewModel.selectedCharacter.speakingStyle)
                    .font(.callout)
                    .foregroundStyle(.secondary)
            }
        }
    }

    private var characterCarousel: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Choose a Digital Human")
                .font(.title2.weight(.bold))
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 14) {
                    ForEach(CoachCharacter.all) { character in
                        CharacterCard(character: character, isSelected: character == viewModel.selectedCharacter) {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.82)) {
                                viewModel.selectedCharacter = character
                            }
                        }
                    }
                }
                .padding(.vertical, 4)
            }
        }
    }
}

private struct CharacterCard: View {
    let character: CoachCharacter
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    AvatarBadge(emoji: character.emoji, colors: character.gradientColors, size: 54)
                    Spacer()
                    Image(systemName: isSelected ? "checkmark.circle.fill" : "circle")
                        .foregroundStyle(isSelected ? .green : .secondary)
                }
                Text(character.name)
                    .font(.headline.weight(.bold))
                    .foregroundStyle(.primary)
                Text(character.localizedName)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.secondary)
                Text(character.recommendedScenario)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(3)
            }
            .frame(width: 220, alignment: .leading)
            .padding(16)
            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .stroke(isSelected ? Color.green.opacity(0.75) : Color.white.opacity(0.28), lineWidth: isSelected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
    }
}

/// Simple wrapping layout for setup chips on compact iPhones.
struct FlowLayout<Content: View>: View {
    let spacing: CGFloat
    let content: Content

    init(spacing: CGFloat, @ViewBuilder content: () -> Content) {
        self.spacing = spacing
        self.content = content()
    }

    var body: some View {
        ViewThatFits(in: .horizontal) {
            HStack(spacing: spacing) { content }
            VStack(alignment: .leading, spacing: spacing) { content }
        }
    }
}
