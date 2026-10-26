<script setup>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
const props = defineProps({ scene: { type: Object, required: true }, compact: Boolean })
const W = 760, H = props.compact ? 360 : 420, L = 14, R = 62, T = 36, B = 34
const variant = ref(0), step = ref(0), playing = ref(false), key = ref(0)
let timer = null
const sc = computed(() => props.scene.variants ? props.scene.variants[variant.value] || props.scene.variants[0] : props.scene)
const total = computed(() => sc.value.steps.length)
const n = computed(() => sc.value.candles.length)
const cw = computed(() => (W - L - R) / n.value)
const range = computed(() => {
  if (sc.value.y) return sc.value.y
  const h = sc.value.candles.map(c => c.h), l = sc.value.candles.map(c => c.l)
  return [Math.min(...l) - 7, Math.max(...h) + 9]
})
const X = i => L + (i + .5) * cw.value
const Y = p => T + (1 - (p - range.value[0]) / (range.value[1] - range.value[0])) * (H - T - B)
const ref_ = v => {
  if (typeof v === 'number') return v
  const m = /^(h|l|o|c|bt|bb)(\d+)$/.exec(v); const c = sc.value.candles[+m[2]]
  return { h: c.h, l: c.l, o: c.o, c: c.c, bt: Math.max(c.o, c.c), bb: Math.min(c.o, c.c) }[m[1]]
}
const xe = (v, edge) => v === 'end' ? W - R : X(v) + (edge === 'r' ? cw.value / 2 : -cw.value / 2)
const vis = a => (a.s ?? 1) <= step.value
const candles = computed(() => sc.value.candles.map((c, i) => ({ i, x: X(i), up: c.c >= c.o, hi: Y(c.h), lo: Y(c.l), top: Y(Math.max(c.o, c.c)), h: Math.max(2, Math.abs(Y(c.o) - Y(c.c))) })))
const cwid = computed(() => Math.min(cw.value * .62, 15))
const ticks = computed(() => { const [a, b] = range.value, k = 6; return Array.from({ length: k }, (_, j) => a + (b - a) * (j + .5) / k) })
const price = p => ((sc.value.base ?? 1.0800) + p * (sc.value.tick ?? .0003)).toFixed(4)
const items = computed(() => sc.value.ann.map((a, k) => {
  const o = { ...a, k, on: vis(a) }
  if (a.t === 'z') Object.assign(o, { x1: xe(a.a, 'l'), x2: xe(a.b ?? 'end', 'r'), y1: Y(ref_(a.top)), y2: Y(ref_(a.bot)) })
  if (a.t === 'l') Object.assign(o, { x1: a.a == null ? L : xe(a.a, 'l') + cw.value / 2, x2: a.b == null || a.b === 'end' ? W - R : X(a.b), yy: Y(ref_(a.y)) })
  if (a.t === 'p') o.d = a.pts.map(([i, p], j) => `${j ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(ref_(p)).toFixed(1)}`).join(' ')
  if (a.t === 'd') Object.assign(o, { cx: X(a.i), cy: Y(ref_(a.y)) })
  if (a.t === 't') Object.assign(o, { cx: X(a.i), cy: Y(ref_(a.y)) + (a.dy || 0), w: a.text.length * 6.4 + 16 })
  if (a.t === 'a') Object.assign(o, { x1: X(a.from[0]), y1: Y(ref_(a.from[1])), x2: X(a.to[0]), y2: Y(ref_(a.to[1])) })
  if (a.t === 'b') Object.assign(o, { x1: xe(a.a, 'l'), x2: xe(a.b, 'r') })
  if (a.t === 'm') Object.assign(o, { cx: X(a.i), y1: Y(ref_(a.y1)), y2: Y(ref_(a.y2)) })
  return o
}))
const tagPos = a => ({ x: a.cx - a.w / 2, y: a.cy - 11 })
const caption = computed(() => step.value === 0 ? 'Solo precio: observá el movimiento antes de marcar nada.' : sc.value.steps[step.value - 1])
function stop() { playing.value = false; clearInterval(timer) }
function play() {
  stop(); step.value = 0; key.value++; playing.value = true
  timer = setInterval(() => { if (step.value >= total.value) return stop(); step.value++ }, 1700)
}
watch(() => props.scene, () => { stop(); variant.value = 0; step.value = total.value; key.value++ }, { immediate: true })
watch(variant, () => { stop(); step.value = total.value; key.value++ })
onBeforeUnmount(stop)
</script>

