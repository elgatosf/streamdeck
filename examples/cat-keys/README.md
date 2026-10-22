# Cat Keys

A cute and cuddly plugin to demonstrate features of the Stream Deck SDK.

![Cat Keys](cat-keys.gif)

## `willAppear` & `willDisappear`

The Random Cat action utilizes these events to keep track of which keys are both visible to the user as well as set to be automatically updated. The action will also draw a new cat on the key as soon as it appears.

## Network Requests & `setImage`

The Random Cat action requests a random cat image using the `fetch` function built into Node.js. It then waits for and parses the response, calling `setImage` to draw the cat onto the key.

## Polling with `setInterval`

The Random Cat action contains an "Auto Update" setting in the property inspector. If this is set to true, the action will fetch and draw a new cat to the key every 15 minutes. The action utilizes the `willAppear`, `willDisappear`, and `didReceiveSettings` events, in order to efficiently manage the polling interval to prevent the use system resources unnecessarily.

## Type-safe Settings

The Random Cat action provides `RandomCatSettings` as the type parameter to all events to ensure we are using our settings appropriately.
