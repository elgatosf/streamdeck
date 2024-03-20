// Enables usage of "jest-websocket-mock" when importing "ws".
// https://www.npmjs.com/package/jest-websocket-mock#using-jest-websocket-mock-to-interact-with-a-non-global-websocket-object
export { WebSocket as default } from "mock-socket";
