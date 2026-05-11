import SwiftUI

@main
struct XirenEnglishCoachApp: App {
    @StateObject private var appViewModel = AppViewModel()
    @StateObject private var speechService = SpeechService()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appViewModel)
                .environmentObject(speechService)
        }
    }
}
