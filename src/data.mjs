// All site content lives here. Edit text, rooms or menus, then run: node src/build.mjs

export const site = {
  name: 'Le Tanger',
  full: 'Le Tanger Résidence Hôtelière',
  address: "Le Tanger by M'nar Palm, Tanger 90000, Maroc",
  phone: '+212 656 103 761',
  phoneHref: 'tel:+212656103761',
  phone2: '+212 808 534 327',
  phone2Href: 'tel:+212808534327',
  email: 'direction@letanger.com',
  whatsapp: 'https://wa.me/212656103761',
  maps: 'https://www.google.com/maps?cid=6150718654187639803',
  mapEmbed: 'https://www.google.com/maps?q=Le+Tanger+R%C3%A9sidence+H%C3%B4teli%C3%A8re,+Tanger&output=embed',
  social: {
    instagram: 'https://www.instagram.com/le.tanger/',
    facebook: 'https://www.facebook.com/p/Le-Tanger-R%C3%A9sidence-H%C3%B4teli%C3%A8re-100054278330322/',
    snapchat: 'https://www.snapchat.com/@letanger2025',
  },
};

const common = [
  'Climatisation',
  'Wi-Fi haut débit gratuit',
  'TV écran plat et chaînes satellite',
  'Machine à laver',
  'Mobilier extérieur et transats',
  'Linge de lit et serviettes inclus',
  'Table à manger',
  "Douche à l'italienne",
  'Ménage quotidien',
];
const kitchen = ['Cuisine entièrement équipée', 'Micro-ondes et plaque de cuisson'];
const kitchenette = ['Kitchenette équipée', 'Micro-ondes et plaque de cuisson'];
const privatePool = ['Piscine privée sur terrasse'];

