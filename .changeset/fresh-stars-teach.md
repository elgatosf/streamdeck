---
"@elgato/utils": patch
---

Fixed `EventEmitter.disposableOn` to only remove the listener it registered (previously all matching listeners were removed).
