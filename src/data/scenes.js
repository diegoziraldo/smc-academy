// Escenas didácticas: cada una reproduce la lógica descrita en Libro_SMC.pdf con velas ilustrativas.
import { gen, mirror } from '../lib/chart.js'
const z = (kind, a, b, top, bot, label, s = 1) => ({ t: 'z', kind, a, b, top, bot, label, s })
const l = (y, kind, label, s = 1, a, b, ls = false) => ({ t: 'l', y, kind, label, s, a, b, ls })
const p = (pts, kind, s = 1) => ({ t: 'p', pts, kind, s })
const d = (i, y, label, pos, kind, s = 1) => ({ t: 'd', i, y, label, pos, kind, s })
const g = (i, y, text, tone, s = 1, dy = 0) => ({ t: 't', i, y, text, tone, s, dy })
const ar = (from, to, kind, s = 1) => ({ t: 'a', from, to, kind, s })
const bd = (a, b, label, kind, s = 1) => ({ t: 'b', a, b, label, kind, s })
const ms = (i, y1, y2, label, s = 1) => ({ t: 'm', i, y1, y2, label, s })
const S = (pts, n, ann, steps, o = {}) => ({ candles: gen(pts, n, o), ann, steps, ...o })
const dual = (up, label = ['Alcista', 'Bajista'], map = {}) => ({ variants: [{ ...up, label: label[0] }, { ...mirror(up, map), label: label[1], tf: up.tf }] })
const TREND = { HH: 'LL', HL: 'LH', BSL: 'SSL', 'Swing High': 'Swing Low', 'Máximo': 'Mínimo', BOS: 'BOS', BISI: 'SIBI', 'Último LH': 'Último HL', LH: 'HL', LL: 'HH', 'Compradores': 'Vendedores', 'alcista': 'bajista', 'Alcista': 'Bajista', 'arriba': 'abajo', 'máximo': 'mínimo', 'mínimo': 'máximo' }

const trendUp = S([[0, 20], [4, 34], [7, 27], [12, 52], [15, 43], [20, 70], [23, 60], [28, 86], [31, 80]], 32, [
  p([[4, 'h4'], [7, 'l7'], [12, 'h12'], [15, 'l15'], [20, 'h20'], [23, 'l23'], [28, 'h28']], 'struct', 1),
  d(7, 'l7', 'HL', 'below', 'lo', 2), d(15, 'l15', 'HL', 'below', 'lo', 2), d(23, 'l23', 'HL', 'below', 'lo', 2),
  d(12, 'h12', 'HH', 'above', 'hi', 3), d(20, 'h20', 'HH', 'above', 'hi', 3), d(28, 'h28', 'HH', 'above', 'hi', 3)],
['Unís los swings relevantes: máximos y mínimos de la estructura, no cada zigzag.', 'Cada mínimo (HL) queda por encima del anterior: los compradores defienden más arriba.', 'Cada máximo (HH) supera al previo: tendencia alcista según el libro.'])
const rangeSc = S([[0, 48], [4, 64], [8, 42], [12, 65], [16, 41], [20, 64], [24, 43], [28, 63], [31, 52]], 32, [
  z('range', 0, 'end', 66, 40, 'RANGO · CONSOLIDACIÓN'), l(66, 'liq', 'Techo', 2), l(40, 'liq', 'Piso', 2),
  g(26, 52, 'Sin HH ni LL', 'n', 3)], ['El precio queda contenido entre un techo y un piso.', 'Los extremos acumulan órdenes: son la liquidez que el rango protege.', 'Sin máximos ni mínimos progresivos no hay tendencia: es consolidación.'])
const trend = { variants: [{ ...trendUp, label: 'Alcista' }, { ...mirror(trendUp, TREND), label: 'Bajista' }, { ...rangeSc, label: 'Consolidación' }] }

const swing = S([[0, 40], [5, 72], [9, 44], [14, 76], [19, 38], [24, 64], [31, 50]], 32, [
  d(5, 'h5', 'Swing High', 'above', 'hi', 1), d(14, 'h14', 'Swing High', 'above', 'hi', 1),
  d(9, 'l9', 'Swing Low', 'below', 'lo', 2), d(19, 'l19', 'Swing Low', 'below', 'lo', 2),
  p([[5, 'h5'], [9, 'l9'], [14, 'h14'], [19, 'l19'], [24, 'h24']], 'struct', 3)],
['Swing High: un máximo con máximos más bajos a ambos lados.', 'Swing Low: un mínimo con mínimos más altos a ambos lados.', 'Al unirlos aparece la estructura sobre la que se leen BOS y CHOCH.'])

