const { fetch, Request, Response, Headers, FormData, File } = require('undici')
Object.assign(globalThis, { fetch, Request, Response, Headers, FormData, File })

const nextJest = require('next/jest.js')

const createJestConfig = nextJest({ dir: './' })

const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.polyfill.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}

module.exports = createJestConfig(config)
