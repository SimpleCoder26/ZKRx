// Mock for isomorphic-ws in browser environments where Webpack fails to resolve the named export
export const WebSocket = typeof window !== 'undefined' ? window.WebSocket : globalThis.WebSocket;
export default typeof window !== 'undefined' ? window.WebSocket : globalThis.WebSocket;