const strong = S([[0, 20], [4, 34], [7, 27], [12, 52], [15, 43], [20, 70], [23, 60], [28, 86], [31, 82]], 32, [
  l('l23', 'eq', 'STRONG LOW', 1, 23, 'end'), d(23, 'l23', '', 'below', 'lo', 1), l('h28', 'choch', 'WEAK HIGH', 2, 28, 'end'), d(28, 'h28', '', 'above', 'hi', 2),
  ar([29, 'h28'], [31, 'l23'], 'proj', 3)],
['El mínimo que originó la ruptura al alza es un Strong Low: si cae, la estructura se rompe.', 'El máximo reciente es un Weak High: tiende a ser barrido, es liquidez a la vista.', 'Esperá que el precio busque el Weak High antes de dar por agotada la estructura.'])

const bosUp = S([[0, 30], [4, 48], [7, 40], [11, 58], [14, 49], [18, 66], [21, 56], [26, 80], [31, 74]], 32, [
  l('h11', 'struct', 'Swing high previo', 1, 11, 19, true), d(11, 'h11', '', 'above', 'hi', 1),
  g(14, 'h11', 'BOS', 'bull', 2, -30), d(17, 'c17', '', 'above', 'n', 2),
  ar([19, 'l21'], [26, 'h26'], 'up', 3)],
['Marcá el último swing high estructural dentro de la tendencia alcista.', 'El precio lo rompe con cierre más allá del nivel: Break of Structure.', 'El BOS confirma continuidad: la tendencia sigue en el mismo sentido.'], { over: { 17: [57, 68, 56, 66] } })
const bos = dual(bosUp, ['BOS alcista', 'BOS bajista'], TREND)

const chochDown = S([[0, 84], [4, 70], [7, 76], [11, 56], [14, 62], [18, 38], [21, 46], [24, 62], [28, 72], [31, 70]], 32, [
  p([[0, 'h0'], [4, 'l4'], [7, 'h7'], [11, 'l11'], [14, 'h14'], [18, 'l18']], 'struct', 1),
  d(7, 'h7', 'LH', 'above', 'hi', 1), d(14, 'h14', 'LH', 'above', 'hi', 1), d(11, 'l11', 'LL', 'below', 'lo', 1), d(18, 'l18', 'LL', 'below', 'lo', 1),
  l('h14', 'choch', 'Último LH', 2, 14, 25, true), g(25, 'h14', 'CHOCH', 'bull', 3, -20), ar([22, 'l21'], [28, 'h28'], 'up', 3)],
['La estructura bajista dibuja LH y LL consecutivos.', 'Marcá el último LH, el máximo que originó el último LL.', 'Si el precio lo rompe hacia arriba, hay un Change of Character: primera señal de cambio, no de reversión confirmada.'])
const choch = dual(chochDown, ['CHOCH alcista', 'CHOCH bajista'], TREND)

const disp = S([[0, 62], [4, 54], [8, 60], [12, 42], [15, 48], [19, 32], [22, 38], [23, 40], [24, 50], [25, 65], [26, 72], [31, 78]], 32, [
  l('h15', 'struct', 'Swing high a romper', 1, 15, 26, true), z('fvg', 24, 'end', 'l26', 'h24', 'FVG', 3), g(27, 'h15', 'MSS', 'bull', 2, -20)],
['Después de un tramo bajista, el precio se acerca a un swing high relevante.', 'Rompe con velas amplias y poco solapamiento: displacement + MSS según el libro.', 'El impulso deja una FVG: el rastro de la entrega agresiva.'], { over: { 24: [41, 50, 40, 49], 25: [49, 66, 48, 65], 26: [65, 73, 59, 71] } })

const cisd = S([[0, 66], [5, 58], [9, 64], [13, 50], [17, 56], [21, 40], [24, 47], [27, 66], [31, 74]], 32, [
  z('range', 17, 22, 'h17', 'l21', 'Secuencia bajista', 1), l('o17', 'choch', 'Apertura de la secuencia', 2, 17, 'end', true), g(26, 'o17', 'CISD', 'bull', 3, -22)],
['El precio entrega en una dirección con una secuencia de velas del mismo color.', 'El nivel clave es la apertura de esa secuencia.', 'Un cierre más allá de esa apertura marca el cambio en el estado de entrega (CISD).'], { over: { 17: [54, 58, 50, 51] } })

