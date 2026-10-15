---
sidebar_position: 13
---

# Logging

Logging is a useful way track the flow of functionality, and can assist with diagnosing bugs within your plugin. By default, the Stream Deck SDK provides support for logging between the runtime consoles, as well as writing logs to the file system.

In this guide you'll learn:

- How to write log entries using the Stream Deck SDK.
- Where your plugin's logs are located.
- Using log levels and logger scopes to help identify logs.

## Writing Logs

Logs are written using a `Logger` instance, with the root logger located on the default `streamDeck` import, for example:

<!-- snippet: node/guides/logging/logger.ts -->

```ts title="Info level log" {3}
import streamDeck from "@elgato/streamdeck";

streamDeck.logger.info("Hello world");

streamDeck.connect();
```

<Tip>
  It is recommended to use `streamDeck.logger` instead of `console`. Using `streamDeck.logger` ensures your plugin's logs are written to all available targets, for example the LOG file.
</Tip>

## Reading Logs

All logs written to a logger are output to targets based on the source of the log entry, and the plugin's environment, for example whether it is in production or development. The log targets are:

| Source                  | Environment | Targets                                                                                                    |
| ----------------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| Plugin                  | Development | <ul><li>[File](#log-files)</li><li>[Console (Plugin)](#console)</li></ul>                                  |
| Property Inspector (UI) | Development | <ul><li>[File](#log-files)</li><li>[Console (Plugin)](#console)</li><li>[Console (UI)](#console)</li></ul> |
| Plugin                  | Production  | <ul><li>[File](#log-files)</li></ul>                                                                       |
| Property Inspector (UI) | Production  | <ul><li>[File](#log-files)</li><li>[Console (UI)](#console)</li></ul>                                      |

### Log Files

File logging is provided as standard, allowing for writing logs to LOG files. These LOG files are found within your plugin's `logs` directory, for example:

```text
com.elgato.hello-world.sdPlugin/logs/com.elgato.hello-world.0.log
└─────────┬──────────┘               └─────────┬──────────┘ └──┐
     Plugin UUID                          Plugin UUID        Index
```

<Warning>
  Uninstalling a plugin will also remove its associated log files. When diagnosing issues, we recommend requesting the logs prior to suggesting a re-install.
</Warning>

#### Format

Logs are written in the following format:

```text
<iso_date> <log_level> [[scope]: ]<message>
```

For example:

```log title="com.elgato.hello-world.sdPlugin/logs/com.elgato.hello-world.0.log"
2024-05-05T12:35:13.000Z INFO  Hello world
```

#### File Rotation

The file target also provides automatic file rotation of your plugin's log files, this means that:

- Your plugin's 10 most recent log files are available, with `0` being the most recent.
- Log files never exceed 10 MiB.

File rotation occurs, i.e. a new log file is created and the oldest removed, when one of the following occurs:

- Your plugin starts.
- The current log file exceeds 10 MiB.

### Console

Whilst developing your plugin, logs are also mirrored to the various consoles supported by the Stream Deck SDK. The supported consoles are:

- The Node.js terminal when debugging your plugin.
- The browser console when debugging your property inspectors.

Where available, the console logger maps one-to-one with the native console to provide more insightful messages and familiarity. The mapping is as follows:

<!-- snippet: node/guides/logging/native.ts -->

```ts title="Logger vs Console"
import streamDeck from "@elgato/streamdeck";

// console.error(...)
streamDeck.logger.error("Failures or exceptions");

// console.warn(...)
streamDeck.logger.warn("Recoverable errors");

// console.log(...);
streamDeck.logger.info("Hello world");
streamDeck.logger.debug("Debugging information");
streamDeck.logger.trace("Detailed messages");

streamDeck.connect();
```

## Log Level

Log entries are associated with log levels to assist with indicating their severity. In the previous chapter, you created an `INFO` log entry using:

```ts
streamDeck.logger.info("Hello world");
```

In addition to `INFO`, it is also possible to create a log with one of the following log levels:

<!-- snippet: node/guides/logging/levels.ts -->

```ts title="Log levels"
import streamDeck from "@elgato/streamdeck";

streamDeck.logger.error("Failures or exceptions");
streamDeck.logger.warn("Recoverable errors");
streamDeck.logger.info("Hello world");
streamDeck.logger.debug("Debugging information");
streamDeck.logger.trace("Detailed messages");

streamDeck.connect();
```

| Level                        | Value            | Description                                                                                                                                                         |
| ---------------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Error       | `LogLevel.ERROR` | Logs that require immediate attention. For example, module failure, unexpected behavior, or data loss/corruption.                                                   |
| Warning     | `LogLevel.WARN`  | Represents abnormal behavior, but a recoverable state. For example, a value resorting to a fallback value.                                                          |
| Information | `LogLevel.INFO`  | General information.                                                                                                                                                |
| Debug       | `LogLevel.DEBUG` | Log entries for debugging and development. For example, variable values.                                                                                            |
| Trace       | `LogLevel.TRACE` | Detailed entries for analyzing the context and flow of execution. For example, network traffic, IPC communication. These entries may contain sensitive information. |

You can also control _lowest_ level that will be written to the logger, for example if you want to only log error and warning messages, you would do the following:

<!-- snippet: node/guides/logging/log-level.ts -->

```ts title="Setting the log level" {3}
import streamDeck from "@elgato/streamdeck";

streamDeck.logger.setLevel("warn");

streamDeck.logger.error("Failures or exceptions");
streamDeck.logger.warn("Recoverable errors");
streamDeck.logger.info("Hello world"); // No output.
streamDeck.logger.debug("Debugging information"); // No output.
streamDeck.logger.trace("Detailed messages"); // No output.

streamDeck.connect();
```

<Warning>
  The default log level is dependent on the mode of the plugin:

  - Development, the default log level is `DEBUG`.
  - Production, the default log level is `INFO`, with `DEBUG` being the lowest possible level.
</Warning>

## Creating Loggers

Additional child loggers may be created from an existing logger, each of which is called a "scope." A scope can be useful to identify the source of a log message, with the scopes acting as breadcrumbs. For example:

<!-- snippet: node/guides/logging/scopes-main.ts -->

```ts title="Scoped loggers" {3}
import streamDeck from "@elgato/streamdeck";

const scopedLogger = streamDeck.logger.createScope("Main");
scopedLogger.info("Hello world");

streamDeck.connect();
```

```log title="com.elgato.hello-world.sdPlugin/logs/com.elgato.hello-world.0.log"
2024-05-05T12:35:13.000Z INFO  Main: Hello world
```

Scoped loggers can also be nested, for example:

<!-- snippet: node/guides/logging/scopes-nested.ts -->

```ts title="Nested scoped loggers" {3,6}
import streamDeck from "@elgato/streamdeck";

const scopedLogger = streamDeck.logger.createScope("Main");
scopedLogger.info("Hello world");

const nestedLogger = scopedLogger.createScope("Nested");
nestedLogger.info("Test");

streamDeck.connect();
```

```log title="com.elgato.hello-world.sdPlugin/logs/com.elgato.hello-world.0.log"
2024-05-05T12:35:13.000Z INFO  Main: Hello world
2024-05-05T12:35:13.000Z INFO  Main->Nested: Test
```

## Stream Deck Logs

In addition to the logs written by your plugin, the Stream Deck app also writes logs to help diagnose issues.

- On Windows, logs are located at `%appdata%\Elgato\StreamDeck\logs\`.
- On macOS, logs are located at `~/Library/Logs/ElgatoStreamDeck/`.

Stream Deck uses a log rotation in which each run of the app creates a new log file, with the most recent log file being `StreamDeck0.log`.