export const rooms = [
  {
    slug: 'penthouse-piscine-privee-pavillon-3',
    hover: 'penthouse-salon',
    title: 'Penthouse', sub: 'Piscine privée · Pavillon 3', seo: "Penthouse avec piscine privée à Tanger, pavillon 3",
    tags: ['piscine', 'mer', 'famille'],
    surface: 120, beds: '1 lit double + 2 lits simples', sofaBed: true, baths: 2, guests: '4 à 6',
    hook: 'Le joyau de la résidence : une piscine suspendue et une terrasse plein ciel face à la Méditerranée.',
    body: [
      "Un penthouse d'exception avec une piscine privée suspendue et une vue panoramique sur la Méditerranée. Sa vaste terrasse à ciel ouvert offre un cadre exclusif, pour des moments de détente en famille ou entre amis.",
      "Deux chambres (un lit double et deux lits simples), deux salles de bain, un salon lumineux, une cuisine moderne et des finitions haut de gamme. Situé dans le pavillon 3, il offre une vue complète sur la piscine, le jardin et la mer. Il accueille 4 à 6 personnes.",
    ],
    imgs: ['penthouse-1', 'penthouse-2', 'penthouse-3', 'penthouse-4', 'penthouse-5', 'penthouse-6', 'penthouse-7', 'penthouse-8'],
    amen: [...privatePool, ...kitchen, ...common],
  },
  {
    slug: 'penthouse-piscine-privee-pavillon-2',
    cover: 'ph2-2', hover: 'ph2-1',
    title: 'Penthouse', sub: 'Piscine privée · Pavillon 2', seo: "Penthouse avec piscine privée à Tanger, pavillon 2",
    tags: ['piscine', 'mer', 'famille'],
    surface: 120, beds: '1 lit double + 2 lits simples', sofaBed: true, baths: 2, guests: '4 à 6',
    hook: 'Une terrasse plein ciel, sa piscine privée et la Méditerranée à l’horizon.',
    body: [
      "Un penthouse panoramique avec piscine privée, dans le pavillon 2 de la résidence. Sa terrasse ouverte sur les collines et la mer offre un cadre exclusif, en famille ou entre amis.",
      "Deux chambres (un lit double et deux lits simples), deux salles de bain, un grand salon baigné de lumière, une cuisine moderne et des finitions haut de gamme. Il accueille 4 à 6 personnes.",
    ],
    imgs: ['ph2-1', 'ph2-2', 'ph2-4', 'ph2-3', 'ph2-6', 'ph2-5', 'ph2-7'],
    amen: [...privatePool, ...kitchen, ...common],
  },
  {
    slug: 'appartement-2-chambres-vue-mer-panoramique',
    cover: 'apt2-salon', hover: 'apt2-1',
    title: 'Appartement 2 chambres', sub: 'Vue mer panoramique', seo: "Appartement 2 chambres vue mer panoramique à Tanger",
    tags: ['mer', 'famille'],
    surface: 100, beds: '1 lit double + 2 lits simples', baths: 1, guests: '3 à 4',
    hook: "Un appartement d'angle, une vue à 180° sur la Méditerranée et le lever du soleil sur la mer.",
    body: [
      "Le charme d'un appartement d'angle unique, avec une vue panoramique à 180° sur la Méditerranée. Spacieux et moderne, il réunit deux chambres (un lit double et deux lits simples), une salle de bain élégante, un salon convivial et une cuisine entièrement équipée.",
      "Son orientation permet de profiter du lever du soleil face à la mer. Il accueille 3 à 4 personnes, pour un séjour en famille ou entre amis.",
    ],
    imgs: ['apt2-1', 'apt2-2', 'apt2-3', 'apt2-4', 'apt2-5', 'apt2-6', 'apt2-7', 'apt2-8'],
    amen: [...kitchen, ...common],
  },
  {
    slug: 'appartement-1-chambre-piscine-privee',
    cover: 'apt1pool-day', hover: 'penthouse-2',
    title: 'Appartement 1 chambre', sub: 'Piscine privée', seo: "Appartement 1 chambre avec piscine privée à Tanger",
    tags: ['piscine', 'jardin'],
    surface: 85, beds: '1 lit double / 2 lits simples', baths: 1, guests: '2',
    hook: 'En rez-de-jardin, de larges baies vitrées et un accès direct à votre piscine privée.',
    body: [
      "Un appartement moderne et lumineux situé en rez-de-jardin, avec un lit double ou deux lits simples, une salle de bain élégante, un salon raffiné et une cuisine équipée. L'option idéale pour un séjour à deux.",
      "Les larges baies vitrées offrent une belle lumière naturelle et un accès direct à votre piscine privée en terrasse. Il accueille 2 personnes.",
    ],
    imgs: ['apt1pool-day', 'penthouse-2', 'apt1pool-3', 'apt1pool-4', 'apt1pool-5'],
    amen: [...privatePool, ...kitchen, ...common],
  },
  {
    slug: 'suite-piscine-privee',
    cover: 'suitepool-salon', hover: 'suitepool-palms',
    title: 'Suite', sub: 'Piscine privée', seo: "Suite avec piscine privée à Tanger",
    tags: ['piscine', 'couple'],
    surface: 70, beds: '1 lit double', sofaBed: true, baths: 1, guests: '1 à 2',
    hook: 'Pensée pour deux : une terrasse ensoleillée, la mer au loin et votre propre piscine.',
    body: [
      "Une escapade romantique dans une suite élégante avec piscine privée. Conçue pour les couples, elle séduit par sa terrasse ensoleillée avec vue sur mer, son design raffiné et son ambiance intimiste.",
      "Une chambre avec lit double, une salle de bain moderne, un coin salon et une kitchenette équipée. Avec sa piscine attenante, c'est l'endroit idéal pour partager des moments à deux.",
    ],
    hero: 'suitepool-1',
    imgs: ['suitepool-interior', 'suitepool-1', 'suitepool-2', 'suitepool-3', 'suitepool-4', 'suitepool-5', 'suitepool-6'],
    amen: [...privatePool, ...kitchenette, ...common],
  },
  {
    slug: 'appartement-1-chambre-vue-mer-panoramique',
    cover: 'apt1pano-salon', hover: 'apt1pano-1',
    title: 'Appartement 1 chambre', sub: 'Vue mer panoramique', seo: "Appartement 1 chambre vue mer panoramique à Tanger",
    tags: ['mer', 'couple'],
    surface: 70, beds: '1 lit double ou 2 lits simples', baths: 1, guests: '2',
    hook: 'Une terrasse ensoleillée et un accès direct à la piscine à débordement.',
    body: [
      "Un appartement élégant d'une chambre avec une vue mer panoramique. Sa terrasse ensoleillée et son accès direct à la piscine à débordement en font l'endroit parfait pour profiter du soleil méditerranéen.",
      "Idéal pour deux personnes : un lit double ou deux lits simples, un salon lumineux, une kitchenette et une salle de bain moderne.",
    ],
    imgs: ['apt1pano-1', 'apt1pano-2', 'apt1pano-3', 'apt1pano-4', 'apt1pano-5', 'apt1pano-6'],
    amen: [...kitchenette, ...common],
  },
  {
    slug: 'appartement-1-chambre-vue-mer',
    title: 'Appartement 1 chambre', sub: 'Vue mer', seo: "Appartement 1 chambre vue mer à Tanger",
    tags: ['mer'],
    surface: 35, beds: '2 lits simples', baths: 1, guests: '1 à 2',
    hook: "Une terrasse face à l'horizon, un intérieur lumineux et contemporain.",
    body: [
      "Un appartement raffiné avec une vue splendide et une terrasse idéale pour savourer chaque instant face à l'horizon. Son design moderne et ses espaces lumineux créent une atmosphère relaxante.",
      "Pour 1 à 2 personnes : deux lits simples, une kitchenette, un coin repas chaleureux et une salle de bain élégante.",
    ],
    hero: 'apt1sea-2',
    imgs: ['apt1sea-salon', 'apt1sea-2', 'apt1sea-1', 'apt1sea-3', 'apt1sea-4', 'apt1sea-5', 'apt1sea-6'],
    amen: [...kitchenette, ...common],
  },
  {
    slug: 'suite-vue-jardin',
    cover: 'suitegarden-3', hover: 'suitegarden-1',
    title: 'Suite', sub: 'Vue jardin', seo: "Suite vue jardin à Tanger",
    tags: ['jardin', 'couple'],
    surface: 35, beds: '1 lit double', sofaBed: true, baths: 1, guests: '2 à 3',
    hook: 'Nichée dans la verdure, une terrasse privative ouverte sur le jardin.',
    body: [
      "Nichée dans un cadre verdoyant, à l'étage ou au niveau du jardin, la Suite Vue Jardin réunit calme et design contemporain. Idéale pour les couples ou les petites familles.",
      "Un lit double confortable, une salle de bain moderne, un coin salon raffiné et une terrasse privative donnant sur le jardin. Elle accueille 2 à 3 personnes.",
    ],
    imgs: ['suitegarden-1', 'suitegarden-3', 'suitegarden-5', 'suitegarden-2', 'suitegarden-4'],
    amen: [...kitchenette, ...common],
  },
  {
    slug: 'studio-vue-piscine',
    title: 'Studio', sub: 'Vue piscine', seo: "Studio vue piscine à Tanger",
    tags: ['piscine'],
    surface: 30, beds: '2 lits simples', baths: 1, guests: '1 à 2',
    hook: 'Un studio intimiste, sa terrasse tournée vers la piscine.',
    body: [
      "Ce studio combine confort moderne et atmosphère intimiste. Sa terrasse avec vue sur la piscine crée un cadre idéal pour un séjour relaxant.",
      "Pour 1 à 2 personnes : deux lits simples, une kitchenette et une salle de bain moderne. Un choix parfait pour les voyageurs en quête de sérénité.",
    ],
    imgs: ['studio-1', 'studio-2', 'studio-3', 'studio-4', 'studio-5'],
    amen: [...kitchenette, ...common],
  },
];

