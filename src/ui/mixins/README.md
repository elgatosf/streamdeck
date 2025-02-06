# Mixins

## Persistable&lt;T&gt;

Mixin that provides persisting a value to Stream Deck settings (action / global).

```mermaid
classDiagram
    class Persistable~T~ {
        + global: boolean
        + setting?: string
        + value?: T
        # debounceSave: boolean
    }
```

## Input

Mixin that provides common functionality for input elements.

```mermaid
classDiagram
    class Input {
        + disabled: boolean
        # inputRef: Ref~HTMLInputElement~
    }
```

## Option

Mixin that provides information for a selectable option.

```mermaid
classDiagram
    class Option {
        + htmlValue?: string
        + type: "boolean" | "number" | "string"
        + typedValue?: boolean | number | string
    }
```
