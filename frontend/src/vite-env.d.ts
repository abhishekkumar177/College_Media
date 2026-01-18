/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_ENV: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_AUTH_ENABLED: string
  readonly VITE_JWT_TOKEN_KEY: string
  readonly VITE_ENABLE_MOCK_DATA: string
  readonly VITE_ENABLE_ANALYTICS: string
  readonly VITE_ENABLE_ERROR_TRACKING: string
  readonly VITE_LOG_LEVEL: string
  readonly VITE_DEBUG_MODE: string
  readonly VITE_IMAGE_UPLOAD_ENDPOINT: string
  readonly VITE_MAX_FILE_SIZE: string
  readonly VITE_ALLOWED_IMAGE_TYPES: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}