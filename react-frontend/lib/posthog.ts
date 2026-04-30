import posthog from 'posthog-js'

export function initPostHog() {
  if (process.env.NODE_ENV === 'development') return
  if (typeof window !== 'undefined') {
    posthog.init('phc_placeholder', {
      api_host: 'https://app.posthog.com',
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') ph.debug()
      },
    })
  }
}

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties)
  }
}

export { posthog }
