// Logique de génération de repas basée sur la documentation nutritionnelle

const repasPertePoids = {
  petit_dejeuner: {
    nom: "Omelette protéinée & Épinards",
    description: "3 œufs entiers (ou 1 entier + 3 blancs), épinards, 1 tranche de pain complet, café/thé.",
    focus: "Protéines élevées, satiété durable"
  },
  dejeuner: {
    nom: "Salade Quinoa & Thon",
    description: "Quinoa, thon au naturel, 1/4 d'avocat, tomates cerises, vinaigrette légère (huile d'olive/citron).",
    focus: "Fibres, volume alimentaire, Oméga-3"
  },
  collation: {
    nom: "Skyr aux Fruits Rouges",
    description: "200g de Skyr nature, fruits rouges (myrtilles/framboises), 10g de graines de chia.",
    focus: "Protéines lentes, IG bas, antioxydants"
  },
  pre_workout: {
    nom: "Whey & Datte",
    description: "1 dose de whey dans l'eau + 1 ou 2 dattes.",
    focus: "Énergie rapide, prévention du catabolisme"
  },
  post_workout: {
    nom: "Riz Blanc & Poulet",
    description: "Riz blanc, blanc de poulet, haricots verts.",
    focus: "Recharge glycogénique rapide, réparation"
  },
  diner: {
    nom: "Cabillaud & Patate Douce",
    description: "Cabillaud au four, brocolis vapeur, patate douce, filet d'huile d'olive.",
    focus: "Digestion légère, index glycémique bas"
  },
  nuit: {
    nom: "Fromage Blanc & Cannelle",
    description: "Fromage blanc 0% et une pincée de cannelle.",
    focus: "Caséine (anabolisme nocturne)"
  }
};

const repasPriseMasse = {
  petit_dejeuner: {
    nom: "Bowl Avoine & Œufs",
    description: "Flocons d'avoine, lait entier, 3 œufs (ou 1 scoop whey), 1 banane, poignée d'amandes.",
    focus: "Densité calorique, glucides complexes"
  },
  dejeuner: {
    nom: "Poulet & Riz + Fromage",
    description: "Riz blanc (grosse portion), poulet grillé, courgettes, huile d'olive, fromage râpé.",
    focus: "Protéines, Glucides ++, Lipides sains"
  },
  collation: {
    nom: "Gros Bol Skyr & Granola",
    description: "Skyr, granola maison, myrtilles, beurre de cacahuète.",
    focus: "Calories faciles, protéines complètes"
  },
  pre_workout: {
    nom: "Banane & Beurre d'Amande",
    description: "1 grosse banane + 1 bonne cuillère de beurre d'amande ou cacahuète.",
    focus: "Énergie soutenue, pompe musculaire"
  },
  post_workout: {
    nom: "Gainer Maison",
    description: "Whey, lait, flocons d'avoine mixés, miel.",
    focus: "Insuline spike, recharge glycogène massive"
  },
  diner: {
    nom: "Saumon & Quinoa",
    description: "Saumon au four, quinoa, épinards, avocat.",
    focus: "Oméga-3 EPA/DHA, protéines qualitatives"
  },
  nuit: {
    nom: "Fromage Blanc & Noix",
    description: "Fromage blanc, cerneaux de noix, poudre de cacao.",
    focus: "Anti-catabolisme 8h, lipides"
  }
};

const repasMaintien = {
  petit_dejeuner: {
    nom: "Porridge Protéiné",
    description: "Flocons d'avoine, lait végétal ou écrémé, 1 scoop de whey ou 2 œufs à côté, fruits de saison.",
    focus: "Équilibre parfait"
  },
  dejeuner: {
    nom: "Poulet & Patate Douce",
    description: "Blanc de poulet, patate douce rôtie, brocolis, filet d'huile d'olive.",
    focus: "Repas complet et équilibré"
  },
  collation: {
    nom: "Yaourt Grec & Amandes",
    description: "Yaourt grec nature, une poignée d'amandes ou de noix.",
    focus: "Satiété et lipides sains"
  },
  pre_workout: {
    nom: "Pain Complet & Miel",
    description: "1 à 2 tranches de pain complet avec un peu de miel ou confiture.",
    focus: "Glucides de préparation"
  },
  post_workout: {
    nom: "Whey & Fruit",
    description: "Un shaker de protéine et un fruit (pomme, banane).",
    focus: "Récupération immédiate"
  },
  diner: {
    nom: "Steak Haché 5% & Pâtes Complètes",
    description: "Steak haché 5% MG, pâtes complètes, sauce tomate maison, salade.",
    focus: "Reconstruction musculaire, fer, zinc"
  },
  nuit: {
    nom: "Skyr Nature",
    description: "Un bol de Skyr nature si petite faim.",
    focus: "Protéines nocturnes"
  }
};

export function getMealPlan(objectif) {
  if (objectif === 'perte_poids' || objectif === 'seche') {
    return repasPertePoids;
  } else if (objectif === 'prise_masse' || objectif === 'masse') {
    return repasPriseMasse;
  } else {
    return repasMaintien;
  }
}
