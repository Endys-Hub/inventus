import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

const QUEUE_KEY = "pos_offline_queue";

function loadQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function useOfflineQueue() {
  const [queuedCount, setQueuedCount] = useState(() => loadQueue().length);

  // Attempt to drain the queue. Returns the number of successfully synced items.
  const sync = useCallback(async () => {
    const queue = loadQueue();
    if (queue.length === 0) return 0;

    const remaining = [];
    let synced = 0;
    for (const item of queue) {
      try {
        await api.post("/sales/", item.payload);
        synced++;
      } catch {
        remaining.push(item);
      }
    }
    saveQueue(remaining);
    setQueuedCount(remaining.length);
    return synced;
  }, []);

  // Auto-retry when browser comes back online
  useEffect(() => {
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, [sync]);

  // Also drain on mount if we're already online
  useEffect(() => {
    if (navigator.onLine && loadQueue().length > 0) sync();
  }, [sync]);

  const enqueue = useCallback((payload) => {
    const queue = loadQueue();
    queue.push({ id: Date.now(), payload, timestamp: new Date().toISOString() });
    saveQueue(queue);
    setQueuedCount(queue.length);
  }, []);

  return { queuedCount, enqueue, sync };
}
