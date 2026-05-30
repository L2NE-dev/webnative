# Project goal
- Any platform can build for any target with almost zero friction for developer
- The application itself is always web based
- Frontend is executed on native WebView component to minimize bundle size
- Any backend can be used on desktop platforms, as long as it implements the webnative IPC interface
- Mobile platforms can't support backend, so api abstraction layer is necessary.
- The cli tool also should be able to create self-contained apps, but in this case the bundle size don't matter
- Always try to build natively. If not possible, fall back to Docker. If Docker is not installed, attempt to install it with user permission. If that fails, explain clearly why Docker is needed and how to install it manually.

## v1 (status: ongoing development)
- Linux target only
- Self-contained AppImage build pipeline
- Optional Node.js backend support
- Dev environment: Windows and Linux supported
- No Windows/macOS/mobile *targets* in v1
