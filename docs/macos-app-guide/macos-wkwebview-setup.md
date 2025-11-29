# macOS WKWebView App Guide

## Goal
Wrap the existing HTML/CSS/JS bundle into a native macOS `.app` using SwiftUI + `WKWebView`. This keeps the app lightweight, fully native, and ready for signing/notarization and updates.

## Prerequisites
- macOS with Xcode installed (latest stable).
- Developer ID/Application certificate for signing (or a Team profile if only running locally).
- Your built assets (e.g., `dist/` or `public/`). Prefer the production build output.

## Project Setup in Xcode
1. Open Xcode → File → New → Project… → **App** (macOS).
2. Product Name: `YourAppName` (no spaces is okay), Team: your dev team, Interface: **SwiftUI**, Language: **Swift**.
3. Choose a Bundle Identifier (reverse-DNS, e.g., `com.yourcompany.mdviewer`).
4. Save the project in your repo (or alongside it) if you want it checked in.

## Add Web Assets to the Bundle
- Decide which folder to ship (e.g., `dist/`).
- In Xcode Project navigator, drag the folder or files into the app target. In the dialog, check **Copy items if needed** and ensure the app target is selected. This puts them into **Copy Bundle Resources** so they ship inside the `.app`.
- If you build assets with Vite, set `build.outDir` to something stable (e.g., `dist`) and always bundle that output.

## SwiftUI Host with WKWebView
Add a simple WebView bridge and load the bundled `index.html`.

```swift
import SwiftUI
import WebKit

struct WebView: NSViewRepresentable {
    func makeNSView(context: Context) -> WKWebView {
        let webView = WKWebView()
        if let url = Bundle.main.url(forResource: "index", withExtension: "html") {
            // Allow access to sibling assets (CSS/JS) in the same folder.
            webView.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        // Optional: enable dev tools during development
        webView.configuration.preferences.setValue(true, forKey: "developerExtrasEnabled")
        return webView
    }

    func updateNSView(_ nsView: WKWebView, context: Context) {}
}

@main
struct AppMain: App {
    var body: some Scene {
        WindowGroup {
            WebView()
        }
    }
}
```

Notes:
- If your entry file is not `index.html`, adjust the `forResource` and extension.
- If you need to load remote resources, set App Transport Security (ATS) exceptions in Info.plist, but avoid broad exceptions.

## Entitlements and Sandbox
- For Mac App Store: enable App Sandbox and only add the capabilities you need (e.g., file read/write with user intent). For direct download, sandbox is optional but recommended for security posture.
- For file access beyond the bundle, use standard `NSOpenPanel`/`NSSavePanel` to get user-approved bookmarks.
- Add privacy keys to Info.plist if you access camera/mic/location: e.g., `NSCameraUsageDescription`, `NSMicrophoneUsageDescription`.

## App Icon
1. In Xcode, select `Assets.xcassets` → delete the placeholder AppIcon if needed.
2. Add a new App Icon set (or use the default) and drop PNGs at required sizes (Xcode shows slots). A single 1024×1024 PNG can be sliced by tools, but supplying all sizes yields the best result.
3. Ensure the App Icon is set in the target’s General → App Icon field.

## Building and Running
- Build/Run from Xcode (⌘R). The app will appear in Dock with your icon.
- The built `.app` lives in `DerivedData/<App>/Build/Products/Debug/YourApp.app` (Release for Archive). Right-click → Show in Finder.

## Code Signing and Notarization (Direct Distribution)
1. Target → Signing & Capabilities → select your Developer ID Application certificate for Release. Debug can use a team profile.
2. Product → Archive → Distribute App → Developer ID → Upload (for notarization) or export notarized build.
3. After notarization succeeds, attach the staple: `xcrun stapler staple YourApp.app` (Xcode Organizer can also do it). This avoids Gatekeeper warnings.
4. Optionally wrap in a `.dmg` for distribution (e.g., using create-dmg or a custom script).

## Updates
- **Sparkle (recommended for direct downloads):**
  - Add Sparkle via Swift Package Manager (Xcode → File → Add Packages → `https://github.com/sparkle-project/Sparkle`).
  - Wire up `SPUStandardUpdaterController` (AppKit) or use the SwiftUI-friendly approach; provide an AppCast XML and signed update archives. Sparkle handles “A new version is available” dialogs and delta updates.
  - Sign the updates with your ed25519 key and ensure the app is signed/notarized.
- **Mac App Store:** shipping through the Store delegates updates to Apple. Requires sandboxing and MAS review; no Sparkle.
- **Manual:** ship new downloads and prompt users to replace the app; simplest but no auto-update.

## Dev/Debug Tips
- Enable Web Inspector: `developerExtrasEnabled` above; then right-click → Inspect Element.
- Use `WKWebView` configuration for custom user scripts, message handlers, or CSP tweaks if needed.
- For CSP/local loading, prefer relative paths in your HTML and ensure assets are inside the bundle.

## Folder Layout Example
```
YourXcodeProject/
├─ YourApp.xcodeproj
├─ YourApp/
│  ├─ Assets.xcassets (with AppIcon)
│  ├─ Info.plist
│  ├─ WebView.swift (the WKWebView bridge)
│  ├─ AppMain.swift (entry point)
│  └─ dist/ (bundled HTML/CSS/JS)
└─ README.md
```

## Common Gotchas
- Missing assets if you forgot to check “Copy items if needed” or didn’t include the folder in the target.
- ATS blocks remote HTTP; add domain-specific exceptions, not `NSAllowsArbitraryLoads`.
- Unsandboxed file access fails on App Store builds; use panels/bookmarks.
- Sparkle requires signed appcasts and notarized builds; test updates on a separate machine/user.

## Next Steps
- Decide where the Xcode project will live (inside this repo or adjacent).
- Build your production assets (e.g., `npm run build` for Vite) and point the bundle to `dist/`.
- Add the Swift files above, set the icon, and archive → notarize.
- If direct download: integrate Sparkle for updates; if App Store: enable sandbox and follow MAS submission flow.
