# Password Wallet

A simple password wallet UI built from the [Figma design](https://www.figma.com/design/w45tZVbgZUE5oBgVAz5UmF/Password-wallet?node-id=1-2).

## Run locally (browser)

Open `index.html` in a browser, or serve the folder:

```bash
npx --yes serve .
```

## Build Android APK

The app is set up with **Capacitor** for Android. See **[BUILD-APK.md](BUILD-APK.md)** for full steps.

Quick build (requires [Android Studio](https://developer.android.com/studio) + SDK):

```powershell
npm install
npm run android:build
```

Output: `Password-Wallet-debug.apk` in the project folder.

## Features

- 4×4 grid of service shortcuts matching the design
- **Multiple users** — switch users from the dropdown; each user has their own credentials per service
- Click any icon to save username, password, and notes (stored in `localStorage`)
- Green dot on icons that have saved credentials for the **active user**
- Add users (`+`), rename or delete users (`⋯` manage dialog)

## Stack

- Plain HTML, CSS, and JavaScript (no build step)
- [Jersey 10](https://fonts.google.com/specimen/Jersey+10) for the pixel title font
