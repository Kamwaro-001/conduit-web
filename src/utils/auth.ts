export const TOKEN_KEY = 'conduit_token'

export function isTokenValid(token: string | null): boolean {
  if (!token) return false

  try {
    const payload = token.split('.')[1]
    if (!payload) return false

    const claims = JSON.parse(
      decodeURIComponent(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map((character) => `%${`00${character.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(''),
      ),
    ) as { exp?: unknown }

    return typeof claims.exp === 'number' && claims.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}
