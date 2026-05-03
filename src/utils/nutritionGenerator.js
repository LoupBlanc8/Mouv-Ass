// Logique de génération de repas basée sur la documentation nutritionnelle

const imgPtDej1 = "https://images.unsplash.com/photo-1495214783159-3503fd1b572d?auto=format&fit=crop&w=400&q=80"; // Porridge/Oatmeal bowl
const imgPtDej2 = "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80"; // Pancakes stack
const imgPtDej3 = "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=400&q=80"; // Eggs/Omelette

const imgDej1 = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80"; // Salade healthy
const imgDej2 = "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=400&q=80"; // Poulet Riz
const imgDej3 = "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80"; // Saumon grillé

const imgSnack1 = "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80"; // Yaourt/Fruits bowl
const imgSnack2 = "https://images.unsplash.com/photo-1622485831930-34623baab374?auto=format&fit=crop&w=400&q=80"; // Protein shake
const imgSnack3 = "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80"; // Banane

const imgDiner1 = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"; // Wrap/Bowl healthy
const imgDiner2 = "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=400&q=80"; // Pâtes/Viande
const imgDiner3 = "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=400&q=80"; // Poulet rôti légumes

const repasPertePoids = {
  petit_dejeuner: {
    nom: "Omelette protéinée & Épinards",
    description: "3 œufs entiers, épinards, 1 tranche pain complet.",
    focus: "Protéines élevées, satiété durable",
    recette: "Battez 3 œufs. Faites revenir une poignée d'épinards dans une poêle légèrement huilée. Ajoutez les œufs et faites cuire à feu moyen. Servez avec le pain complet grillé.",
    options: [
      { nom: "Omelette aux épinards", image: imgPtDej3 },
      { nom: "Porridge Fruits Rouges", image: imgPtDej1 },
      { nom: "Skyr & Muesli léger", image: imgSnack1 }
    ]
  },
  dejeuner: {
    nom: "Salade Quinoa & Thon",
    description: "Quinoa, thon, avocat, tomates, vinaigrette légère.",
    focus: "Fibres, volume alimentaire",
    recette: "Cuire 50g de quinoa. Mélanger avec 100g de thon au naturel, 1/2 avocat en dés et des tomates cerises. Assaisonner avec 1 c.à.s d'huile d'olive, jus de citron, sel et poivre.",
    options: [
      { nom: "Salade Quinoa Thon", image: imgDej1 },
      { nom: "Poulet grillé & Haricots", image: imgDej2 },
      { nom: "Plat Halal: Émincé de dinde (Halal) et boulgour", image: imgDiner1 }
    ]
  },
  collation: {
    nom: "Skyr aux Fruits Rouges",
    description: "200g de Skyr, fruits rouges, graines de chia.",
    focus: "Protéines lentes, IG bas",
    recette: "Dans un bol, versez 200g de Skyr. Ajoutez une poignée de fruits rouges et saupoudrez d'une cuillère à café de graines de chia. Dégustez frais.",
    options: [
      { nom: "Skyr & Myrtilles", image: imgSnack1 },
      { nom: "Pomme & Amandes", image: imgSnack3 },
      { nom: "Shaker Whey", image: imgSnack2 }
    ]
  },
  pre_workout: {
    nom: "WHEY_PLACEHOLDER & Datte",
    description: "WHEY_DESC_PLACEHOLDER + 1 ou 2 dattes.",
    focus: "Énergie rapide",
    recette: "Mélangez votre poudre avec de l'eau. Accompagnez de 1 à 2 dattes pour un apport glucidique rapide avant l'effort.",
    options: [
      { nom: "Shaker & Datte", image: imgSnack2 },
      { nom: "Banane", image: imgSnack3 }
    ]
  },
  post_workout: {
    nom: "Riz Blanc & Poulet CREATINE_PLACEHOLDER",
    description: "Riz, poulet, haricots. CREATINE_DESC_PLACEHOLDER",
    focus: "Recharge glycogénique",
    recette: "Faites cuire 60g de riz blanc. Faites griller 120g de blanc de poulet. Accompagnez d'une portion de haricots verts.",
    options: [
      { nom: "Poulet & Riz", image: imgDej2 },
      { nom: "Plat Halal: Poulet rôti (Halal) & Riz", image: imgDej2 },
      { nom: "Shaker & Banane", image: imgSnack2 }
    ]
  },
  diner: {
    nom: "Cabillaud & Patate Douce",
    description: "Cabillaud, brocolis, patate douce.",
    focus: "Digestion légère",
    recette: "Cuire 150g de cabillaud en papillote au four à 180°C (15 min). Cuire à la vapeur 150g de patate douce et 100g de brocolis. Assaisonner d'herbes.",
    options: [
      { nom: "Poisson & Patate douce", image: imgDej3 },
      { nom: "Plat Halal: Steak haché 5% (Halal) & Légumes", image: imgDiner2 }
    ]
  },
  nuit: {
    nom: "Fromage Blanc & Cannelle",
    description: "Fromage blanc 0% et cannelle.",
    focus: "Caséine nocturne",
    recette: "Mélangez 150g de fromage blanc 0% avec une pincée de cannelle.",
    options: [
      { nom: "Fromage blanc", image: imgSnack1 }
    ]
  }
};

