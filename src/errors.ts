/**
 * Base error class for all EzEnv errors
 */
export class EzEnvError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EzEnvError'
    Object.setPrototypeOf(this, EzEnvError.prototype)
  }
}

/**
 * Error thrown when network requests fail
 */
export class NetworkError extends EzEnvError {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
    Object.setPrototypeOf(this, NetworkError.prototype)
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthError extends EzEnvError {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
    Object.setPrototypeOf(this, AuthError.prototype)
  }
}

/**
 * Error thrown when requested resource is not found
 */
export class NotFoundError extends EzEnvError {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundError'
    Object.setPrototypeOf(this, NotFoundError.prototype)
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends EzEnvError {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}