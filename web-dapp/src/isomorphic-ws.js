const globalObject = typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {});
export const WebSocket = globalObject.WebSocket || globalObject.MozWebSocket;
export default WebSocket;
