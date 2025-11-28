<div align="center">

[![Stream Deck SDK banner](https://images.ctfassets.net/8j9xr8kwdre8/1ihLKCwNWEfPixs27dq0c0/130be66a5173f332e4caa892a3462893/banner.png)](https://docs.elgato.com/sdk)

# Stream Deck SDK

[![SDK documentation](https://img.shields.io/badge/Documentation-2ea043?labelColor=grey&logo=gitbook&logoColor=white)](https://docs.elgato.com/sdk)
[![Elgato homepage](https://img.shields.io/badge/Elgato-3431cf?labelColor=grey&logo=elgato)](https://elgato.com)
[![Join the Marketplace Makers Discord](https://img.shields.io/badge/Marketplace%20Makers-5662f6?labelColor=grey&logo=discord&logoColor=white)](https://discord.gg/GehBUcu627)
[![Stream Deck npm package](https://img.shields.io/npm/v/%40elgato/streamdeck?logo=npm&logoColor=white)](https://www.npmjs.com/package/@elgato/streamdeck)
[![Build status](https://img.shields.io/github/actions/workflow/status/elgatosf/streamdeck/build.yml?branch=main&label=Build&logo=GitHub)](https://github.com/elgatosf/streamdeck/actions)

</div>

Welcome to the Stream Deck SDK — Designed to make creating plugins for Stream Deck easy, the Stream Deck SDK provides everything you need to connect and communicate with Stream Deck app, letting you focus on the fun stuff.

> Creating Stream Deck plugins with Node.js requires Node.js v20. When installing Node.js, we recommended using a version manager such as [nvm](https://github.com/creationix/nvm) (macOS) or [nvm-windows](https://github.com/coreybutler/nvm-windows) (Windows).

## 🚀 Quick Start

The [Stream Deck CLI](https://github.com/elgatosf/cli) provides commands for creating, testing, and bundling your plugins, and is the easiest way to get started building for Stream Deck. You can also [learn more about getting started](https://docs.elgato.com/streamdeck/sdk/introduction/getting-started) in our documentation.

1. With Node.js installed, install the CLI.

```bash
npm install -g @elgato/cli@latest
```

2. Once installed, run the `create` command to initialize the creation wizard.

```bash
streamdeck create
```

<p align="center">
  <img src="./assets/cli-create.gif">
</p>

## 📂 File Structure

After creating a plugin with `streamdeck create` you'll be provided with a local environment for building a plugin.

```
/
├── *.sdPlugin/
│   ├── bin/
│   ├── imgs/
│   ├── logs/
│   ├── ui/
│   │   └── increment-counter.html
│   └── manifest.json
├── src/
│   ├── actions/
│   │   └── increment-counter.ts
│   └── plugin.ts
├── package.json
├── rollup.config.mjs
└── tsconfig.json
```

The `package.json` provides two scripts for building the plugin.

- `npm run build` - builds the plugin.
- `npm run watch` - continuously watches for changes, and hot-reloads the plugin after build.

## 🎛️ Actions

Actions are the star of the show and enable users to interact with your plugin. Actions are represented as classes that inherit from `SingletonAction`, enabling your plugin to receive events from Stream Deck, for example key down, dial rotate, etc.

The following is an example of an action that listens for the `keyDown` event, and then sets the title of the source action.

```typescript
import { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";

@action({ UUID: "com.elgato.hello-world.say-hello" })
export class SayHelloAction extends SingletonAction {
    /**
     * Listen for the key down event that occurs when a user presses
     * a Stream Deck button, and change the title of the action.
     */
    async onKeyDown(ev: KeyDownEvent) {
        await ev.action.setTitle("Hello world");
    }
}
```

## 🔎 Debugging

Plugins can be debugged using any Node.js debugger, for example Visual Studio Code, Chrome, etc., and by default will have debugging enabled when created with the Stream Deck CLI `streamdeck create` command.

You can configure debugging within the [manifest's Node.js configuration](https://docs.elgato.com/streamdeck/sdk/references/manifest#nodejs).

<!-- prettier-ignore-start -->

```jsonc
{
    // ...
    "Nodejs": {
        "Version": "20",
        "Debug": "enabled"
    },
}
```

<!-- prettier-ignore-end -->

There are four available options when configuring the `Debug` property within the manifest:

- `"enabled"` - the plugin will run with [`--inspect`](https://nodejs.org/api/cli.html#--inspecthostport) allowing debuggers to connect.
- `"break"` - the plugin will launch with [`--inspect-brk`](https://nodejs.org/api/cli.html#--inspect-brkhostport) and will await a debugger attaching before running.
- `string` - a collection of [CLI arguments](https://nodejs.org/api/cli.html) supplied to the plugin.
- `undefined` - debugging is disabled.

> When running the plugin in either debug mode `"enabled"` or `"break"`, a random available port will be allocated to the debug listener each time the plugin launches. If you wish to listen on a specific port, the `Debug` value can be set to a string of CLI arguments, for example to listen on port `12345`, the `Debug` value would be `--inspect=127.0.0.1:12345`.

## 📖 Further Reading

- [Making your first changes](https://docs.elgato.com/streamdeck/sdk/introduction/your-first-changes).
- Learn about [key](https://docs.elgato.com/streamdeck/sdk/guides/keys) and [dial](https://docs.elgato.com/streamdeck/sdk/guides/dials) actions.
- Understand your plugin's metadata within the [manifest JSON file](https://docs.elgato.com/streamdeck/sdk/references/manifest)
- Bundle your plugin for [distribution](https://docs.elgato.com/streamdeck/sdk/guides/distribution).
- Explore [Stream Deck plugin samples](https://github.com/elgatosf/streamdeck-plugin-samples)