const pdz = S([[0, 30], [6, 42], [10, 36], [16, 68], [21, 58], [26, 74], [31, 56]], 32, [
  z('premium', 0, 'end', 76, 52, 'PREMIUM · VENTA CARA', 2), z('discount', 0, 'end', 52, 28, 'DISCOUNT · COMPRA BARATA', 2), l(52, 'solid', 'Equilibrio 50 %', 1),
  l(76, 'struct', 'Máximo del rango', 1), l(28, 'struct', 'Mínimo del rango', 1)],
['Elegí un rango relevante y trazá su máximo y su mínimo.', 'La mitad superior es Premium y la inferior Discount; el 50 % es el equilibrio.', 'En una estructura alcista se buscan compras en Discount; en bajista, ventas en Premium.'], { y: [18, 88] })

const obUp = S([[0, 52], [4, 40], [8, 46], [10, 34], [13, 38], [16, 36], [17, 38], [19, 58], [22, 70], [25, 64], [28, 76], [31, 72]], 32, [
  z('ob', 16, 'end', 'bt16', 'bb16', 'ORDER BLOCK', 1), g(21, 'h21', 'Displacement', 'blue', 2, -18), l('bt16', 'liq', '', 3, 16, 'end'),
  g(29, 'bt16', 'Retesteo', 'vio', 3, 0)],
['La última vela bajista antes del impulso marca el origen del movimiento.', 'El desplazamiento posterior confirma que hubo órdenes institucionales.', 'Cuando el precio regresa al bloque, se evalúa la reacción (no es entrada automática).'], { over: { 16: [40, 41, 33, 34], 17: [34, 46, 33, 45], 18: [45, 58, 44, 57] } })
const ob = dual(obUp, ['Bullish OB', 'Bearish OB'], TREND)

const breaker = S([[0, 62], [4, 50], [8, 58], [11, 46], [13, 60], [16, 40], [19, 34], [23, 46], [26, 55], [29, 44], [31, 36]], 32, [
  z('ob', 8, 13, 'bt8', 'bb8', 'OB original', 1), z('breaker', 14, 'end', 'bt8', 'bb8', 'BREAKER BLOCK', 2), g(17, 'bb8', 'Ruptura', 'bear', 2, 22),
  g(27, 'bt8', 'Retesteo', 'acc', 3, -16), ar([27, 'h26'], [30, 'l29'], 'dn', 3)],
['Un Order Block alcista marca soporte en la estructura.', 'El precio lo rompe hacia abajo con desplazamiento: el bloque falla.', 'Al regresar, la zona actúa como resistencia: el OB fallido es ahora un Breaker.'], { over: { 8: [52, 59, 51, 58] } })

const fvgUp = S([[0, 30], [5, 38], [9, 34], [11, 42], [14, 62], [17, 66], [21, 60], [25, 72], [31, 68]], 32, [
  z('fvg', 13, 'end', 'l14', 'h12', 'FVG ALCISTA (BISI)', 2), ms(2, 'h12', 'l14', '', 9), g(13, 'h12', '1', 'n', 1, 16), g(14, 'h14', '2', 'n', 1, -16), g(15, 'h14', '3', 'n', 1, -16),
  l('l14', 'fib', '', 3, 15, 'end'), g(23, 'l14', 'Retorno a la FVG', 'blue', 3, 0)],
['Tres velas consecutivas: la vela 2 es un impulso fuerte.', 'La FVG es el espacio entre el máximo de la vela 1 y el mínimo de la vela 3.', 'El precio suele volver a equilibrar la zona; la reacción define la lectura.'], { over: { 12: [41, 44, 38, 43], 13: [43, 62, 42, 61], 14: [61, 66, 49, 64], 15: [64, 68, 60, 66] } })
const fvg = dual(fvgUp, ['FVG alcista · BISI', 'FVG bajista · SIBI'], TREND)

const ifvg = S([[0, 30], [5, 38], [9, 34], [11, 42], [14, 62], [17, 64], [20, 58], [23, 40], [26, 36], [29, 48], [31, 44]], 32, [
  z('fvg', 13, 22, 'l14', 'h12', 'FVG alcista', 1), z('fvg', 23, 'end', 'l14', 'h12', 'IFVG · ahora resistencia', 3), g(23, 'bb23', 'Cierre bajo la FVG', 'bear', 2, 22), g(29, 'h29', 'Rechazo', 'bear', 3, -18)],
['Primero existe una FVG alcista que actuaba como soporte.', 'El precio la atraviesa y cierra al otro lado: la zona cambió de función.', 'Al retestearla desde abajo se lee como Inverse FVG: resistencia.'], { over: { 12: [41, 44, 38, 43], 13: [43, 62, 42, 61], 14: [61, 66, 49, 64], 15: [64, 68, 60, 66], 23: [52, 52, 38, 40] } })

