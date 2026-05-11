import SwiftUI

/// Practice mode selection screen for daily, travel, business, comedy, pronunciation, and listening drills.
struct PracticeView: View {
    @EnvironmentObject private var viewModel: AppViewModel

    private let columns = [GridItem(.adaptive(minimum: 260), spacing: 16)]

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackground()
                ScrollView {
                    LazyVGrid(columns: columns, spacing: 16) {
                        ForEach(PracticeMode.all) { mode in
                            PracticeModeCard(mode: mode, isSelected: mode == viewModel.selectedPracticeMode) {
                                withAnimation(.spring(response: 0.35, dampingFraction: 0.82)) {
                                    viewModel.selectedPracticeMode = mode
                                }
                            }
                        }
                    }
                    .padding()
                    .frame(maxWidth: 920)
                    .frame(maxWidth: .infinity)
                }
            }
            .navigationTitle("Practice")
        }
    }
}

private struct PracticeModeCard: View {
    let mode: PracticeMode
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            GlassCard {
                VStack(alignment: .leading, spacing: 14) {
                    HStack {
                        Image(systemName: mode.icon)
                            .font(.title2.weight(.bold))
                            .foregroundStyle(.white)
                            .frame(width: 52, height: 52)
                            .background(mode.color, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
                        Spacer()
                        Image(systemName: isSelected ? "checkmark.seal.fill" : "seal")
                            .foregroundStyle(isSelected ? .green : .secondary)
                    }
                    Text(mode.title)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(.primary)
                    Text(mode.localizedTitle)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(mode.color)
                    Text(mode.description)
                        .font(.callout)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.leading)
                    Text("Prompt: \(mode.promptHint)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .padding(10)
                        .background(mode.color.opacity(0.12), in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                }
            }
        }
        .buttonStyle(.plain)
    }
}
