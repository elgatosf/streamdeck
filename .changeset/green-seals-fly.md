---
"@elgato/utils": minor
---

**Breaking:** `EventEmitter.emit` no longer accepts `newListener` or `removeListener`; these are now only emitted internally when listeners are added or removed.
