import {
  EzEnvError,
  NetworkError,
  AuthError,
  NotFoundError,
  ValidationError
} from '../src/errors'

describe('Error Classes', () => {
  describe('EzEnvError', () => {
    it('should create error with correct name and message', () => {
      const error = new EzEnvError('Test error message')
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(EzEnvError)
      expect(error.name).toBe('EzEnvError')
      expect(error.message).toBe('Test error message')
    })

    it('should have correct prototype chain', () => {
      const error = new EzEnvError('Test')
      
      expect(error instanceof EzEnvError).toBe(true)
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('NetworkError', () => {
    it('should create error with correct name and message', () => {
      const error = new NetworkError('Network failed')
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(EzEnvError)
      expect(error).toBeInstanceOf(NetworkError)
      expect(error.name).toBe('NetworkError')
      expect(error.message).toBe('Network failed')
    })

    it('should have correct prototype chain', () => {
      const error = new NetworkError('Test')
      
      expect(error instanceof NetworkError).toBe(true)
      expect(error instanceof EzEnvError).toBe(true)
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('AuthError', () => {
    it('should create error with correct name and message', () => {
      const error = new AuthError('Authentication failed')
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(EzEnvError)
      expect(error).toBeInstanceOf(AuthError)
      expect(error.name).toBe('AuthError')
      expect(error.message).toBe('Authentication failed')
    })

    it('should have correct prototype chain', () => {
      const error = new AuthError('Test')
      
      expect(error instanceof AuthError).toBe(true)
      expect(error instanceof EzEnvError).toBe(true)
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('NotFoundError', () => {
    it('should create error with correct name and message', () => {
      const error = new NotFoundError('Resource not found')
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(EzEnvError)
      expect(error).toBeInstanceOf(NotFoundError)
      expect(error.name).toBe('NotFoundError')
      expect(error.message).toBe('Resource not found')
    })

    it('should have correct prototype chain', () => {
      const error = new NotFoundError('Test')
      
      expect(error instanceof NotFoundError).toBe(true)
      expect(error instanceof EzEnvError).toBe(true)
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('ValidationError', () => {
    it('should create error with correct name and message', () => {
      const error = new ValidationError('Validation failed')
      
      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(EzEnvError)
      expect(error).toBeInstanceOf(ValidationError)
      expect(error.name).toBe('ValidationError')
      expect(error.message).toBe('Validation failed')
    })

    it('should have correct prototype chain', () => {
      const error = new ValidationError('Test')
      
      expect(error instanceof ValidationError).toBe(true)
      expect(error instanceof EzEnvError).toBe(true)
      expect(error instanceof Error).toBe(true)
    })
  })

  describe('Error throwing and catching', () => {
    it('should be catchable by specific type', () => {
      const throwAuthError = () => {
        throw new AuthError('Auth failed')
      }

      try {
        throwAuthError()
      } catch (error) {
        if (error instanceof AuthError) {
          expect(error.message).toBe('Auth failed')
        } else {
          fail('Should have caught AuthError')
        }
      }
    })

    it('should be catchable by base type', () => {
      const errors = [
        new NetworkError('Network'),
        new AuthError('Auth'),
        new NotFoundError('NotFound'),
        new ValidationError('Validation')
      ]

      errors.forEach(error => {
        try {
          throw error
        } catch (e) {
          if (e instanceof EzEnvError) {
            expect(e).toBeInstanceOf(EzEnvError)
          } else {
            fail('Should have caught EzEnvError')
          }
        }
      })
    })
  })
})