<template>
  <figure class="cc">
    <div class="cc-bar">
      <div class="cc-tabs" v-if="scene.variants"><button v-for="(v, i) in scene.variants" :key="v.label" :class="{ on: variant === i }" @click="variant = i">{{ v.label }}</button></div>
      <span v-else class="cc-sym">ESQUEMA · {{ sc.tf || 'M15' }}</span>
      <div class="cc-actions"><button class="cc-play" @click="playing ? stop() : play()">{{ playing ? '❚❚ Pausar' : '▶ Reproducir paso a paso' }}</button></div>
    </div>
    <div class="cc-scroll"><svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="sc.alt || 'Gráfico de velas didáctico'" class="cc-svg">
      <defs>
        <pattern id="cc-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" stroke-width="1" opacity=".35" /></pattern>
        <marker id="cc-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="context-stroke" /></marker>
      </defs>
      <rect :x="L" :y="T - 8" :width="W - L - R" :height="H - T - B + 16" class="cc-plot" />
      <g class="cc-grid"><line v-for="(p, j) in ticks" :key="'g' + j" :x1="L" :x2="W - R" :y1="Y(p)" :y2="Y(p)" /></g>
      <g class="cc-axis"><text v-for="(p, j) in ticks" :key="'a' + j" :x="W - R + 8" :y="Y(p) + 3.5">{{ price(p) }}</text>
        <text v-for="x in (sc.xlabels || [])" :key="x.i" :x="X(x.i)" :y="H - 16" text-anchor="middle">{{ x.t }}</text></g>
      <g :key="'bands' + key"><template v-for="a in items.filter(i => i.t === 'b')" :key="a.k">
        <g class="ann" :class="{ on: a.on }"><rect :x="a.x1" :y="T - 8" :width="a.x2 - a.x1" :height="H - T - B + 16" :class="['band', a.kind || 'time']" /><text :x="(a.x1 + a.x2) / 2" :y="T + 6" text-anchor="middle" class="band-t">{{ a.label }}</text></g></template></g>
      <g :key="'zones' + key"><template v-for="a in items.filter(i => i.t === 'z')" :key="a.k">
        <g class="ann" :class="{ on: a.on }"><rect :x="a.x1" :y="Math.min(a.y1, a.y2)" :width="a.x2 - a.x1" :height="Math.abs(a.y2 - a.y1)" :class="['zone', a.kind]" rx="2" />
</g></template></g>
      <g :key="'c' + key" class="cc-candles"><g v-for="c in candles" :key="c.i" class="candle" :style="{ animationDelay: c.i * 28 + 'ms' }">
        <line :x1="c.x" :x2="c.x" :y1="c.hi" :y2="c.lo" :class="c.up ? 'w-up' : 'w-dn'" />
        <rect :x="c.x - cwid / 2" :y="c.top" :width="cwid" :height="c.h" rx="1.2" :class="c.up ? 'c-up' : 'c-dn'" /></g></g>
      <g :key="'zl' + key"><template v-for="a in items.filter(i => i.t === 'z' && i.label)" :key="a.k"><g class="ann" :class="{ on: a.on }">
        <text :x="a.b == null || a.b === 'end' ? a.x2 - 8 : a.x1 + 8" :y="Math.min(a.y1, a.y2) + 14" :text-anchor="a.b == null || a.b === 'end' ? 'end' : 'start'" :class="['zone-t', a.kind]">{{ a.label }}</text></g></template></g>
      <g :key="'ann' + key"><template v-for="a in items.filter(i => !['z', 'b'].includes(i.t))" :key="a.k">
        <g class="ann" :class="{ on: a.on }">
          <template v-if="a.t === 'l'"><line :x1="a.x1" :x2="a.x2" :y1="a.yy" :y2="a.yy" :class="['lvl', a.kind]" /><text v-if="a.label" :x="a.ls ? a.x1 + 6 : a.x2 - 4" :y="a.yy - 6" :text-anchor="a.ls ? 'start' : 'end'" :class="['lvl-t', a.kind]">{{ a.label }}</text></template>
          <template v-else-if="a.t === 'p'"><path :d="a.d" :class="['pth', a.kind]" pathLength="1" /></template>
          <template v-else-if="a.t === 'a'"><line :x1="a.x1" :y1="a.y1" :x2="a.x2" :y2="a.y2" :class="['arr', a.kind]" marker-end="url(#cc-arr)" /></template>
          <template v-else-if="a.t === 'm'"><path :d="`M${a.cx} ${a.y1}V${a.y2}M${a.cx - 5} ${a.y1}H${a.cx + 5}M${a.cx - 5} ${a.y2}H${a.cx + 5}`" class="meas" /><text :x="a.cx + 9" :y="(a.y1 + a.y2) / 2 + 4" class="meas-t">{{ a.label }}</text></template>
          <template v-else-if="a.t === 'd'"><circle :cx="a.cx" :cy="a.cy" r="4.5" :class="['dot', a.kind]" /><text :x="a.cx" :y="a.pos === 'below' ? a.cy + 19 : a.cy - 11" text-anchor="middle" :class="['dot-t', a.kind]">{{ a.label }}</text></template>
          <template v-else-if="a.t === 't'"><rect :x="tagPos(a).x" :y="tagPos(a).y" :width="a.w" height="22" rx="11" :class="['tag', a.tone]" /><text :x="a.cx" :y="a.cy + 4" text-anchor="middle" :class="['tag-t', a.tone]">{{ a.text }}</text></template>
        </g></template></g>
      <text :x="W - R - 4" :y="H - 6" text-anchor="end" class="cc-note">Datos ilustrativos · no son una señal</text>
    </svg></div>
    <figcaption class="cc-foot">
      <div class="cc-steps"><button class="cc-nav" :disabled="step <= 0" @click="stop(); step--" aria-label="Paso anterior">‹</button>
        <button v-for="s in total + 1" :key="s" class="cc-dot" :class="{ on: step === s - 1, past: step >= s - 1 }" @click="stop(); step = s - 1" :aria-label="'Paso ' + (s - 1)">{{ s - 1 }}</button>
        <button class="cc-nav" :disabled="step >= total" @click="stop(); step++" aria-label="Paso siguiente">›</button></div>
      <p class="cc-cap"><b>{{ step === 0 ? 'Precio' : 'Paso ' + step + ' de ' + total }}</b> {{ caption }}</p>
    </figcaption>
  </figure>