const bpr = S([[0, 56], [4, 70], [8, 66], [11, 50], [14, 30], [18, 46], [21, 62], [24, 50], [28, 58], [31, 54]], 32, [
  z('fvg', 9, 'end', 'l11', 'h9', 'FVG bajista', 1), z('ob', 15, 'end', 'l16', 'h13', 'FVG alcista', 1), z('breaker', 15, 'end', 'l11', 'h13', 'BPR · SUPERPOSICIÓN', 2)],
['Primero se forma un desequilibrio en una dirección.', 'Luego otro en sentido contrario, que cubre parte del primero.', 'El solapamiento de ambos es el Balanced Price Range.'], { y: [18, 82] })

const liq = S([[0, 40], [4, 56], [8, 44], [12, 58], [16, 43], [20, 60], [24, 48], [28, 58], [31, 52]], 32, [
  l('h20', 'liq', 'BSL · Buy-Side Liquidity', 1, 4, 'end'), l('l16', 'eq', 'SSL · Sell-Side Liquidity', 1, 8, 'end'),
  d(4, 'h4', 'EQH', 'above', 'hi', 2), d(12, 'h12', 'EQH', 'above', 'hi', 2), d(20, 'h20', 'EQH', 'above', 'hi', 2),
  ar([29, 'h28'], [31, 'h20'], 'proj', 3)],
['Los máximos evidentes acumulan stops y órdenes de compra: Buy-Side Liquidity.', 'Los mínimos iguales (EQL) hacen lo mismo del lado vendedor: Sell-Side Liquidity.', 'El precio tiende a buscar esos niveles: Draw on Liquidity.'])

const sweepUp = S([[0, 44], [4, 60], [8, 50], [12, 62], [16, 51], [20, 62.5], [22, 66], [24, 56], [28, 46], [31, 40]], 32, [
  l('h12', 'liq', 'BSL · Máximos iguales', 1, 4, 'end'), d(22, 'h22', 'Sweep', 'above', 'sweep', 2), g(25, 'h12', 'Cierre de regreso', 'bear', 2, 20), ar([24, 'l24'], [29, 'l28'], 'dn', 3)],
['Hay liquidez compradora sobre un máximo evidente.', 'El precio lo excede con una mecha y vuelve a cerrar dentro del rango: barrido.', 'La reacción posterior es la que confirma; el barrido solo no es señal.'], { over: { 22: [62, 67, 59, 60] } })
const sweep = dual(sweepUp, ['Sweep de BSL', 'Sweep de SSL'], { BSL: 'SSL', 'Máximos': 'Mínimos', compradora: 'vendedora', 'máximo': 'mínimo' })

const induce = S([[0, 36], [5, 52], [9, 43], [12, 52], [14, 46], [17, 50], [21, 70], [25, 62], [31, 80]], 32, [
  d(12, 'h12', 'Mínimo menor / trampa', 'above', 'sweep', 1), l('l14', 'liq', 'Inducement', 1, 9, 17), ar([14, 'l14'], [21, 'h21'], 'n', 2), g(22, 'h21', 'Liquidez objetivo', 'acc', 3, -18)],
['Un máximo o mínimo menor atrae a los traders minoristas.', 'Sus stops quedan como combustible del movimiento.', 'El precio los barre y luego se dirige a la liquidez principal.'])

const ie = S([[0, 40], [5, 60], [9, 46], [13, 58], [17, 44], [21, 56], [25, 48], [31, 52]], 32, [
  z('range', 0, 'end', 66, 38, ''), l(66, 'liq', 'ERL · liquidez externa', 1), l(38, 'liq', 'ERL · liquidez externa', 1), z('fvg', 13, 17, 'h17', 'l13', 'IRL · FVG', 2), z('ob', 5, 9, 'h5', 'l9', 'IRL · OB', 2),
  ar([22, 'h21'], [29, 'h28'], 'proj', 3)],
['El rango tiene extremos externos: liquidez fuera del rango (ERL).', 'Dentro del rango hay zonas internas, como FVG u OB: liquidez interna (IRL).', 'El precio suele alternar: de IRL a ERL y de ERL a IRL.'], { y: [28, 76] })

