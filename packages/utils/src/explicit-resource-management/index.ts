// Polyfill, explicit resource management https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Symbol as any).dispose ??= Symbol("Symbol.dispose");

export * from "./deferred.js";
export * from "./disposable-stack.js";
export * from "./disposable.js";
