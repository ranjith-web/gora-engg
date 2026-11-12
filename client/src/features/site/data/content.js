export const NAV_LINKS = [
  { label: "Home", hash: "#top", id: "home" },
  { label: "About", hash: "#about", id: "about" },
  { label: "Products", hash: "#products", id: "products" },
  { label: "Contact", hash: "#contact", id: "contact" },
];

export const CORE_ACTIVITY = ["Tyre Building Equipment Manufacturing", "Tyre Building Drum Reconditioning", "Spare Parts Supply for the Tyre Manufacturing Industry"];

export const ABOUT_TEXT = "Gora Engineering Works is a specialised engineering company manufacturing tyre building drums, reconditioning, spare parts supply work for the tyre manufacturing industrial sectors.";

export const DESCRIPTION = [
  "Gora Engineering Works is a specialised engineering company focused on the manufacturing of tyre building drums, drum reconditioning, and precision spare parts supply. We serve the tyre manufacturing industrial sectors with a commitment to quality workmanship, reliable service, and timely delivery.",
  "We make tyre building machine components, drums, moulds, rings and custom engineering assemblies, with a focus on dimensional accuracy, durability and consistent performance. Our product range covers tyre building, bladder moulding, turn-up operations, bead-related applications and strip winding."
]

export const FOUNDED_YEAR = 1998;
export const YEARS_OF_EXPERIENCE = new Date().getFullYear() - FOUNDED_YEAR; // 28 in 2026, keeps itself up to date

export const HISTORY = [
  `Gora Engineering Works was started in ${FOUNDED_YEAR}. Since then we have built ${YEARS_OF_EXPERIENCE} years of experience in the manufacture of tyre building drums.`,
  "That experience is what we bring to every drum we make for the tyre manufacturing industry.",
];

export const STRENGTHS = [
  "Specialised Expertise",
  "Precision Manufacturing",
  "Customised Solutions",
  "Quality Assurance",
  "Reliable & Timely Service",
];

// Real photos from client/public/drums-gallery/ (originals are kept there;
// thumb/ = 900px for the strip, full/ = up to 1800px for the expanded view).
export const GALLERY = ["proj-1", "proj-2", "proj-3", "proj-4", "proj-5", "proj-6", "proj-7", "proj-8", "proj-9", "proj-10"].map((n) => ({
  thumb: `/drums-gallery/thumb/${n}.jpg`,
  full: `/drums-gallery/full/${n}.jpg`,
}));

// Photos for the scrolling strip: your GALLERY photos (stock placeholders only if the gallery is empty).
const STOCK = (id) => `https://images.unsplash.com/${id}?crop=entropy&cs=srgb&fm=jpg&q=85&auto=format&fit=crop`;
export const MARQUEE_IMAGES = GALLERY.length
  ? GALLERY
  : [
      "photo-1666634157070-6fd830fb5672", "photo-1764114441097-6a475eca993d", "photo-1717386255773-a456c611dc4e",
      "photo-1720036236694-d0a231c52563", "photo-1713371398485-7bde1bde9def", "photo-1608126841830-53832c4b326f",
    ].map((id) => ({ thumb: `${STOCK(id)}&w=900`, full: `${STOCK(id)}&w=1800` }));

// Intro banner background. Replace with a real photo of your works (e.g. "/gallery/works.jpg").
export const HERO_IMAGE = `${STOCK("photo-1717386255773-1e3037c81788")}&w=2400`;
export const HERO_HEADLINE = "Tyre building drums, Reconditioning, Spare parts supply.";

// Logos live in client/public/customers/. For TVS and Tollins, add the file and set `logo` (until then the name is shown).
export const CUSTOMERS = [
  { name: "Apollo", logo: "/customers/ATL-Logo.jpg" },
  { name: "MRF", logo: "/customers/mrf-new.jpg" },
  { name: "TVS", logo: "/customers/tvs-srichakra-ltd.avif" },
  { name: "Tollins", logo: "/customers/tollins.png" },
];
