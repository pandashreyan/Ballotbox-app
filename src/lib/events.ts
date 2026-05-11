import { EventEmitter } from 'events';

// Global singleton EventEmitter
let globalEmitter: EventEmitter;

if (process.env.NODE_ENV === 'production') {
  globalEmitter = new EventEmitter();
  // Maximize listeners to prevent leak warnings for high dynamic connections
  globalEmitter.setMaxListeners(100);
} else {
  // Prevent re-initialization in development (HMR)
  if (!(global as any)._globalEmitter) {
    (global as any)._globalEmitter = new EventEmitter();
    (global as any)._globalEmitter.setMaxListeners(100);
  }
  globalEmitter = (global as any)._globalEmitter;
}

export { globalEmitter };