export const drinks = {
  chaudes: [
    ['Espresso', 25], ['Café au lait', 25], ['Chocolat chaud', 25], ['Double espresso', 35],
    ['Chocolat au lait', 25], ['Cappuccino', 30], ['Ristretto / Lungo', 25], ['Lait chaud', 20],
    ['Latte macchiato', 35], ['Mochaccino', 30],
  ],
  froides: [
    ['Coca-Cola / Hawai / Poms', 25], ['Schweppes / Sprite', 25], ['Ice tea', 30],
    ["Jus d'Ananas / Orange / Mangue", 25], ['Jus de fruits exotiques', 25], ['Red Bull', 40],
  ],
  snacks: [['Kinder Bueno', 25], ['KitKat', 15], ['Lays / Pringles', 25]],
  eau: [['Eau pétillante', 20], ['Eau plate', 10]],
  mocktails: [
    ['Virgin Mojito', 55, 'Menthe fraîche et citron vert, allongés de soda pétillant.'],
    ['Virgin Blue Lagoon', 55, 'Curaçao bleu et citron, allongés de limonade pétillante.'],
    ['Virgin Colada', 55, 'Ananas doux et noix de coco onctueuse, une touche tropicale.'],
  ],
  matchas: [
    ['Iced Matcha Latte', 65, 'Matcha et lait servis sur glace, une finale douce et légèrement terreuse.'],
    ['Fruity Matcha', 70, 'Matcha mélangé à des fruits juteux, servi sur glace.'],
  ],
  shakes: [
    ['Milkshake Oreo', 45, 'Milkshake vanille, Oreo écrasés, finition au chocolat.'],
    ['Milkshake Vanille', 45, 'Vanille onctueuse, servi bien frais.'],
  ],
};

