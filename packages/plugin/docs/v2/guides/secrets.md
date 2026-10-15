---
unlisted: true
---

# Secrets

**Deprecated**

Plugins distributed on Marketplace with DRM enabled have access to the secrets API. This API enables plugin to define secrets, and access them at runtime in a secure way.

In this article you'll learn about the benefits of secrets, and how to use them within your plugin.

> [!CAUTION]
> **Deprecation notice**
>
> The Secrets API has been deprecated and will no longer receive updates. Support for accessing secrets using the API will be removed in a future release, and it is recommended that you migrate the use of all secrets to a secure remote source.

<details>
<summary>Disclaimer</summary>

Whilst efforts are taken to protect secrets, the secrets API can never be one hundred percent bulletproof, and before using it you should:

- Review the sensitivity of information being distributed.
- Ensure backups are in place in the event a secret is compromised.
- Have the ability to revoke or void secrets remotely.

Elgato takes no responsibility for the loss of secrets, and the secrets API is used at your own risk.

</details>

## Introduction

The secrets API is available to DRM protected plugins distributed on Marketplace, and allows your plugins to access their obfuscated secrets at runtime. With access to secrets, plugins are able to utilize APIs and services that might otherwise be unavailable, such as those requiring client keys.

## Defining Secrets

During development, secrets are defined within a secrets JSON file, `secrets.json`, that sits alongside the manifest JSON file, for example:

```txt title="Secrets JSON file location"
.
├── *.sdPlugin/
│   ├── ...
│   ├── manifest.json
|   └── secrets.json
└── ...
```

> [!WARNING]
> You should never commit your `secrets.json` file into Git.

Within your secrets JSON file, you should define secrets as a JSON object, for example:

```json title="Secrets JSON file example"
{
	"apiKey": "1479fa141ddf47438710afb3f45b75be"
}
```

## Accessing Secrets

Secrets can be accessed at runtime using the `getSecrets()` function, found on the `system` namespace, for example.

<!-- snippet: node/guides/secrets/get-secrets.ts -->
```ts {3-5}
import streamDeck from "@elgato/streamdeck";

const secrets = await streamDeck.system.getSecrets<Secrets>();
secrets.apiKey; // 1479fa141ddf47438710afb3f45b75be

type Secrets = {
	apiKey: string;
};
```

Depending on your plugin's environment, secrets are read from one of two places:

- Development — your local secrets JSON file, `secrets.json`.
- Production — provided by Stream Deck.

> [!NOTE]
> Production is defined as a plugin that has been processed by Maker Console, this includes:
>
> - Plugins installed from Marketplace.
> - Plugins downloaded from Maker Console.

## Distribution

The distribution of secrets with plugins is only available when distributing your plugin using Marketplace.

When preparing your plugin for Marketplace, you should:

- ✅ **Do:** [Enable DRM protection](../introduction/distribution.md#enabling-drm).
- ✅ **Do:** Include the `secrets.json` file within the `.streamDeckPlugin` when uploading it to Maker Console — the `secrets.json` file is removed as part processing plugins within Maker Console, and the file will not be available to users when downloading from Marketplace or Maker Console.
- ❌ **Don't:** Distribute your plugin without DRM protecting it in Maker Console first. [Learn more about testing with DRM](../introduction/distribution.md#testing-with-drm).

> [!WARNING]
> The contents of your `secrets.json` file are only secure after your plugin has been DRM protected in Maker Console. Once protected, the `secrets.json` file is removed from your plugin; this happens before your plugin becomes available on Marketplace and Maker Console.
