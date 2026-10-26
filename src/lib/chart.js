// Utilidades del motor de gráficos: generación de velas ilustrativas y espejado alcista/bajista.
const rng = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 }

export function gen(pts, n, { seed = 7, vol = 1.3, over = {} } = {}) {
  const r = rng(seed), at = i => { for (let k = 1; k < pts.length; k++) if (i <= pts[k][0]) { const [a, pa] = pts[k - 1], [b, pb] = pts[k]; return pa + (pb - pa) * (i - a) / (b - a || 1) } return pts[pts.length - 1][1] }
  const out = []; let prev = at(0) - 1
  for (let i = 0; i < n; i++) {
    const c = at(i) + (r() - .5) * vol, o = i ? prev : c - 1, hi = Math.max(o, c) + r() * vol * .9 + .3, lo = Math.min(o, c) - r() * vol * .9 - .3
    out.push(over[i] ? { o: over[i][0], h: over[i][1], l: over[i][2], c: over[i][3] } : { o, h: hi, l: lo, c }); prev = out[i].c
  }
  return out
}

const SW = { h: 'l', l: 'h', bt: 'bb', bb: 'bt' }
const flipRef = v => typeof v === 'string' ? v.replace(/^(h|l|bt|bb)(\d+)$/, (_, k, i) => SW[k] + i) : typeof v === 'number' ? 100 - v : v
const POS = { above: 'below', below: 'above' }, KIND = { premium: 'discount', discount: 'premium', supply: 'demand', demand: 'supply', bull: 'bear', bear: 'bull', hi: 'lo', lo: 'hi', up: 'dn', dn: 'up' }

export function mirror(sc, map = {}) {
  const dict = { ...map, ...Object.fromEntries(Object.entries(map).map(([a, b]) => [b, a])) }
  const re = new RegExp(`(?<![A-Za-z])(${Object.keys(dict).sort((a, b) => b.length - a.length).join('|')})(?![A-Za-z])`, 'g')
  const lab = s => typeof s !== 'string' || !Object.keys(dict).length ? s : s.replace(re, m => dict[m])
  const ann = sc.ann.map(a => {
    const x = { ...a }
    for (const k of ['y', 'top', 'bottom', 'y1', 'y2']) if (k in x) x[k] = flipRef(x[k])
    if (x.top !== undefined && x.bottom !== undefined) [x.top, x.bottom] = [x.bottom, x.top]
    if (x.pts) x.pts = x.pts.map(([i, p]) => [i, flipRef(p)])
    if (x.from && Array.isArray(x.from)) x.from = [x.from[0], flipRef(x.from[1])]
    if (x.to && Array.isArray(x.to)) x.to = [x.to[0], flipRef(x.to[1])]
    if (x.pos) x.pos = POS[x.pos]
    if (x.dy) x.dy = -x.dy
    for (const k of ['kind', 'tone']) if (KIND[x[k]]) x[k] = KIND[x[k]]
    for (const k of ['label', 'text']) if (x[k]) x[k] = lab(x[k])
    return x
  })
  return { ...sc, candles: sc.candles.map(c => ({ o: 100 - c.o, c: 100 - c.c, h: 100 - c.l, l: 100 - c.h })), ann, steps: sc.steps.map(lab) }
}
