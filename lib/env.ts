/**
 * Environment variable validation
 * Validates required environment variables and provides helpful error messages
 */

type EnvConfig = {
  name: string
  required: boolean
  production_only?: boolean
  validate?: (value: string) => boolean
  hint?: string
}

const ENV_CONFIG: EnvConfig[] = [
  {
    name: 'DATABASE_URL',
    required: true,
    hint: 'PostgreSQL connection string (e.g., postgresql://user:pass@host:5432/db)',
  },
  {
    name: 'PAYLOAD_SECRET',
    required: true,
    production_only: true,
    hint: 'Random secret key for Payload CMS authentication (min 32 chars recommended)',
    validate: (value) => value.length >= 16,
  },
  {
    name: 'STRIPE_SECRET_KEY',
    required: true,
    validate: (value) => value.startsWith('sk_'),
    hint: 'Stripe secret key (starts with sk_test_ or sk_live_)',
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    required: true,
    validate: (value) => value.startsWith('whsec_'),
    hint: 'Stripe webhook signing secret (starts with whsec_)',
  },
  {
    name: 'RESEND_API_KEY',
    required: true,
    validate: (value) => value.startsWith('re_'),
    hint: 'Resend API key (starts with re_)',
  },
  {
    name: 'ADMIN_EMAIL',
    required: false,
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    hint: 'Email address for admin notifications',
  },
  {
    name: 'FROM_EMAIL',
    required: false,
    hint: 'Sender email address (e.g., "Name <email@domain.com>")',
  },
  {
    name: 'NEXT_PUBLIC_SITE_URL',
    required: false,
    production_only: true,
    validate: (value) => value.startsWith('https://'),
    hint: 'Production site URL (must start with https://)',
  },
]

export type EnvValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate all environment variables
 * Call this at app startup to catch configuration issues early
 */
export function validateEnv(): EnvValidationResult {
  const isProduction = process.env.NODE_ENV === 'production'
  const errors: string[] = []
  const warnings: string[] = []

  for (const config of ENV_CONFIG) {
    const value = process.env[config.name]

    // Check if required
    if (config.required) {
      // Skip production-only checks in development
      if (config.production_only && !isProduction) {
        if (!value) {
          warnings.push(`${config.name} not set (required in production)`)
        }
        continue
      }

      if (!value) {
        errors.push(`Missing required env var: ${config.name}${config.hint ? ` - ${config.hint}` : ''}`)
        continue
      }
    }

    // Validate format if value exists
    if (value && config.validate && !config.validate(value)) {
      const message = `Invalid ${config.name} format${config.hint ? ` - ${config.hint}` : ''}`
      if (config.required) {
        errors.push(message)
      } else {
        warnings.push(message)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate environment variables and log results
 * Throws in production if validation fails
 */
export function validateEnvOrThrow(): void {
  // Skip validation during build phase - env vars are only available at runtime
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return
  }

  const result = validateEnv()
  const isProduction = process.env.NODE_ENV === 'production'

  // Log warnings
  for (const warning of result.warnings) {
    console.warn(`⚠️  ENV WARNING: ${warning}`)
  }

  // Handle errors
  if (!result.valid) {
    for (const error of result.errors) {
      console.error(`❌ ENV ERROR: ${error}`)
    }

    if (isProduction) {
      throw new Error(
        `Environment validation failed:\n${result.errors.join('\n')}`
      )
    } else {
      console.warn('⚠️  Environment validation failed - some features may not work')
    }
  }
}
