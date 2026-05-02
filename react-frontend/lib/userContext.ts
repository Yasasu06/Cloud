export const UserContext = {
  save(key: string, value: unknown) {
    if (typeof window !== 'undefined') {
      const ctx = JSON.parse(localStorage.getItem('user_context') || '{}')
      ctx[key] = value
      localStorage.setItem('user_context', JSON.stringify(ctx))
    }
  },
  get(key: string) {
    if (typeof window !== 'undefined') {
      const ctx = JSON.parse(localStorage.getItem('user_context') || '{}')
      return ctx[key]
    }
    return null
  },
  getAll() {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('user_context') || '{}')
    }
    return {}
  },
}
