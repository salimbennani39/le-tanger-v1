// Static site generator for Le Tanger. Run from /site:  node src/build.mjs
import { writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, rooms, drinks, faq, breakfast } from './data.mjs';
import { readFileSync } from 'node:fs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOGO = readFileSync(join(ROOT, 'src/logo-inline.svg'), 'utf8');
cpSync(join(ROOT, 'src/assets/css'), join(ROOT, 'assets/css'), { recursive: true });
cpSync(join(ROOT, 'src/assets/js'), join(ROOT, 'assets/js'), { recursive: true });

/* ---------- helpers ---------- */
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let P = ''; // relative prefix for current page
const img = (name, alt, { sizes = '100vw', eager = false, par = null, cls = '' } = {}) =>
  `<img src="${P}assets/img/${name}-1200.webp" srcset="${P}assets/img/${name}-1200.webp 1200w, ${P}assets/img/${name}-2400.webp 2400w" sizes="${sizes}" alt="${esc(alt)}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"${par ? ` data-par="${par}"` : ''}${cls ? ` class="${cls}"` : ''}>`;
const full = name => `${P}assets/img/${name}-2400.webp`;
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
  ['cafe.html', 'Le Café'],
  ['celebrations.html', 'Célébrations & événements'],
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
<link rel="stylesheet" href="${P}assets/css/styles.css">
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
<script src="${P}assets/js/main.js" defer></script>
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
        <li><a href="${P}cafe.html">Le Tanger Café</a></li>
        <li><a href="${P}celebrations.html">Célébrations & événements</a></li></ul></div>
      <div><h4>Découvrir</h4><ul>
        <li><a href="${P}a-propos.html">Le lieu</a></li>
        <li><a href="${P}galerie.html">Galerie</a></li>
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
    <h2 class="display d-l rv rv-d1">Une journée au bord de <em>l'infini.</em></h2>
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

<section class="sec ground-dusk" data-tone-section="dusk">
  <div class="wrap">
    <div class="split-head">
      <div><p class="soon rv">Ouverture prochaine</p><h2 class="display d-xl rv rv-d1">Le Tanger <em>Café</em></h2></div>
      <div class="rv rv-d2"><p class="lead">Un salon marocain baigné de lumière, une salle ouverte sur le jardin, un bar à mocktails. Thé, café, pâtisseries marocaines, msemmen et harcha, du matin au soir.</p><a class="btn btn-line" style="margin-top:1.4rem" href="${P}cafe.html">Découvrir le café ${icon.arrow}</a></div>
    </div>
    <div class="mosaic mosaic-2r">
      <div class="frame m1 clipin">${img('cafe-1', 'Projet du Tanger Café, la salle', { sizes: '(max-width:860px) 100vw, 58vw' })}</div>
      <div class="frame m2 clipin">${img('cafe-2', 'Projet du bar à mocktails', { sizes: '(max-width:860px) 60vw, 40vw' })}</div>
      <div class="frame m3 clipin">${img('cafe-3', 'Projet du salon marocain baigné de soleil', { sizes: '(max-width:860px) 40vw, 33vw' })}</div>
      <div class="frame m4 clipin">${img('cafe-4', 'Projet du salon marocain en soirée', { sizes: '(max-width:860px) 100vw, 50vw' })}</div>
      <div class="frame m5 clipin">${img('cafe-terrace', 'Projet de la terrasse du café', { sizes: '(max-width:860px) 100vw, 60vw' })}</div>
    </div>
    <p class="note" style="margin-top:18px">Images de projet. Le café ouvre prochainement.</p>
  </div>
</section>

