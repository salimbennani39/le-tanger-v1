/* Le Tanger — site behaviour */
(() => {
  const TZ = 'Africa/Casablanca';
  const BOOK = 'https://direct-book.com/properties/LeTangerResidenceHoteliereDIRECT';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- dates in Tangier ---------- */
  const ymd = d => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 864e5);

  /* ---------- booking links: same link everywhere, dates refreshed daily ---------- */
  function bookUrl(inD, outD, adults = 2, children = 0) {
    const q = new URLSearchParams();
    q.set('locale', 'fr');
    q.set('items[0][adults]', adults);
    q.set('items[0][children]', children);
    q.set('items[0][infants]', 0);
    q.set('currency', 'MAD');
    q.set('checkInDate', inD);
    q.set('checkOutDate', outD);
    q.set('trackPage', 'no');
    return BOOK + '?' + q.toString().replace(/%5B/g, '[').replace(/%5D/g, ']');
  }
  const defaultBook = bookUrl(ymd(today), ymd(tomorrow));
  $$('[data-book]').forEach(a => { a.href = defaultBook; a.target = '_blank'; a.rel = 'noopener'; });

  /* ---------- date picker (replaces the browser's native calendar) ---------- */
  const fmtField = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const fmtMonth = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });
  const fmtFull = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' });
  const toD = s => new Date(s + 'T12:00:00');
  const addD = (s, n) => { const d = toD(s); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const addMonth = (ym, n) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m - 1 + n, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
  const TODAY = ymd(today);

  function datePicker(form, defaults) {
    const [iIn, iOut] = $$('input[type=date]', form);
    if (!iIn || !iOut) return;
    let start = defaults ? TODAY : '', end = defaults ? ymd(tomorrow) : '', mode = 'start', hover = '';
    const field = inp => { inp.type = 'hidden'; const b = document.createElement('button'); b.type = 'button'; b.className = 'dp-field'; b.setAttribute('aria-haspopup', 'dialog'); inp.after(b); return b; };
    const bIn = field(iIn), bOut = field(iOut);
    const pop = document.createElement('div');
    pop.className = 'dp'; pop.hidden = true; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Choisir vos dates');
    form.classList.add('has-dp'); form.append(pop);
    let view = TODAY.slice(0, 7);

    const sync = () => {
      iIn.value = start; iOut.value = end;
      bIn.textContent = start ? fmtField.format(toD(start)) : 'Choisir';
      bOut.textContent = end ? fmtField.format(toD(end)) : 'Choisir';
      bIn.classList.toggle('empty', !start); bOut.classList.toggle('empty', !end);
      bIn.classList.toggle('active', !pop.hidden && mode === 'start');
      bOut.classList.toggle('active', !pop.hidden && mode === 'end');
      bIn.setAttribute('aria-expanded', !pop.hidden); bOut.setAttribute('aria-expanded', !pop.hidden);
      document.body.classList.toggle('dp-open', !pop.hidden);
    };
    const month = ym => {
      const [y, m] = ym.split('-').map(Number);
      const first = new Date(y, m - 1, 1), days = new Date(y, m, 0).getDate();
      const lead = (first.getDay() + 6) % 7;
      const tail = mode === 'end' && start && hover > start ? hover : end;
      let cells = '';
      for (let k = 0; k < lead; k++) cells += '<span></span>';
      for (let d = 1; d <= days; d++) {
        const s = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const cls = [
          s === start && 'is-start',
          tail && s === tail && 'is-end',
          start && tail && s > start && s < tail && 'in-range',
          s === TODAY && 'is-today',
        ].filter(Boolean).join(' ');
        cells += `<button type="button" data-d="${s}" class="${cls}"${s < TODAY ? ' disabled' : ''} aria-label="${fmtFull.format(toD(s))}">${d}</button>`;
      }
      return `<div class="dp-month"><p class="dp-title">${fmtMonth.format(first)}</p><div class="dp-dow">${['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'].map(x => `<span>${x}</span>`).join('')}</div><div class="dp-days">${cells}</div></div>`;
    };
    const render = (focusD) => {
      const two = innerWidth >= 720;
      const nights = start && end ? Math.round((toD(end) - toD(start)) / 864e5) : 0;
      const hint = mode === 'start' ? 'Choisissez votre arrivée' : 'Choisissez votre départ';
      const canPrev = view > TODAY.slice(0, 7);
      pop.innerHTML = `<div class="dp-head"><button type="button" class="dp-nav" data-nav="-1" aria-label="Mois précédent"${canPrev ? '' : ' disabled'}>&#8592;</button><button type="button" class="dp-nav" data-nav="1" aria-label="Mois suivant">&#8594;</button></div>
        <div class="dp-months">${month(view)}${two ? month(addMonth(view, 1)) : ''}</div>
        <div class="dp-foot"><span>${nights && mode === 'start' ? `${nights} nuit${nights > 1 ? 's' : ''}` : hint}</span><button type="button" class="dp-done">Valider</button></div>`;
      sync();
      if (focusD) pop.querySelector(`[data-d="${focusD}"]`)?.focus({ preventScroll: true });
    };
    const open = m => {
      mode = m;
      view = ((m === 'end' ? start : start) || TODAY).slice(0, 7);
      pop.hidden = false; render();
      (pop.querySelector(m === 'end' ? '.is-end' : '.is-start') || pop.querySelector('.is-today') || pop.querySelector('.dp-days button:not([disabled])'))?.focus({ preventScroll: true });
    };
    const close = focus => { const was = mode; pop.hidden = true; hover = ''; mode = 'start'; sync(); if (focus) (was === 'end' ? bOut : bIn).focus(); };

    bIn.addEventListener('click', () => (pop.hidden || mode !== 'start') ? open('start') : close());
    bOut.addEventListener('click', () => (pop.hidden || mode !== 'end') ? open(start ? 'end' : 'start') : close());
    pop.addEventListener('click', e => {
      const nav = e.target.closest('[data-nav]');
      if (nav) { view = addMonth(view, +nav.dataset.nav); render(); return; }
      if (e.target.closest('.dp-done')) { if (start && !end) end = addD(start, 1); close(true); return; }
      const day = e.target.closest('[data-d]');
      if (!day || day.disabled) return;
      const d = day.dataset.d;
      if (mode === 'start' || !start || d <= start) { start = d; if (end && end <= start) end = ''; mode = 'end'; render(d); }
      else { end = d; hover = ''; mode = 'start'; render(); setTimeout(() => { mode = 'end'; close(true); }, 220); }
    });
    pop.addEventListener('mouseover', e => {
      const day = e.target.closest('[data-d]');
      if (mode !== 'end' || !day || day.disabled || day.dataset.d === hover) return;
      hover = day.dataset.d;
      $$('[data-d]', pop).forEach(b => {
        const s = b.dataset.d, tail = hover > start ? hover : end;
        b.classList.toggle('in-range', !!(start && tail && s > start && s < tail));
        b.classList.toggle('is-end', !!(tail && s === tail));
      });
    });
    pop.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); close(true); return; }
      const day = e.target.closest('[data-d]');
      const step = day && { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (!step) return;
      e.preventDefault();
      const t = addD(day.dataset.d, step);
      if (t < TODAY) return;
      if (!pop.querySelector(`[data-d="${t}"]`)) view = addMonth(view, step > 0 ? 1 : -1);
      render(t);
    });
    document.addEventListener('pointerdown', e => { if (!pop.hidden && !pop.contains(e.target) && e.target !== bIn && e.target !== bOut) close(); });
    document.addEventListener('focusin', e => { if (!pop.hidden && !form.contains(e.target)) close(); });
    addEventListener('resize', () => { if (!pop.hidden) render(); });
    sync();
  }

  /* booking bar */
  $$('.bookbar').forEach(f => {
    datePicker(f, true);
    const i = $('[name=in]', f), o = $('[name=out]', f);
    f.addEventListener('submit', e => {
      e.preventDefault();
      const a = i.value || ymd(today), b = o.value && o.value > a ? o.value : addD(a, 1);
      window.open(bookUrl(a, b, $('[name=adults]', f).value, $('[name=children]', f).value), '_blank', 'noopener');
    });
  });
  $$('form[data-wa]').forEach(f => datePicker(f, false));

  /* ---------- tonight's sunset in Tangier (suncalc method) ---------- */
  function sunset(date, lat, lng) {
    const rad = Math.PI / 180, dayMs = 864e5, J1970 = 2440588, J2000 = 2451545;
    const toDays = d => d.valueOf() / dayMs - 0.5 + J1970 - J2000;
    const lw = rad * -lng, phi = rad * lat, e = rad * 23.4397;
    const d = toDays(date);
    const n = Math.round(d - 0.0009 - lw / (2 * Math.PI));
    const ds = 0.0009 + lw / (2 * Math.PI) + n;
    const M = rad * (357.5291 + 0.98560028 * ds);
    const C = rad * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    const L = M + C + rad * 102.9372 + Math.PI;
    const dec = Math.asin(Math.sin(e) * Math.sin(L));
    const w = Math.acos((Math.sin(-0.833 * rad) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec)));
    const a = 0.0009 + (w + lw) / (2 * Math.PI) + n;
    const J = J2000 + a + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    return new Date((J + 0.5 - J1970) * dayMs);
  }
  const set = sunset(new Date(), 35.7595, -5.834);
  const hhmm = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(set);
  $$('[data-sunset]').forEach(el => el.textContent = hhmm);

  /* ---------- header ---------- */
  const hdr = $('.hdr');
  const heroEl = $('.hero, .phero');
  let lastY = 0;
  function onHeader() {
    const y = scrollY;
    const threshold = heroEl ? heroEl.offsetHeight - 90 : 10;
    hdr.classList.toggle('solid', y > threshold);
    hdr.classList.toggle('hide', y > lastY && y > 600 && !document.body.classList.contains('menu-open'));
    lastY = y;
  }
  if (!heroEl) hdr.classList.add('solid');

  /* mobile menu */
  const menu = $('.menu');
  $('.burger')?.addEventListener('click', () => { menu.classList.add('open'); document.body.classList.add('menu-open'); $('.close', menu).focus(); });
  $('.close', menu)?.addEventListener('click', () => { menu.classList.remove('open'); document.body.classList.remove('menu-open'); $('.burger').focus(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('open')) $('.close', menu).click(); });

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
  $$('.rv, .clipin, .line-mask').forEach(el => io.observe(el));

  /* ---------- tone drift (the sun sets as you scroll) ---------- */
  const toned = $$('[data-tone-section]');
  if (toned.length) {
    const tio = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) document.body.dataset.tone = en.target.dataset.toneSection; }), { rootMargin: '-45% 0px -45% 0px' });
    toned.forEach(s => tio.observe(s));
  }

  /* sun indicator */
  const sun = $('.sun');
  if (sun) {
    const disc = $('.disc', sun), t = $('.t', sun);
    const sunTimes = ['16:30', '17:30', '18:30', hhmm, '21:00', '22:00'];
    sun.dataset.ready = 1;
    sun._update = p => {
      disc.style.transform = `translateY(${(p * 96).toFixed(1)}px)`;
      const i = Math.min(sunTimes.length - 1, Math.floor(p * sunTimes.length));
      t.textContent = p > 0.5 && p < 0.68 ? 'coucher · ' + hhmm : (p < 0.5 ? 'après-midi' : 'nuit');
    };
  }

  /* ---------- parallax + hero ---------- */
  const par = $$('[data-par]');
  const heroMedia = $('.hero-media, .phero-media');
  const heroCopy = $('.hero-copy');
  function frame() {
    const vh = innerHeight, y = scrollY;
    onHeader();
    if (!reduce) {
      if (heroMedia && y < vh * 1.2) {
        heroMedia.style.transform = `translate3d(0,${(y * 0.28).toFixed(1)}px,0)`;
        if (heroCopy) { heroCopy.style.transform = `translate3d(0,${(y * -0.12).toFixed(1)}px,0)`; heroCopy.style.opacity = Math.max(0, 1 - y / (vh * 0.7)); }
      }
      for (const el of par) {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) continue;
        const k = parseFloat(el.dataset.par) || 0.12;
        const c = (r.top + r.height / 2 - vh / 2) / vh;
        el.style.transform = `translate3d(0,${(c * k * -100).toFixed(2)}%,0)`;
      }
    }
    if (sun && sun.dataset.ready) {
      const max = document.documentElement.scrollHeight - vh;
      const p = Math.min(1, Math.max(0, y / max));
      sun._update(p);
      sun.classList.toggle('on', y > vh * 0.6);
    }
    ticking = false;
  }
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', () => requestAnimationFrame(frame));
  frame();

  /* ---------- hero video: play when allowed ---------- */
  $$('video[data-auto]').forEach(v => {
    v.muted = true; v.playsInline = true;
    if (reduce) { v.removeAttribute('autoplay'); v.pause(); return; }
    const vio = new IntersectionObserver(es => es.forEach(en => en.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    vio.observe(v);
  });

  /* ---------- rail (drag + buttons) ---------- */
  $$('.rail').forEach(rail => {
    let down = false, sx = 0, sl = 0, moved = 0;
    rail.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; moved = 0; sx = e.clientX; sl = rail.scrollLeft; });
    addEventListener('pointermove', e => { if (!down) return; const dx = e.clientX - sx; moved = Math.abs(dx); if (moved > 4) rail.classList.add('drag'); rail.scrollLeft = sl - dx; });
    addEventListener('pointerup', () => { down = false; rail.classList.remove('drag'); });
    rail.addEventListener('click', e => { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } }, true);
    rail.addEventListener('dragstart', e => e.preventDefault());
    const ctrl = rail.previousElementSibling?.querySelector('.rail-ctrl') || $('.rail-ctrl');
    if (ctrl) {
      const step = () => rail.querySelector('.card').offsetWidth + 24;
      $('[data-prev]', ctrl)?.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: 'smooth' }));
      $('[data-next]', ctrl)?.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: 'smooth' }));
    }
  });

  /* ---------- residences filter ---------- */
  const fbtns = $$('.filters button');
  fbtns.forEach(b => b.addEventListener('click', () => {
    fbtns.forEach(x => x.setAttribute('aria-pressed', x === b));
    const f = b.dataset.filter;
    $$('.ritem').forEach(it => { it.hidden = !(f === 'all' || it.dataset.tags.split(' ').includes(f)); });
  }));

  /* ---------- lightbox ---------- */
  const lb = $('.lb');
  if (lb) {
    const img = $('img', lb);
    let list = [], idx = 0, opener = null;
    const show = i => { idx = (i + list.length) % list.length; img.src = list[idx].dataset.full; img.alt = list[idx].querySelector('img').alt; };
    $$('[data-full]').forEach(b => b.addEventListener('click', () => {
      list = $$('[data-full]', b.closest('[data-gallery]') || document); opener = b;
      show(list.indexOf(b)); lb.classList.add('open'); document.body.style.overflow = 'hidden'; $('.lb-x', lb).focus();
    }));
    const close = () => { lb.classList.remove('open'); document.body.style.overflow = ''; opener?.focus(); };
    $('.lb-x', lb).addEventListener('click', close);
    $('.lb-p', lb).addEventListener('click', () => show(idx - 1));
    $('.lb-n', lb).addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(idx - 1); if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* ---------- WhatsApp forms ---------- */
  $$('form[data-wa]').forEach(f => f.addEventListener('submit', e => {
    e.preventDefault();
    const lines = [f.dataset.wa];
    $$('[name]', f).forEach(el => { let v = el.value.trim(); if (/^\d{4}-\d{2}-\d{2}$/.test(v)) v = fmtFull.format(toD(v)); if (v) lines.push(`${el.dataset.label || el.name} : ${v}`); });
    window.open('https://wa.me/212656103761?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  }));

  /* ---------- sea waves (synthesised in the browser: no audio file, nothing to download) ---------- */
  $$('[data-waves]').forEach(btn => {
    const section = btn.closest('section');
    const lbl = $('.lbl', btn);
    let ctx = null, master = null, on = false, visible = true, timers = [];

    const noiseBuffer = (c, seconds, brown) => {
      const len = c.sampleRate * seconds, buf = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        let last = 0, b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < len; i++) {
          const w = Math.random() * 2 - 1;
          if (brown) { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.2; }
          else { b0 = 0.997 * b0 + w * 0.029591; b1 = 0.985 * b1 + w * 0.032534; b2 = 0.95 * b2 + w * 0.048056; d[i] = (b0 + b1 + b2 + w * 0.05) * 0.9; }
        }
      }
      return buf;
    };

    function build() {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
      const pink = noiseBuffer(ctx, 6, false), brown = noiseBuffer(ctx, 6, true);

      // low, constant rumble of the sea far away
      const rumble = ctx.createBufferSource(); rumble.buffer = brown; rumble.loop = true;
      const rf = ctx.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 320;
      const rg = ctx.createGain(); rg.gain.value = 0.35;
      rumble.connect(rf).connect(rg).connect(master); rumble.start();

      // two wave layers, slightly left and right, each breaking on its own rhythm
      [-0.45, 0.45].forEach((pan, k) => {
        const src = ctx.createBufferSource(); src.buffer = pink; src.loop = true; src.loopStart = k * 2;
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 300; f.Q.value = 0.4;
        const g = ctx.createGain(); g.gain.value = 0.02;
        const p = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        src.connect(f).connect(g);
        if (p) { p.pan.value = pan; g.connect(p).connect(master); } else g.connect(master);
        src.start(0, k * 2);
        const wave = () => {
          const t = ctx.currentTime, period = 6.5 + Math.random() * 4.5, rise = period * (0.38 + Math.random() * 0.12);
          const peak = 0.55 + Math.random() * 0.4;
          g.gain.cancelScheduledValues(t); f.frequency.cancelScheduledValues(t);
          g.gain.setTargetAtTime(peak, t, rise / 3);
          f.frequency.setTargetAtTime(1400 + Math.random() * 900, t, rise / 3);
          g.gain.setTargetAtTime(0.03, t + rise, (period - rise) / 3.2);
          f.frequency.setTargetAtTime(280, t + rise, (period - rise) / 2.6);
          timers[k] = setTimeout(wave, period * 1000);
        };
        timers[k] = setTimeout(wave, k * 3200 + 200);
      });
    }

    const fade = (to, s) => { const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(to, t + s); };
    const play = () => { if (!ctx) build(); ctx.resume(); fade(0.5, 2.2); };
    const mute = () => { if (!ctx) return; fade(0, 0.9); setTimeout(() => { if (!on || !visible) ctx.suspend(); }, 1000); };
    const sync = () => {
      btn.setAttribute('aria-pressed', on); btn.classList.toggle('playing', on);
      lbl.textContent = on ? 'Couper le son' : 'Écouter la mer';
    };

    btn.addEventListener('click', () => { on = !on; sync(); on && visible ? play() : mute(); });
    // the sound belongs to this section: it fades out when you scroll away, and back in when you return
    new IntersectionObserver(es => es.forEach(en => {
      visible = en.isIntersecting;
      if (on) visible ? play() : mute();
    }), { threshold: 0.2 }).observe(section);
    document.addEventListener('visibilitychange', () => { if (on && ctx) document.hidden ? mute() : (visible && play()); });
    sync();
  });

  /* year */
  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
