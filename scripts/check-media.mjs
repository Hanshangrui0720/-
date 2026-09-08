import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { createContext, SourceTextModule } from 'node:vm'
import { execFileSync } from 'node:child_process'

const source = readFileSync(new URL('../src/media.js', import.meta.url), 'utf8')
async function media({ base = '/', origin = '', ua = '', touch = 0, width = 1440, height = 900 } = {}) {
  const context = createContext({ navigator: { userAgent: ua, maxTouchPoints: touch },
    screen: { width, height }, window: { matchMedia: () => ({ matches: height > width }) } })
  const module = new SourceTextModule(source, { context,
    initializeImportMeta(meta) { meta.env = { BASE_URL: base, VITE_MEDIA_BASE_URL: origin } } })
  await module.link(() => {})
  await module.evaluate()
  return module.namespace
}

const desktop = await media({ width: 600, height: 900 })
assert.equal(desktop.heroSources()[0], '/assets/hero-video-web.mp4', 'narrow desktop keeps original video')
const iphone = await media({ ua: 'iPhone MicroMessenger', touch: 5, width: 390, height: 844 })
assert.equal(iphone.heroSources()[0], '/assets/hero-mobile-portrait-v2.mp4')
assert.equal(iphone.heroPoster(), '/assets/hero-poster-mobile-v2.jpg')
const landscape = await media({ ua: 'iPhone', touch: 5, width: 844, height: 390 })
assert.equal(landscape.heroSources()[0], '/assets/hero-video-web.mp4')
const pages = await media({ base: '/-/' })
assert.equal(pages.asset('/assets/certificates/ai-tuning.png'), '/-/assets/certificates/ai-tuning.webp')
const delivery = await media({ base: '/-/', origin: 'https://hanshangrui.xyz/' })
assert.equal(delivery.asset('/assets/resume-portrait-soft.png'), 'https://hanshangrui.xyz/assets/resume-portrait-soft.webp')

for (const name of ['hero-video-web.mp4', 'hero-mobile-portrait-v2.mp4']) {
  const data = readFileSync(new URL(`../public/assets/${name}`, import.meta.url))
  const boxes = []
  for (let offset = 0; offset + 8 <= data.length;) {
    let size = data.readUInt32BE(offset)
    const type = data.toString('ascii', offset + 4, offset + 8)
    if (size === 1) size = Number(data.readBigUInt64BE(offset + 8))
    if (size === 0) size = data.length - offset
    assert.ok(size >= 8 && offset + size <= data.length, `${name}: valid MP4 box`)
    boxes.push(type)
    offset += size
  }
  assert.ok(boxes.indexOf('moov') >= 0 && boxes.indexOf('moov') < boxes.indexOf('mdat'), `${name}: metadata before video for streaming`)
}
const current = execFileSync('git', ['hash-object', 'public/assets/hero-video-web.mp4'], { encoding: 'utf8' }).trim()
const previous = execFileSync('git', ['rev-parse', 'HEAD:public/assets/hero-video-web.mp4'], { encoding: 'utf8' }).trim()
assert.equal(current, previous, 'original desktop video is byte-for-byte unchanged')
const certs = readdirSync(new URL('../public/assets/certificates/', import.meta.url)).filter(name => name.endsWith('.webp'))
assert.equal(certs.length, 10)
for (const path of ['hero-poster-mobile-v2.jpg', 'hero-poster-v2.jpg', 'resume-portrait-soft.webp', 'services/ai-coding-generated-v2.webp', 'services/ppt-optimization-generated.webp', ...certs.map(n => `certificates/${n}`)]) {
  assert.ok(existsSync(new URL(`../dist/assets/${path}`, import.meta.url)), `${path}: included in deployment`)
}
console.log('PASS: desktop/iPhone selection, Pages/domain paths, 10 certificates, all critical images, streamable MP4s and unchanged original desktop video.')
