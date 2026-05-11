import SwiftUI

/// Shared mobile visual language: gradients, glass cards, and compact metadata chips.
struct AppBackground: View {
    var body: some View {
        LinearGradient(
            colors: [Color(hex: 0xEEF2FF), Color(hex: 0xFDF2F8), Color(hex: 0xECFEFF)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .overlay {
            RadialGradient(colors: [Color.white.opacity(0.45), .clear], center: .topTrailing, startRadius: 10, endRadius: 420)
        }
        .ignoresSafeArea()
    }
}

struct GlassCard<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(18)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .stroke(Color.white.opacity(0.32), lineWidth: 1)
            )
            .shadow(color: Color.black.opacity(0.10), radius: 22, x: 0, y: 14)
    }
}

struct MetadataChip: View {
    let icon: String
    let text: String
    var tint: Color = .blue

    var body: some View {
        Label(text, systemImage: icon)
            .font(.caption.weight(.semibold))
            .foregroundStyle(tint)
            .lineLimit(1)
            .padding(.horizontal, 10)
            .padding(.vertical, 7)
            .background(tint.opacity(0.12), in: Capsule())
    }
}

struct AvatarBadge: View {
    let emoji: String
    let colors: [Color]
    var size: CGFloat = 56

    var body: some View {
        Text(emoji)
            .font(.system(size: size * 0.46))
            .frame(width: size, height: size)
            .background(
                LinearGradient(colors: colors, startPoint: .topLeading, endPoint: .bottomTrailing),
                in: RoundedRectangle(cornerRadius: size * 0.32, style: .continuous)
            )
            .shadow(color: colors.first?.opacity(0.35) ?? .clear, radius: 16, x: 0, y: 8)
    }
}
