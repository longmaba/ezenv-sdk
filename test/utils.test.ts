import { loadFromFile, fromEnv } from '../src/utils'
import { ValidationError } from '../src/errors'
import { EzEnv } from '../src/client'
import * as fs from 'fs'
import * as path from 'path'

// Mock modules
jest.mock('fs')
jest.mock('../src/client')

describe('Utils', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('loadFromFile', () => {
    const mockExistsSync = fs.existsSync as jest.Mock
    const mockReadFileSync = fs.readFileSync as jest.Mock
    const mockEzEnvLoad = jest.fn()

    beforeEach(() => {
      ;(EzEnv as jest.Mock).mockImplementation(() => ({
        load: mockEzEnvLoad
      }))
    })

    it('should load from default .env.ezenv file', async () => {
      const fileContent = `
EZENV_API_KEY=ezenv_test123
EZENV_PROJECT=my-project
EZENV_ENVIRONMENT=development
`
      
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(fileContent)
      mockEzEnvLoad.mockResolvedValue(undefined)

      await loadFromFile()

      expect(mockExistsSync).toHaveBeenCalledWith(
        path.join(process.cwd(), '.env.ezenv')
      )
      expect(mockReadFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), '.env.ezenv'),
        'utf8'
      )
      expect(EzEnv).toHaveBeenCalledWith({
        apiKey: 'ezenv_test123',
        baseUrl: undefined
      })
      expect(mockEzEnvLoad).toHaveBeenCalledWith('my-project', 'development')
    })

    it('should load from custom file path', async () => {
      const customPath = '/custom/path/.env.ezenv'
      const fileContent = `
EZENV_API_KEY=ezenv_test123
EZENV_PROJECT=project
EZENV_ENVIRONMENT=prod
`
      
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(fileContent)
      mockEzEnvLoad.mockResolvedValue(undefined)

      await loadFromFile(customPath)

      expect(mockExistsSync).toHaveBeenCalledWith(customPath)
      expect(mockReadFileSync).toHaveBeenCalledWith(customPath, 'utf8')
    })

    it('should handle custom base URL', async () => {
      const fileContent = `
EZENV_API_KEY=ezenv_test123
EZENV_PROJECT=project
EZENV_ENVIRONMENT=dev
EZENV_BASE_URL=https://api.custom.com
`
      
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(fileContent)
      mockEzEnvLoad.mockResolvedValue(undefined)

      await loadFromFile()

      expect(EzEnv).toHaveBeenCalledWith({
        apiKey: 'ezenv_test123',
        baseUrl: 'https://api.custom.com'
      })
    })

    it('should parse file with comments and empty lines', async () => {
      const fileContent = `
# This is a comment
EZENV_API_KEY=ezenv_test123

# Another comment
EZENV_PROJECT=project
EZENV_ENVIRONMENT=dev

# Empty lines above and below
`
      
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(fileContent)
      mockEzEnvLoad.mockResolvedValue(undefined)

      await loadFromFile()

      expect(mockEzEnvLoad).toHaveBeenCalledWith('project', 'dev')
    })

    it('should handle quoted values', async () => {
      const fileContent = `
EZENV_API_KEY="ezenv_test123"
EZENV_PROJECT='my-project'
EZENV_ENVIRONMENT=development
`
      
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(fileContent)
      mockEzEnvLoad.mockResolvedValue(undefined)

      await loadFromFile()

      expect(EzEnv).toHaveBeenCalledWith({
        apiKey: 'ezenv_test123',
        baseUrl: undefined
      })
      expect(mockEzEnvLoad).toHaveBeenCalledWith('my-project', 'development')
    })

    it('should throw if file does not exist', async () => {
      mockExistsSync.mockReturnValue(false)

      await expect(loadFromFile()).rejects.toThrow(ValidationError)
      await expect(loadFromFile()).rejects.toThrow('.env.ezenv file not found')
    })

    it('should throw if EZENV_API_KEY is missing', async () => {
      const fileContent = `
EZENV_PROJECT=project
EZENV_ENVIRONMENT=dev
`
      
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(fileContent)

      await expect(loadFromFile()).rejects.toThrow(ValidationError)
      await expect(loadFromFile()).rejects.toThrow('EZENV_API_KEY not found')
    })

    it('should throw if EZENV_PROJECT is missing', async () => {
      const fileContent = `
EZENV_API_KEY=ezenv_test123
EZENV_ENVIRONMENT=dev
`
      
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(fileContent)

      await expect(loadFromFile()).rejects.toThrow(ValidationError)
      await expect(loadFromFile()).rejects.toThrow('EZENV_PROJECT not found')
    })

    it('should throw if EZENV_ENVIRONMENT is missing', async () => {
      const fileContent = `
EZENV_API_KEY=ezenv_test123
EZENV_PROJECT=project
`
      
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockReturnValue(fileContent)

      await expect(loadFromFile()).rejects.toThrow(ValidationError)
      await expect(loadFromFile()).rejects.toThrow('EZENV_ENVIRONMENT not found')
    })

    it('should handle file read errors', async () => {
      mockExistsSync.mockReturnValue(true)
      mockReadFileSync.mockImplementation(() => {
        throw new Error('Permission denied')
      })

      await expect(loadFromFile()).rejects.toThrow(ValidationError)
      await expect(loadFromFile()).rejects.toThrow('Failed to read .env.ezenv file')
    })
  })

  describe('fromEnv', () => {
    beforeEach(() => {
      ;(EzEnv as jest.Mock).mockImplementation((config) => ({
        config
      }))
    })

    it('should create client from environment variables', () => {
      process.env.EZENV_API_KEY = 'ezenv_test123'
      process.env.EZENV_BASE_URL = 'https://api.custom.com'

      const client = fromEnv()

      expect(EzEnv).toHaveBeenCalledWith({
        apiKey: 'ezenv_test123',
        baseUrl: 'https://api.custom.com'
      })
      expect(client).toBeDefined()
    })

    it('should work without base URL', () => {
      process.env.EZENV_API_KEY = 'ezenv_test123'
      delete process.env.EZENV_BASE_URL

      const client = fromEnv()

      expect(EzEnv).toHaveBeenCalledWith({
        apiKey: 'ezenv_test123',
        baseUrl: undefined
      })
      expect(client).toBeDefined()
    })

    it('should throw if EZENV_API_KEY is not set', () => {
      delete process.env.EZENV_API_KEY

      expect(() => fromEnv()).toThrow(ValidationError)
      expect(() => fromEnv()).toThrow('EZENV_API_KEY environment variable is not set')
    })
  })
})