<section class="sec" data-tone-section="dusk">
  <div class="wrap">
    <div class="split-head"><div><p class="eyebrow rv">Vos moments</p><h2 class="display d-l rv rv-d1">Pour les jours <em>qui comptent.</em></h2></div><p class="lead rv rv-d2">Un anniversaire, une nuit de noces, une Saint-Valentin. Une baby shower, une bridal shower, une séance de yoga au lever du jour.</p></div>
    <div class="duo">
      <a href="${P}celebrations.html#celebrations" class="rv"><div class="frame">${img('celebration-balloons', 'Ballons sur la piscine au coucher du soleil', { sizes: '(max-width:860px) 100vw, 50vw' })}</div><h3>Célébrations</h3><p class="muted">Nous décorons votre chambre pour l'occasion.</p></a>
      <a href="${P}celebrations.html#evenements" class="rv rv-d2 duo-b"><div class="frame">${img('ph2-2', 'Salon lumineux d’un penthouse', { sizes: '(max-width:860px) 100vw, 50vw' })}</div><h3>Événements</h3><p class="muted">Baby shower, bridal shower, yoga.</p></a>
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
      <a class="btn btn-line" style="margin-top:1.8rem;color:#FBF3E8" href="${P}a-propos.html">Découvrir le lieu ${icon.arrow}</a>
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
      <li>Accès aux deux piscines à débordement</li><li>Parking privé gratuit, accessible PMR</li><li>Lits bébé sur demande</li><li>Arrivée dès 15h00, départ jusqu'à 12h00</li>
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
${pageHero({ media: 'pool-8333', alt: 'Piscine à débordement au crépuscule', eyebrow: 'Pool Day · mai à septembre', title: 'Une journée <em>au bord de l’infini.</em>', lead: "Deux piscines à débordement face à la mer, de 10h jusqu'au coucher du soleil." })}
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
      ${[['pool-1', 'g-wide'], ['pool-5', 'g-2'], ['pool-salon', 'g-3'], ['pool-3', 'g-3'], ['drone-pool', 'g-wide'], ['pool-2', 'g-2']].map(([n, c]) => `<button class="${c} clipin" data-full="${full(n)}" aria-label="Agrandir la photo">${img(n, 'Les piscines de Le Tanger', { sizes: '(max-width:860px) 50vw, 40vw' })}</button>`).join('')}
    </div>
  </div>
</section>
<section class="sec ground-paper">
  <div class="wrap">
    <h2 class="display d-l" style="margin-bottom:clamp(40px,5vw,72px)">Comment ça marche.</h2>
    <div class="steps">
      <div class="rv"><h3>Réservez</h3><p>Par téléphone, sur WhatsApp ou directement à l'accueil. Les transats ne se réservent pas : ils sont attribués à l'arrivée.</p></div>
      <div class="rv rv-d1"><h3>Arrivez</h3><p>À partir de 10h00. Pas de code vestimentaire, pas d'âge minimum : venez en famille.</p></div>
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

/* CAFE */
const li = ([n, p, d]) => `<li><span>${n}${d ? `<span class="desc">${d}</span>` : ''}</span><span>${p}</span></li>`;
page('cafe.html', {
  title: 'Le Tanger Café · Ouverture prochaine', current: 'cafe.html', ogImg: 'cafe-3',
  desc: 'Le Tanger Café ouvre prochainement : salon marocain, salle ouverte sur le jardin et bar à mocktails. Carte des boissons disponible toute la journée.',
  body: () => `
${pageHero({ media: 'cafe-1', alt: 'Projet du Tanger Café', tag: 'Ouverture prochaine', title: 'Le Tanger <em>Café</em>', lead: 'Thé, café, pâtisseries marocaines, msemmen, harcha. Un salon marocain, une salle ouverte sur le jardin, un bar à mocktails.' })}
<section class="sec">
  <div class="wrap">
    <div class="split-head"><h2 class="display d-l rv">Trois ambiances, <em>du matin au soir.</em></h2><p class="lead rv rv-d1">Le café est en cours d'aménagement. Voici le projet, tel qu'il prendra vie.</p></div>
    <div class="mosaic">
      <div class="frame m1 clipin">${img('cafe-3', 'Le salon marocain, en journée', { sizes: '(max-width:860px) 100vw, 58vw' })}</div>
      <div class="frame m2 clipin">${img('cafe-2', 'Le bar à mocktails', { sizes: '(max-width:860px) 60vw, 40vw' })}</div>
      <div class="frame m3 clipin">${img('cafe-4', 'Le salon marocain, en soirée', { sizes: '(max-width:860px) 40vw, 33vw' })}</div>
      <div class="frame m4 clipin">${img('cafe-5', "L'entrée du café et le bar", { sizes: '(max-width:860px) 100vw, 50vw' })}</div>
    </div>
    <p class="note" style="margin-top:18px">Images de projet, non contractuelles.</p>
  </div>
</section>
${barSection()}
<section class="feature rev">
  <div class="feature-media">${img('cafe-6', 'Projet de la terrasse du café', { sizes: '(max-width:860px) 100vw, 55vw', par: 0.1 })}</div>
  <div class="feature-copy">
    <p class="eyebrow">Le menu</p>
    <h2 class="display d-l">Une carte courte, <em>tout en douceur.</em></h2>
    <p class="lead">Thé, café, cheesecake, cacahuètes, pâtisseries marocaines, harcha, msemmen. Le menu complet sera publié à l'ouverture.</p>
  </div>
</section>
${closing()}`,
});