const stats = S([[0, 50], [3, 54], [6, 47], [9, 51], [12, 49], [15, 56], [19, 70], [23, 83], [27, 76], [31, 80]], 32, [
  z('range', 0, 12, 56, 46, 'Rango base', 1), l(56, 'solid', '0', 1, 0, 'end'), l(46, 'solid', '', 1, 0, 'end'),
  l(66, 'fib', '+1σ', 2), l(76, 'fib', '+2σ', 2), l(86, 'fib', '+3σ', 2), ar([14, 'h14'], [23, 'h23'], 'proj', 3), g(25, 'h23', 'Posible extensión', 'acc', 3, -18)],
['Medí el rango base del período de referencia.', 'Replicá su altura hacia arriba y abajo: cada múltiplo es una desviación estándar.', 'Los niveles ±2 y ±2.5 funcionan como zonas de reacción potencial, no como certezas.'], { y: [30, 96] })


const oteC = gen([[0, 34], [2, 32], [10, 60], [14, 50], [17, 41], [20, 47], [24, 70], [28, 84], [31, 82]], 32, { seed: 7, vol: 1.1 })
const oL = oteC[2].l, oH = oteC[10].h, lv = r => oH - (oH - oL) * r
const ote = { candles: oteC, y: [18, 104], steps: ['Definí el impulso: del mínimo al máximo del swing elegido.', 'Fibonacci marca la zona OTE entre 0.62 y 0.79; el 0.705 es el punto ideal.', 'Si el precio reacciona en la zona, los objetivos se proyectan en -0.5 y -1.'], ann: [
  p([[2, 'l2'], [10, 'h10']], 'alt', 1), l(oH, 'fib', '0', 1, 10), l(oL, 'fib', '1 · 100 %', 1, 10), l(lv(.5), 'fib', '0.5', 1, 12),
  z('ote', 12, 'end', lv(.62), lv(.79), 'OTE · 0.62 – 0.79', 2), l(lv(.705), 'fib', '0.705', 2, 12), g(17, 'l17', 'Reacción', 'acc', 3, 22),
  l(oH + (oH - oL) * .5, 'fib', '-0.5 · objetivo 1', 3, 18), l(oH + (oH - oL), 'fib', '-1 · objetivo 2', 3, 18)] }

const drives = S([[0, 30], [4, 46], [6, 38], [10, 58], [12, 49], [16, 74], [19, 62], [24, 52], [31, 40]], 32, [
  d(4, 'h4', '1', 'above', 'hi', 1), d(10, 'h10', '2', 'above', 'hi', 1), d(16, 'h16', '3', 'above', 'hi', 1),
  p([[4, 'h4'], [6, 'l6'], [10, 'h10'], [12, 'l12'], [16, 'h16']], 'struct', 2), g(16, 'h16', 'Posible agotamiento', 'acc', 3, -28), ar([17, 'h16'], [27, 'l27'], 'dn', 3)],
['Tres impulsos sucesivos, cada uno con máximos más altos y correcciones comparables.', 'Se observan simetría de tiempo y de precio entre los drives.', 'El tercer drive puede mostrar agotamiento: se busca confirmación con estructura, no se asume reversión.'])

const po3 = S([[0, 52], [3, 56], [6, 50], [9, 54], [11, 46], [13, 38], [15, 47], [20, 60], [26, 72], [35, 90]], 36, [
  bd(0, 9, 'ACUMULACIÓN', 'blue', 1), bd(10, 15, 'MANIPULACIÓN', 'warn', 2), bd(16, 35, 'DISTRIBUCIÓN', 'hot', 3), l('l6', 'liq', 'SSL del rango', 2, 0, 16), d(13, 'l13', 'Judas swing', 'below', 'sweep', 2), ar([16, 'l15'], [34, 'h34'], 'up', 3)],
['Acumulación: el precio se comprime y construye liquidez a ambos lados.', 'Manipulación: un falso movimiento barre un extremo del rango (Judas Swing).', 'Distribución: el movimiento real se expande hacia la liquidez opuesta.'], { y: [26, 100] })

const turtle = S([[0, 60], [4, 44], [8, 54], [12, 42], [16, 53], [20, 41.5], [22, 36], [24, 48], [28, 62], [31, 70]], 32, [
  l('l12', 'liq', 'Mínimos previos', 1, 4, 'end'), d(22, 'l22', 'Falsa ruptura', 'below', 'sweep', 2), g(25, 'l12', 'Recupera el nivel', 'bull', 3, -22), ar([24, 'h24'], [30, 'h30'], 'up', 3)],
['Un mínimo conocido acumula stops de vendedores.', 'El precio rompe el nivel pero no sostiene: falsa ruptura.', 'Al volver dentro del rango, se evalúa la reversión (Turtle Soup).'], { over: { 22: [42, 43, 35, 41] } })

