/**
 * TypeScript usage examples for @ezenv/sdk
 *
 * This example demonstrates TypeScript-specific features and type safety
 * when using the EzEnv SDK.
 */

import { EzEnv, createClient, EzEnvConfig, EzEnvOptions } from '@ezenv/sdk'
import { EzEnvError, NetworkError, AuthError, NotFoundError, ValidationError } from '@ezenv/sdk'

// Define your environment variables interface
interface MyAppSecrets {
  DATABASE_URL: string
  API_KEY: string
  REDIS_URL?: string
  STRIPE_SECRET_KEY?: string
}

// Example 1: Type-safe secret fetching
async function typeSafeExample(): Promise<void> {
  const config: EzEnvConfig = {
    apiKey: process.env.EZENV_API_KEY || 'ezenv_your_api_key_here',
    baseUrl: 'https://ezenv.dev', // Your production URL
  }

  const client = new EzEnv(config)

  try {
    // Fetch secrets with type assertion
    const secrets = (await client.get('my-app', 'production')) as MyAppSecrets

    // Now you have type-safe access to your secrets
    console.log('Database URL:', secrets.DATABASE_URL)
    console.log('API Key:', secrets.API_KEY)

    // Optional secrets are properly typed
    if (secrets.REDIS_URL) {
      console.log('Redis URL:', secrets.REDIS_URL)
    }
  } catch (error) {
    handleError(error)
  }
}

// Example 2: Custom configuration with options
async function advancedConfiguration(): Promise<void> {
  const client = createClient('ezenv_your_api_key_here', 'http://localhost:3000')

  const options: EzEnvOptions = {
    noCache: false, // Use caching (default)
    timeout: 5000, // 5 second timeout
    override: true, // Override existing env vars when using load()
  }

  try {
    const secrets = await client.get('my-app', 'staging', options)
    console.log('Staging secrets fetched:', Object.keys(secrets).length)
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error('Network issue:', error.message)
      // Implement retry logic
    } else {
      throw error
    }
  }
}

// Example 3: Environment-specific configuration
class ConfigManager {
  private client: EzEnv
  private environment: string
  private projectName: string

  constructor(apiKey: string, projectName: string) {
    this.projectName = projectName
    this.environment = process.env.NODE_ENV || 'development'

    // Use different base URLs for different environments
    const baseUrl = this.getBaseUrl()

    this.client = new EzEnv({
      apiKey,
      baseUrl,
    })
  }

  private getBaseUrl(): string {
    switch (this.environment) {
      case 'production':
        return 'https://ezenv.dev'
      case 'staging':
        return 'https://staging.ezenv.dev'
      default:
        return 'http://localhost:3000'
    }
  }

  async loadConfig(): Promise<MyAppSecrets> {
    try {
      const secrets = (await this.client.get(this.projectName, this.environment)) as MyAppSecrets

      // Validate required secrets
      this.validateSecrets(secrets)

      return secrets
    } catch (error) {
      throw new Error(`Failed to load config for ${this.environment}: ${error.message}`)
    }
  }

  private validateSecrets(secrets: MyAppSecrets): void {
    const required: (keyof MyAppSecrets)[] = ['DATABASE_URL', 'API_KEY']

    for (const key of required) {
      if (!secrets[key]) {
        throw new ValidationError(`Missing required secret: ${key}`)
      }
    }
  }
}

// Example 4: Error handling with specific error types
function handleError(error: unknown): void {
  if (error instanceof ValidationError) {
    console.error('Validation error:', error.message)
    // Fix configuration issues
  } else if (error instanceof AuthError) {
    console.error('Authentication failed:', error.message)
    // Refresh API key or re-authenticate
  } else if (error instanceof NotFoundError) {
    console.error('Resource not found:', error.message)
    // Check project/environment names
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message)
    // Implement retry logic
  } else if (error instanceof EzEnvError) {
    console.error('EzEnv error:', error.message)
    // General error handling
  } else {
    console.error('Unexpected error:', error)
  }
}

// Example 5: Integration with application startup
async function initializeApp(): Promise<void> {
  console.log('Initializing application...')

  const configManager = new ConfigManager(process.env.EZENV_API_KEY!, 'my-awesome-app')

  try {
    // Load configuration
    const config = await configManager.loadConfig()

    // Initialize services with the loaded config
    await initializeDatabase(config.DATABASE_URL)
    await initializeCache(config.REDIS_URL)
    await initializePayments(config.STRIPE_SECRET_KEY)

    console.log('Application initialized successfully')
  } catch (error) {
    console.error('Failed to initialize application:', error)
    process.exit(1)
  }
}

// Mock initialization functions
async function initializeDatabase(url: string): Promise<void> {
  console.log('Connecting to database...')
}

async function initializeCache(url?: string): Promise<void> {
  if (url) {
    console.log('Connecting to Redis...')
  }
}

async function initializePayments(key?: string): Promise<void> {
  if (key) {
    console.log('Initializing payment provider...')
  }
}

// Example 6: Using with async/await patterns
async function modernPatterns(): Promise<void> {
  const client = createClient('ezenv_your_api_key_here')

  // Fetch multiple environments in parallel
  const [dev, staging, prod] = await Promise.all([
    client.get('my-app', 'development'),
    client.get('my-app', 'staging'),
    client.get('my-app', 'production'),
  ])

  console.log('Development secrets:', Object.keys(dev).length)
  console.log('Staging secrets:', Object.keys(staging).length)
  console.log('Production secrets:', Object.keys(prod).length)
}

// Export for use in other modules
export { ConfigManager, MyAppSecrets }

// Run examples
if (require.main === module) {
  console.log('Running TypeScript examples...')
  console.log('Note: Update the API key and URLs before running')

  // Uncomment to run examples
  // typeSafeExample().catch(console.error);
  // advancedConfiguration().catch(console.error);
  // initializeApp().catch(console.error);
  // modernPatterns().catch(console.error);
}