/* CELEBRATIONS & EVENEMENTS (one page) */
const occasions = [
  ['Anniversaire', 'Une année de plus, à fêter face à la mer. Ballons, gâteau et bougies vous attendent à votre arrivée.', 'celebration-balloons', 'deco-red', 'call'],
  ['Saint-Valentin', 'Une nuit à deux face à la mer, une chambre décorée pour l’occasion.', 'deco-valentin', 'suitepool-palms', 'call'],
  ['Nuit de noces', 'La première nuit, dans une suite ou un penthouse, décorée pour vous accueillir.', 'deco-pink', 'penthouse-1', 'call'],
  ['Baby shower', 'Un après-midi doux pour célébrer l’arrivée de bébé, entre amies et en famille, dans l’un de nos appartements.', 'ph2-2', 'apt2-4', 'Nous écrire'],
  ['Bridal shower', 'Avant le grand jour, une fête entre amies dans un appartement lumineux, avec vue sur la mer.', 'penthouse-3', 'apt2-1', 'Nous écrire'],
  ['Yoga', 'Nous accueillons des séances de yoga animées par un studio partenaire, qui apporte son propre matériel, dans l’espace du café. Sur demande, selon disponibilité.', 'cafe-1', 'ext-garden', 'Demander une date'],
];
const occasionRow = ([t, d, a, b, cta]) => `<article class="ritem" id="${t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')}">
        <div class="ritem-media"><div class="frame clipin">${img(a, t, { sizes: '(max-width:860px) 70vw, 40vw' })}</div><div class="frame clipin">${img(b, t, { sizes: '(max-width:860px) 30vw, 16vw' })}</div></div>
        <div class="rv"><h2 class="display d-l">${t}</h2><p class="lead">${d}</p><div class="ritem-ctas" style="margin-top:2rem">${cta === 'call'
          ? `<a class="btn btn-primary" href="${site.phoneHref}">Appeler</a><a class="btn btn-line" href="${site.whatsapp}?text=${encodeURIComponent(`Bonjour, je souhaite organiser : ${t}.`)}" target="_blank" rel="noopener">Nous écrire</a>`
          : `<a class="btn btn-primary" href="${site.whatsapp}?text=${encodeURIComponent(`Bonjour, je souhaite organiser : ${t}.`)}" target="_blank" rel="noopener">${cta}</a><a class="btn btn-line" href="${site.phoneHref}">Appeler</a>`}</div></div>
      </article>`;

