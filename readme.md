[![npm](https://img.shields.io/npm/v/@mindw1n/webnative)](https://www.npmjs.com/package/@mindw1n/webnative)
[![license](https://img.shields.io/github/license/mindw1n/webnative)](LICENSE)

# webnative

> Build web. Ship anywhere.

Build desktop and mobile applications using web technologies you already know.
No cross-compilation or config hell. No manual dependencies. Just you and your beautiful app.

![usecase](docs/screencast.mp4)

## Why webnative?

Most cross-platform frameworks make you choose — either great DX or great results.
Electron ships Chromium (150MB+). Tauri requires Rust. Capacitor is mobile-only.

webnative is different:

- **JavaScript everywhere** — TypeScript/JavaScript for both frontend and backend
- **Native WebView** — uses the system's WebView, not a bundled browser
- **One codebase** — same code for Linux, Windows, macOS, Android, and iOS
- **Smart API abstraction** — backend runs locally on desktop, seamlessly switches on mobile
- **Zero friction** — the framework pushes really hard to give you 'works like magic' dx while you can focus on your app

## Getting started

```bash
npm install -g @mindw1n/webnative
webnative init my-app && cd my-app
webnative build linux
```

## How it works

On desktop, your frontend communicates with a local Node.js backend via IPC.
On mobile, the same frontend code talks to a remote API or on-device apis.
webnative handles the switching — you just write your app.

## Targets

| Platform | Status |
|----------|--------|
| Linux (self-contained) | ✅ v1 |
| Windows (self-contained) | ✅ v2 |
| Android | ✅ v3 |
| Windows (setup) | 🔜 v4 |
| Linux (flatpak) | 🔜 v5 |
| iOS | 🔜 v6 |
| macOS | 🔜 v7 |

## Requirements

- Node.js 22+
- Docker (sometimes needed for cross-compilation)
