# Change Log

## 0.7.0

### Minor Changes

- 4ba022b: **Breaking:** Removed untyped event names from `EventEmitter`; only events defined in the event map, plus `newListener` and `removeListener`, can be listened to.
- 4ba022b: **Breaking:** `EventEmitter.emit` no longer accepts `newListener` or `removeListener`; these are now only emitted internally when listeners are added or removed.
- 4ba022b: **Breaking:** Removed `EventArgUnion` type in favour of new `NewListenerArgs` and `RemoveListenerArgs`.

### Patch Changes

- 4ba022b: Fixed `EventEmitter` behavior when listeners are added, removed, or throw during an emit:

    - Removing a listener during an emit no longer skips the next listener.
    - Listeners added during an emit are not called until the next emit.
    - `once` listeners can no longer be invoked twice from within a `removeListener` handler.
    - `removeAllListeners` no longer loops indefinitely when a `removeListener` handler adds listeners.
    - `listenerCount` and `listeners` no longer include listeners pending removal.
    - Abort handlers are now unregistered from the `signal` when a listener is removed by other means, preventing long-lived signals from retaining the emitter.

- 4ba022b: Fixed `EventEmitter.disposableOn` to only remove the listener it registered (previously all matching listeners were removed).
- 4ba022b: Added optional `options` parameter, supporting `once` and `signal`, to `addListener`, `disposableOn`, `on`, `once`, `prependListener`, and `prependOnceListener` within `EventEmitter`. Listeners removed by aborting `signal` do not emit `removeListener`.

## 0.6.2

### Patch Changes

- 21893cf: Updated TypeScript configuration to use @elgato/tsconfig.

## 0.6.1

### Patch Changes

- 2bfaf9a: Removed dependency on prettier, in favor of monorepo formatting.

## 0.6.0

### Minor Changes

- 483f918: Updated `set` to not trigger property setters.
- 483f918: Fixed type signature of `target` parameter for `set`.

### Patch Changes

- 483f918: Updated `set` to error when an unsafe path is detected to prevent prototype pollution.

## 0.5.0

### Minor Changes

- cf56a87: Fixed return type of `parseBoolean`.
- cf56a87: Fixed JSON-RPC error response to mark `data` as optional.
- cf56a87: Migrated repository to new Stream Deck SDK monorepo.

### Patch Changes

- cf56a87: Added support for file-logging to nested directories.

## 0.4.5

### Minor Changes

- Add data-list, option, and option group types and creation functions.
- Fix support for importing into the browser by lazily importing Node.js modules as part of `getProcesses()`.

## 0.4.4

### Minor Changes

- Fix format test

## 0.4.3

### Minor Changes

- Add export `ProcessInfo` type

## 0.4.2

### Minor Changes

- Add `getProcesses` function to retrieve a list of running processes.

## 0.4.1

### Minor Changes

- Add string formatting via `format`.

## 0.4.0

### Major Changes

- Add support for monitoring new and removed events to align more closely with Node.js implementation.
    - Emits `newListener` when listeners are added.
    - Emits `removeListener` when listeners are removed.

### Minor Changes

- Add support for changing the default language within an `I18nProvider`.

## 0.3.1

### Minor Changes

- Fix default timeout of RPC requests.

## 0.3.0

### Major Changes

- Update Node.js functionality to be optional.
- `FileTarget` is now importable directly via `@elgato/utils/logging/file-target.js`.
- `FileTarget` removed from `@elgato/utils/logging`.

### Minor Changes

- Add `DisposableStack` to manage multiple disposables.

## 0.2.1

### Minor Changes

- Fix missing type export for `RpcServerClient`.

## 0.2.0

### Major Changes

- Replace `unidentifiedResponse` event in `RpcClient` with `options.error`.
- Replace `RpcGateway` with `createRpcServerClient` to streamline interface.
- Rename `RpcProxy` to `RpcSender`.
- Rename `RpcServer.add` to `RpcServer.addMethod`.

### Minor Changes

- Update `RpcClient` to accept options.
- Remove requirement of a result from `RpcSender`.
- Remove `node:stream` import within `RpcClient`.

## 0.1.0

### Major Changes

- Add `deferredDisposable` for creating managed resources.
- Add type-safe `EventEmitter` class for browser and node.
- Add `JsonObject`, `JsonPrimitive`, and `JsonValue` to support JSON types.
- Add `Enumerable` class to support lazy evaluation (iterator helper polyfill).
- Add `Lazy<T>` class for lazy (singleton) value evaluation.
- Add `get` and `set` helper functions for objects.
- Add `parseBoolean` and `parseNumber` for (opinionated) parsing values.
- Add `withResolvers` function to polyfill `Promises.withResolvers()`.
- Add `debounce` function.
