// jest.setup.js
const nodeFetch = require('node-fetch');
globalThis.fetch = nodeFetch;
globalThis.Headers = nodeFetch.Headers;
globalThis.Request = nodeFetch.Request;
globalThis.Response = nodeFetch.Response;