</template>

<style scoped>
.cc{margin:0;background:linear-gradient(180deg,#0f141b,#0c1015);border:1px solid var(--line,#27313b);border-radius:14px;overflow:hidden}
.cc-bar{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--line,#27313b);flex-wrap:wrap}
.cc-sym{font:600 11px/1 ui-monospace,Menlo,monospace;letter-spacing:.12em;color:#7d8a99}
.cc-tabs{display:flex;gap:4px;background:#0a0d11;padding:3px;border-radius:9px;border:1px solid #1d252e}
.cc-tabs button{border:0;background:none;color:#8995a3;padding:6px 12px;border-radius:7px;font-size:12px;font-weight:600;cursor:pointer}
.cc-tabs button.on{background:#1b2530;color:#e9eef4}
.cc-play{border:1px solid #2b3744;background:#151c25;color:#d8e1ea;border-radius:8px;padding:7px 12px;font-size:12px;font-weight:600;cursor:pointer}
.cc-play:hover{border-color:#43e0a1;color:#43e0a1}
.cc-svg{display:block;width:100%;height:auto}
.cc-plot{fill:#0b0f14;stroke:#1a222b}
.cc-grid line{stroke:#18212a;stroke-width:1}
.cc-axis text{font:500 10.5px ui-monospace,Menlo,monospace;fill:#66737f}
.cc-note{font:500 10px ui-monospace,Menlo,monospace;fill:#4b5662;letter-spacing:.04em}
.candle{opacity:0;animation:cin .45s ease forwards}
@keyframes cin{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
.c-up{fill:#2fd39a}.c-dn{fill:#ff5d5d}.w-up{stroke:#2fd39a;stroke-width:1.4}.w-dn{stroke:#ff5d5d;stroke-width:1.4}
.ann{opacity:0;transition:opacity .55s ease;pointer-events:none}.ann.on{opacity:1}
.zone{stroke-width:1;stroke-dasharray:none}
.zone.fvg{fill:#4aa8ff26;stroke:#4aa8ff99}.zone.ob{fill:#a78bfa2b;stroke:#a78bfaaa}.zone.breaker{fill:#f5b94a26;stroke:#f5b94aaa}
.zone.supply,.zone.premium,.zone.risk{fill:#ff5d5d1c;stroke:#ff5d5d66}.zone.demand,.zone.discount,.zone.reward{fill:#2fd39a1c;stroke:#2fd39a66}
.zone.range{fill:#8995a31a;stroke:#8995a355;stroke-dasharray:4 4}.zone.ote{fill:#f5b94a2e;stroke:#f5b94a}.zone.void{fill:url(#cc-hatch);color:#4aa8ff;stroke:#4aa8ff55}
.zone-t{font:700 10.5px ui-sans-serif,system-ui;letter-spacing:.06em}
.zone-t.fvg{fill:#7dbfff}.zone-t.ob{fill:#c4b2ff}.zone-t.breaker,.zone-t.ote{fill:#ffd37a}.zone-t.supply,.zone-t.premium,.zone-t.risk{fill:#ff8d8d}.zone-t.demand,.zone-t.discount,.zone-t.reward{fill:#5fe3b2}.zone-t.range,.zone-t.void{fill:#a7b3c0}
.band{fill:#8995a30f;stroke:#8995a333}.band.hot{fill:#43e0a122;stroke:#43e0a177}.band.warn{fill:#ff8b5522;stroke:#ff8b5577}.band.blue{fill:#4aa8ff1c;stroke:#4aa8ff66}.band-t{font:700 10px ui-sans-serif,system-ui;letter-spacing:.08em;fill:#b4c0cc}
.lvl{stroke-width:1.4;stroke-dasharray:6 5}.lvl.liq{stroke:#ff8b55}.lvl.struct{stroke:#8fa1b3}.lvl.choch{stroke:#ff5d5d}.lvl.eq{stroke:#43e0a1}.lvl.fib{stroke:#f5b94a;stroke-dasharray:2 4}.lvl.solid{stroke:#c9d4df;stroke-dasharray:none}
.lvl-t{font:700 10.5px ui-sans-serif,system-ui;letter-spacing:.05em}.lvl-t.liq{fill:#ffa077}.lvl-t.struct{fill:#b4c0cc}.lvl-t.choch{fill:#ff8d8d}.lvl-t.eq{fill:#5fe3b2}.lvl-t.fib{fill:#ffd37a}.lvl-t.solid{fill:#e4ebf2}
.pth{fill:none;stroke-width:2;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1;animation:none}
.ann.on .pth{animation:draw .9s ease forwards}@keyframes draw{to{stroke-dashoffset:0}}
.pth.struct{stroke:#e9eef4}.pth.up{stroke:#43e0a1}.pth.dn{stroke:#ff6b5e}.pth.alt{stroke:#a78bfa}.pth.proj{stroke:#f5b94a}
.ann.on .pth.proj,.ann.on .pth.alt2{stroke-dasharray:.02 .02;stroke-dashoffset:0;animation:none}
.arr{stroke-width:2.2}.arr.up{stroke:#43e0a1}.arr.dn{stroke:#ff6b5e}.arr.n{stroke:#c9d4df}.arr.proj{stroke:#f5b94a;stroke-dasharray:5 4}
.dot{stroke:#0b0f14;stroke-width:2}.dot.hi{fill:#ff8b55}.dot.lo{fill:#43e0a1}.dot.n{fill:#e9eef4}.dot.sweep{fill:#f5b94a}
.dot-t{font:800 12px ui-sans-serif,system-ui;fill:#e9eef4}.dot-t.hi{fill:#ffa077}.dot-t.lo{fill:#5fe3b2}.dot-t.sweep{fill:#ffd37a}
.tag{stroke-width:1}.tag.bull{fill:#12372c;stroke:#2fd39a}.tag.bear{fill:#3a1b1d;stroke:#ff5d5d}.tag.n{fill:#18212b;stroke:#3a4757}.tag.acc{fill:#2c2410;stroke:#f5b94a}.tag.vio{fill:#241d3d;stroke:#a78bfa}.tag.blue{fill:#12283d;stroke:#4aa8ff}
.tag-t{font:700 10.5px ui-sans-serif,system-ui;letter-spacing:.04em;fill:#e9eef4}
.meas{stroke:#8995a3;fill:none;stroke-width:1.3}.meas-t{font:600 10.5px ui-sans-serif,system-ui;fill:#b4c0cc}
.cc-foot{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;padding:12px;border-top:1px solid var(--line,#27313b);background:#0a0d11}
.cc-steps{display:flex;gap:5px;align-items:center}
.cc-nav,.cc-dot{width:28px;height:28px;border-radius:8px;border:1px solid #2a3440;background:#131a22;color:#a9b6c3;font-weight:700;cursor:pointer;font-size:12px}
.cc-nav:disabled{opacity:.35;cursor:default}.cc-dot.past{border-color:#2f7c63;color:#7be8bf}.cc-dot.on{background:#43e0a1;color:#06150f;border-color:#43e0a1}
.cc-cap{margin:0;color:#b8c4d0;font-size:14px;line-height:1.5}.cc-cap b{color:#43e0a1;font-size:11px;letter-spacing:.1em;text-transform:uppercase;margin-right:6px}
@media(max-width:640px){.cc-foot{grid-template-columns:1fr}.cc-scroll{overflow-x:auto}.cc-svg{min-width:640px}}
@media(prefers-reduced-motion:reduce){.candle,.ann{animation:none;opacity:1;transition:none}.ann:not(.on){opacity:0}}
</style>