export const faq = [
  ['Où se situe Le Tanger Résidence Hôtelière ?', "Entre mer et collines, à M'nar, à proximité du Cap Malabata. Le centre de Tanger est à environ 8 minutes en voiture."],
  ['Quels types de logements proposez-vous ?', 'Des appartements, suites, un studio et des penthouses, avec vue mer, vue jardin ou vue piscine. Certains disposent d’une piscine privée sur terrasse. Une chambre est adaptée aux personnes à mobilité réduite (PMR).'],
  ['La résidence dispose-t-elle de piscines ?', 'Oui, deux piscines extérieures à débordement, ainsi que des logements avec piscine privée.'],
  ['Quels sont les horaires d’arrivée et de départ ?', 'Arrivée à partir de 15h00. Départ jusqu’à 12h00.'],
  ['Y a-t-il un parking ?', 'Oui, un parking privé et gratuit, accessible aux personnes à mobilité réduite.'],
  ['Accueillez-vous les familles ?', 'Oui. Nous proposons des logements familiaux, des espaces extérieurs sécurisés et des lits bébé sur demande.'],
  ['Les animaux sont-ils acceptés ?', 'Les animaux sont admis sur demande. Contactez-nous avant votre arrivée.'],
];

/* Petit-déjeuner: en supplément, réglé à l'arrivée, servi en chambre */
export const breakfast = {
  price: 90,
  hours: '8h00 à 11h00',
  menu: [
    ['Boissons', ["Jus d'orange", 'Café ou thé, au choix']],
    ['Viennoiseries', ['Croissant', 'Pain au chocolat', 'Toast']],
    ['Spécialités marocaines', ['Msemen', 'Harcha', 'Pâtisseries marocaines']],
    ['Accompagnements', ['Beurre', 'Miel', 'Confiture de fraise', 'Fromage', 'Œuf dur']],
  ],
};
