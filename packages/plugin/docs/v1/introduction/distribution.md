---
sidebar_position: 4
---

# Distribution

Plugins are bundled and distributed as `.streamDeckPlugin` files. Once bundle, the file contains everything the user needs to run your plugin within Stream Deck. In this article you'll learn about preparing and bundling your plugin for publishing on Marketplace.

## Validation

Plugins must be validated to ensure they meets requirements to work within Stream Deck. You can validate your plugin using the Stream Deck CLI's [`validate`](https://docs.elgato.com/streamdeck/cli/commands/validate) command. This validation includes things like manifest schema validation, file structure, and more.

```bash
streamdeck validate com.elgato.hello-world.sdPlugin
```

<Note>
  **Marketplace Guidelines**

  When publishing on Marketplace, your plugin must follow a set of guidelines, for example for vocabulary and image styles. In doing so, it ensures users have a consistent and familiar experience within Stream Deck.

  Please review the [submission guidelines](https://docs.elgato.com/guidelines/stream-deck/plugins) before submitting your plugin to ensure that all necessary requirements are fulfilled.
</Note>

## Package

Once you have a valid plugin, you can package it into a `.streamDeckPlugin` file using the Stream Deck CLI's [`pack`](https://docs.elgato.com/streamdeck/cli/commands/pack) command.

```bash
streamdeck pack com.elgato.hello-world.sdPlugin
```

The `.streamDeckPlugin` file acts as an installer, allowing users to double-click the file and install your plugin into Stream Deck.

<Tip>
  **Validation**

  The [`pack`](https://docs.elgato.com/streamdeck/cli/commands/pack) command will also validate the plugin before packaging it.
</Tip>

## Publish

Become a Maker and publish your plugin on Marketplace! Publishing your plugin on Marketplace makes your plugin discoverable to millions of Stream Deck users, and keeps them up to date when you release new versions.

Plugins on Marketplace are submitted, and managed, within [Maker Console](https://maker.elgato.com), a dedicated space for Makers and their products. Before submitting your plugin via Maker Console you should:

- Test your plugin thoroughly. Looking for beta testers? Join the [Marketplace Maker Discord](https://discord.gg/Nv7Qtjkcs8) and share your plugin to get feedback from fellow Makers.
- Review the [style guides](https://docs.elgato.com/guidelines/stream-deck/plugins), and make sure your plugin is Marketplace ready.

When everything is ready, [learn more](https://docs.elgato.com/marketplace/become-a-maker) about submitting to Marketplace.

<Note>
  **Returning Makers**

  Returning Makers, with plugins published before Maker Console, may not see their plugins in Maker Console upon first login. For assistance with accessing your plugins, please email our Maker Relations team on maker@elgato.com.
</Note>
