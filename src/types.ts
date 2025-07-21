export interface EzEnvConfig {
  /**
   * Your EzEnv API key
   */
  apiKey: string
  /**
   * Base URL for the EzEnv API
   * @default "https://ezenv.dev"
   */
  baseUrl?: string
}

export interface EzEnvOptions {
  /**
   * Skip cache and fetch fresh data
   * @default false
   */
  noCache?: boolean
  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number
  /**
   * Override existing environment variables
   * @default false
   */
  override?: boolean
}

export interface SecretsResponse {
  secrets: Record<string, string>
}

export interface ErrorResponse {
  error: string
  code?: string
}