const smt = S([[0, 62], [5, 74], [9, 66], [14, 78], [18, 69], [23, 90], [27, 82], [31, 86]], 32, [
  p([[0, 22], [5, 36], [9, 28], [14, 40], [18, 32], [23, 38], [27, 30], [31, 32]], 'alt', 1), g(2, 'h2', 'ACTIVO A', 'n', 1, -16), g(2, 24, 'ACTIVO B', 'vio', 1),
  d(14, 'h14', 'HH', 'above', 'hi', 2), d(23, 'h23', 'Nuevo HH', 'above', 'hi', 2), d(14, 40, 'Máx.', 'above', 'n', 2), d(23, 38, 'No confirma', 'below', 'sweep', 3)],
['Dos activos correlacionados suelen moverse juntos.', 'Uno marca un nuevo máximo y el otro no lo confirma.', 'Esa divergencia (SMT) sugiere debilidad y aporta contexto.'], { y: [10, 100] })

const hrs = (i0, step, k) => Array.from({ length: k }, (_, j) => ({ i: i0 + j * step, t: `${String((20 + (i0 + j * step) / 2) % 24).padStart(2, '0')}:00` }))
const kz = S([[0, 52], [4, 55], [8, 50], [11, 52], [13, 42], [15, 45], [18, 60], [22, 64], [25, 76], [28, 82], [32, 70], [40, 66], [47, 68]], 48, [
  bd(0, 7, 'ASIA', 'blue', 1), bd(12, 17, 'LONDRES', 'hot', 2), bd(22, 27, 'NY AM', 'hot', 3), bd(28, 31, 'LDN CLOSE', 'warn', 4),
  l('l6', 'liq', 'Rango asiático', 1, 0, 14), d(13, 'l13', 'Judas', 'below', 'sweep', 2)],
['Asia (20:00–00:00 NY): sesión de acumulación, rango estrecho.', 'Londres (02:00–05:00): rompe el rango y marca un extremo del día.', 'Nueva York (07:00–10:00): máxima volatilidad; confirma o revierte a Londres.', 'London Close (10:00–12:00): ajustes y posibles retrocesos.'],
{ y: [28, 98], tf: 'Hora de NY', xlabels: hrs(0, 8, 6).concat([{ i: 47, t: '20:00' }]).slice(0, 6) })
const silver = { ...kz, ann: [bd(14, 17, 'SB LONDRES 03–04', 'blue', 1), bd(28, 31, 'SB NY AM 10–11', 'hot', 2), bd(36, 39, 'SB NY PM 14–15', 'blue', 3), l('l6', 'liq', 'Liquidez previa', 1, 0, 28), z('fvg', 29, 'end', 56, 52, 'FVG 1M', 3)],
  steps: ['Tres ventanas de una hora (hora de NY): 03–04, 10–11 y 14–15.', 'La ventana AM de Nueva York suele ser la más ventajosa por la superposición con Londres.', 'Dentro de la ventana: liquidez, MSS y retorno a una FVG.'] }

const ict = S([[0, 60], [5, 70], [9, 62], [13, 76], [16, 68], [18, 78.5], [20, 70], [22, 55], [24, 52], [27, 61], [31, 50], [35, 40], [39, 30]], 40, [
  l('h13', 'liq', 'BSL · máximo previo', 1, 13, 'end'), d(18, 'h18', '1 · Sweep', 'above', 'sweep', 1), g(22, 'l22', '2 · Displacement + MSS', 'blue', 2, 24), z('fvg', 21, 'end', 'l21', 'h23', '3 · FVG', 3), g(27, 'h27', '4 · Retorno', 'acc', 3, -16), l(30, 'eq', 'SSL · objetivo', 4, 24, 'end'), ar([28, 'h27'], [39, 'l38'], 'dn', 4)],
['Capturá liquidez: el precio barre máximos o mínimos previos.', 'Desplazamiento fuerte y cambio de estructura (MSS).', 'Quedan una FVG u OB por encima/debajo del 50 % del rango.', 'Entrada en el retorno, con objetivo en la liquidez opuesta y R:R mínimo 1:3.'],
{ y: [20, 90], over: { 21: [70, 70.5, 61, 62], 22: [62, 63, 51, 52], 23: [52, 56, 50, 55] } })

