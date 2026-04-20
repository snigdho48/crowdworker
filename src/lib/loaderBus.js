let pendingRequests = 0
const listeners = new Set()

function emit() {
  const isVisible = pendingRequests > 0
  listeners.forEach((listener) => listener(isVisible))
}

export function startGlobalLoading() {
  pendingRequests += 1
  emit()
}

export function stopGlobalLoading() {
  pendingRequests = Math.max(0, pendingRequests - 1)
  emit()
}

export function subscribeGlobalLoading(listener) {
  listeners.add(listener)
  listener(pendingRequests > 0)
  return () => {
    listeners.delete(listener)
  }
}

