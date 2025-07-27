# EzEnv SDK

Official Node.js SDK for fetching environment variables from EzEnv - the secure environment variable management platform.

## Installation

```bash
npm install @ezenv/sdk
# or
yarn add @ezenv/sdk
# or
pnpm add @ezenv/sdk
```

## Quick Start

```javascript
import { EzEnv } from '@ezenv/sdk'

// Initialize client with your API key
const ezenv = new EzEnv({
  apiKey: 'ezenv_your_api_key_here'
})

// Fetch secrets for a project and environment
const secrets = await ezenv.get('my-project', 'production')
console.log(secrets.DATABASE_URL)

// Or load directly into process.env
await ezenv.load('my-project', 'production')
console.log(process.env.DATABASE_URL)
```

## Configuration

### Using Environment Variables

Set your API key as an environment variable:

```bash
export EZENV_API_KEY=ezenv_your_api_key_here
```

Then use the `fromEnv` helper:

```javascript
import { fromEnv } from '@ezenv/sdk'

const ezenv = fromEnv()
const secrets = await ezenv.get('my-project', 'production')
```

### Auto-loading from File

Create a `.env.ezenv` file in your project root:

```bash
# .env.ezenv
EZENV_API_KEY=ezenv_your_api_key_here
EZENV_PROJECT=my-project
EZENV_ENVIRONMENT=development
```

Then load it automatically:

```javascript
import { loadFromFile } from '@ezenv/sdk'

// Loads secrets into process.env
await loadFromFile()

// Or specify a custom path
await loadFromFile('/path/to/.env.ezenv')
```

## API Reference

### `new EzEnv(config)`

Creates a new EzEnv client instance.

**Parameters:**
- `config.apiKey` (string, required) - Your EzEnv API key
- `config.baseUrl` (string, optional) - Custom API base URL

**Example:**
```javascript
const ezenv = new EzEnv({
  apiKey: 'ezenv_your_api_key_here',
  baseUrl: 'https://api.custom-domain.com' // Optional
})
```

### `ezenv.get(projectName, environmentName, options?)`

Fetches secrets for a specific project and environment.

**Parameters:**
- `projectName` (string) - Name of your project
- `environmentName` (string) - Environment name (e.g., 'development', 'production')
- `options` (object, optional)
  - `noCache` (boolean) - Skip cache and fetch fresh data
  - `timeout` (number) - Request timeout in milliseconds (default: 30000)

**Returns:** Promise<Record<string, string>> - Object containing key-value pairs of secrets

**Example:**
```javascript
const secrets = await ezenv.get('my-project', 'production', {
  noCache: true,
  timeout: 5000
})
```

### `ezenv.load(projectName, environmentName, options?)`

Loads secrets directly into `process.env`.

**Parameters:**
- `projectName` (string) - Name of your project
- `environmentName` (string) - Environment name
- `options` (object, optional)
  - `override` (boolean) - Override existing environment variables (default: false)
  - `noCache` (boolean) - Skip cache and fetch fresh data
  - `timeout` (number) - Request timeout in milliseconds

**Example:**
```javascript
await ezenv.load('my-project', 'production', {
  override: true
})
```

### `createClient(apiKey, baseUrl?)`

Factory function to create a new EzEnv client.

**Example:**
```javascript
import { createClient } from '@ezenv/sdk'

const ezenv = createClient('ezenv_your_api_key_here')
```

## Error Handling

The SDK throws specific error types for different scenarios:

```javascript
import { 
  EzEnv, 
  AuthError, 
  NetworkError, 
  NotFoundError,
  ValidationError 
} from '@ezenv/sdk'

try {
  const secrets = await ezenv.get('project', 'env')
} catch (error) {
  if (error instanceof AuthError) {
    console.error('Authentication failed:', error.message)
  } else if (error instanceof NotFoundError) {
    console.error('Project or environment not found:', error.message)
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message)
  } else if (error instanceof ValidationError) {
    console.error('Validation error:', error.message)
  }
}
```

### Error Types

- **`AuthError`** - Invalid API key or permission denied
- **`NotFoundError`** - Project or environment not found
- **`NetworkError`** - Network connectivity issues or timeouts
- **`ValidationError`** - Invalid parameters or configuration
- **`EzEnvError`** - Base error class for all SDK errors

## Caching

The SDK automatically caches successful responses to improve performance. To bypass the cache:

```javascript
// Skip cache for this request
const secrets = await ezenv.get('project', 'env', { noCache: true })

// Clear all cached data
ezenv.clearCache()

// Get cache size
const cacheSize = ezenv.getCacheSize()
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { EzEnv, EzEnvConfig, EzEnvOptions } from '@ezenv/sdk'

const config: EzEnvConfig = {
  apiKey: 'ezenv_your_api_key_here'
}

const options: EzEnvOptions = {
  noCache: true,
  timeout: 10000,
  override: false
}

const ezenv = new EzEnv(config)
const secrets: Record<string, string> = await ezenv.get('project', 'env', options)
```

## Best Practices

1. **Store API keys securely** - Never commit API keys to version control
2. **Use environment-specific keys** - Generate separate API keys for development and production
3. **Handle errors gracefully** - Always wrap SDK calls in try-catch blocks
4. **Leverage caching** - Use the built-in cache for better performance
5. **Set appropriate timeouts** - Adjust timeout based on your network conditions

## Examples

### Basic Usage

```javascript
import { EzEnv } from '@ezenv/sdk'

const ezenv = new EzEnv({
  apiKey: process.env.EZENV_API_KEY
})

// Load secrets for current environment
const env = process.env.NODE_ENV || 'development'
await ezenv.load('my-app', env)

// Your app can now use the loaded environment variables
const db = new Database(process.env.DATABASE_URL)
```

### With Express.js

```javascript
import express from 'express'
import { loadFromFile } from '@ezenv/sdk'

async function startServer() {
  // Load environment variables
  await loadFromFile()
  
  const app = express()
  const port = process.env.PORT || 3000
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}

startServer().catch(console.error)
```

### With Next.js

```javascript
// next.config.js
import { EzEnv } from '@ezenv/sdk'

const ezenv = new EzEnv({
  apiKey: process.env.EZENV_API_KEY
})

const secrets = await ezenv.get('my-app', process.env.NODE_ENV)

export default {
  env: secrets
}
```

## License

MIT

## Support

- [Documentation](https://ezenv.dev/docs)
- [GitHub Issues](https://github.com/longmaba/ezenv-sdk/issues)
- [Discord Community](https://discord.gg/ezenv)