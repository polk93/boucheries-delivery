// lib/data.ts — Données de démonstration + types partagés

export type CatProduit = 'Bœuf' | 'Veau' | 'Agneau' | 'Volaille' | 'Entrée'
export type VenteType  = 'pièce' | 'poids'

export interface Produit {
  id: string
  nom: string
  desc: string
  prix: number
  icon: string
  stock: number
  photo: string | null
  decoupes: string[]
  preparation: string[]
  cat: CatProduit
  venteType: VenteType
  pays_origine?: string
  allergenes?: string
}

export interface Boucherie {
  id: number
  nom: string
  note: number
  avis: number
  img: string
  tags: string[]
  cat: string
  livraison: string
  frais: number
  desc: string
  badge: string | null
  ouvert: boolean
  produits: Produit[]
}

export const BOUCHERIES: Boucherie[] = [
  {
    id: 1, nom: 'Maison Dupont', note: 4.9, avis: 312,
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=700&q=80',
    tags: ['Charolais', 'Bio', 'MOF'], cat: 'Bœuf', livraison: '30 min', frais: 2.90,
    desc: 'Boucherie familiale depuis 1962. Bœuf Charolais élevé en plein air, bouchers Meilleurs Ouvriers de France.',
    badge: 'Nouveau', ouvert: true,
    produits: [
      { id:'e1',  nom:'Entrecôte Charolais',      desc:'~500g, persillé idéal',            prix:18.90, icon:'🥩', stock:12, cat:'Bœuf',   venteType:'pièce',
        photo:'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80',
        decoupes:['Standard','Fine (3mm)','Épaisse (2cm)','Papillon'],
        preparation:['Nature','Marinée herbes','Marinée BBQ'] },
      { id:'f1',  nom:'Filet de Bœuf',             desc:'~300g, ultra tendre',              prix:24.50, icon:'🍖', stock:5,  cat:'Bœuf',   venteType:'pièce',
        photo:'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?w=400&q=80',
        decoupes:['Entier','En médaillons','En carpaccio'],
        preparation:['Nature','Poivré','Flambé cognac'] },
      { id:'b1',  nom:"Bavette d'Aloyau",           desc:'~400g, goûteuse',                 prix:12.80, icon:'🥩', stock:0,  cat:'Bœuf',   venteType:'pièce',
        photo:null, decoupes:['Standard','Fine','Épaisse'], preparation:['Nature','Marinée échalotes'] },
      { id:'m1',  nom:'Merguez Maison',             desc:'6 pièces, épicées',               prix:8.50,  icon:'🌶️',stock:22, cat:'Bœuf',   venteType:'pièce',
        photo:null, decoupes:['Standard'], preparation:['Épicées','Douces','Extra-épicées'] },
      // Entrées à la pièce
      { id:'cp1', nom:'Coppa',                      desc:'5 tranches fines, séchage 4 mois',prix:4.90,  icon:'🍖', stock:8,  cat:'Entrée', venteType:'pièce',
        photo:null, decoupes:[], preparation:[] },
      { id:'jc1', nom:'Jambon Cru',                 desc:'5 tranches fines, affinage 18 mois',prix:5.50,icon:'🍖', stock:6,  cat:'Entrée', venteType:'pièce',
        photo:null, decoupes:[], preparation:[] },
      { id:'jb1', nom:'Jambon Blanc Supérieur',     desc:'3 tranches épaisses, sans couenne',prix:3.80, icon:'🍖', stock:10, cat:'Entrée', venteType:'pièce',
        photo:null, decoupes:[], preparation:[] },
      { id:'sa1', nom:'Saucisson Sec Maison',       desc:'10 tranches, noix et poivre',     prix:4.20,  icon:'🌭', stock:14, cat:'Entrée', venteType:'pièce',
        photo:null, decoupes:[], preparation:[] },
      { id:'pa1', nom:'Pâté de Campagne',           desc:'2 tranches généreuses, maison',   prix:3.50,  icon:'🫙', stock:9,  cat:'Entrée', venteType:'pièce',
        photo:null, decoupes:[], preparation:[] },
      { id:'ro2', nom:'Rôti de Porc Froid',         desc:'4 tranches, cuit au thym',        prix:4.80,  icon:'🍖', stock:5,  cat:'Entrée', venteType:'pièce',
        photo:null, decoupes:[], preparation:[] },
      { id:'mu1', nom:'Museau Vinaigrette',          desc:'Barquette 150g, câpres',          prix:5.20,  icon:'🥩', stock:4,  cat:'Entrée', venteType:'pièce',
        photo:null, decoupes:[], preparation:[] },
      { id:'bu1', nom:'Boudin Noir Grillé',          desc:'2 tranches, pommes maison',       prix:4.50,  icon:'🌭', stock:0,  cat:'Entrée', venteType:'pièce',
        photo:null, decoupes:[], preparation:[] },
      // Entrées au poids
      { id:'tb1', nom:'Taboulé Maison',             desc:'Semoule, menthe, citron, tomates',prix:8.90,  icon:'🥗', stock:1,  cat:'Entrée', venteType:'poids',
        photo:null, decoupes:[], preparation:[] },
      { id:'cr1', nom:'Carottes Râpées',            desc:'Vinaigrette maison, persil frais', prix:7.50, icon:'🥕', stock:1,  cat:'Entrée', venteType:'poids',
        photo:null, decoupes:[], preparation:[] },
      { id:'ce1', nom:'Céleri Rémoulade',           desc:'Sauce moutarde, citron',           prix:9.20, icon:'🥬', stock:1,  cat:'Entrée', venteType:'poids',
        photo:null, decoupes:[], preparation:[] },
      { id:'bl1', nom:'Betterave Vinaigrette',      desc:'Cuite maison, échalotes, persil',  prix:7.80, icon:'🟣', stock:1,  cat:'Entrée', venteType:'poids',
        photo:null, decoupes:[], preparation:[] },
      { id:'po2', nom:'Pommes de Terre Mimosa',     desc:'Mayonnaise maison, œufs durs',     prix:9.50, icon:'🥔', stock:1,  cat:'Entrée', venteType:'poids',
        photo:null, decoupes:[], preparation:[] },
      { id:'hv1', nom:'Haricots Verts Vinaigrette', desc:'Al dente, ail, persil, noisettes', prix:10.50,icon:'🫛', stock:1,  cat:'Entrée', venteType:'poids',
        photo:null, decoupes:[], preparation:[] },
      { id:'cx1', nom:'Chou Blanc aux Lardons',     desc:'Lardons fumés, vinaigre chaud',    prix:8.20, icon:'🥬', stock:1,  cat:'Entrée', venteType:'poids',
        photo:null, decoupes:[], preparation:[] },
      { id:'le1', nom:'Lentilles à la Lyonnaise',   desc:'Lardons, oignons, moutarde',       prix:9.80, icon:'🟤', stock:0,  cat:'Entrée', venteType:'poids',
        photo:null, decoupes:[], preparation:[] },
    ],
  },
  {
    id: 2, nom: 'Boucherie Le Gall', note: 4.7, avis: 198,
    img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=700&q=80',
    tags: ['Porc', 'Charcuterie', 'Artisan'], cat: 'Porc', livraison: '45 min', frais: 1.50,
    desc: 'Spécialistes du porc breton. Charcuterie maison : rillettes, pâtés, jambons fumés au bois de hêtre.',
    badge: 'Promo', ouvert: true,
    produits: [
      { id:'c2',  nom:'Côtes de Porc',   desc:'4 pièces 600g',             prix:11.20, icon:'🍖', stock:8,  cat:'Bœuf',   venteType:'pièce',
        photo:null, decoupes:['Avec os','Désossées','Fines escalopes'], preparation:['Nature','Marinée miel-moutarde','Panée'] },
      { id:'r1',  nom:'Rillettes Maison',desc:'Bocal 300g',                prix:7.80,  icon:'🫙', stock:15, cat:'Entrée', venteType:'pièce',
        photo:null, decoupes:['Bocal 300g','Bocal 500g'], preparation:["Classiques","Au piment d'Espelette"] },
      { id:'j1',  nom:'Jambon Fumé',     desc:'Tranches 200g',             prix:9.50,  icon:'🍖', stock:3,  cat:'Entrée', venteType:'pièce',
        photo:null, decoupes:['Tranches fines','Tranches épaisses'], preparation:['Fumé hêtre','Fumé chêne'] },
      { id:'s1',  nom:'Saucissons Secs', desc:'Lot de 3',                  prix:13.00, icon:'🌭', stock:20, cat:'Entrée', venteType:'pièce',
        photo:null, decoupes:['Entier','Pré-tranché'], preparation:['Nature','Aux noisettes','Au poivre'] },
    ],
  },
  {
    id: 3, nom: 'Comptoir du Veau', note: 4.8, avis: 143,
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&q=80',
    tags: ['Veau', 'Label Rouge', 'Premium'], cat: 'Veau', livraison: '25 min', frais: 0,
    desc: 'Veau élevé sous la mère, Label Rouge. Côtes, escalopes, noix de veau — toute la gamme.',
    badge: null, ouvert: true,
    produits: [
      { id:'cv1', nom:'Côte de Veau',     desc:'500g, Label Rouge', prix:21.00, icon:'🥩', stock:6,  cat:'Veau', venteType:'pièce',
        photo:null, decoupes:['Avec os','Désossée','Escalope fine'], preparation:['Nature','Milanaise','À la crème'] },
      { id:'ev2', nom:'Escalope de Veau', desc:'2 pièces 300g',     prix:14.60, icon:'🍖', stock:0,  cat:'Veau', venteType:'pièce',
        photo:null, decoupes:['Fine (5mm)','Épaisse (1cm)'], preparation:['Nature','Panée','Saltimbocca'] },
      { id:'nv1', nom:'Noix de Veau',     desc:'400g, rôti idéal',  prix:19.90, icon:'🥩', stock:4,  cat:'Veau', venteType:'pièce',
        photo:null, decoupes:['Entière','En tranches','En cubes'], preparation:['Nature','Bardée lard','Farcie'] },
      { id:'ov1', nom:'Os à Moelle',      desc:'4 pièces',          prix:6.50,  icon:'🦴', stock:18, cat:'Entrée', venteType:'pièce',
        photo:null, decoupes:['Rondelles','Fendu en long'], preparation:['Nature','Pré-assaisonné'] },
    ],
  },
  {
    id: 4, nom: "L'Agneau d'Or", note: 4.6, avis: 87,
    img: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=700&q=80',
    tags: ['Agneau', 'Halal', 'Plein Air'], cat: 'Agneau', livraison: '40 min', frais: 2.00,
    desc: "Agneau de prés-salés certifié Halal. Du gigot au carré, en passant par les merguez maison.",
    badge: null, ouvert: false,
    produits: [
      { id:'g2',  nom:"Gigot d'Agneau",   desc:'1,2 kg entier', prix:28.50, icon:'🍖', stock:3,  cat:'Agneau', venteType:'pièce',
        photo:null, decoupes:['Entier','Désossé','En tranches'], preparation:['Nature','Piqué ail','Herbes de Provence'] },
      { id:'ca2', nom:"Carré d'Agneau",   desc:'8 côtelettes',  prix:22.00, icon:'🥩', stock:0,  cat:'Agneau', venteType:'pièce',
        photo:null, decoupes:['Entier','Côtelettes séparées'], preparation:["Nature","Croûte d'herbes",'Moutarde'] },
      { id:'e3',  nom:'Épaule Désossée',  desc:'800g, à rôtir', prix:16.80, icon:'🥩', stock:7,  cat:'Agneau', venteType:'pièce',
        photo:null, decoupes:['Entière','En morceaux navarin'], preparation:['Nature','Ficellée','Farcie'] },
      { id:'m3',  nom:'Merguez Agneau',   desc:'8 pièces maison',prix:9.90, icon:'🌶️',stock:25, cat:'Bœuf',   venteType:'pièce',
        photo:null, decoupes:['Standard','Chipolata'], preparation:['Épicées','Douces'] },
    ],
  },
  {
    id: 5, nom: 'Bœuf & Tradition', note: 4.9, avis: 411,
    img: 'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=700&q=80',
    tags: ['Wagyu', 'Maturation', 'Prestige'], cat: 'Bœuf', livraison: '55 min', frais: 3.50,
    desc: 'Wagyu A5 et viandes maturées 45-90 jours. Pour les connaisseurs exigeants.',
    badge: 'Promo', ouvert: true,
    produits: [
      { id:'w1',  nom:'Wagyu A5 – 200g',   desc:'Grade A5, Japon', prix:58.00, icon:'⭐', stock:2, cat:'Bœuf', venteType:'pièce',
        photo:'https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?w=400&q=80',
        decoupes:['Fine (4mm)','Standard (8mm)','Épaisse (12mm)'], preparation:['Nature uniquement'] },
      { id:'t1',  nom:'T-Bone Maturé 60j', desc:'700g, majestueux', prix:39.90, icon:'🥩', stock:4, cat:'Bœuf', venteType:'pièce',
        photo:null, decoupes:['Entier','Séparé faux-filet/filet'], preparation:['Nature','Sel de Guérande'] },
      { id:'rt1', nom:'Rosbif Maturé',      desc:'600g, tranche fine',prix:27.50,icon:'🍖', stock:9, cat:'Bœuf', venteType:'pièce',
        photo:null, decoupes:['En rôti','Tranché fin','Tranché épais'], preparation:['Nature','Bardé','Lardé ail'] },
      { id:'br1', nom:'Brisket Fumé',        desc:'500g, BBQ style',  prix:19.00,icon:'🔥', stock:6, cat:'Bœuf', venteType:'pièce',
        photo:null, decoupes:['Entier','En tranches'], preparation:['Fumé classique','Épicé Texas','Sucré-salé'] },
    ],
  },
  {
    id: 6, nom: 'Ferme & Boucherie Morel', note: 4.5, avis: 234,
    img: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=700&q=80',
    tags: ['Fermier', 'Circuit Court', 'Volaille'], cat: 'Volaille', livraison: '35 min', frais: 1.90,
    desc: 'Du champ à votre assiette. Poulets, lapins, canards en direct de ferme.',
    badge: 'Nouveau', ouvert: true,
    produits: [
      { id:'po3', nom:'Poulet Fermier Entier', desc:'1,6 kg, plein air', prix:17.90, icon:'🐓', stock:11, cat:'Volaille', venteType:'pièce',
        photo:null, decoupes:['Entier','Découpé 8 morceaux','Blanc seul'], preparation:['Nature','Mariné citron-thym','Farci'] },
      { id:'la1', nom:'Lapin Entier',           desc:'1,2 kg, élevage',  prix:14.50, icon:'🐇', stock:0,  cat:'Volaille', venteType:'pièce',
        photo:null, decoupes:['Entier','Découpé','Râble seul'], preparation:['Nature','Moutarde'] },
      { id:'ca3', nom:'Canard Effilé',           desc:'1,8 kg',           prix:19.00, icon:'🦆', stock:5,  cat:'Volaille', venteType:'pièce',
        photo:null, decoupes:['Entier','Découpé','Magret seul'], preparation:['Nature','Confit'] },
      { id:'mag1',nom:'Magret de Canard',        desc:'2 pièces 400g',    prix:16.80, icon:'🍖', stock:8,  cat:'Volaille', venteType:'pièce',
        photo:null, decoupes:['Entier','Tranché fin','Tranché épais'], preparation:['Nature','Miel-vinaigre balsamique','Poivré'] },
    ],
  },
]

export const CATS_NAV = [
  { icon:'🥩', label:'Bœuf'    },
  { icon:'🐷', label:'Porc'    },
  { icon:'🐑', label:'Agneau'  },
  { icon:'🐔', label:'Volaille'},
  { icon:'🌭', label:'Charcuterie'},
  { icon:'⭐', label:'Premium' },
  { icon:'🌿', label:'Bio'     },
  { icon:'🔥', label:'BBQ'     },
]

export const CRENEAUX = [
  { label:'Dès que possible (~30 min)', value:'now'        },
  { label:"Aujourd'hui 12h–13h",        value:'today-12'   },
  { label:"Aujourd'hui 18h–19h",        value:'today-18'   },
  { label:"Aujourd'hui 19h–20h",        value:'today-19'   },
  { label:'Demain 9h–10h',              value:'tomorrow-9' },
  { label:'Demain 12h–13h',             value:'tomorrow-12'},
  { label:'Demain 18h–19h',             value:'tomorrow-18'},
]
