export const APP_CONSTANTS = {
  APP_NAME: 'Plaigiarized',
  VERSION: '0.1.0',
  API_VERSION: 'v1',
  
  // Upload limits
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['pdf', 'doc', 'docx', 'txt'],
  
  // Detection settings
  MIN_CONFIDENCE_THRESHOLD: 0.65,
  DEFAULT_DETECTION_THRESHOLD: 0.8,
  MAX_BATCH_SIZE: 100,
  
  // Analysis settings
  MIN_WORD_COUNT: 100,
  MAX_PROCESSING_TIME: 30000, // 30 seconds
  
  // API settings
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100
  },
  
  // Cache settings
  CACHE_TTL: 3600, // 1 hour
  
  // Paths
  ROUTES: {
    HOME: '/',
    DASHBOARD: '/dashboard',
    ANALYSIS: '/analysis',
    REPORTS: '/reports',
    API: {
      BASE: '/api',
      AUTH: '/api/auth',
      DOCUMENTS: '/api/documents',
      ANALYSIS: '/api/analysis'
    }
  }
} as const;
