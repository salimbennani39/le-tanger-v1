// Static site generator for Le Tanger. Run from /site:  node src/build.mjs
import { writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, rooms, drinks, faq, breakfast } from './data.mjs';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
/* cache-busting: a new version tag whenever the CSS or JS changes, so browsers never show an old stylesheet */
const hash8 = f => createHash('md5').update(readFileSync(join(ROOT, f))).digest('hex').slice(0, 8);
const VER = { css: hash8('src/assets/css/styles.css'), js: hash8('src/assets/js/main.js') };
const LOGO = readFileSync(join(ROOT, 'src/logo-inline.svg'), 'utf8');
cpSync(join(ROOT, 'src/assets/css'), join(ROOT, 'assets/css'), { recursive: true });
cpSync(join(ROOT, 'src/assets/js'), join(ROOT, 'assets/js'), { recursive: true });

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let P = ''; // relative prefix for current page
const img = (name, alt, { sizes = '100vw', eager = false, par = null, cls = '' } = {}) =>
  `<img src="${P}assets/img/${name}-1200.webp" srcset="${P}assets/img/${name}-1200.webp 1200w, ${P}assets/img/${name}-2400.webp 2400w" sizes="${sizes}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${par ? ` data-par="${par}"` : ''}${cls ? ` class="${cls}"` : ''}>`;
