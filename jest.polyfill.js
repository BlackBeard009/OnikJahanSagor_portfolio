const { fetch, Request, Response, Headers, FormData } = require('undici')

console.log('[polyfill] Setting up fetch globals')
Object.assign(globalThis, { fetch, Request, Response, Headers, FormData })
console.log('[polyfill] Done, Request is:', typeof globalThis.Request)