const repasPriseMasse = {
  petit_dejeuner: {
    nom: "Bowl Avoine & WHEY_PLACEHOLDER",
    description: "Flocons d'avoine, lait entier, WHEY_DESC_PLACEHOLDER, banane.",
    focus: "Densité calorique",
    recette: "Chauffez 80g de flocons d'avoine avec 200ml de lait entier. Hors du feu, ajoutez la whey et 1 banane en rondelles.",
    options: [
      { nom: "Porridge Banane", image: imgPtDej1 },
      { nom: "Pancakes Protéinés", image: imgPtDej2 },
      { nom: "Plat Halal: 4 Oeufs & Bacon de Dinde (Halal)", image: imgPtDej3 }
    ]
  },
  dejeuner: {
    nom: "Poulet & Riz + Fromage",
    description: "Riz blanc, poulet, huile d'olive, fromage.",
    focus: "Protéines, Glucides ++",
    recette: "Cuire 100g de riz sec. Saisir 150g de blanc de poulet en dés. Mélanger le tout avec 1 c.à.s d'huile d'olive et 30g de fromage râpé.",
    options: [
      { nom: "Poulet Riz XXL", image: imgDej2 },
      { nom: "Pâtes au Boeuf", image: imgDiner2 },
      { nom: "Plat Halal: Boeuf haché (Halal) & Pâtes", image: imgDiner2 }
    ]
  },
  collation: {
    nom: "Gros Bol Skyr & Granola",
    description: "Skyr, granola maison, beurre de cacahuète.",
    focus: "Calories faciles",
    recette: "Dans un grand bol, mélangez 250g de Skyr avec 50g de granola. Ajoutez une cuillère à soupe de beurre de cacahuète.",
    options: [
      { nom: "Skyr Beurre Cacahuète", image: imgSnack1 },
      { nom: "Gainer Maison", image: imgSnack2 },
      { nom: "Pain complet Beurre Amande", image: imgSnack3 }
    ]
  },
  pre_workout: {
    nom: "Banane & Beurre d'Amande",
    description: "1 grosse banane + beurre d'amande.",
    focus: "Énergie soutenue",
    recette: "Coupez une banane en deux et tartinez le centre de beurre d'amande.",
    options: [
      { nom: "Banane Beurre Amande", image: imgSnack3 },
      { nom: "Gâteau de riz", image: imgPtDej1 }
    ]
  },
  post_workout: {
    nom: "Gainer Maison CREATINE_PLACEHOLDER",
    description: "WHEY_PLACEHOLDER, lait, avoine mixés. CREATINE_DESC_PLACEHOLDER",
    focus: "Insuline spike",
    recette: "Mixez 300ml de lait entier, 1 portion de poudre, 50g de poudre d'avoine, 1 banane (et créatine si prévue).",
    options: [
      { nom: "Gainer Liquide", image: imgSnack2 },
      { nom: "Repas Solide Poulet Riz", image: imgDej2 },
      { nom: "Plat Halal: Riz blanc & Poulet (Halal)", image: imgDej2 }
    ]
  },
  diner: {
    nom: "Saumon & Quinoa",
    description: "Saumon, quinoa, épinards, avocat.",
    focus: "Oméga-3",
    recette: "Cuire 150g de saumon au four (180°C, 15 min) et 80g de quinoa. Servir sur des jeunes pousses d'épinards avec un demi-avocat.",
    options: [
      { nom: "Saumon Avocat", image: imgDej3 },
      { nom: "Steak & Pâtes", image: imgDiner2 },
      { nom: "Plat Halal: Escalope de Veau (Halal) & Riz", image: imgDiner3 }
    ]
  },
  nuit: {
    nom: "Fromage Blanc & Noix",
    description: "Fromage blanc, noix, cacao.",
    focus: "Anti-catabolisme",
    recette: "Ajoutez une poignée de noix et une cuillère de cacao pur dans 200g de fromage blanc.",
    options: [
      { nom: "Fromage Blanc Noix", image: imgSnack1 }
    ]
  }
};

