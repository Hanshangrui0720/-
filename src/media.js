// One asset root for the app, portrait, posters and certificate gallery.
// A GitHub Pages build may use the same Netlify media delivery as the main site.
export const MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE_URL || import.meta.env.BASE_URL).replace(/\/?$/, '/')
export const ORIGINAL_SITE = 'https://hanshangrui-080720.netlify.app/'

export function asset(path, { original = false } = {}) {
  const [file, query] = path.replace(/^\//, '').split('?')
  const name = original ? file : file.replace(/\.(png|jpe?g)$/i, '.webp')
  return `${MEDIA_BASE}${name}${query ? `?${query}` : ''}`
}

export const legacyAsset = path => `${ORIGINAL_SITE}${path.replace(/^\//, '').split('?')[0]}`

export function phoneDevice() {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPod|Android|Windows Phone/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 0 && Math.min(screen.width, screen.height) <= 820)
}

export function heroSources() {
  const mobilePortrait = phoneDevice() && window.matchMedia('(orientation: portrait)').matches
  return [...new Set([
    asset(mobilePortrait ? 'assets/hero-mobile-portrait-v2.mp4' : 'assets/hero-video-web.mp4'),
    legacyAsset('assets/hero-video-web.mp4'),
  ])]
}

export function heroPoster() {
  return asset(phoneDevice() && window.matchMedia('(orientation: portrait)').matches
    ? 'assets/hero-poster-mobile-v2.jpg' : 'assets/hero-poster-v2.jpg', { original: true })
}
