<div align="center">

[![Stream Deck SDK banner](https://images.ctfassets.net/8j9xr8kwdre8/1ihLKCwNWEfPixs27dq0c0/130be66a5173f332e4caa892a3462893/banner.png)](https://docs.elgato.com/sdk)

# Stream Deck CLI

[![SDK documentation](https://img.shields.io/badge/Documentation-2ea043?labelColor=grey&logo=gitbook&logoColor=white)](https://docs.elgato.com/streamdeck/cli)
[![Elgato homepage](https://img.shields.io/badge/Elgato-3431cf?labelColor=grey&logo=elgato)](https://elgato.com)
[![Join the Marketplace Makers Discord](https://img.shields.io/badge/Marketplace%20Makers-5662f6?labelColor=grey&logo=discord&logoColor=white)](https://discord.gg/GehBUcu627)
[![Stream Deck CLI npm package](https://img.shields.io/npm/v/%40elgato/cli?logo=npm&logoColor=white)](https://www.npmjs.com/package/@elgato/cli)
[![Build status](https://img.shields.io/github/actions/workflow/status/elgatosf/cli/build.yml?branch=main&label=Build&logo=GitHub)](https://github.com/elgatosf/cli/actions)

</div>

## Installation

```
npm install -g @elgato/cli@latest
```

## Usage

```
Usage: streamdeck [options] [command]

Options:
  -v                            display CLI version
  -l, --list                    display list of installed plugins
  -h, --help                    display help for command

Commands:
  create                        Stream Deck plugin creation wizard.
  link [path]                   Links the plugin to Stream Deck.
  unlink [options] <uuid>       Unlinks the plugin from Stream Deck.
  list [options]                Display list of installed plugins.
  restart|r <uuid>              Starts the plugin in Stream Deck; if the plugin is already running, it is stopped first.
  stop|s <uuid>                 Stops the plugin in Stream Deck.
  dev [options]                 Enables developer mode.
  validate [options] [path]     Validates the Stream Deck plugin.
  pack|bundle [options] [path]  Creates a .streamDeckPlugin file from the plugin.
  config                        Manage the local configuration.

Alias:
  streamdeck
  sd
```

## Creating a Stream Deck plugin

The `streamdeck create` command enables you to scaffold a new Stream Deck plugin with ease. Running the command will initialize the creation wizard, and guide you through creating a new plugin.

<p align="center">
  <img src="./assets/cli-create.gif">
</p>

## Further Reading

-   Learn more about [Stream Deck CLI commands](https://docs.elgato.com/streamdeck/cli).
-   Read about [getting started with the Stream Deck SDK](https://docs.elgato.com/sdk).