const full = name => `${P}assets/img/${name}-2400.webp`;
/* real pixel size of a webp, so gallery tiles keep each photo's own shape */
const webpSize = name => {
  const b = readFileSync(join(ROOT, `assets/img/${name}-1200.webp`));
  const t = b.toString('ascii', 12, 16);
  if (t === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (t === 'VP8L') { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; }
  return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
};
const icon = {
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12h16M14 6l6 6-6 6"/></svg>',
  left: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 12H4M10 6l-6 6 6 6"/></svg>',
  area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16v16H4z"/><path d="M4 9h5V4"/></svg>',
  bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 18V7M3 14h18v4M21 14v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11" r="1.6"/></svg>',
  bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12h18v2a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-2zM6 12V6a2 2 0 0 1 4 0"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="8" r="3.2"/><path d="M3 19c.8-3.4 3.2-5 6-5s5.2 1.6 6 5M16 5.2a3 3 0 0 1 0 5.6M18 14.4c1.5.7 2.6 2.3 3 4.6"/></svg>',
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3.9 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2.1.7 2.8.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.4-.3z"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor"/></svg>',
  fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v8h4v-8h3l1-4h-4V8z"/></svg>',
  snap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3c3 0 5 2.2 5 5v2.5l2 .8-1.6 1.4c.6 1.8 2 3 3.6 3.4-.4.8-1.8 1-2.8 1.2-.2.6-.3 1.2-.7 1.2-.8 0-1.6-.4-2.7 0-1 .4-1.8 1.5-2.8 1.5s-1.8-1.1-2.8-1.5c-1.1-.4-1.9 0-2.7 0-.4 0-.5-.6-.7-1.2-1-.2-2.4-.4-2.8-1.2 1.6-.4 3-1.6 3.6-3.4L5 11.3l2-.8V8c0-2.8 2-5 5-5z"/></svg>',
  li: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M5 9h3v11H5zM6.5 4a1.8 1.8 0 1 1 0 3.6 1.8 1.8 0 0 1 0-3.6zM10 9h3v1.6c.5-.9 1.6-1.8 3.4-1.8 3.2 0 3.6 2.1 3.6 4.8V20h-3v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V20h-3z"/></svg>',
};
const specs = r => `<ul class="specs">
  <li>${icon.area}<span class="num">${r.surface} m²</span></li>
  <li>${icon.users}<span>${r.guests} pers.</span></li>
  <li>${icon.bed}<span>${r.beds}</span></li>
  <li>${icon.bath}<span>${r.baths} salle${r.baths > 1 ? 's' : ''} de bain</span></li></ul>`;
const roomName = r => `${r.title} <em>${r.sub.toLowerCase()}</em>`;
const roomPlain = r => `${r.title}, ${r.sub.toLowerCase()}`;
const book = (label = 'Réserver', cls = 'btn btn-primary') => `<a class="${cls}" data-book href="https://direct-book.com/properties/LeTangerResidenceHoteliereDIRECT">${label}</a>`;

const NAV = [
  ['residences.html', 'Résidences'],
  ['pool-day.html', 'Pool Day'],
  ['le-feu.html', 'Le Feu'],
  ['celebrations.html', 'Célébrations & événements'],
  ['conciergerie.html', 'Conciergerie'],
  ['collection-telephones.html', 'Collection'],
  ['galerie.html', 'Galerie'],
];
const MORE = [['a-propos.html', 'Le lieu'], ['contact.html', 'Contact'], ['blog.html', 'Journal']];

/* ---------- layout ---------- */
function layout({ path, title, desc, body, current = '', tones = false, light = false, ogImg = 'hero-pool-sunset' }) {
  const depth = path.split('/').length - 1;
  P = '../'.repeat(depth);
  const nav = NAV.map(([h, l]) => `<a href="${P}${h}"${current === h ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  const html = body();
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#15100C">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="https://letanger.com/assets/img/${ogImg}-1200.webp">
<meta property="og:locale" content="fr_FR">
<link rel="icon" href="${P}assets/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${P}assets/css/styles.css?v=${VER.css}">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Hotel', name: site.full, address: { '@type': 'PostalAddress', streetAddress: "M'nar Palm", addressLocality: 'Tanger', postalCode: '90000', addressCountry: 'MA' }, telephone: site.phone, email: site.email, url: 'https://letanger.com', checkinTime: '15:00', checkoutTime: '12:00' })}</script>
</head>
<body data-tone="day">
<a class="skip" href="#main">Aller au contenu</a>
<header class="hdr${light ? ' on-light' : ''}">
  <div class="hdr-in">
    <a class="logo" href="${P}index.html" aria-label="Le Tanger, accueil">${LOGO}<small>Résidence hôtelière</small></a>
    <nav class="nav" aria-label="Navigation principale">${nav}</nav>
    <div class="hdr-right">
      <span class="sunset" title="Heure du coucher du soleil à Tanger aujourd'hui"><i></i>Coucher du soleil <span data-sunset class="num">--:--</span></span>
      ${book('Réserver', 'btn btn-primary')}
      <button class="burger" aria-label="Ouvrir le menu"><span></span></button>
    </div>
  </div>
</header>
<div class="menu" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="menu-top"><a class="logo" href="${P}index.html">${LOGO}<small>Résidence hôtelière</small></a><button class="close" aria-label="Fermer le menu">×</button></div>
  <nav>${[['index.html', 'Accueil'], ...NAV, ...MORE].map(([h, l]) => `<a href="${P}${h}">${l}</a>`).join('')}</nav>
  <div class="menu-foot">${book('Réserver', 'btn btn-primary')}<a href="${site.phoneHref}">${site.phone}</a><span>Coucher du soleil ce soir à <span data-sunset>--:--</span></span></div>
</div>
<main id="main">
${html}
</main>
${footer()}
<a class="wa" href="${site.whatsapp}" target="_blank" rel="noopener" aria-label="Écrire sur WhatsApp">${icon.wa}</a>
${tones ? '<div class="sun" aria-hidden="true"><div class="clip"><div class="disc"></div></div><div class="hz"></div><div class="t">après-midi</div></div>' : ''}
<div class="lb" role="dialog" aria-modal="true" aria-label="Galerie"><button class="lb-x" aria-label="Fermer">×</button><button class="lb-p" aria-label="Photo précédente">${icon.left}</button><img alt=""><button class="lb-n" aria-label="Photo suivante">${icon.arrow}</button></div>
<script src="${P}assets/js/main.js?v=${VER.js}" defer></script>
</body>
</html>`;
}

function footer() {
  return `<footer class="ftr">
  <div class="wrap">
    <div class="ftr-top">
      <div>
        <a class="logo" href="${P}index.html">${LOGO}<small>Résidence hôtelière</small></a>
        <p style="color:#B9A38D;margin-top:22px;max-width:34ch">Entre mer et collines, face au détroit de Gibraltar.</p>
        <div class="social">
          <a href="${site.social.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${icon.ig}</a>
          <a href="${site.social.snapchat}" target="_blank" rel="noopener" aria-label="Snapchat">${icon.snap}</a>
          <a href="${site.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${icon.wa}</a>
        </div>
      </div>
      <div><h4>Séjourner</h4><ul>
        <li><a href="${P}residences.html">Résidences</a></li>
        <li><a href="${P}pool-day.html">Pool Day</a></li>
        <li><a href="${P}le-feu.html">Le Feu</a></li>
        <li><a href="${P}celebrations.html">Célébrations & événements</a></li>
        <li><a href="${P}conciergerie.html">Conciergerie</a></li></ul></div>
      <div><h4>Découvrir</h4><ul>
        <li><a href="${P}a-propos.html">Le lieu</a></li>
        <li><a href="${P}galerie.html">Galerie</a></li>
        <li><a href="${P}collection-telephones.html">Collection de téléphones</a></li>
        <li><a href="${P}blog.html">Journal</a></li>
        <li><a href="${P}contact.html">Contact</a></li>
        <li>${book('Réserver en ligne', '')}</li></ul></div>
      <div><h4>Nous joindre</h4><ul>
        <li>${site.address}</li>
        <li><a href="${site.phoneHref}">${site.phone}</a></li>
        <li><a href="${site.phone2Href}">${site.phone2}</a></li>
        <li><a href="mailto:${site.email}">${site.email}</a></li>
        <li>Arrivée dès 15h00 · Départ 12h00</li></ul></div>
    </div>
    <div class="ftr-bot"><span>© <span data-year></span> Le Tanger Résidence Hôtelière. Photographies : Fata Morgana.</span><span><a href="${P}confidentialite.html">Confidentialité</a> · <a href="${P}conditions.html">Conditions générales</a></span></div>
  </div>
</footer>`;
}

/* ---------- shared blocks ---------- */
const pageHero = ({ media, alt, eyebrow, title, lead, short = false, video = null, tag = '' }) => `
<section class="phero${short ? ' short' : ''}">
  <div class="phero-media">${video ? `<video data-auto autoplay muted loop playsinline preload="metadata" poster="${P}assets/img/${media}-1200.webp"><source src="${P}assets/video/${video}" type="video/mp4"></video>` : img(media, alt, { eager: true })}</div>
  <div class="phero-copy">
    ${tag ? `<span class="tag">${tag}</span>` : ''}
    ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
    <h1 class="display d-xl">${title}</h1>
    ${lead ? `<p class="lead">${lead}</p>` : ''}
  </div>
</section>`;

const closing = (title = 'Le soleil se couche.<br><em>Restez encore un peu.</em>', text = 'Réservez directement sur notre site, au meilleur tarif.') => `
<section class="closing ground-dark">
  <div class="wrap">
    <h2 class="display d-xl rv">${title}</h2>
    <p class="rv rv-d1">${text}</p>
    <form class="bookbar rv rv-d2" aria-label="Vérifier les disponibilités">
      <label>Arrivée<input type="date" name="in" required></label>
      <label>Départ<input type="date" name="out" required></label>
      <label>Adultes<select name="adults">${[1, 2, 3, 4, 5, 6].map(n => `<option${n === 2 ? ' selected' : ''}>${n}</option>`).join('')}</select></label>
      <label>Enfants<select name="children">${[0, 1, 2, 3, 4].map(n => `<option>${n}</option>`).join('')}</select></label>
      <button class="btn btn-primary" type="submit">Réserver</button>
    </form>
  </div>
</section>`;

const roomCard = r => `<a class="card" href="${P}residences/${r.slug}.html">
  <div class="frame">${img(r.cover || r.imgs[0], roomPlain(r), { sizes: '(max-width:860px) 80vw, 30vw' })}${img(r.hover || r.imgs[1], roomPlain(r) + ', autre vue', { sizes: '30vw', cls: 'alt' })}</div>
  <h3>${roomName(r)}</h3>${specs(r)}</a>`;

const barSection = () => `
<section class="sec ground-dusk">
  <div class="wrap">
    <div class="split-head"><div><p class="eyebrow">The Bar</p><h2 class="display d-l">Le bar, <em>toute la journée.</em></h2></div><p class="lead">Au bord de la piscine, en room service ou par WhatsApp au ${site.phone}. Prix en dirhams.</p></div>
    <p class="eyebrow">Signatures</p>
    <div class="sig" style="margin-bottom:clamp(56px,7vw,96px)">
      ${[...drinks.mocktails, ...drinks.matchas, ...drinks.shakes.slice(0, 1)].map(([n, p, d]) => `<div class="rv"><h4><span>${n}</span><span class="num">${p}</span></h4><p>${d}</p></div>`).join('')}
    </div>
    <div class="carte">
      <div><h3>Boissons chaudes</h3><ul>${drinks.chaudes.map(li).join('')}</ul></div>
      <div><h3>Boissons froides</h3><ul>${drinks.froides.map(li).join('')}</ul><h3 style="margin-top:2.4rem">Milkshakes</h3><ul>${drinks.shakes.map(([n, p]) => li([n, p])).join('')}</ul></div>
      <div><h3>Snacks</h3><ul>${drinks.snacks.map(li).join('')}</ul><h3 style="margin-top:2.4rem">Eau</h3><ul>${drinks.eau.map(li).join('')}</ul></div>
    </div>
    <div style="margin-top:3rem"><a class="btn btn-primary" href="${site.whatsapp}?text=${encodeURIComponent('Bonjour, je souhaite commander :')}" target="_blank" rel="noopener">Commander sur WhatsApp</a></div>
  </div>
</section>`;

const breakfastSection = (cls = '') => `
<section class="sec ${cls}">
  <div class="wrap">
    <div class="split-head"><div><p class="eyebrow">Petit-déjeuner</p><h2 class="display d-l">Le petit-déjeuner, <em>servi en chambre.</em></h2></div><p class="lead">Chaque matin, un plateau entre viennoiseries et spécialités marocaines, livré dans votre logement. En supplément, à demander à la réception ou sur WhatsApp.</p></div>
    <div class="room-facts bf-facts">
      <div><b class="num">${breakfast.price} MAD</b><span>Par personne et par jour</span></div>
      <div><b>${breakfast.hours.replace(' à ', ' – ')}</b><span>Tous les matins</span></div>
      <div><b>En chambre</b><span>Servi dans votre logement</span></div>
      <div><b>À l'arrivée</b><span>Réglé sur place</span></div>
    </div>
    <div class="carte carte-4">${breakfast.menu.map(([h, items]) => `<div><h3>${h}</h3><ul>${items.map(x => `<li><span>${x}</span></li>`).join('')}</ul></div>`).join('')}</div>
    <div style="margin-top:3rem"><a class="btn btn-primary" href="${site.whatsapp}?text=${encodeURIComponent('Bonjour, je souhaite ajouter le petit-déjeuner à mon séjour.')}" target="_blank" rel="noopener">Réserver le petit-déjeuner</a></div>
  </div>
</section>`;

const phones = [
  ['phone-magneto', 'Fin du XIXe – début du XXe siècle', 'Le téléphone mural à manivelle', 'Pas encore de cadran : on tournait la manivelle pour faire sonner le central, et une opératrice, les fameuses « demoiselles du téléphone », branchait la communication à la main.'],
  ['phone-bakelite', 'Années 1950', 'Le téléphone de bureau à cadran', 'Le cadran rotatif permet enfin d’appeler sans passer par l’opératrice. Les touches à l’avant servaient à passer d’une ligne à l’autre, un vrai luxe de bureau à l’époque.'],
  ['phone-onyx', 'Années 1960 – 1970', 'Le téléphone en onyx et laiton', 'Il reprend la silhouette des combinés de la Belle Époque. Ces modèles d’apparat trônaient dans les salons, autant objets de décoration que téléphones.'],
];
const phonesSection = (cls = '') => `
<section class="sec ${cls}" id="telephones">
  <div class="wrap">
    <div class="phones-head">
      <div><p class="eyebrow rv">Dans le salon de réception</p><h2 class="display d-l rv rv-d1">Collection privée <em>de téléphones.</em></h2>
      <p class="lead rv rv-d2" style="margin-top:1.6rem">Des appareils à manivelle aux cadrans des années 1950, une collection réunie au fil des années et exposée à la réception. Demandez-nous de vous en raconter l’histoire.</p><a class="btn btn-line rv rv-d3" style="margin-top:2rem" href="${P}collection-telephones.html">Découvrir la collection ${icon.arrow}</a></div>
      <div class="frame clipin phones-hero">${img('phone-sculpture', 'La collection de téléphones dans le salon de réception', { sizes: '(max-width:860px) 100vw, 34vw' })}</div>
    </div>
    <div class="phones">${phones.map(([im, era, t, d], k) => `<article class="rv rv-d${k}"><div class="frame">${img(im, t, { sizes: '(max-width:860px) 100vw, 33vw' })}</div><p class="eyebrow">${era}</p><h3>${t}</h3><p class="muted">${d}</p></article>`).join('')}</div>
  </div>
</section>`;

const conciergeServices = [
  ['Dîners privés', 'Un dîner rien que pour vous, dressé et préparé selon vos envies : pour une occasion à fêter, ou simplement pour une belle soirée face à la mer.'],
  ['Restaurants', 'Poisson grillé au port, cuisine marocaine dans la médina, rooftop au coucher du soleil : dites-nous ce qui vous ferait plaisir, nous réservons votre table, au déjeuner comme au dîner.'],
  ['Transferts aéroport', 'À l’arrivée comme au départ, un chauffeur vous attend à l’aéroport de Tanger Ibn Battouta et vous conduit jusqu’à la résidence.'],
  ['Excursions', 'Cap Spartel, les grottes d’Hercule, la médina et la kasbah, Asilah ou Chefchaouen : nous organisons vos sorties, à la demi-journée ou à la journée.'],
  ['Spa et hammam', 'Un hammam, un massage, un moment de détente : nous réservons votre créneau dans une adresse de confiance.'],
];
const conciergeTeaser = () => `
<section class="sec ground-paper" id="conciergerie">
  <div class="wrap">
    <div class="split-head"><div><p class="eyebrow rv">Conciergerie</p><h2 class="display d-l rv rv-d1">Tanger, <em>on s’occupe du reste.</em></h2></div>
    <div><p class="lead rv rv-d2">Une table au port, un transfert depuis l’aéroport, une excursion à Chefchaouen, un dîner privé : demandez, nous organisons. Un service inclus dans votre séjour.</p>
    <a class="btn btn-line rv rv-d3" style="margin-top:2rem" href="${P}conciergerie.html">Découvrir la conciergerie ${icon.arrow}</a></div></div>
    <ul class="svc-chips rv">${conciergeServices.map(([t]) => `<li>${t}</li>`).join('')}</ul>
  </div>
</section>`;

/* ---------- pages ---------- */
const pages = [];
const page = (path, opts) => pages.push({ path, ...opts });

/* HOME */
page('index.html', {
  title: 'Le Tanger · Résidence hôtelière face au détroit de Gibraltar',
  desc: "Appartements, suites et penthouses avec vue mer à Tanger. Deux piscines à débordement, le feu de pierre au coucher du soleil, réservation directe.",
  tones: true,
  body: () => `
<section class="hero" data-tone-section="day">
  <div class="hero-media">
    <video data-auto autoplay muted loop playsinline preload="auto" poster="${P}assets/video/hero-montage-poster.jpg">
      <source src="${P}assets/video/hero-montage-m.mp4" type="video/mp4" media="(max-width: 700px)">
      <source src="${P}assets/video/hero-montage.mp4" type="video/mp4">
    </video>
  </div>
  <div class="hero-shade"></div>
  <div class="hero-copy">
    <h1 class="display d-xxl"><small>Résidence hôtelière · Tanger</small>Le Tanger</h1>
    <div class="hero-side">
      <p>Face au détroit de Gibraltar, entre mer et collines. L'indépendance d'un appartement, les attentions d'un hôtel.</p>
      <div class="hero-ctas">${book('Réserver', 'btn btn-light')}<a class="btn btn-ghost" style="color:#FBF3E8" href="${P}residences.html">Les résidences</a></div>
    </div>
  </div>
</section>

<section class="sec" data-tone-section="day">
  <div class="wrap statement">
    <div>
      <p class="eyebrow rv">Bienvenue</p>
      <h2 class="display d-l rv rv-d1">Là où la Méditerranée rencontre <em>la sérénité.</em></h2>
    </div>
    <div class="rv rv-d2">
      <p class="lead">Plus qu'un séjour : des appartements spacieux et entièrement équipés, le service d'un hôtel, et chaque soir le soleil qui descend sur le détroit.</p>
      <dl class="facts" style="margin-top:2.2rem">
        <div><dt>Centre de Tanger</dt><dd>≈ 8 min</dd></div>
        <div><dt>Piscines à débordement</dt><dd>2, face à la mer</dd></div>
        <div><dt>Vue</dt><dd>Méditerranée et Cap Malabata</dd></div>
        <div><dt>Petit-déjeuner</dt><dd>Servi en chambre, 8h00 – 11h00</dd></div>
        <div><dt>Coucher du soleil ce soir</dt><dd class="num" data-sunset>--:--</dd></div>
      </dl>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0" data-tone-section="day">
  <div class="wrap">
    <div class="grid-2" style="align-items:end">
      <div class="frame ratio-45 clipin">${img('penthouse-1', 'Piscine privée du penthouse face à la mer', { sizes: '(max-width:860px) 100vw, 50vw', par: 0.08 })}</div>
      <div>
        <div class="frame ratio-32 clipin" style="margin-bottom:2.4rem">${img('ext-dusk-palms', 'La résidence au crépuscule', { sizes: '(max-width:860px) 100vw, 45vw', par: 0.08 })}</div>
        <p class="lead rv">Du studio tourné vers la piscine aux penthouses et leur piscine privée : choisissez votre façon d'habiter Le Tanger.</p>
        <a class="btn btn-line rv" href="${P}residences.html">Voir les résidences ${icon.arrow}</a>
      </div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0" data-tone-section="gold">
  <div class="wrap rail-head">
    <div><p class="eyebrow">Nos résidences</p><h2 class="display d-l">Choisissez <em>votre horizon.</em></h2></div>
    <div class="rail-ctrl"><button data-prev aria-label="Précédent">${icon.left}</button><button data-next aria-label="Suivant">${icon.arrow}</button></div>
  </div>
  <div class="rail" tabindex="0" aria-label="Liste des résidences">${rooms.map(roomCard).join('')}</div>
</section>

<section class="feature" data-tone-section="gold">
  <div class="feature-media">${img('pool-8333', 'Piscine à débordement au coucher du soleil', { sizes: '(max-width:860px) 100vw, 55vw', par: 0.1 })}</div>
  <div class="feature-copy">
    <p class="eyebrow rv">Pool Day · mai à septembre</p>
    <h2 class="display d-l rv rv-d1">Une journée au bord de <em>l’eau.</em></h2>
    <p class="lead rv rv-d2">Nos deux piscines à débordement vous accueillent de 10h jusqu'au coucher du soleil. Transat et serviette inclus, réservation par téléphone, WhatsApp ou sur place.</p>
    <div class="price rv rv-d2"><div><b class="num">350</b><span>MAD · adulte</span></div><div><b class="num">200</b><span>MAD · enfant</span></div></div>
    <div class="rv rv-d3"><a class="btn btn-primary" href="${P}pool-day.html">Découvrir le Pool Day</a></div>
  </div>
</section>

<section class="fire" data-tone-section="dusk">
  <div class="fire-media" data-par="0.1">${img('feu-night-8462', 'Le salon de pierre et son feu, à la nuit tombée', { sizes: '100vw' })}</div>
  <div class="wrap fire-copy">
    <p class="eyebrow rv" style="color:var(--gold)">Le Feu</p>
    <h2 class="display d-xl rv rv-d1" style="max-width:11ch">Quand le soleil tombe, <em>le feu peut s’allumer.</em></h2>
    <p class="lead rv rv-d2">Un salon de pierre creusé à côté de la piscine, des coussins, un thé à la menthe. Le feu s'allume à votre demande, toute l'année.</p>
    <div class="rv rv-d3" style="margin-top:2.2rem"><a class="btn btn-primary" href="${P}le-feu.html">Le Feu ${icon.arrow}</a></div>
  </div>
</section>

${phonesSection()}
${conciergeTeaser()}
<section class="sec" data-tone-section="dusk">
  <div class="wrap">
    <div class="split-head"><div><p class="eyebrow rv">Vos moments</p><h2 class="display d-l rv rv-d1">Pour les jours <em>qui comptent.</em></h2></div><p class="lead rv rv-d2">Un anniversaire, une nuit de noces, une Saint-Valentin. Une baby shower, une bridal shower.</p></div>
    <div class="duo">
      <a href="${P}celebrations.html#celebrations" class="rv"><div class="frame">${img('celebration-balloons', 'Ballons sur la piscine au coucher du soleil', { sizes: '(max-width:860px) 100vw, 50vw' })}</div><h3>Célébrations</h3><p class="muted">Nous décorons votre chambre pour l'occasion.</p></a>
      <a href="${P}celebrations.html#evenements" class="rv rv-d2 duo-b"><div class="frame">${img('ph2-2', 'Salon lumineux d’un penthouse', { sizes: '(max-width:860px) 100vw, 50vw' })}</div><h3>Événements</h3><p class="muted">Baby shower, bridal shower.</p></a>
    </div>
  </div>
</section>

<section class="band" data-tone-section="night">
  <video data-auto autoplay muted loop playsinline preload="none" poster="${P}assets/img/drone-dusk-1-1200.webp"><source src="${P}assets/video/dusk-coast.mp4" type="video/mp4"></video>
  <div class="wrap band-grid">
    <div><p class="eyebrow" style="color:rgba(251,243,232,.8)">Le lieu</p><h2 class="display d-xl rv">Entre mer <em>et collines.</em></h2></div>
    <div class="rv rv-d1">
      <dl class="facts">
        <div><dt>Adresse</dt><dd>M'nar Palm, Tanger</dd></div>
        <div><dt>Centre-ville</dt><dd>≈ 8 min</dd></div>
        <div><dt>Parking</dt><dd>Privé et gratuit</dd></div>
      </dl>
      <div class="band-ctas"><a class="btn btn-line" style="color:#FBF3E8" href="${P}a-propos.html">Découvrir le lieu ${icon.arrow}</a>
      <button type="button" class="waves-btn" data-waves aria-pressed="false"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="lbl">Écouter la mer</span></button></div>
    </div>
  </div>
</section>
${closing()}`,
});

/* RESIDENCES INDEX */
page('residences.html', {
  title: 'Nos résidences · Le Tanger', current: 'residences.html',
  desc: 'Penthouses, appartements, suites et studio avec vue mer, vue jardin ou piscine privée à Tanger.',
  body: () => `
${pageHero({ media: 'drone-pool', alt: 'La résidence et sa piscine vues du ciel', eyebrow: 'Nos résidences', title: 'Choisissez <em>votre vue.</em>', lead: "Des appartements entièrement équipés et le service d'un hôtel : ménage quotidien, accueil attentif, deux piscines à débordement." })}
<section class="sec">
  <div class="wrap">
    <div class="filters" role="group" aria-label="Filtrer les résidences">
      <button data-filter="all" aria-pressed="true">Toutes</button>
      <button data-filter="piscine" aria-pressed="false">Piscine privée ou vue piscine</button>
      <button data-filter="mer" aria-pressed="false">Vue mer</button>
      <button data-filter="jardin" aria-pressed="false">Jardin</button>
      <button data-filter="couple" aria-pressed="false">Pour deux</button>
      <button data-filter="famille" aria-pressed="false">En famille</button>
    </div>
    <div class="rlist" style="margin-top:clamp(56px,8vw,110px)">
      ${rooms.map(r => `<article class="ritem" data-tags="${r.tags.join(' ')} ${parseInt(r.guests.split(' ').pop()) >= 4 ? 'famille' : ''}">
        <div class="ritem-media">
          <a class="frame clipin" href="${P}residences/${r.slug}.html">${img(r.cover || r.imgs[0], roomPlain(r), { sizes: '(max-width:860px) 70vw, 40vw', par: 0.06 })}</a>
          <div class="frame clipin">${img(r.hover || r.imgs[1], roomPlain(r) + ', autre vue', { sizes: '(max-width:860px) 30vw, 16vw' })}</div>
        </div>
        <div class="rv">
          <h2 class="display d-l">${roomName(r)}</h2>
          <p class="lead">${r.hook}</p>
          ${specs(r)}
          <div class="ritem-ctas">${book()}<a class="btn btn-line" href="${P}residences/${r.slug}.html">Découvrir ${icon.arrow}</a></div>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>
${breakfastSection()}
<section class="sec ground-paper">
  <div class="wrap grid-2" style="align-items:start">
    <div><p class="eyebrow">Inclus dans chaque séjour</p><h2 class="display d-m">Le confort d'un appartement, <em>les attentions d'un hôtel.</em></h2></div>
    <ul class="check">
      <li>Ménage quotidien</li><li>Wi-Fi haut débit gratuit</li><li>Cuisine ou kitchenette équipée</li><li>Climatisation et TV connectée</li>
      <li>Accès aux deux piscines à débordement</li><li>Parking privé gratuit, accessible PMR</li><li>Lits bébé sur demande</li><li>Conciergerie : restaurants, transferts, excursions</li><li>Arrivée dès 15h00, départ jusqu'à 12h00</li>
    </ul>
  </div>
</section>
${closing('Votre horizon <em>vous attend.</em>')}`,
});

/* ROOM PAGES */
rooms.forEach((r, i) => {
  const next = rooms[(i + 1) % rooms.length], prev = rooms[(i - 1 + rooms.length) % rooms.length];
  const layoutCls = ['g-wide', 'g-2', 'g-3', 'g-3', 'g-2', 'g-2', 'g-2', 'g-wide'];
  page(`residences/${r.slug}.html`, {
    title: `${roomPlain(r)} · Le Tanger`, current: 'residences.html', ogImg: r.imgs[0],
    desc: `${roomPlain(r)} à Le Tanger, ${r.surface} m², ${r.guests} personnes. ${r.hook}`,
    body: () => `
${pageHero({ media: r.hero || r.imgs[0], alt: roomPlain(r), eyebrow: `<a href="${P}residences.html" style="text-decoration:none">Résidences</a> / ${r.surface} m²`, title: roomName(r), lead: r.hook })}
<section class="sec">
  <div class="wrap room-top">
    <div>
      <div class="room-facts">
        <div><b class="num">${r.surface} m²</b><span>Surface</span></div>
        <div><b>${r.guests}</b><span>Personnes</span></div>
        <div><b class="num">${r.baths}</b><span>Salle${r.baths > 1 ? 's' : ''} de bain</span></div>
        <div><b class="num">${r.beds.match(/\d/g).reduce((a, b) => a + +b, 0) > 2 ? '2' : '1'}</b><span>Chambre${r.title.includes('2') || r.title === 'Penthouse' ? 's' : ''}</span></div>
      </div>
      <div class="stack">${r.body.map(p => `<p class="lead" style="color:var(--fg)">${p}</p>`).join('')}</div>
      <p class="muted" style="margin-top:1.4rem">Literie : ${r.beds}.</p>
    </div>
    <aside class="sticky">
      <p class="eyebrow">Équipements</p>
      <ul class="amen">${r.amen.map(a => `<li>${a}</li>`).join('')}</ul>
      <div style="display:flex;gap:16px;margin-top:2rem;flex-wrap:wrap">${book()}<a class="btn btn-ghost" href="${site.whatsapp}" target="_blank" rel="noopener">Une question ?</a></div>
    </aside>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="gal" data-gallery>${r.imgs.slice(1).map((n, k) => `<button class="${layoutCls[k] || 'g-2'} clipin" data-full="${full(n)}" aria-label="Agrandir la photo">${img(n, `${roomPlain(r)}, photo ${k + 2}`, { sizes: '(max-width:860px) 50vw, 33vw' })}</button>`).join('')}</div>
  </div>
</section>
${breakfastSection()}
<section class="sec ground-paper">
  <div class="wrap rules">
    <div><p class="eyebrow">Conditions</p><ul>
      <li><span>Arrivée</span><span>à partir de 15h00</span></li>
      <li><span>Départ</span><span>jusqu'à 12h00</span></li>
      <li><span>Ménage</span><span>quotidien</span></li></ul></div>
    <div><p class="eyebrow">Règles de la maison</p><ul>
      <li><span>Animaux</span><span>admis sur demande</span></li>
      <li><span>Tabac</span><span>non-fumeur à l'intérieur</span></li>
      <li><span>Heures calmes</span><span>20h00 à 10h00</span></li>
      <li><span>Événements</span><span>sur demande</span></li></ul></div>
  </div>
</section>
<section class="sec">
  <div class="wrap">
    <p class="eyebrow">Continuer la visite</p>
    <div class="next-room">${[prev, next].map(x => `<a class="card" href="${P}residences/${x.slug}.html"><div class="frame ratio-32" style="aspect-ratio:3/2">${img(x.cover || x.imgs[0], roomPlain(x), { sizes: '(max-width:860px) 100vw, 50vw' })}</div><h3>${roomName(x)}</h3>${specs(x)}</a>`).join('')}</div>
  </div>
</section>
${closing(`${r.title} <em>${r.sub.toLowerCase()}.</em>`, 'Même lien de réservation pour toutes nos résidences. Choisissez vos dates, nous nous occupons du reste.')}`,
  });
});

/* POOL DAY */
page('pool-day.html', {
  title: 'Pool Day · Le Tanger', current: 'pool-day.html', ogImg: 'pool-8333',
  desc: 'Pool Day à Tanger : deux piscines à débordement face à la mer, de 10h au coucher du soleil, de mai à septembre. 350 MAD adulte, 200 MAD enfant.',
  body: () => `
${pageHero({ media: 'pool-8333', alt: 'Piscine à débordement au crépuscule', eyebrow: 'Pool Day · mai à septembre', title: 'Une journée <em>au bord de l’eau.</em>', lead: "Deux piscines à débordement face à la mer, de 10h jusqu'au coucher du soleil." })}
<section class="sec">
  <div class="wrap grid-2" style="align-items:start">
    <div>
      <h2 class="display d-l rv">Le pass de la journée.</h2>
      <div class="price rv rv-d1"><div><b class="num">350</b><span>MAD · adulte</span></div><div><b class="num">200</b><span>MAD · enfant</span></div></div>
      <p class="lead rv rv-d2">Arrivez quand vous voulez à partir de 10h, restez jusqu'au coucher du soleil. Le pass se règle sur place, à l'arrivée.</p>
      <div class="rv rv-d3" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:2rem">
        <a class="btn btn-primary" href="${site.whatsapp}?text=${encodeURIComponent('Bonjour, je souhaite réserver un Pool Day.')}" target="_blank" rel="noopener">Réserver par WhatsApp</a>
        <a class="btn btn-ghost" href="${site.phoneHref}">Appeler</a>
      </div>
    </div>
    <div class="rv rv-d1">
      <p class="eyebrow">Inclus</p>
      <ul class="check">
        <li>Accès aux deux piscines extérieures à débordement</li>
        <li>Transat, selon disponibilité : premier arrivé, premier servi</li>
        <li>Serviette</li>
        <li>Accès de 10h00 jusqu'au coucher du soleil (<span data-sunset class="num">--:--</span> aujourd'hui)</li>
        <li>Accès au salon de pierre et au feu, sur demande</li>
      </ul>
      <p class="note" style="margin-top:1.2rem">Boissons non incluses. Notre carte est disponible toute la journée.</p>
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="gal" data-gallery>
      ${[['pool-1', 'g-wide'], ['pool-5', 'g-2'], ['pool-salon', 'g-3'], ['pool-dusk-3', 'g-3'], ['drone-pool', 'g-wide'], ['pool-2', 'g-2']].map(([n, c]) => `<button class="${c} clipin" data-full="${full(n)}" aria-label="Agrandir la photo">${img(n, 'Les piscines de Le Tanger', { sizes: '(max-width:860px) 50vw, 40vw' })}</button>`).join('')}
    </div>
  </div>
</section>
<section class="sec ground-paper">
  <div class="wrap how">
    <h2 class="display d-l rv">Comment <em>ça marche.</em></h2>
    <div class="steps steps-side">
      <div class="rv"><h3>Réservez</h3><p>Par téléphone, sur WhatsApp ou directement à l'accueil. Les transats ne se réservent pas&nbsp;: ils sont attribués à l'arrivée.</p></div>
      <div class="rv rv-d1"><h3>Arrivez</h3><p>À partir de 10h00. Pas de code vestimentaire, pas d'âge minimum&nbsp;: venez en famille.</p></div>
      <div class="rv rv-d2"><h3>Restez</h3><p>Jusqu'au coucher du soleil. Le pass se règle sur place, à l'arrivée.</p></div>
    </div>
  </div>
</section>
${barSection()}
<section class="feature rev">
  <div class="feature-media">${img('feu-night-8457', 'Le salon de pierre près de la piscine', { sizes: '(max-width:860px) 100vw, 55vw', par: 0.1 })}</div>
  <div class="feature-copy ground-dark" style="background:var(--night);color:#F3E6D4">
    <p class="eyebrow" style="color:var(--gold)">Après la baignade</p>
    <h2 class="display d-l">Le feu, <em>pour finir la journée.</em></h2>
    <p class="lead" style="color:#C9B39B">Les clients du Pool Day ont accès au salon de pierre et à son feu, sur demande. Thé, café et pâtisseries marocaines à la carte.</p>
    <div style="margin-top:2rem"><a class="btn btn-primary" href="${P}le-feu.html">Le Feu ${icon.arrow}</a></div>
  </div>
</section>
${closing('Rendez-vous <em>au bord de l’eau.</em>', 'Une question sur le Pool Day ? Écrivez-nous sur WhatsApp, nous répondons rapidement. Pour séjourner, réservez en ligne.')}`,
});

/* LE FEU */
page('le-feu.html', {
  title: 'Le Feu · Le Tanger', current: 'le-feu.html', ogImg: 'feu-night-8450',
  desc: 'Un salon de pierre et son feu, à côté de la piscine. Allumé sur demande, toute l’année, pour les résidents et les clients du Pool Day.',
  body: () => `
${pageHero({ media: 'feu-night-8462', alt: 'Le feu dans le salon de pierre', eyebrow: 'Le Feu', title: 'Quand le soleil tombe, <em>le feu peut s’allumer.</em>', lead: 'Un salon de pierre creusé dans le jardin, à côté de la piscine. Toute l’année, sur demande.' })}
<section class="sec ground-dark">
  <div class="wrap statement">
    <h2 class="display d-l rv">Des coussins, la pierre encore tiède, <em>un thé à la menthe.</em></h2>
    <div class="rv rv-d1">
      <p class="lead" style="color:#C9B39B">Le salon est construit en pierre, en contrebas du jardin, face à la mer. Il suffit de demander : nous allumons le feu pour vous, été comme hiver.</p>
      <dl class="facts" style="margin-top:2rem">
        <div><dt>Quand</dt><dd>Toute l'année, sur demande</dd></div>
        <div><dt>Pour qui</dt><dd>Résidents et clients du Pool Day</dd></div>
        <div><dt>Le feu</dt><dd>Offert</dd></div>
        <div><dt>À la carte</dt><dd>Thé, café et pâtisseries marocaines</dd></div>
      </dl>
    </div>
  </div>
</section>
<section class="ground-dark" style="padding-bottom:var(--sec)">
  <div class="wrap">
    <div class="gal" data-gallery>
      ${[['feu-night-8450', 'g-wide'], ['feu-night-8458', 'g-2'], ['feu-night-8453', 'g-3'], ['feu-night-8449', 'g-3'], ['feu-night-8457', 'g-wide'], ['feu-day-1', 'g-2']].map(([n, c]) => `<button class="${c} clipin" data-full="${full(n)}" aria-label="Agrandir la photo">${img(n, 'Le salon de pierre et son feu', { sizes: '(max-width:860px) 50vw, 40vw' })}</button>`).join('')}
    </div>
  </div>
</section>
<section class="feature">
  <div class="feature-media">${img('feu-day-2', 'Le salon de pierre en journée', { sizes: '(max-width:860px) 100vw, 55vw', par: 0.1 })}</div>
  <div class="feature-copy">
    <p class="eyebrow">De jour</p>
    <h2 class="display d-l">Le même salon, <em>à l'ombre du jardin.</em></h2>
    <p class="lead">En journée, le salon de pierre devient un coin de lecture entre deux baignades.</p>
    <div style="margin-top:2rem;display:flex;gap:14px;flex-wrap:wrap"><a class="btn btn-primary" href="${site.whatsapp}?text=${encodeURIComponent('Bonjour, je souhaite profiter du feu ce soir.')}" target="_blank" rel="noopener">Demander le feu</a><a class="btn btn-ghost" href="${P}pool-day.html">Pool Day</a></div>
  </div>
</section>
${closing()}`,
});

/* bar menu helper */
const li = ([n, p, d]) => `<li><span>${n}${d ? `<span class="desc">${d}</span>` : ''}</span><span>${p}</span></li>`;

/* CELEBRATIONS & EVENEMENTS (one page) */
const occasions = [
  ['Anniversaire', 'Une année de plus, à fêter face à la mer. Ballons, gâteau et bougies vous attendent à votre arrivée.', 'celebration-balloons', 'deco-red', 'call'],
  ['Saint-Valentin', 'Une nuit à deux face à la mer, une chambre décorée pour l’occasion.', 'deco-valentin', 'suitepool-palms', 'call'],
  ['Nuit de noces', 'La première nuit, dans une suite ou un penthouse, décorée pour vous accueillir.', 'deco-pink', 'penthouse-1', 'call'],
  ['Baby shower', 'Un après-midi doux pour célébrer l’arrivée du bébé, entre amis et en famille, dans l’un de nos appartements.', 'ph2-2', 'apt2-4', 'Nous écrire'],
  ['Bridal shower', 'Avant le grand jour, une fête entre amis dans un appartement lumineux, avec vue sur la mer.', 'penthouse-3', 'apt2-1', 'Nous écrire'],
];
const occasionRow = ([t, d, a, b, cta]) => `<article class="ritem" id="${t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')}">
        <div class="ritem-media"><div class="frame clipin">${img(a, t, { sizes: '(max-width:860px) 70vw, 40vw' })}</div><div class="frame clipin">${img(b, t, { sizes: '(max-width:860px) 30vw, 16vw' })}</div></div>
        <div class="rv"><h2 class="display d-l">${t}</h2><p class="lead">${d}</p><div class="ritem-ctas" style="margin-top:2rem">${cta === 'call'
          ? `<a class="btn btn-primary" href="${site.phoneHref}">Appeler</a><a class="btn btn-line" href="${site.whatsapp}?text=${encodeURIComponent(`Bonjour, je souhaite organiser : ${t}.`)}" target="_blank" rel="noopener">Nous écrire</a>`
          : `<a class="btn btn-primary" href="${site.whatsapp}?text=${encodeURIComponent(`Bonjour, je souhaite organiser : ${t}.`)}" target="_blank" rel="noopener">${cta}</a><a class="btn btn-line" href="${site.phoneHref}">Appeler</a>`}</div></div>
      </article>`;

page('celebrations.html', {
  title: 'Célébrations & événements · Le Tanger', current: 'celebrations.html', ogImg: 'deco-red',
  desc: 'Anniversaire, Saint-Valentin, nuit de noces, baby shower, bridal shower : célébrez et réunissez vos proches à Le Tanger.',
  body: () => `
${pageHero({ media: 'deco-red', alt: 'Salon décoré de ballons rouges et de roses', eyebrow: 'Célébrations & événements', title: 'Pour les jours <em>qui comptent.</em>', lead: 'Une chambre décorée pour l’occasion, une fête entre amis dans un appartement. Dites-nous ce que vous préparez, nous nous occupons du reste.' })}
<section class="sec">
  <div class="wrap">
    <div class="split-head" id="celebrations"><div><p class="eyebrow">Célébrations</p><h2 class="display d-l">Votre chambre, <em>décorée pour l’occasion.</em></h2></div><p class="lead">Fleurs, pétales de roses, bougies, ballons et gâteau. Tout est prêt à votre arrivée. Appelez-nous avec l’occasion, la date et vos envies.</p></div>
    <div class="rlist">
      ${occasions.slice(0, 3).map(occasionRow).join('')}
    </div>
    <div class="split-head" id="evenements" style="margin-top:clamp(110px,14vw,200px)"><div><p class="eyebrow">Événements</p><h2 class="display d-l">Réunir ceux <em>qu’on aime.</em></h2></div><p class="lead">Baby shower et bridal shower, dans nos appartements lumineux face à la mer.</p></div>
    <div class="rlist">
      ${occasions.slice(3).map(occasionRow).join('')}
    </div>
  </div>
</section>
${closing('Parlons <em>de votre séjour.</em>', 'Appelez-nous ou écrivez-nous sur WhatsApp avec l’occasion, la date et vos envies.')}`,
});

/* COLLECTION PRIVEE DE TELEPHONES */
const phoneStories = [
  {
    im: 'phone-magneto', era: 'Fin du XIXe – début du XXe siècle', title: 'Le téléphone mural <em>à manivelle.</em>',
    paras: [
      'Le plus ancien de la collection. Une caisse en bois accrochée au mur, deux sonneries en métal sur le dessus, un cornet pour parler et un écouteur que l’on décroche pour écouter.',
      'Pas encore de cadran. Pour appeler, on tournait la manivelle : elle actionnait une petite génératrice, la « magnéto », qui faisait sonner le central. Une opératrice, l’une des « demoiselles du téléphone », répondait, demandait le nom du correspondant et branchait la communication à la main, fiche par fiche.',
    ],
    facts: [['Usage', 'Mural'], ['Appel', 'Manivelle et opératrice'], ['Matière', 'Bois et métal']],
  },
  {
    im: 'phone-bakelite', era: 'Années 1950', title: 'Le téléphone de bureau <em>à cadran.</em>',
    paras: [
      'Avec le cadran rotatif, l’abonné compose lui-même son numéro : le central automatique remplace peu à peu l’opératrice. À Paris, le premier central automatique ouvre en 1928, et il faudra attendre 1979 pour que tout le réseau français fonctionne sans opératrice.',
      'Les touches alignées à l’avant permettaient de passer d’une ligne à l’autre ou de mettre un appel en attente. Un appareil de bureau, lourd et robuste, pensé pour durer des décennies.',
    ],
    facts: [['Usage', 'Bureau'], ['Appel', 'Cadran rotatif'], ['Particularité', 'Touches de ligne']],
  },
  {
    im: 'phone-onyx', era: 'Années 1960 – 1970', title: 'Le téléphone <em>en onyx et laiton.</em>',
    paras: [
      'Un clin d’œil à la Belle Époque : le combiné repose sur une fourche en laiton, comme sur les appareils du début du siècle, mais il cache un cadran moderne derrière une façade en onyx veiné.',
      'Ces modèles d’apparat étaient faits pour être vus. Ils trônaient sur une console ou un bureau, autant objets de décoration que téléphones.',
    ],
    facts: [['Usage', 'Salon'], ['Appel', 'Cadran rotatif'], ['Matière', 'Onyx et laiton']],
  },
];

page('collection-telephones.html', {
  title: 'Collection privée de téléphones · Le Tanger', current: 'collection-telephones.html', ogImg: 'phone-onyx',
  desc: 'Des téléphones muraux à manivelle aux cadrans des années 1950 : la collection privée de téléphones anciens exposée à la réception de Le Tanger.',
  body: () => `
${pageHero({ media: 'phone-onyx', alt: 'Téléphone en onyx et laiton de la collection', eyebrow: 'Collection privée — Khalid Bennani', title: 'Une histoire <em>du téléphone.</em>', lead: 'De la manivelle au cadran, une collection de téléphones anciens réunie au fil des années et exposée dans le salon de réception.' })}
<section class="sec">
  <div class="wrap phones-head" style="margin-bottom:0">
    <div>
      <p class="eyebrow rv">Dans le salon de réception</p>
      <h2 class="display d-l rv rv-d1">Collection privée <em>de téléphones.</em></h2>
      <p class="lead rv rv-d2" style="margin-top:1.6rem">Sur les étagères en bois de la réception, chaque appareil raconte une étape de l’histoire du téléphone : l’époque des opératrices, l’arrivée du cadran, puis les modèles de salon. La collection est ouverte à tous, résidents comme visiteurs : passez la voir, et demandez-nous de vous en raconter l’histoire.</p>
    </div>
    <div class="frame clipin phones-hero">${img('phone-sculpture', 'Sculpture en laiton et téléphones anciens dans le salon de réception', { sizes: '(max-width:860px) 100vw, 34vw' })}</div>
  </div>
</section>
${phoneStories.map((x, k) => `<section class="feature${k % 2 ? ' rev' : ''} phone-story">
  <div class="feature-media">${img(x.im, x.title.replace(/<[^>]+>/g, ''), { sizes: '(max-width:860px) 100vw, 55vw', par: 0.08 })}</div>
  <div class="feature-copy">
    <p class="eyebrow rv">${String(k + 1).padStart(2, '0')} · ${x.era}</p>
    <h2 class="display d-l rv rv-d1">${x.title}</h2>
    ${x.paras.map((t, j) => `<p class="rv rv-d${j + 2}" style="margin-top:${j ? '1rem' : '1.6rem'}">${t}</p>`).join('')}
    <dl class="phone-facts rv rv-d3">${x.facts.map(([a, b]) => `<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>
  </div>
</section>`).join('')}
<section class="sec ground-paper">
  <div class="wrap">
    <p class="eyebrow rv">Repères</p>
    <h2 class="display d-l rv rv-d1" style="margin-bottom:clamp(40px,5vw,72px)">Du central manuel <em>au cadran.</em></h2>
    <ol class="timeline">
      <li class="rv"><b class="num">1876</b><span>Alexander Graham Bell dépose le brevet du téléphone.</span></li>
      <li class="rv rv-d1"><b class="num">1879</b><span>Ouverture du premier central téléphonique à Paris. Les communications passent par des opératrices.</span></li>
      <li class="rv rv-d2"><b class="num">1928</b><span>Premier central automatique à Paris : l’abonné compose lui-même son numéro au cadran.</span></li>
      <li class="rv rv-d3"><b class="num">1979</b><span>Le réseau français devient entièrement automatique. Fin de l’époque des opératrices.</span></li>
    </ol>
  </div>
</section>
${closing('Venez la voir <em>à la réception.</em>', 'La collection est exposée dans le salon de réception et ouverte à tous, que vous séjourniez chez nous ou non. Passez la voir, nous serons ravis de vous la faire découvrir.')}`,
});

/* CONCIERGERIE */
page('conciergerie.html', {
  title: 'Conciergerie · Le Tanger', current: 'conciergerie.html', ogImg: 'drone-sunset',
  desc: 'Dîners privés, réservations de restaurants, transferts aéroport, excursions, spa et hammam : la conciergerie de Le Tanger organise votre séjour à Tanger. Service inclus.',
  body: () => `
${pageHero({ media: 'drone-sunset', alt: 'La résidence et le détroit au coucher du soleil', eyebrow: 'Conciergerie', title: 'Tanger, <em>on s’occupe du reste.</em>', lead: 'Une table, un chauffeur, une excursion, un dîner privé. Dites-nous ce qui vous ferait plaisir, nous organisons.' })}
<section class="sec">
  <div class="wrap">
    <div class="split-head"><div><p class="eyebrow rv">Inclus dans votre séjour</p><h2 class="display d-l rv rv-d1">Un seul message, <em>tout est organisé.</em></h2></div><p class="lead rv rv-d2">Notre conciergerie connaît Tanger par cœur. Elle réserve, organise et confirme pour vous, sans frais : le service est compris dans le prix de votre logement.</p></div>
    <ol class="svc-list">
      ${conciergeServices.map(([t, d], k) => `<li class="rv"><span class="num">${String(k + 1).padStart(2, '0')}</span><h3>${t}</h3><p>${d}</p></li>`).join('')}
    </ol>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="wrap svc-strip">
    <div class="frame clipin">${img('drone-coast', 'La côte de Tanger vue du ciel', { sizes: '(max-width:860px) 100vw, 40vw' })}</div>
    <div class="frame clipin">${img('feu-night-8450', 'Une soirée autour du feu à la résidence', { sizes: '(max-width:860px) 100vw, 30vw' })}</div>
    <div class="frame clipin">${img('ext-entree', 'L’entrée de la résidence le soir', { sizes: '(max-width:860px) 100vw, 30vw' })}</div>
  </div>
</section>
<section class="sec ground-paper">
  <div class="wrap">
    <div class="split-head"><div><p class="eyebrow rv">Comment demander</p><h2 class="display d-l rv rv-d1">Comme <em>vous préférez.</em></h2></div><p class="lead rv rv-d2">Le plus tôt est le mieux, surtout pour les excursions et les transferts. Nous vous confirmons chaque réservation.</p></div>
    <div class="steps">
      <div class="rv"><h3>WhatsApp</h3><p>Écrivez-nous au ${site.phone}, nous répondons rapidement.</p><a class="btn btn-primary" style="margin-top:1.4rem" href="${site.whatsapp}?text=${encodeURIComponent('Bonjour, je souhaite faire une demande à la conciergerie :')}" target="_blank" rel="noopener">Écrire sur WhatsApp</a></div>
      <div class="rv rv-d1"><h3>Téléphone</h3><p>Appelez la réception, qui s’occupe de tout.</p><a class="btn btn-line" style="margin-top:1.4rem" href="${site.phoneHref}">Appeler le ${site.phone}</a></div>
      <div class="rv rv-d2"><h3>Room service</h3><p>Depuis votre logement, demandez simplement au room service.</p></div>
    </div>
  </div>
</section>
${closing('Votre séjour, <em>sur mesure.</em>')}`,
});

/* GALERIE */
const galleryList = ['hero-pool-sunset', 'penthouse-1', 'ext-dusk-palms', 'feu-night-8450', 'pool-1', 'apt2-1', 'drone-pool', 'suitepool-1', 'ext-night-palms', 'penthouse-3', 'pool-dusk-2', 'apt1pano-1', 'drone-dusk-1', 'feu-night-8453', 'ext-entree', 'apt2-4', 'pool-salon', 'suitegarden-1', 'drone-golden', 'penthouse-4', 'ext-palms-day', 'pool-dusk-3', 'apt1sea-2', 'drone-sunset', 'studio-1', 'ext-lounge-1', 'feu-night-8462', 'pool-4', 'apt1pool-day', 'drone-sea-1', 'ext-night-palms2', 'ext-phone', 'pool-sunset-2'];
page('galerie.html', {
  title: 'Galerie · Le Tanger', current: 'galerie.html',
  desc: 'Les résidences, les piscines, le feu et la lumière de Tanger en images.',
  body: () => `
${pageHero({ media: 'drone-pool-clean', alt: 'La résidence et ses piscines vues du ciel', eyebrow: 'Galerie', title: 'Voyage <em>en images.</em>', short: true })}
<section class="sec"><div class="wrap">${[3, 2].map(cols => `<div class="stagger s${cols}" data-gallery>${[...Array(cols).keys()].map(c => `<div class="st-col">${galleryList.map((n, k) => [n, k]).filter(([, k]) => k % cols === c).map(([n, k]) => `<button data-full="${full(n)}" class="rv r${k % 5}" style="aspect-ratio:${webpSize(n).join('/')}" aria-label="Agrandir la photo">${img(n, 'Le Tanger', { sizes: cols === 3 ? '33vw' : '50vw' })}</button>`).join('')}</div>`).join('')}</div>`).join('')}</div></section>
${closing()}`,
});

/* A PROPOS / LE LIEU */
page('a-propos.html', {
  title: 'Le lieu · Le Tanger', current: 'a-propos.html', ogImg: 'drone-dusk-1',
  desc: 'Le Tanger Résidence Hôtelière : entre mer et collines, face au Cap Malabata et au détroit de Gibraltar, à 8 minutes du centre de Tanger.',
  body: () => `
${pageHero({ media: 'drone-dusk-1', video: 'dusk-coast.mp4', alt: 'La côte au crépuscule', eyebrow: 'Le lieu', title: 'Entre mer <em>et collines.</em>', lead: "Une résidence nichée entre les collines verdoyantes et la Méditerranée, face au Cap Malabata." })}
<section class="sec">
  <div class="wrap statement">
    <h2 class="display d-l rv">L'indépendance d'un appartement. <em>Les attentions d'un hôtel.</em></h2>
    <p class="lead rv rv-d1">Le Tanger réunit des appartements haut de gamme, entièrement équipés, et les services d'un hôtel : ménage quotidien, assistance dédiée, accueil chaleureux. Que vous voyagiez en couple, en famille ou pour affaires, nous adaptons notre service à votre séjour.</p>
  </div>
</section>
<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="mosaic mosaic-land">
      <div class="frame m1 clipin">${img('drone-pool', 'La résidence et sa piscine vues du ciel', { sizes: '(max-width:860px) 100vw, 58vw' })}</div>
      <div class="frame m2 clipin">${img('ext-entree', "L'entrée de la résidence le soir", { sizes: '(max-width:860px) 60vw, 40vw' })}</div>
      <div class="frame m3 clipin">${img('ext-phone', 'Détail du salon de réception', { sizes: '(max-width:860px) 40vw, 33vw' })}</div>
      <div class="frame m4 clipin">${img('ext-lounge-1', 'Le salon de réception', { sizes: '(max-width:860px) 100vw, 50vw' })}</div>
    </div>
  </div>
</section>
${phonesSection()}
<section class="sec ground-paper">
  <div class="wrap grid-2" style="align-items:start">
    <div><p class="eyebrow">Pourquoi Le Tanger</p><h2 class="display d-l">L'art de séjourner <em>à Tanger.</em></h2></div>
    <dl class="facts">
      <div><dt>Emplacement</dt><dd>Vue panoramique sur la Méditerranée et le Cap Malabata</dd></div>
      <div><dt>Confort</dt><dd>Appartements spacieux et entièrement équipés</dd></div>
      <div><dt>Détente</dt><dd>2 piscines à débordement face à la mer</dd></div>
      <div><dt>Service</dt><dd>Ménage quotidien et assistance dédiée</dd></div>
      <div><dt>Accès</dt><dd>≈ 8 min du centre, parking privé gratuit</dd></div>
    </dl>
  </div>
</section>
<section class="sec">
  <div class="wrap grid-2" style="align-items:start">
    <div><h2 class="display d-l">Questions <em>fréquentes.</em></h2><p class="lead" style="margin-top:1.4rem">Une autre question ? <a href="${P}contact.html">Écrivez-nous</a>.</p></div>
    <div class="faq">${faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div>
  </div>
</section>
${closing()}`,
});

/* CONTACT */
page('contact.html', {
  title: 'Contact · Le Tanger', current: 'contact.html', light: true,
  desc: 'Contactez Le Tanger Résidence Hôtelière par WhatsApp, téléphone ou email.',
  body: () => `
<section class="sec" style="padding-top:clamp(140px,16vw,220px)">
  <div class="wrap contact-grid">
    <div>
      <p class="eyebrow">Contact</p>
      <h1 class="display d-xl">Parlons <em>de votre séjour.</em></h1>
      <ul class="clist" style="margin-top:2.4rem">
        <li><small>WhatsApp et téléphone</small><a href="${site.phoneHref}">${site.phone}</a></li>
        <li><small>Téléphone fixe</small><a href="${site.phone2Href}">${site.phone2}</a></li>
        <li><small>Email</small><a href="mailto:${site.email}">${site.email}</a></li>
        <li><small>Adresse</small><a href="${site.maps}" target="_blank" rel="noopener">${site.address}</a></li>
      </ul>
    </div>
    <div>
      <form class="form" data-wa="Bonjour Le Tanger, voici ma demande :">
        <label>Nom<input name="nom" data-label="Nom" required autocomplete="name"></label>
        <label>Téléphone<input name="tel" data-label="Téléphone" type="tel" autocomplete="tel"></label>
        <label class="full">Sujet<select name="sujet" data-label="Sujet"><option>Séjour</option><option>Pool Day</option><option>Le Feu</option><option>Célébration</option><option>Événement</option><option>Autre</option></select></label>
        <label>Arrivée<input name="arrivee" data-label="Arrivée" type="date"></label>
        <label>Départ<input name="depart" data-label="Départ" type="date"></label>
        <label class="full">Message<textarea name="message" data-label="Message" required></textarea></label>
        <div class="full" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap"><button class="btn btn-primary" type="submit">Envoyer sur WhatsApp</button><span class="note">Votre message s'ouvre dans WhatsApp, prêt à être envoyé.</span></div>
      </form>
    </div>
  </div>
</section>
<section class="sec" style="padding-top:0"><div class="wrap"><iframe class="map" src="${site.mapEmbed}" loading="lazy" title="Carte : Le Tanger Résidence Hôtelière" referrerpolicy="no-referrer-when-downgrade"></iframe></div></section>
${closing()}`,
});

/* BLOG */
page('blog.html', {
  title: 'Journal · Le Tanger', light: true,
  desc: 'Le journal de Le Tanger : Tanger, la Méditerranée et l’art de séjourner.',
  body: () => `
<section class="sec" style="padding-top:clamp(140px,16vw,220px)"><div class="wrap blog-empty"><p class="eyebrow">Journal</p><h1 class="display d-xl">Bientôt, <em>nos histoires.</em></h1><p class="lead" style="margin-top:1.6rem">Tanger, la Méditerranée, nos adresses préférées. Les premiers articles arrivent très vite.</p><div style="margin-top:2.4rem"><a class="btn btn-ghost" href="${site.social.instagram}" target="_blank" rel="noopener">Suivre sur Instagram</a></div></div></section>
${closing()}`,
});

/* LEGAL */
const legal = (path, title, paras) => page(path, {
  title: `${title} · Le Tanger`, light: true, desc: title,
  body: () => `<section class="sec" style="padding-top:clamp(140px,16vw,220px)"><div class="wrap" style="max-width:820px"><h1 class="display d-l">${title}</h1><div class="stack" style="margin-top:2rem">${paras.map(p => `<p>${p}</p>`).join('')}</div></div></section>`,
});
legal('confidentialite.html', 'Politique de confidentialité', [
  "Ce site ne dépose pas de cookies publicitaires. Les messages envoyés depuis le formulaire de contact s'ouvrent dans WhatsApp : aucune donnée n'est stockée sur ce site.",
  'Les réservations sont traitées par notre moteur de réservation partenaire (direct-book.com), soumis à sa propre politique de confidentialité.',
  `Pour toute question relative à vos données : ${site.email}.`,
]);
legal('conditions.html', 'Conditions générales', [
  "Arrivée à partir de 15h00, départ jusqu'à 12h00. Logements non-fumeurs à l'intérieur. Animaux admis sur demande. Événements dans les logements sur demande uniquement. Heures calmes de 20h00 à 10h00.",
  'Les conditions tarifaires, d’annulation et de paiement de chaque réservation sont indiquées lors de la réservation en ligne.',
  `Le Tanger Résidence Hôtelière, ${site.address}. ${site.email}.`,
]);

/* ---------- write ---------- */
for (const p of pages) {
  const out = join(ROOT, p.path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, layout(p));
}
console.log(`built ${pages.length} pages`);

writeFileSync(join(ROOT, 'evenements.html'), '<!doctype html><meta charset="utf-8"><title>Événements · Le Tanger</title><meta http-equiv="refresh" content="0; url=celebrations.html#evenements"><link rel="canonical" href="celebrations.html#evenements"><a href="celebrations.html#evenements">Célébrations & événements</a>');

/* old penthouse URLs (bloc) keep working */
for (const n of [2, 3]) writeFileSync(join(ROOT, `residences/penthouse-piscine-privee-bloc-${n}.html`), `<!doctype html><meta charset="utf-8"><title>Penthouse · Le Tanger</title><meta http-equiv="refresh" content="0; url=penthouse-piscine-privee-pavillon-${n}.html"><link rel="canonical" href="penthouse-piscine-privee-pavillon-${n}.html"><a href="penthouse-piscine-privee-pavillon-${n}.html">Penthouse piscine privée · Pavillon ${n}</a>`);