const unicornBase = breaker
const unicorn = { ...breaker, ann: [...breaker.ann.filter(a => a.t !== 'a'), z('fvg', 15, 'end', 56, 47, 'FVG', 2), g(24, 53, 'UNICORN', 'vio', 3)],
  steps: ['Un bloque fallido se convierte en Breaker Block.', 'En el mismo tramo aparece una FVG que lo solapa.', 'La superposición de ambos (Unicorn) refina la zona de entrada.'] }

const risk = S([[0, 40], [5, 46], [10, 44], [12, 50], [16, 58], [20, 68], [24, 74], [31, 76]], 32, [
  z('reward', 12, 'end', 74, 50, 'OBJETIVO · +3R'), z('risk', 12, 'end', 50, 42, 'RIESGO · 1R'), l(50, 'solid', 'Entrada', 1, 12), l(42, 'choch', 'Invalidación (stop)', 1, 12), l(74, 'eq', 'Objetivo', 2, 12), g(8, 46, 'Plan antes de entrar', 'n', 1)],
['Definí el nivel de invalidación antes de entrar.', 'El objetivo define la recompensa; la relación R:R se calcula de antemano.', 'Sin plan de riesgo, ninguna lectura estructural alcanza.'], { y: [30, 84] })

const candlesSc = S([[0, 50], [8, 52]], 9, [
  d(3, 'h3', 'Máximo (High)', 'above', 'n', 1), d(3, 'l3', 'Mínimo (Low)', 'below', 'n', 1), g(4.7, 'o3', 'Apertura', 'n', 2), g(4.7, 'c3', 'Cierre', 'bull', 2), ms(1.6, 'bt3', 'bb3', 'Cuerpo', 3),
  g(7.3, 'bt6', 'Apertura', 'n', 2, 0), g(7.3, 'bb6', 'Cierre', 'bear', 2, 0)],
['Cada vela resume un intervalo: máximo, mínimo, apertura y cierre.', 'Vela alcista: abre abajo y cierra arriba. Vela bajista: al revés.', 'El cuerpo une apertura y cierre; las mechas muestran los extremos.'], { y: [18, 82], over: { 0: [50, 54, 46, 49], 1: [49, 56, 47, 52], 2: [52, 55, 48, 50], 3: [38, 70, 28, 60], 4: [60, 66, 55, 58], 5: [58, 62, 50, 52], 6: [64, 72, 36, 42], 7: [42, 50, 38, 47], 8: [47, 56, 44, 54] } })

const orders = S([[0, 50], [10, 55], [20, 47], [31, 51]], 32, [
  l(52, 'solid', 'Precio actual', 1), l(66, 'liq', 'Buy Stop · Sell Limit', 2), l(38, 'eq', 'Buy Limit · Sell Stop', 2), g(26, 52, 'Orden de mercado: se ejecuta ya', 'n', 3, -16)],
['Las órdenes se colocan respecto del precio actual.', 'Por encima: Buy Stop (compra en ruptura) y Sell Limit (venta en rechazo). Por debajo: Buy Limit y Sell Stop.', 'Mercado ejecuta al instante; límite y stop esperan un nivel.'], { y: [26, 76] })

const sd = S([[0, 60], [5, 48], [8, 40], [11, 41], [13, 40], [16, 62], [20, 74], [23, 73], [25, 74], [28, 56], [31, 44]], 32, [
  z('demand', 8, 13, 'h11', 'l8', 'DEMANDA · base previa al rally', 1), z('supply', 22, 26, 'h24', 'l22', 'OFERTA · base previa a la caída', 2), g(30, 'l28', 'Reacción en oferta', 'bear', 3, 22)],
['Una base seguida de rally señala demanda: ahí hubo más compradores.', 'Una base seguida de caída señala oferta: dominaron los vendedores.', 'Son zonas, no líneas: el precio puede reaccionar al volver.'], { y: [26, 86] })

const weekly = S([[0, 50], [6, 56], [8, 52], [14, 40], [16, 44], [23, 34], [24, 45], [30, 60], [32, 64], [38, 80], [39, 78]], 40, [
  bd(0, 7, 'LUN', 'blue', 1), bd(8, 15, 'MAR', 'blue', 1), bd(16, 23, 'MIÉ', 'blue', 1), bd(24, 31, 'JUE', 'blue', 1), bd(32, 39, 'VIE', 'blue', 1), d(23, 'l23', 'Mínimo semanal', 'below', 'lo', 2), ar([25, 'h24'], [38, 'h38'], 'up', 3)],
['Cada día aporta una fase del movimiento semanal.', 'El extremo de la semana suele formarse a mitad de semana, tras un barrido.', 'La expansión posterior lleva el precio hacia la liquidez opuesta.'], { y: [22, 92] })

