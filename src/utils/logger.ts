const LOG_ENABLED = process.env.EXPO_PUBLIC_ENABLE_LOGS !== 'false';
const LOG_LEVEL = (process.env.EXPO_PUBLIC_LOG_LEVEL || 'info').toLowerCase();
const LEVELS = ['error', 'warn', 'info', 'debug'] as const;

type Level = typeof LEVELS[number];

const shouldLog = (level: Level) => {
  if (!LOG_ENABLED && level !== 'error') {
    return false;
  }
  const currentIndex = LEVELS.indexOf(LOG_LEVEL as Level);
  const levelIndex = LEVELS.indexOf(level);
  if (currentIndex === -1 || levelIndex === -1) {
    return true;
  }
  return levelIndex <= currentIndex;
};

const emit = (level: Level, message: string, meta?: Record<string, unknown>) => {
  if (!shouldLog(level)) {
    return;
  }

  const payload = {
    level,
    timestamp: new Date().toISOString(),
    message,
    ...(meta ? { meta } : {}),
  };

  switch (level) {
    case 'error':
      console.error(payload); // eslint-disable-line no-console
      break;
    case 'warn':
      console.warn(payload); // eslint-disable-line no-console
      break;
    case 'info':
      console.info(payload); // eslint-disable-line no-console
      break;
    default:
      console.log(payload); // eslint-disable-line no-console
  }
};

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => emit('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => emit('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => emit('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => emit('debug', message, meta),
};


