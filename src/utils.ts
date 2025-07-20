import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { EzEnv } from './client'
import { ValidationError } from './errors'

interface FileConfig {
  EZENV_API_KEY?: string
  EZENV_PROJECT?: string
  EZENV_ENVIRONMENT?: string
  EZENV_BASE_URL?: string
}

/**
 * Parse a .env file and return key-value pairs
 */
function parseEnvFile(content: string): FileConfig {
  const config: FileConfig = {}
  
  content.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.trim().startsWith('#') || !line.trim()) {
      return
    }
    
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim()
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '')
      config[key.trim() as keyof FileConfig] = cleanValue
    }
  })
  
  return config
}

/**
 * Load environment variables from a .env.ezenv file
 */
export async function loadFromFile(filePath?: string): Promise<void> {
  const path = filePath || join(process.cwd(), '.env.ezenv')
  
  if (!existsSync(path)) {
    throw new ValidationError(`.env.ezenv file not found at ${path}`)
  }
  
  let content: string
  try {
    content = readFileSync(path, 'utf8')
  } catch (error: any) {
    throw new ValidationError(`Failed to read .env.ezenv file: ${error.message}`)
  }
  
  const config = parseEnvFile(content)
  
  if (!config.EZENV_API_KEY) {
    throw new ValidationError('EZENV_API_KEY not found in .env.ezenv')
  }
  
  if (!config.EZENV_PROJECT) {
    throw new ValidationError('EZENV_PROJECT not found in .env.ezenv')
  }
  
  if (!config.EZENV_ENVIRONMENT) {
    throw new ValidationError('EZENV_ENVIRONMENT not found in .env.ezenv')
  }
  
  const client = new EzEnv({ 
    apiKey: config.EZENV_API_KEY,
    baseUrl: config.EZENV_BASE_URL 
  })
  
  await client.load(config.EZENV_PROJECT, config.EZENV_ENVIRONMENT)
}

/**
 * Initialize EzEnv from environment variables
 */
export function fromEnv(): EzEnv {
  const apiKey = process.env.EZENV_API_KEY
  const baseUrl = process.env.EZENV_BASE_URL
  
  if (!apiKey) {
    throw new ValidationError('EZENV_API_KEY environment variable is not set')
  }
  
  return new EzEnv({ apiKey, baseUrl })
}