# my-first-codex-test

This repository keeps the existing web prototype and now also includes a native SwiftUI iOS app prototype for **Xiren English Coach / 喜人樾聊 Digital Human**.

## Existing Web App

The original HTML/CSS/JavaScript files remain at the repository root, including `index.html`, `app.js`, `style.css`, and the supporting data files under `data/`. These files were not removed or replaced.

## iOS App Prototype

The new iOS source lives in `ios/XirenEnglishCoach/` and is designed as a local-first SwiftUI prototype for iPhone and iPad.

### Included Features

- Modern SwiftUI tab navigation: Home, Chat, Voices, Practice, and Profile.
- Premium mobile UI direction with soft gradients, glass-style cards, rounded corners, shadows, and dark-mode-friendly system materials.
- Digital human role selection with four characters:
  - Cheerful Coach / 活泼教练
  - Gentle Tutor / 温柔老师
  - Business Partner / 商务伙伴
  - Comedy Friend / 喜剧朋友
- Practice modes:
  - Daily Chat / 日常对话
  - Travel English / 旅行英语
  - Business English / 商务英语
  - Comedy Improv / 喜剧即兴
  - Pronunciation Drill / 发音训练
  - Listening Practice / 听力训练
- Chat screen with left/right bubbles, timestamps, avatars, local mock coach responses, and a playback button on every coach reply.
- Native iOS speech support using `AVSpeechSynthesizer` and `AVSpeechSynthesisVoice.speechVoices()`.
- Voice picker with English voice discovery plus filters for gender, voice name/search, and language code.
- `UserDefaults` persistence for:
  - `selectedVoiceIdentifier`
  - `selectedCharacter`
  - `selectedPracticeMode`
- Placeholder architecture for future OpenAI, Claude, Gemini, or custom backend integration.

### iOS Source Structure

```text
ios/XirenEnglishCoach/
├── XirenEnglishCoachApp.swift
├── ContentView.swift
├── Models/
│   └── AppModels.swift
├── Services/
│   └── SpeechService.swift
├── ViewModels/
│   └── AppViewModel.swift
└── Views/
    ├── ChatView.swift
    ├── HomeView.swift
    ├── PracticeView.swift
    ├── ProfileView.swift
    ├── VoicePickerView.swift
    └── Components/
        └── DesignSystem.swift
```

## How to Open the iOS App in Xcode

A full `.xcodeproj` is intentionally not checked in yet; the repository contains the complete SwiftUI source scaffold. To run it locally:

1. Open Xcode 15 or newer.
2. Choose **File → New → Project…**.
3. Select **iOS → App** and click **Next**.
4. Use these settings:
   - Product Name: `XirenEnglishCoach`
   - Interface: `SwiftUI`
   - Language: `Swift`
   - Minimum Deployment Target: iOS 16 or newer recommended
5. Save the generated project anywhere convenient, for example inside `ios/`.
6. In Finder or Xcode, add the Swift source files from `ios/XirenEnglishCoach/` into the new app target.
7. If Xcode generated its own `App` and `ContentView` files, replace them with:
   - `ios/XirenEnglishCoach/XirenEnglishCoachApp.swift`
   - `ios/XirenEnglishCoach/ContentView.swift`
8. Ensure the app target links the standard Apple frameworks used by the source. `SwiftUI`, `Foundation`, and `AVFoundation` are imported directly by the files.
9. Select an iPhone or iPad simulator and press **Run**.

The prototype runs fully locally. Voice availability depends on the simulator or physical device language assets installed by iOS.
