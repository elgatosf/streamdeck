---
"@elgato/utils": patch
---

Added optional `options` parameter, supporting `once` and `signal`, to `addListener`, `disposableOn`, `on`, `once`, `prependListener`, and `prependOnceListener` within `EventEmitter`. Listeners removed by aborting `signal` do not emit `removeListener`.
