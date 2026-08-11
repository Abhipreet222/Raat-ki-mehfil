// Simple in-memory store for active listeners
// Note: In a production serverless environment (like Vercel), this state may be lost between cold starts.
// For true persistence across serverless invocations, use Redis (e.g. Upstash).

type Listener = {
  lastSeen: number;
};

// Map of hashed IPs to Listener data
const activeListeners = new Map<string, Listener>();

const TIMEOUT_MS = 30000; // 30 seconds timeout

export function recordListenerActivity(id: string) {
  activeListeners.set(id, { lastSeen: Date.now() });
  cleanupStaleListeners();
}

export function getActiveListenersCount() {
  cleanupStaleListeners();
  // Ensure at least 1 listener (the current one) is shown
  return Math.max(1, activeListeners.size);
}

function cleanupStaleListeners() {
  const now = Date.now();
  for (const [id, listener] of activeListeners.entries()) {
    if (now - listener.lastSeen > TIMEOUT_MS) {
      activeListeners.delete(id);
    }
  }
}
