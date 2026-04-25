// Logique de génération de repas basée sur la documentation nutritionnelle

const imgPtDej1 = "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&w=400&q=80";
const imgPtDej2 = "https://images.unsplash.com/photo-1525385133512-2f3bdd039054?auto=format&fit=crop&w=400&q=80"; // Pancakes
const imgPtDej3 = "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&w=400&q=80"; // Oeufs

const imgDej1 = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80"; // Salade
const imgDej2 = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80"; // Poulet Riz
const imgDej3 = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"; // Saumon

const imgSnack1 = "https://images.unsplash.com/photo-1622597467836-f38240662c8b?auto=format&fit=crop&w=400&q=80"; // Yaourt/Skyr
const imgSnack2 = "https://images.unsplash.com/photo-1550828520-4cb496926fc9?auto=format&fit=crop&w=400&q=80"; // Shaker/Whey
const imgSnack3 = "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&q=80"; // Banane beurre cacahuète

const imgDiner1 = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"; // Bowl healthy
const imgDiner2 = "https://images.unsplash.com/photo-1504630083234-14187a9df0f5?auto=format&fit=crop&w=400&q=80"; // Viande légumes
const imgDiner3 = "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=400&q=80"; // Poulet rôti

const repasPertePoids = {
  petit_dejeuner: {
    nom: "Omelette protéinée & Épinards",
    description: "3 œufs entiers, épinards, 1 tranche pain complet.",
    focus: "Protéines élevées, satiété durable",
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
    options: [
      { nom: "Salade Quinoa Thon", image: imgDej1 },
      { nom: "Poulet grillé & Haricots", image: imgDej2 },
      { nom: "Wrap Dinde Crudités", image: imgDiner1 }
    ]
  },
  collation: {
    nom: "Skyr aux Fruits Rouges",
    description: "200g de Skyr, fruits rouges, graines de chia.",
    focus: "Protéines lentes, IG bas",
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
    options: [
      { nom: "Shaker & Datte", image: imgSnack2 },
      { nom: "Banane", image: imgSnack3 }
    ]
  },
  post_workout: {
    nom: "Riz Blanc & Poulet CREATINE_PLACEHOLDER",
    description: "Riz, poulet, haricots. CREATINE_DESC_PLACEHOLDER",
    focus: "Recharge glycogénique",
    options: [
      { nom: "Poulet & Riz", image: imgDej2 },
      { nom: "Shaker & Banane", image: imgSnack2 }
    ]
  },
  diner: {
    nom: "Cabillaud & Patate Douce",
    description: "Cabillaud, brocolis, patate douce.",
    focus: "Digestion légère",
    options: [
      { nom: "Poisson & Patate douce", image: imgDej3 },
      { nom: "Steak haché 5% & Légumes", image: imgDiner2 }
    ]
  },
  nuit: {
    nom: "Fromage Blanc & Cannelle",
    description: "Fromage blanc 0% et cannelle.",
    focus: "Caséine nocturne",
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
    options: [
      { nom: "Porridge Banane", image: imgPtDej1 },
      { nom: "Pancakes Protéinés", image: imgPtDej2 },
      { nom: "4 Oeufs & Bacon", image: imgPtDej3 }
    ]
  },
  dejeuner: {
    nom: "Poulet & Riz + Fromage",
    description: "Riz blanc, poulet, huile d'olive, fromage.",
    focus: "Protéines, Glucides ++",
    options: [
      { nom: "Poulet Riz XXL", image: imgDej2 },
      { nom: "Pâtes au Boeuf", image: imgDiner2 },
      { nom: "Saumon & Quinoa", image: imgDej3 }
    ]
  },
  collation: {
    nom: "Gros Bol Skyr & Granola",
    description: "Skyr, granola maison, beurre de cacahuète.",
    focus: "Calories faciles",
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
    options: [
      { nom: "Banane Beurre Amande", image: imgSnack3 },
      { nom: "Gâteau de riz", image: imgPtDej1 }
    ]
  },
  post_workout: {
    nom: "Gainer Maison CREATINE_PLACEHOLDER",
    description: "WHEY_PLACEHOLDER, lait, avoine mixés. CREATINE_DESC_PLACEHOLDER",
    focus: "Insuline spike",
    options: [
      { nom: "Gainer Liquide", image: imgSnack2 },
      { nom: "Repas Solide Poulet Riz", image: imgDej2 }
    ]
  },
  diner: {
    nom: "Saumon & Quinoa",
    description: "Saumon, quinoa, épinards, avocat.",
    focus: "Oméga-3",
    options: [
      { nom: "Saumon Avocat", image: imgDej3 },
      { nom: "Steak & Pâtes", image: imgDiner2 }
    ]
  },
  nuit: {
    nom: "Fromage Blanc & Noix",
    description: "Fromage blanc, noix, cacao.",
    focus: "Anti-catabolisme",
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
    options: [
      { nom: "Porridge Protéiné", image: imgPtDej1 },
      { nom: "Oeufs au plat", image: imgPtDej3 }
    ]
  },
  dejeuner: {
    nom: "Poulet & Patate Douce",
    description: "Poulet, patate douce, brocolis.",
    focus: "Repas équilibré",
    options: [
      { nom: "Poulet Patate Douce", image: imgDiner3 },
      { nom: "Salade composée", image: imgDej1 }
    ]
  },
  collation: {
    nom: "Yaourt Grec & Amandes",
    description: "Yaourt grec nature, amandes.",
    focus: "Satiété",
    options: [
      { nom: "Yaourt Amandes", image: imgSnack1 },
      { nom: "Shaker", image: imgSnack2 }
    ]
  },
  pre_workout: {
    nom: "Pain Complet & Miel",
    description: "Tranches de pain complet avec miel.",
    focus: "Glucides de préparation",
    options: [
      { nom: "Pain Miel", image: imgPtDej2 },
      { nom: "Banane", image: imgSnack3 }
    ]
  },
  post_workout: {
    nom: "WHEY_PLACEHOLDER & Fruit CREATINE_PLACEHOLDER",
    description: "WHEY_DESC_PLACEHOLDER et un fruit. CREATINE_DESC_PLACEHOLDER",
    focus: "Récupération immédiate",
    options: [
      { nom: "Whey & Fruit", image: imgSnack2 },
      { nom: "Poulet Riz", image: imgDej2 }
    ]
  },
  diner: {
    nom: "Steak Haché 5% & Pâtes Complètes",
    description: "Steak haché 5% MG, pâtes complètes.",
    focus: "Reconstruction musculaire",
    options: [
      { nom: "Steak Pâtes", image: imgDiner2 },
      { nom: "Poisson Riz", image: imgDej3 }
    ]
  },
  nuit: {
    nom: "Skyr Nature",
    description: "Un bol de Skyr.",
    focus: "Protéines nocturnes",
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
