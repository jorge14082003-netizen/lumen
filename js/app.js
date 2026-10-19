/* Lumen · gastos — PWA sin dependencias. Los datos viven solo en el teléfono.
   Concepto: tu dinero es luz. La lámpara se atenúa según consumes el presupuesto. */
(() => {
  'use strict';

  const KEY = 'lumen.v1';
  const VERSION = '2.0.0';
  const MAX_CENTS = 99999999; // 999.999,99 €

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const app = $('#app');
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  /* ---------------------------------------------------------------- iconos */
  const I = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    left: '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
    right: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    del: '<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="m16.5 9.5-5 5m0-5 5 5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    pencil: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2.2"/><circle cx="10" cy="17" r="2.2"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 5.6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.7M6.3 6.8A16 16 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 4.3-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    repeat: '<path d="M17 2.5 20.5 6 17 9.5"/><path d="M3.5 11V9.5A3.5 3.5 0 0 1 7 6h13.5"/><path d="M7 21.5 3.5 18 7 14.5"/><path d="M20.5 13v1.5A3.5 3.5 0 0 1 17 18H3.5"/>',
    shield: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
    down: '<path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/>',
    up: '<path d="M12 20V9m-5 5 5-5 5 5M5 4h14"/>',
    bolt: '<path d="M13 2.5 4.5 13.5H12L11 21.5l8.5-11H12z"/>',
    phone: '<rect x="6" y="2.5" width="12" height="19" rx="3"/><path d="M10.5 18.5h3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.5"/>',
    warn: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.5v.3"/>',
    trendUp: '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    trendDown: '<path d="M3 7l6 6 4-4 8 8"/><path d="M15 17h6v-6"/>',
    flag: '<path d="M5 21V4m0 0h11l-2 4 2 4H5"/>',
    share: '<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M5 12v7.5h14V12"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.6l2.4 12.2h11.2l2-8.4H6.2"/>',
    fork: '<path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10M17 21V3c-2.2 1.2-3.5 3.7-3.5 7v3H17"/>',
    car: '<path d="M5 16.5h14M3.5 17v-4.5l2.2-5A2 2 0 0 1 7.5 6.3h9a2 2 0 0 1 1.8 1.2l2.2 5V17"/><path d="M3.5 12.5h17"/><circle cx="7.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
    home: '<path d="M3.5 11 12 4l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M10 20v-5.5h4V20"/>',
    spark: '<path d="M11 3.5l1.8 4.7 4.7 1.8-4.7 1.8L11 16.5l-1.8-4.7L4.5 10l4.7-1.8z"/><path d="M18.5 15l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
    bag: '<path d="M5 8h14l-1 12.5H6z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    heart: '<path d="M20.5 8.8c0 5-8.5 10.7-8.5 10.7S3.5 13.8 3.5 8.8A4.3 4.3 0 0 1 12 6.6a4.3 4.3 0 0 1 8.5 2.2z"/>',
    case: '<rect x="3.5" y="7.5" width="17" height="12.5" rx="2.5"/><path d="M9 7.5v-2A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5v2M8 7.5V20M16 7.5V20"/>',
    dots: '<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>',
  };
  const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n] || ''}</svg>`;

  /* ------------------------------------------------------------ categorías */
  const CATS = [
    { id: 'super', nombre: 'Súper', h: 28, ic: 'cart' },
    { id: 'comer', nombre: 'Comer fuera', h: 8, ic: 'fork' },
    { id: 'transporte', nombre: 'Transporte', h: 198, ic: 'car' },
    { id: 'casa', nombre: 'Casa', h: 262, ic: 'home' },
    { id: 'ocio', nombre: 'Ocio', h: 318, ic: 'spark' },
    { id: 'compras', nombre: 'Compras', h: 46, ic: 'bag' },
    { id: 'salud', nombre: 'Salud', h: 350, ic: 'heart' },
    { id: 'suscripciones', nombre: 'Suscripción', h: 168, ic: 'repeat' },
    { id: 'viajes', nombre: 'Viajes', h: 222, ic: 'case' },
    { id: 'otros', nombre: 'Otros', h: 30, ic: 'dots' },
  ];
  const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));
  const cat = (id) => CAT[id] || CAT.otros;
  const catHsl = (id, l = 66) => `hsl(${cat(id).h} 85% ${l}%)`;

  // Palabras que delatan la categoría cuando el concepto es nuevo.
  const PISTAS = {
    super: 'mercadona lidl carrefour aldi alcampo eroski dia hipercor consum ahorramas bonpreu supermercado super compra fruteria carniceria panaderia pan',
    comer: 'cafe menu comida cena desayuno almuerzo restaurante bar cerveza cana vermut burger hamburguesa pizza sushi kebab tapas glovo ubereats justeat telepizza mcdonalds burgerking starbucks brunch',
    transporte: 'gasolina gasoil diesel combustible metro bus autobus taxi uber cabify bolt parking aparcamiento peaje renfe tren abono itv taller patinete bicing',
    casa: 'alquiler hipoteca luz agua gas internet fibra comunidad ikea limpieza muebles leroy bricolaje',
    ocio: 'cine concierto copas entradas teatro fiesta discoteca festival museo juego steam playstation xbox libro libros padel futbol',
    compras: 'zara amazon ropa zapatillas primark decathlon mango pull bershka mediamarkt fnac aliexpress shein corte',
    salud: 'farmacia medico dentista fisio fisioterapeuta optica gafas gimnasio gym seguro medicinas psicologo',
    suscripciones: 'netflix spotify hbo max disney prime youtube icloud chatgpt claude movil telefono tarifa suscripcion dazn filmin',
    viajes: 'hotel vuelo avion airbnb booking ryanair iberia vueling easyjet maleta viaje',
  };
  const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const PISTA_MAP = new Map();
  for (const [c, words] of Object.entries(PISTAS)) for (const w of words.split(' ')) PISTA_MAP.set(w, c);

  /* ---------------------------------------------------------------- fechas */
  const pad = (n) => String(n).padStart(2, '0');
  const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const today = () => ymd(new Date());
  const yesterday = () => { const d = new Date(); d.setDate(d.getDate() - 1); return ymd(d); };
  const ymOf = (f) => f.slice(0, 7);
  const curYM = () => today().slice(0, 7);
  const parseD = (f) => { const [y, m, d] = f.split('-').map(Number); return new Date(y, m - 1, d || 1); };
  const addM = (ym, n) => {
    let [y, m] = ym.split('-').map(Number);
    m += n; y += Math.floor((m - 1) / 12); m = (((m - 1) % 12) + 12) % 12 + 1;
    return `${y}-${pad(m)}`;
  };
  const dim = (ym) => { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate(); };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const mesNombre = (ym) => new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(parseD(ym));
  const mesCorto = (ym) => new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(parseD(ym)).replace('.', '');
  const fmtMes = (ym) => `${cap(mesNombre(ym))} ${ym.slice(0, 4)}`;
  const diaLabel = (f) => {
    if (f === today()) return 'Hoy';
    if (f === yesterday()) return 'Ayer';
    return cap(new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric' }).format(parseD(f)));
  };
  const fechaCorta = (f) => new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(parseD(f)).replace('.', '');

  /* ---------------------------------------------------------------- dinero */
  // Todo se guarda en céntimos enteros: nunca se suman decimales en coma flotante.
  const NF = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' });
  const NF0 = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always' });
  const eur = (c) => NF.format(c / 100);
  const eur0 = (c) => NF0.format(Math.round(c / 100));
  const eurBig = (c) => { // "1.234" + ",56 €"
    let a = '', b = '', dec = false;
    for (const x of NF.formatToParts(c / 100)) {
      if (x.type === 'decimal') dec = true;
      if (x.type === 'literal' || x.type === 'currency' || x.type === 'minusSign') continue;
      if (dec) b += x.value; else a += x.value;
    }
    return `${a}<small>${b} €</small>`;
  };
  const centsToStr = (c) => (c / 100).toFixed(2).replace('.', ',').replace(/,00$/, '');
  // Admite "1.250,5", "1250.50", "12,5 €"…
  function parseImporte(txt) {
    let s = String(txt || '').replace(/[€\s]/g, '');
    if (!s) return null;
    if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
    else if (/\.\d{3}$/.test(s)) s = s.replace(/\./g, '');
    if (!/^\d+(\.\d{0,2})?$/.test(s)) return null;
    const [i, d = ''] = s.split('.');
    const c = Number(i) * 100 + Number((d + '00').slice(0, 2));
    return Number.isSafeInteger(c) ? c : null;
  }
  const pct = (x) => `${Math.round(x * 100)} %`;
  const deltaHtml = (d) => { const p = Math.round(d * 100); return p === 0 ? '<span>= igual</span>' : `<span class="${p > 0 ? 'up' : 'down'}">${p > 0 ? '▲' : '▼'} ${Math.abs(p)} %</span>`; };
  const esc = (s) => String(s).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
  const sum = (arr) => arr.reduce((a, g) => a + g.cents, 0);
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));

  /* ----------------------------------------------------------------- datos */
  const DEFAULT = () => ({ v: 1, gastos: [], fijos: [], presupuesto: null, tema: 'ambar', nombre: '', ultimaCat: 'super', ultimoBackup: null,
    abrirDirecto: false, discreto: false, heroModo: 'gastado', cierreVisto: null, bienvenida: false });
  const validGasto = (g) => g && typeof g.id === 'string' && Number.isSafeInteger(g.cents) && g.cents > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(g.fecha) && typeof g.concepto === 'string';
  function normalizar(d) {
    const s = Object.assign(DEFAULT(), d && typeof d === 'object' ? d : {});
    s.gastos = Array.isArray(s.gastos) ? s.gastos.filter(validGasto).map((g) => ({ creado: 0, ...g, cat: CAT[g.cat] ? g.cat : 'otros' })) : [];
    s.fijos = Array.isArray(s.fijos) ? s.fijos.filter((f) => f && f.id && Number.isSafeInteger(f.cents) && /^\d{4}-\d{2}$/.test(f.desde))
      .map((f) => ({ omitidos: [], activo: true, ...f })) : [];
    if (!Number.isSafeInteger(s.presupuesto) || s.presupuesto <= 0) s.presupuesto = null;
    if (!['ambar', 'noche', 'salvia'].includes(s.tema)) s.tema = 'ambar';
    if (s.gastos.length) s.bienvenida = true; // quien ya tiene datos no necesita presentación
    return s;
  }
  function load() {
    let raw = null;
    try {
      raw = localStorage.getItem(KEY);
      return raw ? normalizar(JSON.parse(raw)) : DEFAULT();
    } catch (e) {
      // Nunca se pisa un dato ilegible: se aparta con otra clave antes de seguir.
      try { if (raw) localStorage.setItem(`${KEY}.ilegible.${Date.now()}`, raw); } catch (_) { /* sin espacio */ }
      return DEFAULT();
    }
  }
  let S = load();
  function save() {
    const raw = JSON.stringify(S);
    try {
      localStorage.setItem(KEY, raw);
      if (localStorage.getItem(KEY) !== raw) throw new Error('verificación');
      return true;
    } catch (e) {
      toast('No se ha podido guardar. Libera espacio en el teléfono y vuelve a intentarlo.', { error: true, ms: 7000 });
      return false;
    }
  }
  // Toda modificación pasa por aquí: si falla el guardado se deshace en memoria,
  // y si sale bien devuelve la foto anterior para poder "Deshacer".
  function commit(fn) {
    const snap = JSON.stringify(S);
    const r = fn();
    if (!save()) { S = JSON.parse(snap); return null; }
    persistir();
    return { snap, r };
  }
  function undo(snap) {
    S = normalizar(JSON.parse(snap));
    if (save()) { render(); toast('Deshecho', { ic: 'check' }); }
  }
  async function persistir() {
    try { if (navigator.storage && navigator.storage.persist && !(await navigator.storage.persisted())) await navigator.storage.persist(); } catch (_) { /* opcional */ }
  }

  /* --------------------------------------------------------- gastos fijos */
  function aplicarFijos() {
    const hoy = today(), cym = hoy.slice(0, 7), dHoy = Number(hoy.slice(8));
    let n = 0;
    for (const f of S.fijos) {
      if (!f.activo) continue;
      for (let m = addM(f.desde, 1); m <= cym; m = addM(m, 1)) {
        if (f.omitidos.includes(m)) continue;
        if (m === cym && dHoy < Math.min(f.dia, dim(m))) continue; // día 31 en meses cortos: último día
        if (S.gastos.some((g) => g.fijoId === f.id && ymOf(g.fecha) === m)) continue;
        S.gastos.push({ id: uid(), cents: f.cents, cat: f.cat, concepto: f.concepto, fecha: `${m}-${pad(Math.min(f.dia, dim(m)))}`, creado: Date.now(), fijoId: f.id });
        n++;
      }
    }
    return n;
  }
  function borrarGasto(id) {
    const g = S.gastos.find((x) => x.id === id);
    if (!g) return null;
    if (g.fijoId) { const f = S.fijos.find((x) => x.id === g.fijoId); if (f && !f.omitidos.includes(ymOf(g.fecha))) f.omitidos.push(ymOf(g.fecha)); }
    S.gastos = S.gastos.filter((x) => x.id !== id);
    return g;
  }

  /* -------------------------------------------------------------- cálculos */
  const gastosMes = (ym) => S.gastos.filter((g) => g.fecha.startsWith(ym))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.creado - a.creado);
  const totalHasta = (ym, corte, catId) => sum(S.gastos.filter((g) => g.fecha.startsWith(ym) && Number(g.fecha.slice(8)) <= corte && (!catId || g.cat === catId)));
  function resumen(ym) {
    const list = gastosMes(ym);
    const total = sum(list);
    const cym = curYM(), D = dim(ym), hoy = today();
    const dias = ym < cym ? D : ym === cym ? Number(hoy.slice(8)) : 0;
    const porCat = {};
    for (const g of list) porCat[g.cat] = (porCat[g.cat] || 0) + g.cents;
    // Fijos que aún no han llegado este mes: se reservan del presupuesto.
    const fijosPendList = ym === cym ? S.fijos.filter((f) => f.activo && f.desde < ym && !f.omitidos.includes(ym) && !list.some((g) => g.fijoId === f.id)) : [];
    const fijosPend = fijosPendList.reduce((a, f) => a + f.cents, 0);
    const gastoHoy = ym === cym ? sum(list.filter((g) => g.fecha === hoy)) : 0;
    let proy = null;
    if (ym === cym && dias) {
      // Los fijos no se extrapolan: se suman tal cual, hayan llegado ya o no.
      const fijosHechos = sum(list.filter((g) => g.fijoId));
      proy = Math.round(((total - fijosHechos) / dias) * D) + fijosHechos + fijosPend;
    }
    // Comparación justa: en el mes en curso, contra el mismo tramo de días del anterior.
    const prev = addM(ym, -1);
    const corte = ym === cym ? dias : 31;
    const prevTotal = totalHasta(prev, corte);
    let hoyDisp = null;
    if (S.presupuesto && ym === cym) {
      const restante = S.presupuesto - (total - gastoHoy) - fijosPend;
      const diasRest = D - dias + 1;
      const porDia = restante / diasRest;
      hoyDisp = { restante, diasRest, porDia, queda: Math.round(porDia - gastoHoy) };
    }
    return { list, total, porCat, dias, D, media: dias ? total / dias : 0, proy, prev, prevTotal, corte,
      delta: prevTotal ? (total - prevTotal) / prevTotal : null, fijosPend, fijosPendList, gastoHoy, hoyDisp };
  }
  function historialConceptos() {
    const m = new Map();
    for (const g of S.gastos) {
      const k = norm(g.concepto);
      if (!k) continue;
      const e = m.get(k) || { label: g.concepto.trim(), cat: g.cat, n: 0, cents: g.cents, t: 0 };
      e.n++;
      const t = g.creado || parseD(g.fecha).getTime();
      if (t >= e.t) { e.t = t; e.cents = g.cents; e.cat = g.cat; e.label = g.concepto.trim(); }
      m.set(k, e);
    }
    return m;
  }
  function sugerencias(texto, catId) {
    let arr = [...historialConceptos().values()];
    const q = norm(texto);
    if (q) arr = arr.filter((e) => norm(e.label).includes(q) && norm(e.label) !== q);
    else if (catId) { const deCat = arr.filter((e) => e.cat === catId); if (deCat.length) arr = deCat; }
    return arr.sort((a, b) => b.n - a.n || b.t - a.t).slice(0, 8);
  }
  // Adivina la categoría: primero tu propio historial, luego palabras clave.
  function adivinarCat(concepto) {
    const k = norm(concepto);
    if (!k) return null;
    const h = historialConceptos().get(k);
    if (h) return h.cat;
    for (const w of k.split(/[^a-z0-9ñ]+/)) {
      if (PISTA_MAP.has(w)) return PISTA_MAP.get(w);
      if (w.length >= 4) for (const [p, c] of PISTA_MAP) if (p.length >= 4 && w.startsWith(p)) return c;
    }
    return null;
  }
  // "café 1,80" → importe 1,80 · concepto "café" · categoría Comer fuera
  function interpretar(txt) {
    const m = txt.match(/(?:^|\s)(\d{1,6}(?:[.,]\d{1,2})?)\s*(?:€|eur|euros?)?(?=\s|$)/i);
    let cents = null, concepto = txt.trim();
    if (m) {
      const c = parseImporte(m[1]);
      if (c && c <= MAX_CENTS) { cents = c; concepto = `${txt.slice(0, m.index)} ${txt.slice(m.index + m[0].length)}`.replace(/\s+/g, ' ').trim(); }
    }
    if (concepto) concepto = cap(concepto);
    return { cents, concepto, cat: adivinarCat(concepto) };
  }

  /* ------------------------------------------------------------- copiloto */
  function mediaCategoria(catId, ym, corte) {
    const vals = [];
    for (let i = 1; i <= 3; i++) {
      const m = addM(ym, -i);
      if (!S.gastos.some((g) => g.fecha.startsWith(m))) continue;
      vals.push(totalHasta(m, corte, catId));
    }
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  }
  function consejos(ym, r) {
    const out = [];
    const cym = curYM(), pres = S.presupuesto;
    if (!r.list.length) return out;
    if (ym === cym) {
      if (pres && r.dias >= 3 && r.proy !== null) {
        if (r.proy > pres * 1.03) out.push({ t: 'warn', ic: 'trendUp', k: 'Ritmo', h: `A este ritmo cerrarás ${mesNombre(ym)} en <b>${eur0(r.proy)}</b>, <b>${eur0(r.proy - pres)} por encima</b> de tu presupuesto.` });
        else if (r.proy < pres * 0.95) out.push({ t: 'good', ic: 'trendDown', k: 'Ritmo', h: `Si sigues así acabarás el mes en <b>${eur0(r.proy)}</b> y te sobrarán unos <b>${eur0(pres - r.proy)}</b>.` });
        else out.push({ t: 'info', ic: 'flag', k: 'Ritmo', h: `Vas justo al ritmo de tu presupuesto. Proyección: <b>${eur0(r.proy)}</b>.` });
      }
      // Categoría disparada respecto a tus últimos meses (mismo tramo de días)
      let peor = null;
      for (const [id, c] of Object.entries(r.porCat)) {
        const media = mediaCategoria(id, ym, r.dias);
        if (media > 0 && c > media * 1.5 && c - media >= 2000 && (!peor || c - media > peor.diff)) peor = { id, c, media, diff: c - media };
      }
      if (peor) out.push({ t: 'warn', ic: 'warn', k: 'Ojo', h: `<b>${cat(peor.id).nombre}</b> va un <b>${Math.round((peor.c / peor.media - 1) * 100)} % por encima</b> de lo habitual: ${eur0(peor.c)} frente a ${eur0(peor.media)} de media.` });
      if (r.prevTotal && Math.abs(r.delta) >= 0.1) {
        const d = r.total - r.prevTotal;
        out.push({ t: d > 0 ? 'info' : 'good', ic: d > 0 ? 'trendUp' : 'trendDown', k: `Frente a ${mesNombre(r.prev)}`, h: `Llevas <b>${eur0(Math.abs(d))} ${d > 0 ? 'más' : 'menos'}</b> que en ${mesNombre(r.prev)} a estas alturas del mes.` });
      }
      if (r.fijosPendList.length) out.push({ t: 'info', ic: 'repeat', k: 'Por llegar', h: `Faltan <b>${r.fijosPendList.length} ${r.fijosPendList.length === 1 ? 'gasto fijo' : 'gastos fijos'}</b> este mes: <b>${eur(r.fijosPend)}</b>. Ya están reservados en tu cálculo diario.` });
    } else if (ym < cym) {
      out.push({ t: 'info', ic: 'book', k: 'Mes cerrado', h: `Toca aquí para ver el <b>cierre de ${mesNombre(ym)}</b>: lo que gastaste, dónde y cómo te fue.`, act: 'cierre' });
    }
    const conc = new Map();
    for (const g of r.list) { if (g.fijoId) continue; const k = norm(g.concepto); if (!k) continue; const e = conc.get(k) || { label: g.concepto, n: 0, c: 0 }; e.n++; e.c += g.cents; conc.set(k, e); }
    const rep = [...conc.values()].sort((a, b) => b.n - a.n)[0];
    if (rep && rep.n >= 4) out.push({ t: 'info', ic: 'repeat', k: 'Costumbre', h: `Has apuntado <b>«${esc(rep.label)}»</b> ${rep.n} veces en ${mesNombre(ym)}: <b>${eur(rep.c)}</b> en total.` });
    if (!pres && ym === cym) out.push({ t: 'info', ic: 'sun', k: 'Consejo', h: 'Fija un <b>presupuesto</b> y la lámpara te dirá cuánto puedes gastar cada día. Toca aquí.', act: 'presupuesto' });
    return out.slice(0, 4);
  }

  /* ------------------------------------------------------------ utilidades */
  let toastTimer = null;
  function toast(msg, { action, onAction, error, ms = 4200, ic } = {}) {
    const box = $('#toast-root');
    const old = $('.toast', box);
    if (old) old.remove();
    clearTimeout(toastTimer);
    const el = document.createElement('div');
    el.className = `toast${error ? ' err' : ''}`;
    el.innerHTML = `${icon(error ? 'warn' : ic || 'check')}<span>${msg}</span>${action ? `<button type="button">${esc(action)}</button>` : ''}`;
    box.appendChild(el);
    const close = () => { el.classList.add('out'); setTimeout(() => el.remove(), 300); };
    if (action) $('button', el).onclick = () => { close(); onAction && onAction(); };
    toastTimer = setTimeout(close, ms);
  }
  function haptic(ms = 8) {
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return; // sin toque previo el navegador lo bloquea
    try {
      if (navigator.vibrate) navigator.vibrate(ms);
      else $('#haptic').click(); // iOS 18+: un interruptor nativo produce vibración háptica
    } catch (_) { /* opcional */ }
  }
  function dialog({ title, text = '', input = null, ok = 'Aceptar', cancel = 'Cancelar', danger = false }) {
    return new Promise((res) => {
      const el = document.createElement('div');
      el.className = 'dlg-wrap';
      el.innerHTML = `<div class="scrim"></div><div class="dlg glass" role="alertdialog" aria-modal="true" aria-label="${esc(title)}">
        <h3>${esc(title)}</h3>${text ? `<p>${text}</p>` : ''}
        ${input ? `<input class="field" type="text" inputmode="${input.mode || 'text'}" placeholder="${esc(input.placeholder || '')}" value="${esc(input.value || '')}" autocomplete="off">` : ''}
        <div class="dlg-btns">${cancel ? `<button class="btn ghost" data-r="0">${esc(cancel)}</button>` : ''}<button class="btn ${danger ? 'danger solid' : 'primary'}" data-r="1">${esc(ok)}</button></div></div>`;
      document.body.appendChild(el);
      void el.offsetWidth; el.classList.add('open');
      const inp = $('input', el);
      if (inp) setTimeout(() => { inp.focus(); inp.select(); }, 200);
      const done = (v) => { el.classList.remove('open'); document.removeEventListener('keydown', onKey); setTimeout(() => el.remove(), 300); res(v); };
      const onKey = (e) => { if (e.key === 'Escape') done(null); if (e.key === 'Enter') done(inp ? inp.value : true); };
      document.addEventListener('keydown', onKey);
      el.addEventListener('click', (e) => {
        const b = e.target.closest('[data-r]');
        if (b) done(b.dataset.r === '1' ? (inp ? inp.value : true) : null);
        else if (e.target.classList.contains('scrim')) done(null);
      });
    });
  }
  function burst(x, y) {
    if (reduceMotion) return;
    const el = document.createElement('div');
    el.className = 'burst';
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    let h = '<b></b>';
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + Math.random() * .3, r = 60 + Math.random() * 50;
      h += `<i style="--dx:${(Math.cos(a) * r).toFixed(0)}px;--dy:${(Math.sin(a) * r).toFixed(0)}px;animation-delay:${(Math.random() * 60).toFixed(0)}ms"></i>`;
    }
    el.innerHTML = h;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  // La animación es solo decoración: si el navegador no pinta (app en segundo
  // plano, ahorro de batería), un temporizador deja siempre el valor final.
  function tween(ms, fn, done) {
    let fin = false;
    const end = () => { if (fin) return; fin = true; fn(1); done && done(); };
    if (reduceMotion || document.visibilityState !== 'visible') return end();
    const t0 = performance.now();
    const step = (t) => { if (fin) return; const k = Math.min(1, (t - t0) / ms); if (k >= 1) return end(); fn(ease(k)); requestAnimationFrame(step); };
    requestAnimationFrame(step);
    setTimeout(end, ms + 250);
  }
  function animateCounts(scope) {
    $$('[data-count]', scope).forEach((el) => {
      const c = Number(el.dataset.count);
      const big = el.hasAttribute('data-big');
      tween(1000, (k) => { const v = Math.round(c * k); if (big) el.innerHTML = eurBig(v); else el.textContent = eur(v); });
    });
  }
  const saludo = () => { const h = new Date().getHours(); return h < 6 ? 'Buenas noches' : h < 13 ? 'Buenos días' : h < 21 ? 'Buenas tardes' : 'Buenas noches'; };
  const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  /* ---------------------------------------------------------------- estado */
  let view = 'inicio';
  let vm = curYM();
  let fcat = null;
  let fdia = null;
  let rango = 6;
  let freshId = null;
  let installEvt = null;
  let slideDir = '';
  let busq = { q: '', todo: true };

  /* ------------------------------------------------------------- lámpara */
  const lampHtml = (id = 'lamp') => `<div class="lamp" id="${id}" role="button" tabindex="0" aria-label="Lámpara. Tira hacia abajo para apuntar un gasto">
    <div class="cord"></div>
    <div class="lamp-head">
      <svg class="shade" viewBox="0 0 112 54" aria-hidden="true">
        <defs><linearGradient id="shg-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--acc2)"/><stop offset="1" style="stop-color:var(--acc)"/></linearGradient></defs>
        <rect x="48" y="0" width="16" height="9" rx="2.5" fill="rgba(0,0,0,.4)"/>
        <path d="M2 52 C4 22 30 7 56 7 C82 7 108 22 110 52 Z" fill="url(#shg-${id})"/>
        <path d="M3 52 H109" stroke="rgba(255,255,255,.55)" stroke-width="1.5"/>
        <path d="M20 31 C29 19 42 13.5 55 13" stroke="rgba(255,255,255,.5)" stroke-width="2" fill="none" stroke-linecap="round"/>
      </svg>
      <div class="bulb"></div>
      <div class="beam-wrap"><div class="beam"></div></div>
    </div>
    <span class="lamp-hint">Suelta para apuntar</span>
  </div>`;

  // Péndulo amortiguado: la lámpara se balancea al hacer scroll o al apuntar.
  let swA = 0, swV = 0, swRaf = 0, swLast = 0;
  function swing(imp) {
    if (reduceMotion || document.visibilityState !== 'visible') return;
    swV += imp;
    if (!swRaf) { swLast = performance.now(); swRaf = requestAnimationFrame(swStep); }
  }
  function swStep(t) {
    const dt = Math.min(0.05, (t - swLast) / 1000);
    swLast = t;
    swV += (-55 * swA - 2.6 * swV) * dt;
    swA += swV * dt;
    const el = document.getElementById('lamp');
    if (Math.abs(swA) < 0.02 && Math.abs(swV) < 0.05) { swA = swV = 0; if (el) el.style.setProperty('--sw', '0deg'); swRaf = 0; return; }
    if (el) el.style.setProperty('--sw', `${swA.toFixed(3)}deg`);
    swRaf = requestAnimationFrame(swStep);
  }
  function flashLamp() {
    const el = document.getElementById('lamp');
    if (!el) return;
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  }
  function bindLamp() {
    const el = $('#lamp', app);
    if (!el) return;
    let y0 = null, dy = 0, armed = false, moved = false;
    el.addEventListener('pointerdown', (e) => {
      y0 = e.clientY; dy = 0; armed = false; moved = false;
      el.classList.remove('release');
      try { el.setPointerCapture(e.pointerId); } catch (_) { /* nada */ }
    });
    el.addEventListener('pointermove', (e) => {
      if (y0 === null) return;
      dy = Math.max(0, e.clientY - y0);
      if (dy > 4) moved = true;
      const pull = dy < 90 ? dy : 90 + (dy - 90) * 0.25;
      el.style.setProperty('--pull', `${pull.toFixed(0)}px`);
      el.classList.toggle('pulling', dy > 12);
      const a = dy > 64;
      if (a !== armed) { armed = a; if (a) haptic(14); }
    });
    const end = () => {
      if (y0 === null) return;
      y0 = null;
      el.classList.add('release'); el.classList.remove('pulling');
      el.style.setProperty('--pull', '0px');
      if (armed) { flashLamp(); swing(10); setTimeout(() => openSheet(), 180); }
      else if (!moved) { flashLamp(); swing(12); haptic(6); }
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSheet(); } });
  }
  function setLux(ym) {
    const r = resumen(ym);
    const pres = S.presupuesto;
    const lux = pres ? clamp(1 - r.total / pres) : 0.85;
    root.style.setProperty('--lux', lux.toFixed(3));
    return { lux, over: !!(pres && r.total > pres) };
  }

  /* ----------------------------------------------------------------- vistas */
  function headerInicio() {
    return `<header class="top">
      <p class="hello">${saludo()}<b>${esc(S.nombre || 'Lumen')}</b></p>
      <div class="tools">
        <button class="icon-btn glass" data-go="buscar" aria-label="Buscar gastos">${icon('search')}</button>
        <button class="icon-btn glass${S.discreto ? ' on' : ''}" data-act="discreto" aria-label="${S.discreto ? 'Mostrar cifras' : 'Ocultar cifras'}" aria-pressed="${S.discreto}">${icon(S.discreto ? 'eyeoff' : 'eye')}</button>
        <button class="icon-btn glass" data-go="ajustes" aria-label="Ajustes">${icon('sliders')}</button>
      </div>
    </header>`;
  }

  function vInicio() {
    const r = resumen(vm);
    const cym = curYM();
    const pres = S.presupuesto;
    const over = !!(pres && r.total > pres);
    const esCur = vm === cym;
    const dispo = r.hoyDisp && S.heroModo === 'disponible';

    // Cifra principal
    let label, num, sub;
    if (dispo) {
      const q = r.hoyDisp.queda;
      label = q >= 0 ? 'Hoy puedes gastar' : 'Hoy te has pasado';
      num = Math.abs(q);
      const libre = r.hoyDisp.restante - r.gastoHoy; // presupuesto − gastado − fijos por llegar
      sub = libre > 0
        ? `Quedan <b>${eur(libre)}</b> libres para ${r.hoyDisp.diasRest === 1 ? 'hoy' : `${r.hoyDisp.diasRest} días`}${r.fijosPend ? `, con <b>${eur0(r.fijosPend)}</b> de fijos ya reservados` : ''}.`
        : 'Ya no queda presupuesto libre para el resto del mes.';
    } else {
      label = `Gastado en ${mesNombre(vm)}`;
      num = r.total;
      if (pres) sub = r.total <= pres ? `de ${eur0(pres)} · quedan <b>${eur(pres - r.total)}</b>` : `de ${eur0(pres)} · te has pasado <b>${eur(r.total - pres)}</b>`;
      else sub = `${r.list.length} ${r.list.length === 1 ? 'movimiento' : 'movimientos'}${esCur ? ` · día ${r.dias} de ${r.D}` : ''}`;
    }
    const pill = r.hoyDisp
      ? (dispo
        ? `<button class="today-pill glass" data-act="hero">${icon('flag')}Gastado este mes <b>${eur(r.total)}</b></button>`
        : `<button class="today-pill glass" data-act="hero">${icon('sun')}${r.hoyDisp.queda >= 0 ? `Hoy puedes gastar <b>${eur(r.hoyDisp.queda)}</b>` : `Hoy te has pasado <b class="neg">${eur(-r.hoyDisp.queda)}</b>`}</button>`)
      : (!pres ? `<button class="set-budget glass" data-act="presupuesto">${icon('plus')}Fijar presupuesto mensual</button>` : '');

    // Ritmo: barra de presupuesto con la marca de "hoy"
    let pace = '';
    if (pres) {
      const used = r.total / pres;
      const tiempo = esCur ? (r.dias - 0.5) / r.D : vm < cym ? 1 : 0;
      let estado;
      if (esCur) {
        const ratio = tiempo ? used / tiempo : 0;
        estado = over ? '<b class="bad">Presupuesto superado</b>' : ratio > 1.08 ? '<b class="bad">Por encima del ritmo</b>' : ratio < 0.92 ? '<b class="ok">Por debajo del ritmo</b>' : '<b>Al ritmo justo</b>';
      } else estado = over ? '<b class="bad">Superado</b>' : '<b class="ok">Dentro del presupuesto</b>';
      pace = `<div class="pace" aria-label="Ritmo de gasto">
        <div class="pace-head"><span>${pct(Math.min(used, 9.99))} del presupuesto</span>${estado}</div>
        <div class="pace-track"><i class="pace-fill" data-w="${(Math.min(used, 1) * 100).toFixed(1)}"></i>${esCur ? `<b class="pace-today" style="left:${(tiempo * 100).toFixed(1)}%" title="Hoy"></b>` : ''}</div>
        <div class="pace-ends"><span>1 ${mesCorto(vm)}</span><span>${r.D} ${mesCorto(vm)}</span></div>
      </div>`;
    }

    const tips = consejos(vm, r).map((t, i) => `
      <${t.act ? `button data-act="${t.act}"` : 'div'} class="tip glass ${t.t}" style="animation-delay:${200 + i * 80}ms">
        <span class="tip-ic">${icon(t.ic)}</span><p><small>${esc(t.k)}</small>${t.h}</p>
      </${t.act ? 'button' : 'div'}>`).join('');

    const third = esCur && r.proy !== null
      ? `<div class="stat glass"><span>Proyección</span><b>${eur0(r.proy)}</b></div>`
      : `<div class="stat glass"><span>Movimientos</span><b>${r.list.length}</b></div>`;

    // Fichas por categoría
    const cats = Object.entries(r.porCat).sort((a, b) => b[1] - a[1]);
    const tiles = cats.map(([id, c], i) => `
      <button class="tile glass${fcat === id ? ' on' : ''}" data-fcat="${id}" style="--h:${cat(id).h};animation-delay:${80 + i * 50}ms" aria-pressed="${fcat === id}">
        <span class="bubble">${icon(cat(id).ic)}</span><span class="pct">${pct(c / r.total)}</span>
        <span><b data-count="${c}">${eur(0)}</b><small>${cat(id).nombre}</small><span class="bar"><i data-w="${((c / cats[0][1]) * 100).toFixed(1)}"></i></span></span>
      </button>`).join('');

    // Movimientos (filtrables por categoría y por día)
    let list = r.list;
    if (fcat) list = list.filter((g) => g.cat === fcat);
    if (fdia) list = list.filter((g) => g.fecha === fdia);
    const byDay = [];
    for (const g of list) { const last = byDay[byDay.length - 1]; if (last && last.f === g.fecha) last.items.push(g); else byDay.push({ f: g.fecha, items: [g] }); }
    const rows = byDay.map((d, i) => `
      <div class="day" style="animation-delay:${Math.min(i, 6) * 60 + 120}ms">
        <div class="day-head"><span>${diaLabel(d.f)}</span><b>${eur(sum(d.items))}</b></div>
        <div class="rows glass">${d.items.map((g) => rowHtml(g)).join('')}</div>
      </div>`).join('');
    const filtroTxt = [fcat ? cat(fcat).nombre : '', fdia ? fechaCorta(fdia) : ''].filter(Boolean).join(' · ');

    const backupDue = S.gastos.length >= 15 && (!S.ultimoBackup || Date.now() - S.ultimoBackup > 30 * 864e5);
    const installHint = !isStandalone() && coarse;

    return `
      ${lampHtml()}
      ${headerInicio()}
      <section class="stage${over ? ' over' : ''}${slideDir ? ` slide-${slideDir}` : ''}" id="stage" aria-label="Resumen de ${fmtMes(vm)}">
        <div class="month-nav">
          <button data-mes="-1" aria-label="Mes anterior">${icon('left')}</button>
          <span aria-live="polite">${fmtMes(vm)}</span>
          <button data-mes="1" aria-label="Mes siguiente">${icon('right')}</button>
        </div>
        <button class="fig" ${r.hoyDisp ? 'data-act="hero" aria-label="Cambiar entre gastado y disponible hoy"' : 'tabindex="-1"'}>
          <span class="fig-label">${label}</span>
          <span class="fig-num" data-count="${num}" data-big>${eurBig(0)}</span>
        </button>
        <p class="fig-sub">${sub}</p>
        ${pill}
        ${!esCur ? `<div><button class="set-budget glass" data-hoy>${icon('cal')}Volver a ${mesNombre(cym)}</button></div>` : ''}
        ${pace}
      </section>
      ${tips ? `<div class="tips" aria-label="Copiloto">${tips}</div>` : ''}
      ${r.list.length ? `<div class="stats">
        <div class="stat glass"><span>Media diaria</span><b>${eur(Math.round(r.media))}</b></div>
        ${third}
        <div class="stat glass" title="${esCur ? 'Comparado con los mismos días del mes anterior' : ''}"><span>vs. ${mesCorto(r.prev)}</span><b>${r.delta === null ? '—' : deltaHtml(r.delta)}</b></div>
      </div>` : ''}
      ${installHint ? `<button class="notice glass" data-go="ajustes" data-scroll="acceso">${icon('phone')}<span><b>Instálala en tu pantalla de inicio</b><span>Así se abre a pantalla completa y al instante.</span></span></button>` : ''}
      ${backupDue ? `<button class="notice glass" data-act="backup">${icon('shield')}<span><b>Haz una copia de seguridad</b><span>Tus gastos solo están en este teléfono. Guárdala en iCloud, Drive o donde prefieras.</span></span></button>` : ''}
      ${r.list.length ? calHtml(r) : ''}
      ${cats.length ? `<section class="sec"><div class="sec-head"><h2>Por categoría</h2>${fcat ? '<button data-fcat="">Ver todas</button>' : `<span>${cats.length}</span>`}</div><div class="cat-grid">${tiles}</div></section>` : ''}
      <section class="sec" id="movs">
        <div class="sec-head"><h2>${filtroTxt ? esc(filtroTxt) : 'Movimientos'}</h2>${filtroTxt ? '<button data-limpiar>Quitar filtro</button>' : `<span>${list.length ? `${list.length} · ${eur(sum(list))}` : ''}</span>`}</div>
        ${rows || `<div class="empty"><div class="ic-big">${icon('sun')}</div><h3>${esCur ? 'Todo en calma' : 'Sin gastos'}</h3><p>${esCur ? 'Pulsa <b>+</b> o <b>tira de la lámpara</b> para apuntar tu primer gasto del mes. Tardas tres segundos.' : `No apuntaste gastos en ${mesNombre(vm)}.`}</p></div>`}
      </section>`;
  }

  function calHtml(r) {
    const off = (parseD(`${vm}-01`).getDay() + 6) % 7; // semana de lunes a domingo
    const porDia = {};
    for (const g of r.list) porDia[g.fecha] = (porDia[g.fecha] || 0) + g.cents;
    const max = Math.max(1, ...Object.values(porDia));
    const hoy = today();
    let cells = ['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => `<span class="cal-dow">${d}</span>`).join('');
    for (let i = 0; i < off; i++) cells += '<span class="cal-cell pad"></span>';
    for (let d = 1; d <= r.D; d++) {
      const f = `${vm}-${pad(d)}`, v = porDia[f] || 0;
      const i = v ? Math.sqrt(v / max) : 0; // raíz: que un alquiler no apague el resto
      const cls = [f > hoy ? 'fut' : '', f === hoy ? 'hoy' : '', fdia === f ? 'sel' : '', i > 0.6 ? 'hot' : ''].filter(Boolean).join(' ');
      cells += `<button class="cal-cell ${cls}" style="--i:${i.toFixed(3)};animation-delay:${(d * 12)}ms" data-dia="${f}" aria-label="${d}: ${v ? eur(v) : 'sin gastos'}">${d}</button>`;
    }
    return `<section class="sec"><div class="sec-head"><h2>Tu mes en luces</h2><span>${Object.keys(porDia).length} días con gasto</span></div>
      <div class="cal glass"><div class="cal-grid">${cells}</div>
        <div class="cal-foot"><span>${fdia ? `${diaLabel(fdia)} · ${eur(porDia[fdia] || 0)}` : 'Toca un día para ver sus gastos'}</span>
        <span class="cal-scale">menos <i style="--a:.08"></i><i style="--a:.3"></i><i style="--a:.5"></i><i style="--a:.75"></i> más</span></div>
      </div></section>`;
  }

  function rowHtml(g, swipe = true) {
    const c = cat(g.cat);
    return `<div class="row-wrap" data-id="${g.id}">${swipe ? `<div class="row-del">${icon('trash')}</div>` : ''}
      <button class="row${g.id === freshId ? ' fresh' : ''}" data-edit="${g.id}" style="--h:${c.h}">
        <span class="row-ic">${icon(c.ic)}</span>
        <span class="row-main"><b>${esc(g.concepto || c.nombre)}</b><small>${c.nombre}${g.fijoId ? '<span class="tag">FIJO</span>' : ''}${swipe ? '' : ` · ${fechaCorta(g.fecha)}`}</small></span>
        <span class="row-amt">−${eur(g.cents)}</span>
      </button></div>`;
  }

  function vAnalisis() {
    const cym = curYM();
    const fin = vm > cym ? vm : cym;
    const meses = [];
    for (let i = rango - 1; i >= 0; i--) meses.push(addM(fin, -i));
    const tot = meses.map((m) => sum(S.gastos.filter((g) => g.fecha.startsWith(m))));
    const conDatos = tot.filter((t) => t > 0);
    const media = conDatos.length ? conDatos.reduce((a, b) => a + b, 0) / conDatos.length : 0;
    const max = Math.max(...tot, S.presupuesto || 0, 1);
    const bars = meses.map((m, i) => `
      <button class="bar-col${m === vm ? ' on' : ''}" data-setmes="${m}" aria-label="${fmtMes(m)}: ${eur(tot[i])}">
        <span class="bt"><i class="b" data-h="${((tot[i] / max) * 100).toFixed(1)}" style="transition-delay:${i * 50}ms"><em>${eur0(tot[i])}</em></i></span>
        <span>${rango > 6 ? mesCorto(m).slice(0, 1) : mesCorto(m)}</span>
      </button>`).join('');

    const r = resumen(vm);
    const cats = Object.entries(r.porCat).sort((a, b) => b[1] - a[1]);
    const prevCat = {};
    for (const g of S.gastos) if (g.fecha.startsWith(r.prev) && Number(g.fecha.slice(8)) <= r.corte) prevCat[g.cat] = (prevCat[g.cat] || 0) + g.cents;
    const C = 2 * Math.PI * 80;
    let off = 0;
    const segs = cats.map(([id, c]) => {
      const len = (c / r.total) * C, gap = cats.length > 1 ? Math.min(4, len / 3) : 0;
      const s = `<circle cx="110" cy="110" r="80" stroke="${catHsl(id)}" stroke-dasharray="0 ${C.toFixed(2)}" data-len="${(len - gap).toFixed(2)}" data-c="${C.toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" stroke-linecap="${cats.length > 1 ? 'butt' : 'round'}"/>`;
      off += len;
      return s;
    }).join('');
    const legend = cats.map(([id, c]) => {
      const p = prevCat[id] || 0;
      const d = p ? (c - p) / p : null;
      return `<div class="legend-row" style="--h:${cat(id).h}"><span class="row-ic">${icon(cat(id).ic)}</span>
        <span class="nm"><b>${cat(id).nombre}</b><small>${pct(c / r.total)} del mes</small></span>
        <span class="am">${eur(c)}<small>${d !== null ? `${deltaHtml(d)} vs ${mesCorto(r.prev)}` : 'nuevo este mes'}</small></span></div>`;
    }).join('');

    const conc = new Map();
    for (const g of r.list) { const k = norm(g.concepto || cat(g.cat).nombre); const e = conc.get(k) || { label: g.concepto || cat(g.cat).nombre, cat: g.cat, n: 0, c: 0 }; e.n++; e.c += g.cents; conc.set(k, e); }
    const top = [...conc.values()].sort((a, b) => b.c - a.c).slice(0, 5);
    const porDia = {};
    for (const g of r.list) if (!g.fijoId) porDia[g.fecha] = (porDia[g.fecha] || 0) + g.cents; // sin fijos: el alquiler no cuenta como "día caro"
    const diaTop = Object.entries(porDia).sort((a, b) => b[1] - a[1])[0];
    const gMax = r.list.reduce((m, g) => (!m || g.cents > m.cents ? g : m), null);

    return `
      <header class="top"><p class="hello">Análisis<b>${fmtMes(vm)}</b></p>
        <div class="tools"><button class="icon-btn glass" data-go="buscar" aria-label="Buscar">${icon('search')}</button><button class="icon-btn glass" data-go="ajustes" aria-label="Ajustes">${icon('sliders')}</button></div></header>
      <h1 class="page-title">Dónde va <em>tu luz</em></h1>
      <div class="seg glass" role="tablist">
        <button class="${rango === 6 ? 'on' : ''}" data-rango="6">6 meses</button>
        <button class="${rango === 12 ? 'on' : ''}" data-rango="12">12 meses</button>
      </div>
      <section class="card glass sec" style="margin-top:12px">
        <div class="sec-head" style="margin:0 0 4px"><h2>Evolución</h2><span>media ${eur0(media)}</span></div>
        <div class="chart">${bars}
          ${media ? `<div class="avg-line" data-b="${(media / max).toFixed(4)}"><span>media</span></div>` : ''}
          ${S.presupuesto ? `<div class="avg-line budget-line" data-b="${(S.presupuesto / max).toFixed(4)}"><span>presupuesto</span></div>` : ''}
        </div>
      </section>
      ${r.list.length ? `
      ${vm < cym ? `<button class="btn ghost btn-wide" data-act="cierre">${icon('book')}Ver el cierre de ${mesNombre(vm)}</button>` : ''}
      <section class="card glass sec">
        <div class="sec-head" style="margin:0 0 8px"><h2>Reparto</h2><span>${r.list.length} movimientos</span></div>
        <div class="donut-wrap"><svg class="donut" viewBox="0 0 220 220"><circle cx="110" cy="110" r="80" stroke="rgba(255,255,255,.06)"/>${segs}</svg>
          <div class="donut-c"><b data-count="${r.total}">${eur(0)}</b><span>${cats.length} ${cats.length === 1 ? 'categoría' : 'categorías'}</span></div></div>
        ${legend}
      </section>
      <section class="sec insights">
        <div class="insight glass"><span>Día más caro</span><b>${diaTop ? eur0(diaTop[1]) : '—'}</b><small>${diaTop ? fechaCorta(diaTop[0]) : ''}</small></div>
        <div class="insight glass"><span>Gasto más alto</span><b>${gMax ? eur0(gMax.cents) : '—'}</b><small>${gMax ? esc(gMax.concepto || cat(gMax.cat).nombre) : ''}</small></div>
        <div class="insight glass"><span>Ticket medio</span><b>${eur(Math.round(r.total / r.list.length))}</b><small>por movimiento</small></div>
        <div class="insight glass"><span>Media diaria</span><b>${eur(Math.round(r.media))}</b><small>${r.dias} días contados</small></div>
      </section>
      <section class="sec">
        <div class="sec-head"><h2>En qué se va</h2></div>
        <div class="rows glass">${top.map((t) => `<div class="row" style="--h:${cat(t.cat).h}"><span class="row-ic">${icon(cat(t.cat).ic)}</span>
          <span class="row-main"><b>${esc(t.label)}</b><small>${t.n} ${t.n === 1 ? 'vez' : 'veces'}</small></span><span class="row-amt">${eur(t.c)}</span></div>`).join('')}</div>
      </section>` : `<div class="empty sec"><div class="ic-big">${icon('sun')}</div><h3>Sin datos en ${mesNombre(vm)}</h3><p>Toca una barra para ver otro mes.</p></div>`}`;
  }

  function vBuscar() {
    return `
      <header class="top"><button class="back" data-go="inicio">${icon('left')} Volver</button></header>
      <h1 class="page-title">Buscar</h1>
      <div class="search-bar"><div class="smart">${icon('search')}<input class="field" id="q" type="search" placeholder="Gasolina, Mercadona, cena…" value="${esc(busq.q)}" autocomplete="off" enterkeyhint="search"></div></div>
      <div class="seg glass" style="margin-bottom:16px">
        <button class="${busq.todo ? 'on' : ''}" data-alcance="todo">Todo</button>
        <button class="${busq.todo ? '' : 'on'}" data-alcance="mes">${cap(mesNombre(vm))}</button>
      </div>
      <div id="res"></div>`;
  }
  function pintarBusqueda() {
    const box = $('#res', app);
    if (!box) return;
    const q = norm(busq.q);
    if (!q) {
      const top = [...historialConceptos().values()].sort((a, b) => b.n - a.n).slice(0, 10);
      box.innerHTML = top.length
        ? `<p class="help" style="padding:0 4px 4px">Lo que más apuntas:</p><div class="chips" style="flex-wrap:wrap;overflow:visible">${top.map((e) => `<button class="chip sugg" data-q="${esc(e.label)}" style="--h:${cat(e.cat).h}"><i></i>${esc(e.label)}</button>`).join('')}</div>`
        : '<div class="empty"><p>Cuando apuntes gastos podrás buscarlos aquí.</p></div>';
      return;
    }
    const tokens = q.split(/\s+/);
    const res = S.gastos.filter((g) => (busq.todo || g.fecha.startsWith(vm)) && tokens.every((t) => norm(`${g.concepto} ${cat(g.cat).nombre}`).includes(t)))
      .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.creado - a.creado);
    if (!res.length) { box.innerHTML = '<div class="empty"><h3>Nada por aquí</h3><p>Prueba con otra palabra.</p></div>'; return; }
    const total = sum(res);
    const porMes = [];
    for (const g of res) { const m = ymOf(g.fecha); const last = porMes[porMes.length - 1]; if (last && last.m === m) last.items.push(g); else porMes.push({ m, items: [g] }); }
    box.innerHTML = `<div class="search-sum glass"><div><span>${res.length} ${res.length === 1 ? 'gasto' : 'gastos'}${porMes.length > 1 ? ` en ${porMes.length} meses` : ''}</span><b>${eur(total)}</b></div>
        <span>${porMes.length > 1 ? `${eur0(total / porMes.length)}/mes` : `media ${eur(Math.round(total / res.length))}`}</span></div>
      ${porMes.slice(0, 24).map((p) => `<div class="day"><div class="day-head"><span>${fmtMes(p.m)}</span><b>${eur(sum(p.items))}</b></div>
        <div class="rows glass">${p.items.map((g) => rowHtml(g, false)).join('')}</div></div>`).join('')}`;
  }

  function vAjustes() {
    const fijos = S.fijos.filter((f) => f.activo);
    const url = `${location.origin}${location.pathname}`;
    const ios = isIOS();
    return `
      <header class="top"><button class="back" data-go="inicio">${icon('left')} Volver</button></header>
      <h1 class="page-title">Ajustes</h1>
      <div class="group glass">
        <label class="item"><span class="grow"><b>Tu nombre</b><small>Para el saludo</small></span><input class="inline" id="in-nombre" value="${esc(S.nombre)}" placeholder="Opcional" maxlength="24" autocomplete="off"></label>
        <button class="item" data-act="presupuesto"><span class="grow"><b>Presupuesto mensual</b><small>Da luz a la lámpara y calcula cuánto puedes gastar cada día</small></span><span class="val">${S.presupuesto ? eur0(S.presupuesto) : 'Sin fijar'}</span>${icon('right', 'chev')}</button>
      </div>

      <div class="sec"><div class="sec-head"><h2>Apariencia</h2></div>
        <div class="group glass"><div class="themes">
          ${[['ambar', 'Ámbar', '#241309', '#ff8a3d'], ['noche', 'Noche', '#0c0c0c', '#f4efe6'], ['salvia', 'Salvia', '#13231a', '#b7d99c']].map(([id, n, bg, c]) => `
            <button class="theme${S.tema === id ? ' on' : ''}" data-tema="${id}" aria-pressed="${S.tema === id}"><div class="sw" style="background:${bg};--c:${c}"></div>${n}</button>`).join('')}
        </div>
        <button class="item" data-act="discreto" role="switch" aria-checked="${S.discreto}">${icon(S.discreto ? 'eyeoff' : 'eye')}<span class="grow"><b>Modo discreto</b><small>Difumina las cifras. Útil si enseñas el móvil.</small></span><span class="switch${S.discreto ? ' on' : ''}"><i></i></span></button>
        </div></div>

      <div class="sec"><div class="sec-head"><h2>Gastos fijos</h2><span>${fijos.length ? `${eur(fijos.reduce((a, f) => a + f.cents, 0))}/mes` : ''}</span></div>
        <div class="group glass">
          ${fijos.length ? fijos.map((f) => `<div class="item" style="--h:${cat(f.cat).h}"><span class="row-ic">${icon(cat(f.cat).ic)}</span>
              <span class="grow"><b>${esc(f.concepto || cat(f.cat).nombre)}</b><small>${eur(f.cents)} · día ${f.dia} de cada mes</small></span>
              <button class="icon-btn" data-fijo-edit="${f.id}" aria-label="Cambiar importe">${icon('pencil')}</button>
              <button class="icon-btn" data-fijo-stop="${f.id}" aria-label="Dejar de repetir">${icon('trash')}</button></div>`).join('')
            : '<div class="help">Al apuntar un gasto, activa <b>Fijo mensual</b> (alquiler, gimnasio, suscripciones…) y se registrará solo cada mes en la misma fecha. Lumen lo reserva de tu presupuesto antes de que llegue.</div>'}
        </div></div>

      <div class="sec" id="acceso"><div class="sec-head"><h2>Acceso rápido</h2></div>
        <div class="group glass">
          <button class="item" data-act="toggle-directo" role="switch" aria-checked="${S.abrirDirecto}">${icon('bolt')}<span class="grow"><b>Abrir directo en registro</b><small>Al tocar el icono de Lumen aparece el teclado para apuntar.</small></span><span class="switch${S.abrirDirecto ? ' on' : ''}"><i></i></span></button>
          ${installEvt ? `<button class="item" data-act="instalar">${icon('down')}<span class="grow"><b>Instalar Lumen</b><small>Añádela a la pantalla de inicio</small></span>${icon('right', 'chev')}</button>` : ''}
          <div class="help">${ios ? `
            <b>iPhone</b> — pon Lumen en el <b>Dock</b> y activa <b>Abrir directo en registro</b>: un toque y estás apuntando.
            <br><br><b>Sobre el toque trasero:</b> en iPhone un atajo solo puede abrir el enlace en <b>Safari</b>, y Safari guarda los datos aparte de la app instalada. Por eso no lo recomiendo para apuntar gastos.` : `
            <b>Android · toque trasero y accesos</b>
            <ol><li>Mantén pulsado el icono de Lumen: verás <b>Nuevo gasto</b>. Arrástralo a la pantalla de inicio.</li>
            <li><b>Pixel:</b> Ajustes → Sistema → Gestos → <b>Quick Tap</b> → Abrir app → Lumen.</li>
            <li><b>Samsung:</b> app Good Lock → <b>RegiStar</b> → Back-Tap action → Abrir app → Lumen.</li></ol>`}
            <div class="code"><span style="flex:1">${esc(url)}?nuevo</span><button data-act="copiar">Copiar</button></div>
          </div>
          <a class="item" href="?nuevo">${icon('plus')}<span class="grow"><b>Probar el registro rápido</b><small>Abre el teclado como lo haría el acceso directo</small></span>${icon('right', 'chev')}</a>
        </div></div>

      <div class="sec"><div class="sec-head"><h2>Tus datos</h2><span id="persist-st"></span></div>
        <div class="group glass">
          <button class="item" data-act="backup">${icon('shield')}<span class="grow"><b>Copia de seguridad</b><small>${S.ultimoBackup ? `Última: ${new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(S.ultimoBackup)}` : 'Nunca. Recomendable una vez al mes.'}</small></span>${icon('right', 'chev')}</button>
          <button class="item" data-act="restaurar">${icon('up')}<span class="grow"><b>Restaurar copia</b><small>Desde un archivo .json de Lumen</small></span>${icon('right', 'chev')}</button>
          <button class="item" data-act="csv">${icon('down')}<span class="grow"><b>Exportar a Excel</b><small>Archivo CSV con todos los gastos</small></span>${icon('right', 'chev')}</button>
        </div></div>

      <div class="sec"><div class="group glass">
        <button class="item danger" data-act="borrar-todo">${icon('trash')}<span class="grow"><b>Borrar todos los datos</b><small>Pide confirmación escrita</small></span></button>
      </div></div>

      <p class="foot"><span class="serif">Lumen</span>Versión ${VERSION} · ${S.gastos.length} gastos guardados<br>Tus datos viven solo en este teléfono. Nadie más los ve.</p>`;
  }

  /* ----------------------------------------------------------------- render */
  function render() {
    root.classList.toggle('discreto', !!S.discreto);
    app.innerHTML = view === 'analisis' ? vAnalisis() : view === 'ajustes' ? vAjustes() : view === 'buscar' ? vBuscar() : vInicio();
    $$('.dock-btn').forEach((b) => b.classList.toggle('on', b.dataset.go === view));
    afterRender();
  }
  function afterRender() {
    if (view === 'inicio' || view === 'analisis') setLux(vm);
    if (view === 'inicio') {
      requestAnimationFrame(() => {
        $$('.tile .bar i, .pace-fill', app).forEach((i) => { i.style.width = `${i.dataset.w}%`; });
      });
      setTimeout(() => $$('.tile .bar i, .pace-fill', app).forEach((i) => { i.style.width = `${i.dataset.w}%`; }), 400);
      bindSwipes();
      bindStageSwipe();
      bindLamp();
      if (freshId) setTimeout(() => { freshId = null; }, 0);
    }
    if (view === 'analisis') {
      const pintar = () => {
        $$('.bar-col .b', app).forEach((b) => { b.style.height = `${b.dataset.h}%`; });
        const ch = $('.chart', app), bt = $('.bar-col .bt', app);
        if (ch && bt) {
          const c = ch.getBoundingClientRect(), r = bt.getBoundingClientRect();
          $$('.avg-line', app).forEach((l) => { l.style.bottom = `${c.bottom - r.bottom + r.height * Number(l.dataset.b)}px`; });
        }
        $$('.donut circle[data-len]', app).forEach((c) => { c.setAttribute('stroke-dasharray', `${c.dataset.len} ${c.dataset.c}`); });
      };
      requestAnimationFrame(() => requestAnimationFrame(pintar));
      setTimeout(pintar, 400);
    }
    if (view === 'buscar') {
      pintarBusqueda();
      const q = $('#q', app);
      q.addEventListener('input', () => { busq.q = q.value; pintarBusqueda(); });
      if (!coarse || !busq.q) setTimeout(() => q.focus(), 250);
    }
    if (view === 'ajustes') {
      const st = $('#persist-st', app);
      if (st && navigator.storage && navigator.storage.persisted) navigator.storage.persisted().then((p) => { st.textContent = p ? 'Almacenamiento protegido' : ''; }).catch(() => {});
    }
    animateCounts(app);
    slideDir = '';
  }
  function go(v, scrollTo) {
    if (v === view && !scrollTo) { render(); window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    view = v;
    render();
    app.classList.remove('view-enter'); void app.offsetWidth; app.classList.add('view-enter');
    if (scrollTo) setTimeout(() => { const el = document.getElementById(scrollTo); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
    else window.scrollTo(0, 0);
  }
  function setMes(ym, dir) {
    if (ym === vm) return;
    slideDir = dir || (ym > vm ? 'l' : 'r');
    vm = ym; fcat = null; fdia = null;
    haptic(6);
    render();
    swing(dir === 'r' ? -9 : 9);
  }

  /* --------------------------------------------------------------- gestos */
  function bindSwipes() {
    $$('.row-wrap', app).forEach((w) => {
      const row = $('.row', w);
      if (!$('.row-del', w)) return;
      let x0 = 0, y0 = 0, dx = 0, lock = null, active = false;
      row.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        x0 = e.clientX; y0 = e.clientY; dx = 0; lock = null; active = true;
        row.style.transition = 'none';
      });
      row.addEventListener('pointermove', (e) => {
        if (!active) return;
        const mx = e.clientX - x0, my = e.clientY - y0;
        if (lock === null && (Math.abs(mx) > 8 || Math.abs(my) > 8)) {
          lock = Math.abs(mx) > Math.abs(my) ? 'x' : 'y';
          if (lock === 'x') try { row.setPointerCapture(e.pointerId); } catch (_) { /* nada */ }
        }
        if (lock === 'x') {
          dx = Math.min(0, mx);
          row.style.transform = `translateX(${dx}px)`;
          const armed = dx < -row.offsetWidth * 0.33;
          if (armed !== w.classList.contains('arm')) { w.classList.toggle('arm', armed); if (armed) haptic(10); }
        }
      });
      const end = () => {
        if (!active) return;
        active = false;
        row.style.transition = '';
        if (lock !== 'x') return;
        row.dataset.swiped = '1';
        setTimeout(() => { delete row.dataset.swiped; }, 60);
        if (dx < -row.offsetWidth * 0.33) {
          row.style.transform = 'translateX(-110%)';
          w.style.height = `${w.offsetHeight}px`;
          w.classList.add('gone');
          setTimeout(() => eliminar(w.dataset.id), 380);
        } else { row.style.transform = ''; w.classList.remove('arm'); }
      };
      row.addEventListener('pointerup', end);
      row.addEventListener('pointercancel', end);
    });
  }
  function bindStageSwipe() {
    const h = $('#stage', app);
    if (!h) return;
    let x0 = null, y0 = 0;
    h.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    h.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) setMes(addM(vm, dx < 0 ? 1 : -1), dx < 0 ? 'l' : 'r');
    }, { passive: true });
  }
  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY, d = y - lastY;
    lastY = y;
    if (view === 'inicio' && y < 500 && Math.abs(d) > 2) swing(clamp(d * 0.35, -6, 6));
  }, { passive: true });

  /* ---------------------------------------------------------- acciones */
  function eliminar(id) {
    let g = null;
    const res = commit(() => { g = borrarGasto(id); });
    if (!res || !g) return render();
    haptic(12);
    render();
    toast(`Borrado: ${esc(g.concepto || cat(g.cat).nombre)} · ${eur(g.cents)}`, { ic: 'trash', action: 'Deshacer', onAction: () => undo(res.snap), ms: 6000 });
  }
  async function pedirPresupuesto() {
    const v = await dialog({
      title: 'Presupuesto mensual',
      text: 'Lo que quieres gastar como máximo cada mes, fijos incluidos. Déjalo vacío para quitarlo.',
      input: { mode: 'decimal', placeholder: 'Ej. 1.200', value: S.presupuesto ? centsToStr(S.presupuesto) : '' },
      ok: 'Guardar',
    });
    if (v === null) return;
    const c = v.trim() ? parseImporte(v) : null;
    if (v.trim() && (!c || c > MAX_CENTS)) return toast('Ese importe no es válido.', { error: true });
    if (commit(() => { S.presupuesto = c; })) { render(); flashLamp(); toast(c ? `Presupuesto: ${eur0(c)} al mes` : 'Presupuesto quitado'); }
  }
  async function entregarArchivo(nombre, contenido, tipo) {
    const blob = new Blob([contenido], { type: tipo });
    if (coarse && navigator.canShare) {
      try {
        const file = new File([blob], nombre, { type: tipo });
        if (navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: nombre }); return true; }
      } catch (e) { if (e && e.name === 'AbortError') return false; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = nombre;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return true;
  }
  async function backup() {
    const ok = await entregarArchivo(`lumen-copia-${today()}.json`, JSON.stringify({ app: 'lumen', exportado: new Date().toISOString(), ...S }, null, 1), 'application/json');
    if (ok && commit(() => { S.ultimoBackup = Date.now(); })) { render(); toast('Copia de seguridad creada'); }
  }
  function csv() {
    const q = (s) => `"${String(s).replace(/"/g, '""')}"`;
    const lines = ['Fecha;Concepto;Categoría;Importe (€);Fijo'];
    [...S.gastos].sort((a, b) => a.fecha.localeCompare(b.fecha)).forEach((g) => {
      lines.push([g.fecha, q(g.concepto), q(cat(g.cat).nombre), (g.cents / 100).toFixed(2).replace('.', ','), g.fijoId ? 'sí' : ''].join(';'));
    });
    entregarArchivo(`lumen-gastos-${today()}.csv`, `﻿${lines.join('\r\n')}`, 'text/csv');
  }
  async function restaurar(file) {
    let data;
    try { data = JSON.parse(await file.text()); } catch (_) { return toast('Ese archivo no es una copia de Lumen.', { error: true }); }
    if (!data || !Array.isArray(data.gastos)) return toast('Ese archivo no es una copia de Lumen.', { error: true });
    const nuevo = normalizar(data);
    const ok = await dialog({
      title: 'Restaurar copia',
      text: `La copia tiene <b>${nuevo.gastos.length}</b> gastos. Sustituirá a los <b>${S.gastos.length}</b> que hay ahora en el teléfono.`,
      ok: 'Restaurar', danger: true,
    });
    if (!ok) return;
    try { localStorage.setItem(`${KEY}.antes-de-restaurar`, JSON.stringify(S)); } catch (_) { /* sin espacio */ }
    const res = commit(() => { S = nuevo; aplicarFijos(); });
    if (res) { root.dataset.theme = S.tema; vm = curYM(); go('inicio'); toast('Copia restaurada', { action: 'Deshacer', onAction: () => undo(res.snap), ms: 7000 }); }
  }
  async function borrarTodo() {
    const v = await dialog({ title: '¿Borrar todo?', text: `Se eliminarán ${S.gastos.length} gastos y los fijos. Escribe <b>BORRAR</b> para confirmar.`, input: { placeholder: 'BORRAR' }, ok: 'Borrar', danger: true });
    if (v === null) return;
    if (v.trim().toUpperCase() !== 'BORRAR') return toast('No se ha borrado nada.', { ic: 'info' });
    try { localStorage.setItem(`${KEY}.borrado`, JSON.stringify(S)); } catch (_) { /* sin espacio */ }
    const res = commit(() => { const keep = { tema: S.tema, nombre: S.nombre, bienvenida: true }; S = Object.assign(DEFAULT(), keep); });
    if (res) { go('inicio'); toast('Datos borrados', { ic: 'trash', action: 'Deshacer', onAction: () => undo(res.snap), ms: 8000 }); }
  }
  async function fijoEdit(id) {
    const f = S.fijos.find((x) => x.id === id);
    if (!f) return;
    const v = await dialog({ title: f.concepto || cat(f.cat).nombre, text: 'Nuevo importe mensual. Se aplicará desde el próximo cargo; lo ya apuntado no cambia.', input: { mode: 'decimal', value: centsToStr(f.cents) }, ok: 'Guardar' });
    if (v === null) return;
    const c = parseImporte(v);
    if (!c || c > MAX_CENTS) return toast('Ese importe no es válido.', { error: true });
    if (commit(() => { f.cents = c; })) { render(); toast(`Fijo actualizado: ${eur(c)}`); }
  }
  async function fijoStop(id) {
    const f = S.fijos.find((x) => x.id === id);
    if (!f) return;
    const ok = await dialog({ title: 'Dejar de repetir', text: `«${esc(f.concepto || cat(f.cat).nombre)}» no se apuntará más. Los meses ya registrados se quedan como están.`, ok: 'Dejar de repetir', danger: true });
    if (!ok) return;
    const res = commit(() => { f.activo = false; f.hasta = curYM(); });
    if (res) { render(); toast('Fijo detenido', { action: 'Deshacer', onAction: () => undo(res.snap) }); }
  }

  /* ------------------------------------------- pantallas: bienvenida y cierre */
  function abrirOverlay(html, cls = '') {
    const el = document.createElement('div');
    el.className = `overlay ${cls}`;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.innerHTML = `<div class="ambient" aria-hidden="true"><div class="glow"></div><div class="blob b1"></div><div class="grain"></div></div>${html}`;
    document.body.appendChild(el);
    document.body.classList.add('overlay-open');
    void el.offsetWidth; el.classList.add('open');
    return el;
  }
  function cerrarOverlay(el) {
    el.classList.remove('open');
    document.body.classList.remove('overlay-open');
    setTimeout(() => el.remove(), 500);
  }
  function bienvenida() {
    const el = abrirOverlay(`
      <div class="ov-lamp">${lampHtml('lamp-ov')}</div>
      <h1>Tu dinero,<br><em>a la luz.</em></h1>
      <p class="lead">Apunta cada gasto en tres segundos. La lámpara te enseña cuánto te queda: cuanto más gastas, menos luz.</p>
      <div class="ov-form">
        <label for="ov-nombre">¿Cómo te llamas?</label>
        <input class="field" id="ov-nombre" maxlength="24" autocomplete="given-name" placeholder="Tu nombre">
        <label for="ov-pres">Presupuesto al mes · opcional</label>
        <input class="field" id="ov-pres" inputmode="decimal" placeholder="Ej. 1.200 €" autocomplete="off">
      </div>
      <div class="ov-actions">
        <button class="btn primary" data-ov="encender">${icon('sun')}Encender Lumen</button>
        <button class="link-btn" data-ov="saltar">Ahora no</button>
      </div>`, 'off');
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-ov]');
      if (!b) return;
      const nombre = $('#ov-nombre', el).value.trim().slice(0, 24);
      const presTxt = $('#ov-pres', el).value.trim();
      const pres = presTxt ? parseImporte(presTxt) : null;
      if (b.dataset.ov === 'encender' && presTxt && (!pres || pres > MAX_CENTS)) return toast('Ese presupuesto no es válido.', { error: true });
      commit(() => {
        S.bienvenida = true;
        if (b.dataset.ov === 'encender') { S.nombre = nombre; if (pres) S.presupuesto = pres; }
      });
      if (b.dataset.ov === 'encender') {
        haptic(20);
        el.classList.remove('off');
        const l = $('#lamp-ov', el); l.classList.add('flash');
        setTimeout(() => { cerrarOverlay(el); render(); }, 1300);
      } else { cerrarOverlay(el); render(); }
    });
  }
  function cierre(ym, auto = false) {
    const r = resumen(ym);
    if (!r.list.length) return;
    const pres = S.presupuesto;
    const cats = Object.entries(r.porCat).sort((a, b) => b[1] - a[1]);
    const porDia = {};
    for (const g of r.list) if (!g.fijoId) porDia[g.fecha] = (porDia[g.fecha] || 0) + g.cents; // sin fijos: el alquiler no cuenta como "día caro"
    const diaTop = Object.entries(porDia).sort((a, b) => b[1] - a[1])[0];
    const prevT = sum(gastosMes(r.prev));
    let veredicto;
    if (pres) veredicto = r.total <= pres ? `Cerraste <b>${eur0(pres - r.total)} por debajo</b> de tu presupuesto. Buen mes.` : `Te pasaste <b>${eur0(r.total - pres)}</b> de tu presupuesto. El mes que viene, más luz.`;
    else if (prevT) veredicto = `Un <b>${Math.abs(Math.round((r.total / prevT - 1) * 100))} % ${r.total > prevT ? 'más' : 'menos'}</b> que en ${mesNombre(r.prev)}.`;
    else veredicto = 'Tu primer mes completo con Lumen.';
    const el = abrirOverlay(`
      <div class="story glass">
        <span class="kicker">Cierre de mes</span>
        <h2>${cap(mesNombre(ym))}</h2>
        <span class="big">${eur(r.total)}</span>
        <p class="verdict">${veredicto}</p>
        <ul>
          <li><span>Movimientos</span><b>${r.list.length}</b></li>
          <li><span>Media diaria</span><b>${eur(Math.round(r.total / r.D))}</b></li>
          <li><span>Donde más</span><b>${cat(cats[0][0]).nombre} · ${eur0(cats[0][1])}</b></li>
          ${diaTop ? `<li><span>Día más caro</span><b>${fechaCorta(diaTop[0])} · ${eur0(diaTop[1])}</b></li>` : ''}
          ${prevT ? `<li><span>Frente a ${mesNombre(r.prev)}</span><b>${deltaHtml((r.total - prevT) / prevT)}</b></li>` : ''}
        </ul>
      </div>
      <div class="ov-actions">
        ${navigator.share ? `<button class="btn ghost" data-ov="compartir">${icon('share')}Compartir resumen</button>` : ''}
        <button class="btn primary" data-ov="cerrar">${auto ? `Empezar ${mesNombre(curYM())}` : 'Cerrar'}</button>
      </div>`);
    el.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-ov]');
      if (!b) return;
      if (b.dataset.ov === 'compartir') {
        try { await navigator.share({ title: `Lumen · ${fmtMes(ym)}`, text: `${fmtMes(ym)}: ${eur(r.total)} en ${r.list.length} gastos. Donde más: ${cat(cats[0][0]).nombre}.` }); } catch (_) { /* cancelado */ }
        return;
      }
      if (auto) commit(() => { S.cierreVisto = ym; });
      cerrarOverlay(el);
    });
  }

  /* ---------------------------------------------------- hoja de registro */
  let sheetState = null;
  function fechaPorDefecto() {
    const cym = curYM();
    if (vm >= cym) return today();
    return `${vm}-${pad(dim(vm))}`;
  }
  function openSheet(g = null) {
    if (sheetState || $('.overlay')) return;
    const box = $('#sheet-root');
    const st = sheetState = {
      id: g ? g.id : null,
      amt: g ? centsToStr(g.cents) : '',
      amtDeTexto: false,
      cat: g ? g.cat : (CAT[S.ultimaCat] ? S.ultimaCat : 'super'),
      tocadoCat: !!g,
      texto: g ? g.concepto : '',
      fecha: g ? g.fecha : fechaPorDefecto(),
      fijo: false,
      esFijo: !!(g && g.fijoId),
    };
    box.innerHTML = `<div class="sheet-host"><div class="scrim" data-close></div>
      <div class="sheet" role="dialog" aria-modal="true" aria-label="${g ? 'Editar gasto' : 'Nuevo gasto'}">
        <div class="grab"><div class="sheet-top"><h3>${g ? 'Editar gasto' : 'Nuevo gasto'}</h3>
          <button class="icon-btn" data-close aria-label="Cerrar">${icon('close')}</button></div></div>
        <div class="sheet-body">
          <div class="amount"><div class="amount-val" id="amt" aria-live="polite"></div><div class="amount-hint" id="amt-hint"></div></div>
          <div class="smart">${icon('spark')}<input class="field" id="concepto" type="text" placeholder="Concepto · o escribe «café 1,80»" maxlength="60" autocomplete="off" enterkeyhint="done" value="${esc(st.texto)}"></div>
          <div class="smart-hint" id="smart-hint"></div>
          <div class="chips" id="sugg" aria-label="Sugerencias"></div>
          <div class="cat-pick" id="cats" role="radiogroup" aria-label="Categoría">${CATS.map((c) => `
            <button class="cp" data-cat="${c.id}" style="--h:${c.h}" role="radio"><span class="dot">${icon(c.ic)}</span><span>${c.nombre}</span></button>`).join('')}</div>
          <div class="opts">
            <button class="chip" data-fecha="hoy">Hoy</button>
            <button class="chip" data-fecha="ayer">Ayer</button>
            <span class="chip date-chip" id="fecha-otra">${icon('cal')}<span id="fecha-lbl"></span><input type="date" id="fecha-in" aria-label="Elegir fecha"></span>
            ${g ? '' : '<button class="switch" id="fijo" role="switch" aria-checked="false"><i></i>Fijo</button>'}
          </div>
          <div class="fijo-hint" id="fijo-hint">${st.esFijo ? 'Gasto fijo: cambiarlo aquí solo afecta a este mes.' : ''}</div>
        </div>
        <div class="keypad" role="group" aria-label="Teclado numérico">
          ${['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'del'].map((k) => `<button class="key" data-k="${k}" aria-label="${k === 'del' ? 'Borrar' : k}">${k === 'del' ? icon('del') : k}</button>`).join('')}
        </div>
        <div class="sheet-actions">
          ${g ? `<button class="btn danger" data-act="sheet-del" aria-label="Eliminar gasto">${icon('trash')}</button>` : ''}
          <button class="btn primary" data-act="guardar">${icon('check')}${g ? 'Guardar cambios' : 'Guardar gasto'}</button>
        </div>
      </div></div>`;
    const host = $('.sheet-host', box);
    document.body.classList.add('sheet-open');
    void host.offsetWidth; host.classList.add('open'); // reflujo forzado: la transición arranca sin esperar a un fotograma
    pintarHoja();
    const inp = $('#concepto', host);
    inp.addEventListener('input', () => { st.texto = inp.value; interpretarTexto(); pintarHoja(); });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); inp.blur(); } });
    $('#fecha-in', host).addEventListener('change', (e) => { if (e.target.value) { st.fecha = e.target.value; pintarHoja(); } });
    bindSheetDrag(host);
  }
  function interpretarTexto() {
    const st = sheetState;
    const r = interpretar(st.texto);
    if (r.cents && (!st.amt || st.amtDeTexto)) { st.amt = centsToStr(r.cents); st.amtDeTexto = true; }
    else if (!r.cents && st.amtDeTexto) { st.amt = ''; st.amtDeTexto = false; }
    if (r.cat && !st.tocadoCat) st.cat = r.cat;
    st.detectado = (r.cents && st.amtDeTexto) || (r.cat && !st.tocadoCat) ? r : null;
  }
  function closeSheet() {
    const host = $('#sheet-root .sheet-host');
    if (!host) return;
    host.classList.remove('open');
    document.body.classList.remove('sheet-open');
    sheetState = null;
    setTimeout(() => { host.remove(); }, 420);
  }
  const amtCents = (st) => (st.amt ? parseImporte(st.amt) : 0);
  function pintarHoja() {
    const st = sheetState;
    if (!st) return;
    const host = $('#sheet-root .sheet-host');
    const [i, d] = st.amt.split(',');
    const ent = (i || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    $('#amt', host).innerHTML = st.amt
      ? `${ent}${d !== undefined ? `,${d}` : ''}<span class="caret"></span><span class="cur">€</span>`
      : '<span class="ph">0</span><span class="caret"></span><span class="cur">€</span>';
    const c = amtCents(st);
    let hint = '';
    if (c && S.presupuesto && !st.id) {
      const r = resumen(ymOf(st.fecha));
      if (r.hoyDisp && st.fecha === today()) {
        const q = r.hoyDisp.queda - c;
        hint = q >= 0 ? `Después te quedarán ${eur(q)} para hoy` : `<span class="neg">Hoy te pasarás ${eur(-q)} de lo previsto</span>`;
      } else {
        const rest = S.presupuesto - r.total - c;
        hint = rest >= 0 ? `Te quedarán ${eur(rest)} este mes` : `<span class="neg">Te pasarás ${eur(-rest)} del presupuesto</span>`;
      }
    }
    $('#amt-hint', host).innerHTML = hint;
    $('#smart-hint', host).innerHTML = st.detectado
      ? `✦ Entendido: ${[st.amtDeTexto ? eur(c) : '', st.detectado.concepto ? `«${esc(st.detectado.concepto)}»` : '', !st.tocadoCat ? cat(st.cat).nombre : ''].filter(Boolean).join(' · ')}`
      : '';
    $$('#cats .cp', host).forEach((b) => { const on = b.dataset.cat === st.cat; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    const t = today(), y = yesterday();
    $('[data-fecha="hoy"]', host).classList.toggle('on', st.fecha === t);
    $('[data-fecha="ayer"]', host).classList.toggle('on', st.fecha === y);
    const otra = st.fecha !== t && st.fecha !== y;
    $('#fecha-otra', host).classList.toggle('on', otra);
    $('#fecha-lbl', host).textContent = otra ? fechaCorta(st.fecha) : 'Otro día';
    $('#fecha-in', host).value = st.fecha;
    $('#fecha-in', host).max = t;
    const fj = $('#fijo', host);
    if (fj) {
      fj.classList.toggle('on', st.fijo); fj.setAttribute('aria-checked', st.fijo);
      $('#fijo-hint', host).textContent = st.fijo ? `Se apuntará solo el día ${Number(st.fecha.slice(8))} de cada mes y se reservará de tu presupuesto.` : '';
    }
    pintarSugerencias();
  }
  function pintarSugerencias() {
    const st = sheetState;
    if (!st) return;
    const box = $('#sugg');
    const q = st.amtDeTexto ? interpretar(st.texto).concepto : st.texto;
    const s = sugerencias(q, st.tocadoCat ? st.cat : null);
    box.innerHTML = s.map((e, i) => `<button class="chip sugg" data-sugg="${i}" style="--h:${cat(e.cat).h}"><i></i>${esc(e.label)} <em>${eur(e.cents)}</em></button>`).join('');
    box.style.display = s.length ? '' : 'none';
    box._s = s;
  }
  function tecla(k) {
    const st = sheetState;
    if (!st) return;
    let a = st.amt;
    const el = $('#amt');
    const nope = () => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); haptic(20); };
    if (k === 'del') a = a.slice(0, -1);
    else if (k === ',') { if (a.includes(',')) return nope(); a = `${a || '0'},`; }
    else {
      const [i, d] = a.split(',');
      if (d !== undefined) { if (d.length >= 2) return nope(); a += k; }
      else if (i === '0') a = k;
      else if (i.length >= 6) return nope();
      else a += k;
    }
    st.amt = a;
    st.amtDeTexto = false;
    haptic(5);
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    pintarHoja();
  }
  function guardar() {
    const st = sheetState;
    if (!st) return;
    const cents = amtCents(st);
    if (!cents || cents <= 0) {
      const el = $('#amt'); el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); haptic(30);
      return toast('Escribe un importe', { error: true, ms: 2200 });
    }
    if (cents > MAX_CENTS) return toast('Importe demasiado alto', { error: true });
    if (!/^\d{4}-\d{2}-\d{2}$/.test(st.fecha)) return toast('Fecha no válida', { error: true });
    const concepto = (st.amtDeTexto ? interpretar(st.texto).concepto : st.texto.trim()).slice(0, 60);
    let g, extra = 0;
    const res = commit(() => {
      if (st.id) {
        g = S.gastos.find((x) => x.id === st.id);
        if (!g) return;
        Object.assign(g, { cents, cat: st.cat, concepto, fecha: st.fecha });
      } else {
        g = { id: uid(), cents, cat: st.cat, concepto, fecha: st.fecha, creado: Date.now() };
        if (st.fijo) {
          const f = { id: uid(), cents, cat: st.cat, concepto, dia: Number(st.fecha.slice(8)), desde: ymOf(st.fecha), activo: true, omitidos: [] };
          S.fijos.push(f);
          g.fijoId = f.id;
        }
        S.gastos.push(g);
        if (st.fijo) extra = aplicarFijos();
      }
      S.ultimaCat = st.cat;
    });
    if (!res || !g) return;
    const btn = $('[data-act="guardar"]').getBoundingClientRect();
    closeSheet();
    haptic(st.id ? 10 : 18);
    freshId = g.id;
    if (!st.id) {
      // Un gasto nuevo se ve en Inicio: la lámpara reacciona y la fila brilla.
      burst(btn.left + btn.width / 2, btn.top + btn.height / 2);
      view = 'inicio';
      const m = ymOf(g.fecha);
      if (m !== vm) { slideDir = m > vm ? 'l' : 'r'; vm = m; }
      fcat = null; fdia = null;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    render();
    if (!st.id) { setTimeout(() => { flashLamp(); swing(16); }, 250); }
    const msg = st.id ? 'Cambios guardados' : `${eur(cents)} en ${cat(st.cat).nombre}${extra ? ` · y ${extra} ${extra === 1 ? 'mes' : 'meses'} más como fijo` : ''}`;
    toast(msg, { action: 'Deshacer', onAction: () => undo(res.snap), ms: 5000 });
  }
  function bindSheetDrag(host) {
    const sheet = $('.sheet', host), grab = $('.grab', host);
    let y0 = null, dy = 0;
    grab.addEventListener('pointerdown', (e) => { if (e.target.closest('button')) return; y0 = e.clientY; dy = 0; sheet.classList.add('dragging'); grab.setPointerCapture(e.pointerId); });
    grab.addEventListener('pointermove', (e) => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); sheet.style.transform = `translateY(${dy}px)`; });
    const end = () => {
      if (y0 === null) return;
      y0 = null; sheet.classList.remove('dragging'); sheet.style.transform = '';
      if (dy > 120) closeSheet();
    };
    grab.addEventListener('pointerup', end); grab.addEventListener('pointercancel', end);
  }

  /* ------------------------------------------------------------- eventos */
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('button, a, [data-close]');
    if (!t || t.closest('.overlay')) return;
    const d = t.dataset;

    // hoja
    if (sheetState) {
      if ('close' in d) return closeSheet();
      if (d.k) return tecla(d.k);
      if (d.cat) { sheetState.cat = d.cat; sheetState.tocadoCat = true; haptic(5); return pintarHoja(); }
      if (d.fecha) { sheetState.fecha = d.fecha === 'hoy' ? today() : yesterday(); return pintarHoja(); }
      if (t.id === 'fijo') { sheetState.fijo = !sheetState.fijo; haptic(8); return pintarHoja(); }
      if (d.sugg !== undefined) {
        const s = $('#sugg')._s[Number(d.sugg)];
        if (!s) return;
        sheetState.texto = s.label; sheetState.cat = s.cat; sheetState.tocadoCat = true;
        if (!sheetState.amt || sheetState.amtDeTexto) { sheetState.amt = centsToStr(s.cents); }
        sheetState.amtDeTexto = false; sheetState.detectado = null;
        $('#concepto').value = s.label;
        haptic(6);
        return pintarHoja();
      }
      if (d.act === 'guardar') return guardar();
      if (d.act === 'sheet-del') { const id = sheetState.id; closeSheet(); return setTimeout(() => eliminar(id), 250); }
      return;
    }

    if (d.go) { e.preventDefault(); return go(d.go, d.scroll); }
    if (d.mes) return setMes(addM(vm, Number(d.mes)));
    if ('hoy' in d) return setMes(curYM());
    if (d.setmes) { vm = d.setmes; fcat = null; fdia = null; haptic(5); return render(); }
    if (d.fcat !== undefined) {
      fcat = d.fcat && fcat !== d.fcat ? d.fcat : null;
      haptic(5); render();
      if (fcat) { const s = $('#movs', app); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      return;
    }
    if (d.dia) {
      fdia = fdia === d.dia ? null : d.dia;
      haptic(5); render();
      if (fdia) { const s = $('#movs', app); if (s) s.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      return;
    }
    if ('limpiar' in d) { fcat = null; fdia = null; return render(); }
    if (d.edit) {
      if (t.dataset.swiped) return;
      const g = S.gastos.find((x) => x.id === d.edit);
      return g && openSheet(g);
    }
    if (d.rango) { rango = Number(d.rango); return render(); }
    if (d.alcance) { busq.todo = d.alcance === 'todo'; $$('[data-alcance]', app).forEach((b) => b.classList.toggle('on', b === t)); return pintarBusqueda(); }
    if (d.q !== undefined) { busq.q = d.q; $('#q', app).value = d.q; return pintarBusqueda(); }
    if (d.tema) {
      if (commit(() => { S.tema = d.tema; })) {
        root.dataset.theme = d.tema;
        $('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue('--bg0').trim();
        haptic(8); render();
      }
      return;
    }
    if (d.fijoEdit) return fijoEdit(d.fijoEdit);
    if (d.fijoStop) return fijoStop(d.fijoStop);
    if (t.matches('a[href="?nuevo"]')) { e.preventDefault(); return openSheet(); }
    switch (d.act) {
      case 'nuevo': haptic(10); return openSheet();
      case 'presupuesto': return pedirPresupuesto();
      case 'hero':
        if (commit(() => { S.heroModo = S.heroModo === 'disponible' ? 'gastado' : 'disponible'; })) { haptic(8); render(); flashLamp(); }
        return;
      case 'discreto':
        if (commit(() => { S.discreto = !S.discreto; })) { haptic(8); render(); }
        return;
      case 'cierre': return cierre(vm);
      case 'toggle-directo':
        if (commit(() => { S.abrirDirecto = !S.abrirDirecto; })) { haptic(8); render(); toast(S.abrirDirecto ? 'Lumen se abrirá directamente en el teclado' : 'Lumen se abrirá en el resumen'); }
        return;
      case 'backup': return backup();
      case 'csv': return csv();
      case 'restaurar': return $('#file-restore').click();
      case 'borrar-todo': return borrarTodo();
      case 'copiar': {
        const u = `${location.origin}${location.pathname}?nuevo`;
        try { await navigator.clipboard.writeText(u); toast('Enlace copiado'); } catch (_) { toast(u, { ic: 'info', ms: 8000 }); }
        return;
      }
      case 'instalar':
        if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice.catch(() => null); if (r && r.outcome === 'accepted') { installEvt = null; render(); } }
        return;
      default:
    }
  });
  $('#file-restore').addEventListener('change', (e) => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (f) restaurar(f); });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'in-nombre') { const v = e.target.value.trim().slice(0, 24); if (commit(() => { S.nombre = v; })) toast(v ? `Hola, ${esc(v)}` : 'Nombre quitado'); }
  });
  document.addEventListener('keydown', (e) => {
    if (sheetState) {
      if (e.target.id === 'concepto') { if (e.key === 'Escape') closeSheet(); return; }
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); return tecla(e.key); }
      if (e.key === ',' || e.key === '.') { e.preventDefault(); return tecla(','); }
      if (e.key === 'Backspace') { e.preventDefault(); return tecla('del'); }
      if (e.key === 'Enter') { e.preventDefault(); return guardar(); }
      if (e.key === 'Escape') return closeSheet();
      return;
    }
    if ($('.dlg-wrap') || $('.overlay') || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'n' || e.key === '+') { e.preventDefault(); openSheet(); }
    if (e.key === '/') { e.preventDefault(); go('buscar'); }
    if (view === 'inicio' && e.key === 'ArrowLeft') setMes(addM(vm, -1), 'r');
    if (view === 'inicio' && e.key === 'ArrowRight') setMes(addM(vm, 1), 'l');
  });
  // Otra pestaña con la app abierta guardó algo: recargar.
  window.addEventListener('storage', (e) => { if (e.key === KEY) { S = load(); render(); } });
  // Al volver a la app: refrescar si cambió el día y, si toca, abrir el teclado.
  let lastDay = today();
  let ocultaDesde = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') { ocultaDesde = Date.now(); return; }
    if (S.abrirDirecto && isStandalone() && ocultaDesde && Date.now() - ocultaDesde > 3 * 60e3 && !sheetState && !$('.dlg-wrap') && !$('.overlay')) setTimeout(() => openSheet(), 150);
    if (today() !== lastDay) {
      const enMesActual = vm === ymOf(lastDay);
      lastDay = today();
      if (aplicarFijos()) save();
      if (enMesActual) vm = curYM();
      if (!sheetState) render();
    }
    if (swReg) swReg.update().catch(() => {});
  });
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; if (view === 'ajustes') render(); });
  window.addEventListener('appinstalled', () => { installEvt = null; toast('Lumen instalada en tu pantalla de inicio'); });

  /* --------------------------------------------------------- service worker */
  let swReg = null;
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').then((reg) => {
      swReg = reg;
      const avisar = () => toast('Hay una versión nueva de Lumen', { ic: 'bolt', action: 'Actualizar', ms: 15000, onAction: () => reg.waiting && reg.waiting.postMessage('skip') });
      if (reg.waiting && navigator.serviceWorker.controller) avisar();
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (w) w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) avisar(); });
      });
    }).catch(() => {});
    // Recargar solo cuando el usuario acepta una actualización; en la primera
    // instalación el service worker toma el control sin tocar la página.
    const habiaControl = !!navigator.serviceWorker.controller;
    let recargando = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (!habiaControl || recargando) return; recargando = true; location.reload(); });
  }

  /* ------------------------------------------------------------- arranque */
  if (aplicarFijos()) save();
  const qs = new URLSearchParams(location.search);
  const abrirNuevo = qs.has('nuevo') || location.hash === '#nuevo';
  const avisoSafari = abrirNuevo && isIOS() && !isStandalone();
  if (qs.get('vista') === 'analisis') view = 'analisis';
  if (abrirNuevo || qs.has('vista') || location.hash) history.replaceState(null, '', location.pathname);
  render();
  app.classList.add('view-enter');
  $('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue('--bg0').trim();
  const prevYM = addM(curYM(), -1);
  if (!S.bienvenida && !abrirNuevo) bienvenida();
  else if (abrirNuevo || (S.abrirDirecto && isStandalone())) {
    setTimeout(() => {
      openSheet();
      if (avisoSafari) toast('Esto se ha abierto en Safari, no en la app instalada: en iPhone guardan datos por separado. Usa el icono de Lumen.', { error: true, ms: 9000 });
    }, reduceMotion ? 0 : 180);
  } else if ((!S.cierreVisto || S.cierreVisto < prevYM) && gastosMes(prevYM).length >= 5) setTimeout(() => cierre(prevYM, true), 700);
  window.addEventListener('hashchange', () => { if (location.hash === '#nuevo') { history.replaceState(null, '', location.pathname); openSheet(); } });
})();
