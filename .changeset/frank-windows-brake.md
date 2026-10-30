---
"@elgato/utils": minor
---

**Breaking:** Removed untyped event names from `EventEmitter`; only events defined in the event map, plus `newListener` and `removeListener`, can be listened to.
