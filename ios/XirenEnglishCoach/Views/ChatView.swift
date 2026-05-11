import SwiftUI

/// Premium chat interface with local mock responses and native text-to-speech playback.
struct ChatView: View {
    @EnvironmentObject private var viewModel: AppViewModel
    @EnvironmentObject private var speechService: SpeechService

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackground()
                VStack(spacing: 0) {
                    chatHeader
                    messageList
                    composer
                }
            }
            .navigationTitle("Conversation")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private var chatHeader: some View {
        GlassCard {
            HStack(spacing: 14) {
                AvatarBadge(emoji: viewModel.selectedCharacter.emoji, colors: viewModel.selectedCharacter.gradientColors, size: 54)
                VStack(alignment: .leading, spacing: 4) {
                    Text(viewModel.selectedCharacter.name)
                        .font(.headline.weight(.bold))
                    Text("\(viewModel.selectedPracticeMode.title) · \(speechService.selectedVoiceName())")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
                Spacer()
                Button { viewModel.applyPromptHint() } label: {
                    Image(systemName: "wand.and.stars")
                        .font(.headline)
                }
                .buttonStyle(.bordered)
                .clipShape(Circle())
            }
        }
        .padding([.horizontal, .top])
        .padding(.bottom, 8)
    }

    private var messageList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 14) {
                    ForEach(viewModel.messages) { message in
                        ChatBubble(message: message, character: viewModel.selectedCharacter) {
                            speechService.speak(message.text)
                        }
                        .id(message.id)
                    }
                }
                .padding(.horizontal)
                .padding(.vertical, 10)
            }
            .onChange(of: viewModel.messages.count) { _ in
                if let last = viewModel.messages.last {
                    withAnimation(.easeOut(duration: 0.28)) {
                        proxy.scrollTo(last.id, anchor: .bottom)
                    }
                }
            }
        }
    }

    private var composer: some View {
        HStack(spacing: 10) {
            TextField("Type an English sentence…", text: $viewModel.draftMessage, axis: .vertical)
                .textInputAutocapitalization(.sentences)
                .lineLimit(1...4)
                .padding(14)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))

            Button { viewModel.sendCurrentDraft() } label: {
                Image(systemName: "arrow.up")
                    .font(.headline.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(width: 46, height: 46)
                    .background(Color(hex: 0x6366F1), in: Circle())
            }
            .disabled(viewModel.draftMessage.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            .opacity(viewModel.draftMessage.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? 0.45 : 1)
        }
        .padding()
        .background(.ultraThinMaterial)
    }
}

private struct ChatBubble: View {
    let message: ChatMessage
    let character: CoachCharacter
    let speak: () -> Void

    private var isUser: Bool { message.sender == .user }

    var body: some View {
        HStack(alignment: .bottom, spacing: 8) {
            if isUser { Spacer(minLength: 44) } else { AvatarBadge(emoji: character.emoji, colors: character.gradientColors, size: 38) }

            VStack(alignment: isUser ? .trailing : .leading, spacing: 6) {
                HStack(alignment: .bottom, spacing: 8) {
                    if !isUser {
                        Button(action: speak) {
                            Image(systemName: "play.circle.fill")
                                .font(.title3)
                                .foregroundStyle(Color(hex: 0x6366F1))
                        }
                        .buttonStyle(.plain)
                    }

                    Text(message.text)
                        .font(.body)
                        .foregroundStyle(isUser ? .white : .primary)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(bubbleBackground, in: RoundedRectangle(cornerRadius: 22, style: .continuous))
                }
                Text(message.timestamp, style: .time)
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(.secondary)
                    .padding(.horizontal, 6)
            }

            if isUser {
                Image(systemName: "person.crop.circle.fill")
                    .font(.system(size: 34))
                    .foregroundStyle(Color(hex: 0x6366F1))
            } else {
                Spacer(minLength: 44)
            }
        }
    }

    @ViewBuilder private var bubbleBackground: some View {
        if isUser {
            LinearGradient(colors: [Color(hex: 0x6366F1), Color(hex: 0x8B5CF6)], startPoint: .topLeading, endPoint: .bottomTrailing)
        } else {
            Color(.secondarySystemBackground).opacity(0.86)
        }
    }
}
