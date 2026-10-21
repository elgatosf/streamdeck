# Image Resizer

A simple image resizer plugin to demonstrate utilizing native dependencies in a Stream Deck plugin. This sample uses [sharp](https://sharp.pixelplumbing.com/) for image processing, which relies on platform-specific native binaries.

<details>
<summary><strong>Quick Start</strong></summary>

1. Install dependencies (this also fetches platform-specific native binaries for `sharp`).

    ```sh
    pnpm install
    ```

2. Build the plugin.

    ```sh
    pnpm build
    ```

3. Link the plugin to Stream Deck.

    ```sh
    streamdeck link com.elgato.image-resizer.sdPlugin
    ```

</details>

## pnpm Setup for Native Modules

Native modules like `sharp` need platform-specific binaries at runtime. We use pnpm here because it can install the macOS and Windows variants into the `.sdPlugin` folder during development, so the plugin bundle includes the files Stream Deck needs when the plugin is bundled.

### 1. Use pnpm at the repo root

In [package.json](package.json):

```json
"packageManager": "pnpm@10.32.0",
"postinstall": "pnpm --dir com.elgato.image-resizer.sdPlugin install --frozen-lockfile"
```

- `packageManager` makes sure contributors use pnpm.
- `postinstall` installs the runtime dependencies inside the plugin folder after the main repo install finishes.
- `--dir` targets the `.sdPlugin` folder, because that is the bundle shipped to Stream Deck.
- `--frozen-lockfile` keeps installs repeatable.

The root project also depends on `sharp` so local TypeScript, bundling, and development tooling can resolve it normally.

### 2. Declare the native dependency in the plugin bundle

In [com.elgato.image-resizer.sdPlugin/package.json](com.elgato.image-resizer.sdPlugin/package.json):

```json
"dependencies": {
    "sharp": "^0.34.5"
}
```

This keeps `sharp` in the actual plugin package, not just in the repo root.

### 3. Add a small pnpm config in the plugin folder

In [com.elgato.image-resizer.sdPlugin/pnpm-workspace.yaml](com.elgato.image-resizer.sdPlugin/pnpm-workspace.yaml):

```yaml
packages:
    - .

nodeLinker: hoisted
packageImportMethod: copy

supportedArchitectures:
    os:
        - win32
        - darwin
    cpu:
        - x64
        - arm64

onlyBuiltDependencies:
    - sharp
```

- `packages: - .` treats the plugin folder as its own small pnpm workspace.
- `nodeLinker: hoisted` produces a flatter `node_modules` layout.
- `packageImportMethod: copy` copies files instead of using symlinks which can sometimes cause issues with zipping and unzipping.
- `supportedArchitectures` tells pnpm which OS and CPU variants to install for optional native packages.
- `onlyBuiltDependencies` allows the native build/install step only for `sharp`.

With that in place, `pnpm install` at the repo root installs normal dev dependencies first, then installs the plugin's runtime dependencies with the macOS and Windows Sharp binaries included.

### Rollup Config (`rollup.config.mjs`)

The key changes in the Rollup configuration to support native modules:

1. **Mark native modules as external** — `sharp` is listed in the `external` array so Rollup does not attempt to bundle its native binaries into the output. At runtime, Node's module resolution walks up from the output directory (`bin/`) and finds `sharp` in the `*.sdPlugin/node_modules` directory.

    ```js
    external: ['sharp'],
    ```

2. **Ignore dynamic requires** — The `@rollup/plugin-commonjs` option `ignoreDynamicRequires: true` prevents Rollup from failing on `require()` calls that sharp's internals use to dynamically load the correct platform binary.

    ```js
    commonjs({ ignoreDynamicRequires: true }),
    ```

> [!WARNING]
> Note that these are the changes required for `sharp`, however, other native modules may require more or less configuration changes.
