import { fetch, Request, Response, Headers, FormData } from 'undici'

Object.assign(globalThis, { fetch, Request, Response, Headers, FormData })
