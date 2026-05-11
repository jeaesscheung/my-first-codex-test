import SwiftUI

/// Root tab shell for the iPhone/iPad prototype.
struct ContentView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem { Label("Home", systemImage: "house.fill") }

            ChatView()
                .tabItem { Label("Chat", systemImage: "message.fill") }

            VoicePickerView()
                .tabItem { Label("Voices", systemImage: "speaker.wave.2.fill") }

            PracticeView()
                .tabItem { Label("Practice", systemImage: "sparkles") }

            ProfileView()
                .tabItem { Label("Profile", systemImage: "person.crop.circle.fill") }
        }
        .tint(Color(hex: 0x6366F1))
    }
}

#Preview {
    ContentView()
        .environmentObject(AppViewModel())
        .environmentObject(SpeechService())
}
