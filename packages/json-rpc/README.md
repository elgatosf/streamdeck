<div align="center">

# @elgato/json-rpc

Bidirectional JSON-RPC 2.0 messaging for clients and servers.

[![@elgato/json-rpc npm package](https://img.shields.io/npm/v/%40elgato/json-rpc?logo=npm&logoColor=white)](https://www.npmjs.com/package/@elgato/json-rpc)
[![Elgato homepage](https://img.shields.io/badge/Elgato-3431cf?labelColor=grey&logo=Elgato)](https://elgato.com)

</div>

## Installation

```
npm install @elgato/json-rpc
```

## Connections

`JsonRpcConnection` provides bidirectional JSON-RPC messaging over readable and writable streams. Call `connect()` to begin routing inbound messages. The returned promise settles when the inbound stream closes or the supplied abort signal is aborted.

```ts
import { JsonRpcConnection } from "@elgato/json-rpc";

const connection = new JsonRpcConnection({
    inboundStream,
    outboundStream,
});

await connection.connect();
```

### Client Methods

#### `JsonRpcConnection.request(method, params)`

Sends a request and waits for a response. The `ok` property distinguishes successful results from JSON-RPC errors.

```ts
const response = await connection.request("add", { left: 20, right: 22 });

if (response.ok) {
    console.log(response.result); // 42
} else {
    console.error(response.error);
}
```

Pass a request object to specify a timeout. Requests time out after 30 seconds by default.

```ts
const response = await connection.request({
    method: "add",
    params: { left: 20, right: 22 },
    timeout: 5000,
});
```

#### `JsonRpcConnection.notify(method, params)`

Sends a notification without waiting for a response.

```ts
await connection.notify("statusChanged", { status: "ready" });
```

### Server Methods

#### `JsonRpcConnection.addLocalMethod(method, handler)`

Registers a handler for inbound requests and notifications. Returning a value sends it as the request result. Notifications invoke the same handler without sending a response. Dispose of the returned registration to remove the handler.

```ts
const registration = connection.addLocalMethod("add", ({ left, right }) => {
    return left + right;
});

// Remove the handler when it is no longer needed.
registration.dispose();
```

Multiple handlers can be registered for a method and composed with `next()`.

```ts
connection.addLocalMethod("add", async (params, response, next) => {
    console.log("Adding numbers", params);
    return next();
});

connection.addLocalMethod("add", ({ left, right }) => left + right);
```

#### Validating Parameters

Pass a Zod schema to validate parameters and infer their type. Invalid parameters produce a JSON-RPC `InvalidParams` error response.

```ts
import { z } from "zod/mini";

const AddParameters = z.object({
    left: z.number(),
    right: z.number(),
});

connection.addLocalMethod("add", ({ left, right }) => left + right, AddParameters);
```

## Transport Helpers

### WebSocket

`createWebSocketJsonRpcConnection` creates a JSON-RPC connection backed by a WebSocket. It serializes outbound messages as JSON and parses inbound message data.

```ts
import { createWebSocketJsonRpcConnection } from "@elgato/json-rpc";

const connection = createWebSocketJsonRpcConnection(webSocket);
await connection.connect();
```

### Delegated

`createDelegatedJsonRpcConnection` creates a JSON-RPC connection from callback functions. The `send` callback receives outbound messages, while the returned `receive` callback accepts inbound messages.

```ts
import { createDelegatedJsonRpcConnection } from "@elgato/json-rpc";

const [connection, receive] = createDelegatedJsonRpcConnection((message) => {
    transport.send(message);
});

transport.onMessage(receive);
await connection.connect();
```

## JSON-RPC Types

JSON-RPC message schemas, TypeScript types, and reserved error codes are available from `@elgato/json-rpc/spec`.

```ts
import { ErrorCode, Request, Response } from "@elgato/json-rpc/spec";

const request = Request.parse({
    id: "request-id",
    jsonrpc: "2.0",
    method: "add",
    params: { left: 20, right: 22 },
});

console.log(Response.safeParse(request).success); // false
console.log(ErrorCode.MethodNotFound); // -32601
```
