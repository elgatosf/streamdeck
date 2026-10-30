---
"@elgato/utils": patch
---

Fixed `EventEmitter` behavior when listeners are added, removed, or throw during an emit:

- Removing a listener during an emit no longer skips the next listener.
- Listeners added during an emit are not called until the next emit.
- `once` listeners can no longer be invoked twice from within a `removeListener` handler.
- `removeAllListeners` no longer loops indefinitely when a `removeListener` handler adds listeners.
- `listenerCount` and `listeners` no longer include listeners pending removal.
- Abort handlers are now unregistered from the `signal` when a listener is removed by other means, preventing long-lived signals from retaining the emitter.
