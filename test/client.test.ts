import { EzEnv, createClient } from '../src/client'
import { 
  AuthError, 
  NetworkError, 
  NotFoundError, 
  ValidationError 
} from '../src/errors'

// Mock fetch
global.fetch = jest.fn()

describe('EzEnv Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(global.fetch as jest.Mock).mockReset()
  })

  describe('constructor', () => {
    it('should create instance with valid API key', () => {
      const client = new EzEnv({ apiKey: 'ezenv_test123' })
      expect(client).toBeInstanceOf(EzEnv)
    })

    it('should throw ValidationError if API key is missing', () => {
      expect(() => new EzEnv({ apiKey: '' })).toThrow(ValidationError)
      expect(() => new EzEnv({ apiKey: '' })).toThrow('API key is required')
    })

    it('should throw ValidationError if API key has invalid format', () => {
      expect(() => new EzEnv({ apiKey: 'invalid_key' })).toThrow(ValidationError)
      expect(() => new EzEnv({ apiKey: 'invalid_key' })).toThrow('Invalid API key format')
    })

    it('should accept custom baseUrl', () => {
      const client = new EzEnv({ 
        apiKey: 'ezenv_test123',
        baseUrl: 'https://custom.api.com'
      })
      expect(client).toBeInstanceOf(EzEnv)
    })
  })

  describe('get()', () => {
    let client: EzEnv

    beforeEach(() => {
      client = new EzEnv({ apiKey: 'ezenv_test123' })
    })

    it('should fetch secrets successfully', async () => {
      const mockSecrets = {
        DATABASE_URL: 'postgres://localhost:5432/db',
        API_KEY: 'test-api-key'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ secrets: mockSecrets })
      })

      const secrets = await client.get('my-project', 'production')
      
      expect(secrets).toEqual(mockSecrets)
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/secrets',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ezenv_test123',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            projectName: 'my-project',
            environmentName: 'production'
          })
        })
      )
    })

    it('should validate project name', async () => {
      await expect(client.get('', 'production')).rejects.toThrow(ValidationError)
      await expect(client.get('', 'production')).rejects.toThrow('Project name is required')
    })

    it('should validate environment name', async () => {
      await expect(client.get('project', '')).rejects.toThrow(ValidationError)
      await expect(client.get('project', '')).rejects.toThrow('Environment name is required')
    })

    it('should throw AuthError on 401', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid API key' })
      })

      await expect(client.get('project', 'env')).rejects.toThrow(AuthError)
      await expect(client.get('project', 'env')).rejects.toThrow('Invalid API key')
    })

    it('should throw AuthError on 403', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Permission denied' })
      })

      await expect(client.get('project', 'env')).rejects.toThrow(AuthError)
      await expect(client.get('project', 'env')).rejects.toThrow('Permission denied')
    })

    it('should throw NotFoundError on 404', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Project not found' })
      })

      await expect(client.get('project', 'env')).rejects.toThrow(NotFoundError)
      await expect(client.get('project', 'env')).rejects.toThrow('Project not found')
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'))

      await expect(client.get('project', 'env')).rejects.toThrow(NetworkError)
      await expect(client.get('project', 'env')).rejects.toThrow('Failed to connect to EzEnv API')
    })

    it('should handle timeout', async () => {
      const abortError = new Error('AbortError')
      abortError.name = 'AbortError'
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(abortError)

      await expect(client.get('project', 'env')).rejects.toThrow(NetworkError)
      await expect(client.get('project', 'env')).rejects.toThrow('Request timeout')
    })

    it('should cache successful responses', async () => {
      const mockSecrets = { KEY: 'value' }
      
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ secrets: mockSecrets })
      })

      // First call
      const result1 = await client.get('project', 'env')
      expect(result1).toEqual(mockSecrets)
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Second call should use cache
      const result2 = await client.get('project', 'env')
      expect(result2).toEqual(mockSecrets)
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should bypass cache with noCache option', async () => {
      const mockSecrets = { KEY: 'value' }
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ secrets: mockSecrets })
      })

      // First call
      await client.get('project', 'env')
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Second call with noCache
      await client.get('project', 'env', { noCache: true })
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('load()', () => {
    let client: EzEnv
    const originalEnv = process.env

    beforeEach(() => {
      client = new EzEnv({ apiKey: 'ezenv_test123' })
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should load secrets into process.env', async () => {
      const mockSecrets = {
        NEW_VAR: 'new-value',
        ANOTHER_VAR: 'another-value'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ secrets: mockSecrets })
      })

      await client.load('project', 'env')

      expect(process.env.NEW_VAR).toBe('new-value')
      expect(process.env.ANOTHER_VAR).toBe('another-value')
    })

    it('should not override existing vars by default', async () => {
      process.env.EXISTING_VAR = 'original-value'

      const mockSecrets = {
        EXISTING_VAR: 'new-value',
        NEW_VAR: 'new-value'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ secrets: mockSecrets })
      })

      await client.load('project', 'env')

      expect(process.env.EXISTING_VAR).toBe('original-value')
      expect(process.env.NEW_VAR).toBe('new-value')
    })

    it('should override existing vars with override option', async () => {
      process.env.EXISTING_VAR = 'original-value'

      const mockSecrets = {
        EXISTING_VAR: 'new-value'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ secrets: mockSecrets })
      })

      await client.load('project', 'env', { override: true })

      expect(process.env.EXISTING_VAR).toBe('new-value')
    })
  })

  describe('cache methods', () => {
    let client: EzEnv

    beforeEach(() => {
      client = new EzEnv({ apiKey: 'ezenv_test123' })
    })

    it('should clear cache', async () => {
      const mockSecrets = { KEY: 'value' }
      
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ secrets: mockSecrets })
      })

      // Populate cache
      await client.get('project', 'env')
      expect(client.getCacheSize()).toBe(1)

      // Clear cache
      client.clearCache()
      expect(client.getCacheSize()).toBe(0)
    })
  })

  describe('createClient', () => {
    it('should create client instance', () => {
      const client = createClient('ezenv_test123')
      expect(client).toBeInstanceOf(EzEnv)
    })

    it('should accept baseUrl', () => {
      const client = createClient('ezenv_test123', 'https://api.example.com')
      expect(client).toBeInstanceOf(EzEnv)
    })
  })
})