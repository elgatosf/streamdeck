<div align="center">

# @elgato/utils

Utilities used throughout the Elgato ecosystem.

[![@elgato/utils npm package](https://img.shields.io/npm/v/%40elgato/utils?logo=npm&logoColor=white)](https://www.npmjs.com/package/@elgato/utils)
[![Elgato homepage](https://img.shields.io/badge/Elgato-3431cf?labelColor=grey&logo=Elgato)](https://elgato.com)

</div>

## Installation

```
npm install @elgato/utils
```

## Disposables

### `deferredDisposable`

Creates a new function that implements `Symbol.dispose` and accepts a disposer function. The disposer function is called when the new function is disposed.

```js
import { deferredDisposable } from "@elgato/utils";

{
    using deferredDisposable(() => console.log("Hello world"));
    // ...
}

// "Hello world"
```

### `DisposableStack`

Stack of managed resources, controlled by a single disposer. Partial polyfill of TC39 Explicit Resource Management's `DisposableStack`.

```js
import { DisposableStack } from "@elgato/utils";

{
    using stack = new DisposableStack();
    stack.defer(() => "Hello");
    stack.defer(() => "world");
    // ...
}

// "Hello"
// "world"
```

## Events

### `EventEmitter`

An strongly-typed event emitter that enables the listening for, and emitting of, events; supported in browser and Node.js environments.

```ts
import { EventEmitter } from "@elgato/utils";

type EventMap = {
    created: [name: string];
};

const emitter = new EventEmitter<EventMap>();
emitter.on("created", (name: string) => {
    // ...
});
```

## JSON

### `JsonObject`

Type that represents an object within JSON.

```ts
import { type JsonObject } from "@elgato/utils";

const obj: JsonObject = {
    name: "Elgato",
};
```

### `JsonPrimitive`

Type that represents a primitive within JSON, for example a string or number.

```ts
import { type JsonPrimitive } from "@elgato/utils";

const value: JsonPrimitive = "Elgato";
```

### `JsonValue`

Type that represents a valid JSON value, for example an object, array, or primitive.

```ts
import { type JsonValue } from "@elgato/utils";

const value: JsonValue = ["Hello", "World"];
```

## Miscellaneous

### `Enumerable`

Provides a read-only iterable collection of items that also acts as a partial polyfill for iterator helpers.

```js
import { Enumerable } from "@elgato/utils";

const items = new Enumerable(["One", "Two", "Three", "Four"]);
items
    .drop(1) // Drop "One"
    .take(2); // Take "Two" & "Three"
```

Polyfilled iterator helpers:

- `Symbol.iterator`
- `asIndexedPairs()`
- `drop(limit)`
- `every(predicate)`
- `filter(predicate)`
- `find(predicate)`
- `findLast(predicate)`
- `flapMap(mapper)`
- `forEach(fn)`
- `includes(search)`
- `map(mapper)`
- `reduce(accumulator, initial)`
- `some(predicate)`
- `take(limit)`
- `toArray()`

### `Lazy`

Object that wraps a lazily instantiated value, similar to C# [`Lazy<T>`](https://learn.microsoft.com/en-us/dotnet/framework/performance/lazy-initialization).

```js
import { Lazy } from "@elgato/utils";

const lazy = new Lazy(() => "Hello world");
lazy.value; // "Hello world";
```

## Objects

### `get(source, path)`

Gets the value at the specified (deep) path.

```js
import { get } from "@elgato/utils";

const obj = {
    name: "Elgato",
};

get(obj, "name"); // Elgato
```

### `set(target, path, value)`

Sets the value at the specified (deep) path.

```js
import { get } from "@elgato/utils";

const obj = {
    name: "Gato",
};

set(obj, "name", "Elgato"); // { name: "Elgato" }
```

## Parsers

### `parseBoolean(value)`

Parses the value a truthy-boolean; the strings `"0"` and `"false"` are parsed as `false`.

```js
import { parseBoolean } from "@elgato/utils";

const a = parseBoolean(1); // true
const b = parseBoolean("false"); // false
```

### `parseNumber(value)`

Attempts to parse a value to a number; returns `undefined` when parsing was unsuccessful.

```js
import { parseNumber } from "@elgato/utils";

const number = parseNumber("13"); // 13
```

## Processes

### `getProcesses()`

Gets the running processes in a cross-platform way.

```js
import { getProcesses } from "@elgato/utils";

const processes = await getProcesses();
console.log(processes);
```

## Promises

### `withResolvers()`

Function that returns an object that contains the promise, and two functions to resolve or reject it. Polyfill of [Promise.withResolvers()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers).

```js
import { withResolvers } "@elgato/utils";

const { promise, resolve, reject } = withResolvers<string>();
```

## Strings

### `format(format, ...args)`

Formats the specified string, replacing placeholders with their associated arguments.

```js
import { format } from "@elgato/utils";

format("Hello {0}, from {1}", "world", "Elgato"); // Hello world, from Elgato
```

## Timers

### `debounce(fn, delay)`

Wraps a function; subsequent invocations of the wrapped function made within the specified delay are debounced to prevent multiple calls.

```js
import { debounce } from "@elgato/utils";

const fn = debounce(() => console.log("Hello world"), 1000);

fn(); // Debounced
fn(); // "Hello world"
```
