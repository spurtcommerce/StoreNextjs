/* eslint-disable no-console */
/**
 * Central Environment-Gated Logger.
 *
 * - In production: suppresses debug/info noise so browser consoles stay clean
 *   and server logs only record actionable warnings and errors.
 * - In development: logs all levels with clear scope prefixes.
 * - Server errors can be forwarded to an external reporter (e.g. Sentry) from one place.
 */

const LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

function getMinLevel() {
  const configured = (process.env.NEXT_PUBLIC_LOG_LEVEL || process.env.LOG_LEVEL || "")
    .toLowerCase()
    .trim();
  if (configured && LEVELS[configured] !== undefined) {
    return LEVELS[configured];
  }
  return process.env.NODE_ENV === "production" ? LEVELS.warn : LEVELS.debug;
}

function shouldLog(levelName) {
  return LEVELS[levelName] >= getMinLevel();
}

function emit(levelName, scope, message, meta) {
  if (!shouldLog(levelName)) return;

  const prefix = scope ? `[${scope}]` : "[app]";
  const fn =
    levelName === "error"
      ? console.error
      : levelName === "warn"
        ? console.warn
        : levelName === "info"
          ? console.info
          : console.debug;

  if (meta !== undefined) {
    fn(prefix, message, meta);
  } else {
    fn(prefix, message);
  }
}

export function createLogger(scope = "app") {
  return {
    debug: (message, meta) => emit("debug", scope, message, meta),
    info: (message, meta) => emit("info", scope, message, meta),
    warn: (message, meta) => emit("warn", scope, message, meta),
    error: (message, meta) => emit("error", scope, message, meta),
  };
}

export const logger = createLogger("app");
export default logger;
