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
    nom: "WHEY_PLACEHOLDER & Datte",
    description: "WHEY_DESC_PLACEHOLDER + 1 ou 2 dattes.",
    focus: "Énergie rapide, prévention du catabolisme"
  },
  post_workout: {
    nom: "Riz Blanc & Poulet CREATINE_PLACEHOLDER",
    description: "Riz blanc, blanc de poulet, haricots verts. CREATINE_DESC_PLACEHOLDER",
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
    nom: "Bowl Avoine & WHEY_PLACEHOLDER",
    description: "Flocons d'avoine, lait entier, WHEY_DESC_PLACEHOLDER, 1 banane, poignée d'amandes.",
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
    nom: "Gainer Maison CREATINE_PLACEHOLDER",
    description: "WHEY_PLACEHOLDER, lait, flocons d'avoine mixés, miel. CREATINE_DESC_PLACEHOLDER",
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
    description: "Flocons d'avoine, lait végétal ou écrémé, WHEY_DESC_PLACEHOLDER, fruits de saison.",
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
    nom: "WHEY_PLACEHOLDER & Fruit CREATINE_PLACEHOLDER",
    description: "WHEY_DESC_PLACEHOLDER et un fruit (pomme, banane). CREATINE_DESC_PLACEHOLDER",
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

function adaptPlanToPreferences(plan, prefs) {
  const newPlan = JSON.parse(JSON.stringify(plan));
  
  for (const key in newPlan) {
    if (newPlan[key]) {
      // ── WHEY ADAPTATION ──
      if (prefs.use_whey) {
        newPlan[key].nom = newPlan[key].nom.replace('WHEY_PLACEHOLDER', 'Whey');
        newPlan[key].description = newPlan[key].description.replace('WHEY_DESC_PLACEHOLDER', '1 dose de whey');
        newPlan[key].description = newPlan[key].description.replace('WHEY_PLACEHOLDER', 'Whey');
      } else {
        newPlan[key].nom = newPlan[key].nom.replace('WHEY_PLACEHOLDER', 'Skyr / Œufs');
        newPlan[key].description = newPlan[key].description.replace('WHEY_DESC_PLACEHOLDER', '150g de Skyr ou 3 blancs d\'œufs');
        newPlan[key].description = newPlan[key].description.replace('WHEY_PLACEHOLDER', 'Skyr');
      }
      
      // ── CREATINE ADAPTATION ──
      if (prefs.use_creatine) {
        newPlan[key].nom = newPlan[key].nom.replace('CREATINE_PLACEHOLDER', '+ Créatine');
        newPlan[key].description = newPlan[key].description.replace('CREATINE_DESC_PLACEHOLDER', 'Mélange 5g de Créatine monohydrate à ton repas/shaker.');
      } else {
        newPlan[key].nom = newPlan[key].nom.replace(' CREATINE_PLACEHOLDER', '');
        newPlan[key].description = newPlan[key].description.replace(' CREATINE_DESC_PLACEHOLDER', '');
      }
    }
  }
  
  return newPlan;
}

export function getMealPlan(objectif, prefs = { use_whey: true, use_creatine: false }) {
  let basePlan;
  if (objectif === 'perte_poids' || objectif === 'seche') {
    basePlan = repasPertePoids;
  } else if (objectif === 'prise_masse' || objectif === 'masse') {
    basePlan = repasPriseMasse;
  } else {
    basePlan = repasMaintien;
  }

  return adaptPlanToPreferences(basePlan, prefs);
}
