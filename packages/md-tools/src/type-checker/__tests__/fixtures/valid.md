# Valid

```ts
const a: number = 1;
```

```ts
import { add } from "./math.js";

const sum: number = add(1, 2);
```

Each code block is its own module, so re-declaring `a` is valid.

```ts
const a = 2;
```