page('celebrations.html', {
  title: 'Célébrations & événements · Le Tanger', current: 'celebrations.html', ogImg: 'deco-red',
  desc: 'Anniversaire, Saint-Valentin, nuit de noces, baby shower, bridal shower, yoga : célébrez et réunissez vos proches à Le Tanger.',
  body: () => `
${pageHero({ media: 'deco-red', alt: 'Salon décoré de ballons rouges et de roses', eyebrow: 'Célébrations & événements', title: 'Pour les jours <em>qui comptent.</em>', lead: 'Une chambre décorée pour l’occasion, une fête entre amies dans un appartement, une séance de yoga dans l’espace du café. Dites-nous ce que vous préparez, nous nous occupons du reste.' })}
<section class="sec">
  <div class="wrap">
    <div class="split-head" id="celebrations"><div><p class="eyebrow">Célébrations</p><h2 class="display d-l">Votre chambre, <em>décorée pour l’occasion.</em></h2></div><p class="lead">Fleurs, pétales de roses, bougies, ballons et gâteau. Tout est prêt à votre arrivée. Appelez-nous avec l’occasion, la date et vos envies.</p></div>
    <div class="rlist">
      ${occasions.slice(0, 3).map(occasionRow).join('')}
    </div>
    <div class="split-head" id="evenements" style="margin-top:clamp(110px,14vw,200px)"><div><p class="eyebrow">Événements</p><h2 class="display d-l">Réunir ceux <em>qu’on aime.</em></h2></div><p class="lead">Baby shower et bridal shower dans nos appartements, séances de yoga dans l’espace du café.</p></div>
    <div class="rlist">
      ${occasions.slice(3).map(occasionRow).join('')}
    </div>
    <p class="note" style="margin-top:4rem">L’image du yoga montre le projet du Tanger Café, qui ouvre prochainement.</p>
  </div>
</section>
${closing('Parlons <em>de votre projet.</em>', 'Appelez-nous ou écrivez-nous sur WhatsApp avec l’occasion, la date et vos envies.')}`,
});

/* GALERIE */
const galleryList = ['hero-pool-sunset', 'penthouse-1', 'ext-dusk-palms', 'feu-night-8450', 'pool-1', 'apt2-1', 'drone-pool', 'cafe-3', 'suitepool-1', 'ext-night-palms', 'penthouse-3', 'pool-dusk-2', 'apt1pano-1', 'drone-dusk-1', 'feu-night-8453', 'ext-entree', 'apt2-4', 'pool-salon', 'suitegarden-1', 'drone-golden', 'cafe-2', 'penthouse-4', 'ext-palms-day', 'pool-dusk-3', 'apt1sea-2', 'drone-sunset', 'studio-1', 'ext-lounge-1', 'feu-night-8462', 'pool-4', 'apt1pool-day', 'drone-sea-1', 'ext-night-palms2', 'ext-phone', 'cafe-4', 'pool-sunset-2'];
page('galerie.html', {
  title: 'Galerie · Le Tanger', current: 'galerie.html',
  desc: 'Les résidences, les piscines, le feu et la lumière de Tanger en images.',
  body: () => `
${pageHero({ media: 'drone-pool-clean', alt: 'La résidence et ses piscines vues du ciel', eyebrow: 'Galerie', title: 'Voyage <em>en images.</em>', short: true })}
<section class="sec"><div class="wrap">${[3, 2].map(cols => `<div class="stagger s${cols}" data-gallery>${[...Array(cols).keys()].map(c => `<div class="st-col">${galleryList.map((n, k) => [n, k]).filter(([, k]) => k % cols === c).map(([n, k]) => `<button data-full="${full(n)}" class="rv r${k % 5}" aria-label="Agrandir la photo">${img(n, 'Le Tanger', { sizes: cols === 3 ? '33vw' : '50vw' })}</button>`).join('')}</div>`).join('')}</div>`).join('')}</div></section>
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
    <div class="mosaic">
      <div class="frame m1 clipin">${img('drone-pool', 'La résidence et sa piscine vues du ciel', { sizes: '(max-width:860px) 100vw, 58vw' })}</div>
      <div class="frame m2 clipin">${img('ext-entree', "L'entrée de la résidence le soir", { sizes: '(max-width:860px) 60vw, 40vw' })}</div>
      <div class="frame m3 clipin">${img('ext-phone', 'Détail du salon de réception', { sizes: '(max-width:860px) 40vw, 33vw' })}</div>
      <div class="frame m4 clipin">${img('ext-lounge-1', 'Le salon de réception', { sizes: '(max-width:860px) 100vw, 50vw' })}</div>
    </div>
  </div>
</section>
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
