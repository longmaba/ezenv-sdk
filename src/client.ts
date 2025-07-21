import { EzEnvConfig, EzEnvOptions, SecretsResponse, ErrorResponse } from './types'
import { EzEnvError, NetworkError, AuthError, NotFoundError, ValidationError } from './errors'

export class EzEnv {
  private apiKey: string
  private baseUrl: string
  private cache: Map<string, Record<string, string>> = new Map()

  constructor(config: EzEnvConfig) {
    if (!config.apiKey) {
      throw new ValidationError('API key is required')
    }
    
    if (!config.apiKey.startsWith('ezenv_')) {
      throw new ValidationError('Invalid API key format')
    }
    
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://ezenv.dev'
  }

  /**
   * Fetch secrets for a project and environment
   */
  async get(
    projectName: string, 
    environmentName: string, 
    options?: EzEnvOptions
  ): Promise<Record<string, string>> {
    // Validate inputs
    if (!projectName || typeof projectName !== 'string') {
      throw new ValidationError('Project name is required')
    }
    
    if (!environmentName || typeof environmentName !== 'string') {
      throw new ValidationError('Environment name is required')
    }

    const cacheKey = `${projectName}:${environmentName}`
    
    // Check cache
    if (!options?.noCache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, options?.timeout || 30000)

      const response = await fetch(`${this.baseUrl}/api/v1/secrets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectName,
          environmentName,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json() as SecretsResponse | ErrorResponse

      if (!response.ok) {
        const error = data as ErrorResponse
        
        if (response.status === 401) {
          throw new AuthError(error.error || 'Invalid API key')
        }
        
        if (response.status === 403) {
          throw new AuthError(error.error || 'Permission denied')
        }
        
        if (response.status === 404) {
          throw new NotFoundError(
            error.error || `Project "${projectName}" or environment "${environmentName}" not found`
          )
        }
        
        throw new EzEnvError(error.error || 'Failed to fetch secrets')
      }

      const secrets = (data as SecretsResponse).secrets

      // Cache successful response
      this.cache.set(cacheKey, secrets)
      
      return secrets
    } catch (error: any) {
      if (error instanceof EzEnvError) {
        throw error
      }
      
      if (error.name === 'AbortError') {
        throw new NetworkError('Request timeout')
      }
      
      if (error.message === 'Failed to fetch') {
        throw new NetworkError('Failed to connect to EzEnv API')
      }
      
      throw new NetworkError(error.message || 'Network error occurred')
    }
  }

  /**
   * Load secrets directly into process.env
   */
  async load(
    projectName: string, 
    environmentName: string,
    options?: EzEnvOptions
  ): Promise<void> {
    const secrets = await this.get(projectName, environmentName, options)
    
    Object.entries(secrets).forEach(([key, value]) => {
      if (!options?.override && process.env[key] !== undefined) {
        return // Don't override existing values
      }
      process.env[key] = value
    })
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size
  }
}

/**
 * Convenience factory function to create a new EzEnv client
 */
export function createClient(apiKey: string, baseUrl?: string): EzEnv {
  return new EzEnv({ apiKey, baseUrl })
}