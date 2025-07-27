# EzEnv SDK Examples

This directory contains examples demonstrating how to use the @ezenv/sdk package.

## Examples

### 1. Basic Usage (JavaScript)
**File:** `basic-usage.js`

Demonstrates:
- Creating an EzEnv client
- Fetching secrets for a project/environment
- Loading secrets into `process.env`
- Error handling
- Cache management

### 2. TypeScript Usage
**File:** `typescript-usage.ts`

Demonstrates:
- Type-safe secret fetching
- Custom configuration options
- Environment-specific setup
- Advanced error handling
- Integration patterns

## Getting Started

1. **Install the SDK:**
   ```bash
   npm install @ezenv/sdk
   # or
   yarn add @ezenv/sdk
   # or
   pnpm add @ezenv/sdk
   ```

2. **Get your API Key:**
   - Log into your EzEnv dashboard
   - Navigate to Settings → API Keys
   - Create a new API key

3. **Update the examples:**
   - Replace `ezenv_your_api_key_here` with your actual API key
   - Update the `baseUrl` to point to your EzEnv instance
   - Update project and environment names to match your setup

4. **Run the examples:**
   ```bash
   # JavaScript example
   node basic-usage.js
   
   # TypeScript example (compile first)
   npx tsx typescript-usage.ts
   # or
   npx ts-node typescript-usage.ts
   ```

## Environment Variables

You can also configure the SDK using environment variables:

```bash
export EZENV_API_KEY="ezenv_your_api_key_here"
export EZENV_BASE_URL="https://your-ezenv-instance.com"
```

## Common Patterns

### Initialize once, use everywhere
```javascript
// config.js
const { createClient } = require('@ezenv/sdk');

const client = createClient(
  process.env.EZENV_API_KEY,
  process.env.EZENV_BASE_URL
);

module.exports = { client };
```

### Load on application startup
```javascript
// app.js
const { client } = require('./config');

async function startApp() {
  // Load all secrets at startup
  await client.load('my-app', process.env.NODE_ENV || 'development');
  
  // Now all secrets are in process.env
  const app = require('./server');
  app.listen(process.env.PORT || 3000);
}

startApp().catch(console.error);
```

### Use with dotenv fallback
```javascript
// Load from .env file first (for local development)
require('dotenv').config();

// Then override with EzEnv secrets
const { createClient } = require('@ezenv/sdk');
const client = createClient(process.env.EZENV_API_KEY);

if (process.env.EZENV_API_KEY) {
  await client.load('my-app', 'development', {
    override: true // Override .env values
  });
}
```

## Error Handling

The SDK throws specific error types:

- `ValidationError` - Invalid input parameters
- `AuthError` - Authentication/authorization failures  
- `NotFoundError` - Project or environment not found
- `NetworkError` - Network connectivity issues
- `EzEnvError` - General errors

Always wrap SDK calls in try-catch blocks for proper error handling.

## Need Help?

- Check the [SDK documentation](../README.md)
- Visit the [EzEnv documentation](https://ezenv.dev/docs)
- Open an issue on [GitHub](https://github.com/ezenv/ezenv)