const gap = S([[0, 50], [11, 56], [12, 64], [23, 76]], 24, [
  z('fvg', 11, 'end', 'o12', 'c11', 'NWOG · hueco de apertura', 1), g(5, 'c11', 'Cierre del viernes', 'n', 1, -22), g(16, 'o12', 'Apertura del domingo', 'acc', 2, 22), ar([20, 'h20'], [14, 'bb12'], 'proj', 3)],
['Entre el cierre del viernes y la apertura del domingo queda un hueco: el NWOG.', 'El mismo concepto aplica al día (NDOG), entre cierre y apertura.', 'El hueco actúa como referencia de precio al que el mercado puede volver.'], { y: [34, 86], over: { 12: [66, 69, 62, 64] } })

const cal = S([[0, 50], [13, 51], [14, 52], [18, 44], [27, 48]], 28, [
  bd(13, 15, 'DATO MACRO', 'warn', 1), g(20, 'h14', 'Spread amplio · slippage', 'bear', 2, 6), g(21, 'l14', 'Volatilidad', 'acc', 2, 6)],
['Un dato macroeconómico programado puede disparar la volatilidad.', 'El spread y el deslizamiento pueden empeorar la ejecución.', 'El calendario económico es contexto: conviene saber cuándo sale.'], { y: [14, 86], over: { 14: [50, 78, 24, 38] } })

export const scenes = { trend, swing, strongweak: strong, bos, choch, mss: disp, displacement: disp, cisd, premium: pdz, ob, breaker, fvg, ifvg, bpr, liquidity: liq, sweep, inducement: induce, 'internal-external': ie, stats, ote, 'three-drives': drives, po3, turtle, smt, time: kz, silver, ict, unicorn, risk, candles: candlesSc, orders, 'supply-demand': sd, weekly, 'opening-gap': gap, calendar: cal }
const alias = { 'trend-up': 'trend', 'trend-down': 'trend', range: 'trend', platform: 'candles', vacuum: 'displacement', propulsion: 'ob', mitigation: 'ob', rejection: 'ob', imbalance: 'fvg' }
export const sceneOverride = {
  27: { title: 'Breakaway Gap: hueco de ruptura', caption: 'Un hueco de precio que deja una zona sin cubrir tras una ruptura.', rule: 'El libro lo relaciona con desequilibrios que el precio puede volver a rebalancear.' },
  37: { title: 'Candle Range Theory: barrido y retorno al rango', caption: 'Una vela barre el extremo de la anterior y el precio regresa hacia su rango.', rule: 'El rango de una vela (máximo–mínimo) sirve de marco para anticipar el siguiente movimiento.' },
  40: { title: 'IPDA: la liquidez como referencia de entrega', caption: 'El precio se entrega entre extremos de liquidez de ventanas de 20, 40 y 60 días.', rule: 'Es un marco conceptual: ayuda a ubicar objetivos, no a predecir cada vela.' },
  46: { title: 'CBDR: rango 14:00–20:00 (NY) y desviaciones', caption: 'El rango se proyecta con desviaciones estándar para estimar extremos del día.', rule: 'Idealmente el rango es menor a 40 pips; 20–30 pips es el intervalo más indicado.' },
  50: { title: 'Judas Swing: el movimiento inicial que engaña', caption: 'Al abrir una sesión el precio barre un extremo del rango antes de la dirección real.', rule: 'Suele aparecer al inicio de Londres o Nueva York y captura la liquidez del rango previo.' },
  56: { title: 'Silver Bullet: tres ventanas de una hora', caption: 'Londres 03–04, NY AM 10–11 y NY PM 14–15 (hora de Nueva York).', alt: 'Línea de tiempo con las tres ventanas Silver Bullet.', rule: 'Dentro de la ventana: liquidez, MSS y retorno a una FVG.' },
}
export const sceneTypeFix = { 27: 'opening-gap', 37: 'sweep', 40: 'liquidity', 46: 'stats', 50: 'po3', 56: 'silver' }
export const sceneFor = type => scenes[alias[type] || type] || scenes.trend
