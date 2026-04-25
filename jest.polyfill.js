const { TextDecoder, TextEncoder } = require('util')
Object.assign(globalThis, { TextDecoder, TextEncoder })

const { fetch, Request, Response, Headers, FormData } = require('undici')
Object.assign(globalThis, { fetch, Request, Response, Headers, FormData })