const repasMaintien = {
  petit_dejeuner: {
    nom: "Porridge Protéiné",
    description: "Flocons d'avoine, lait, WHEY_DESC_PLACEHOLDER.",
    focus: "Équilibre",
    recette: "Chauffez 60g d'avoine avec 150ml de lait demi-écrémé. Ajoutez la poudre protéinée en fin de cuisson.",
    options: [
      { nom: "Porridge Protéiné", image: imgPtDej1 },
      { nom: "Oeufs au plat", image: imgPtDej3 },
      { nom: "Plat Halal: Toast Avocat & Oeuf", image: imgPtDej3 }
    ]
  },
  dejeuner: {
    nom: "Poulet & Patate Douce",
    description: "Poulet, patate douce, brocolis.",
    focus: "Repas équilibré",
    recette: "Faites dorer 130g de blanc de poulet. Servez avec 150g de patate douce rôtie et 100g de brocolis vapeur.",
    options: [
      { nom: "Poulet Patate Douce", image: imgDiner3 },
      { nom: "Salade composée", image: imgDej1 },
      { nom: "Plat Halal: Poulet Curry (Halal) & Riz basmati", image: imgDiner3 }
    ]
  },
  collation: {
    nom: "Yaourt Grec & Amandes",
    description: "Yaourt grec nature, amandes.",
    focus: "Satiété",
    recette: "Servez 150g de yaourt grec avec une quinzaine d'amandes.",
    options: [
      { nom: "Yaourt Amandes", image: imgSnack1 },
      { nom: "Shaker", image: imgSnack2 }
    ]
  },
  pre_workout: {
    nom: "Pain Complet & Miel",
    description: "Tranches de pain complet avec miel.",
    focus: "Glucides de préparation",
    recette: "Faites griller deux tranches de pain complet et étalez finement du miel.",
    options: [
      { nom: "Pain Miel", image: imgPtDej2 },
      { nom: "Banane", image: imgSnack3 }
    ]
  },
  post_workout: {
    nom: "WHEY_PLACEHOLDER & Fruit CREATINE_PLACEHOLDER",
    description: "WHEY_DESC_PLACEHOLDER et un fruit. CREATINE_DESC_PLACEHOLDER",
    focus: "Récupération immédiate",
    recette: "Diluez la poudre dans l'eau. Consommez avec un fruit de saison.",
    options: [
      { nom: "Whey & Fruit", image: imgSnack2 },
      { nom: "Plat Halal: Poulet (Halal) & Riz", image: imgDej2 }
    ]
  },
  diner: {
    nom: "Steak Haché 5% & Pâtes Complètes",
    description: "Steak haché 5% MG, pâtes complètes.",
    focus: "Reconstruction musculaire",
    recette: "Cuisez 70g de pâtes complètes. Poêlez un steak haché à 5% MG et mélangez avec du coulis de tomate.",
    options: [
      { nom: "Steak Pâtes", image: imgDiner2 },
      { nom: "Poisson Riz", image: imgDej3 },
      { nom: "Plat Halal: Steak haché (Halal) & Boulgour", image: imgDiner2 }
    ]
  },
  nuit: {
    nom: "Skyr Nature",
    description: "Un bol de Skyr.",
    focus: "Protéines nocturnes",
    recette: "Versez 150g de Skyr dans un bol. Ajoutez quelques gouttes de vanille si désiré.",
    options: [
      { nom: "Skyr", image: imgSnack1 }
    ]
  }
};

function adaptPlanToPreferences(plan, prefs) {
  const newPlan = JSON.parse(JSON.stringify(plan));
  
  for (const key in newPlan) {
    if (newPlan[key]) {
      if (prefs.use_whey) {
        newPlan[key].nom = newPlan[key].nom.replace('WHEY_PLACEHOLDER', 'Whey');
        newPlan[key].description = newPlan[key].description.replace('WHEY_DESC_PLACEHOLDER', '1 dose de whey');
      } else {
        newPlan[key].nom = newPlan[key].nom.replace('WHEY_PLACEHOLDER', 'Skyr / Œufs');
        newPlan[key].description = newPlan[key].description.replace('WHEY_DESC_PLACEHOLDER', '150g de Skyr ou 3 blancs d\'œufs');
      }
      
      if (prefs.use_creatine) {
        newPlan[key].nom = newPlan[key].nom.replace('CREATINE_PLACEHOLDER', '+ Créatine');
        newPlan[key].description = newPlan[key].description.replace('CREATINE_DESC_PLACEHOLDER', 'Mélange 5g de Créatine.');
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
