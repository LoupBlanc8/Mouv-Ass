export function generateRealRecipe(input) {
  if (!input || input.trim() === '') return null;
  
  const text = input.toLowerCase();
  
  // Analyse des Protéines
  let protein = "vos protéines (tofu, lentilles ou haricots)";
  let proteinTitle = "Végé";
  if (text.includes('poulet') || text.includes('dinde')) { 
    protein = "le blanc de volaille coupé en dés"; 
    proteinTitle = "Poulet"; 
  } else if (text.includes('oeuf') || text.includes('œuf')) { 
    protein = "les œufs (brouillés, pochés ou au plat)"; 
    proteinTitle = "Œufs"; 
  } else if (text.includes('thon')) { 
    protein = "le thon au naturel émietté"; 
    proteinTitle = "Thon"; 
  } else if (text.includes('saumon') || text.includes('poisson')) { 
    protein = "le poisson coupé en cubes ou en filet"; 
    proteinTitle = "Poisson"; 
  } else if (text.includes('boeuf') || text.includes('steak') || text.includes('viande') || text.includes('haché')) { 
    protein = "la viande de bœuf à 5% de matière grasse"; 
    proteinTitle = "Bœuf"; 
  } else if (text.includes('crevette')) {
    protein = "les crevettes décortiquées";
    proteinTitle = "Crevettes";
  }
  
  // Analyse des Glucides
  let carb = "une source de glucides (quinoa, boulgour ou pain complet)";
  let carbTitle = "Express";
  if (text.includes('riz')) { 
    carb = "le riz basmati préalablement rincé et cuit"; 
    carbTitle = "au Riz"; 
  } else if (text.includes('pâte') || text.includes('pate') || text.includes('macaroni') || text.includes('spaghetti')) { 
    carb = "les pâtes cuites al dente"; 
    carbTitle = "Façon Pasta"; 
  } else if (text.includes('patate douce')) { 
    carb = "la patate douce coupée en dés et rôtie au four"; 
    carbTitle = "à la Patate Douce"; 
  } else if (text.includes('pomme de terre') || text.includes('patate')) { 
    carb = "les pommes de terre vapeur ou sautées"; 
    carbTitle = "aux Pommes de terre"; 
  } else if (text.includes('semoule') || text.includes('couscous')) {
    carb = "la semoule gonflée à l'eau chaude";
    carbTitle = "Façon Couscous";
  }

  // Analyse des Légumes
  let veg = "quelques légumes de saison de votre choix";
  if (text.includes('brocoli')) veg = "les fleurettes de brocoli cuites à la vapeur";
  else if (text.includes('courgette')) veg = "la courgette coupée en fines demi-lunes";
  else if (text.includes('carotte')) veg = "les carottes râpées ou en julienne";
  else if (text.includes('tomate')) veg = "les tomates cerises coupées en deux";
  else if (text.includes('épinard') || text.includes('epinard')) veg = "les grandes poignées de pousses d'épinards fraîches";
  else if (text.includes('poivron')) veg = "les lamelles de poivron croquantes";
  else if (text.includes('champignon')) veg = "les champignons de Paris émincés";

  // Analyse des lipides / extras
  let fat = "une cuillère à café d'huile d'olive";
  if (text.includes('avocat')) fat = "un demi-avocat coupé en lamelles";
  else if (text.includes('noix') || text.includes('amande') || text.includes('cajou')) fat = "quelques oléagineux concassés pour le croquant";
  else if (text.includes('fromage') || text.includes('gruyère') || text.includes('mozzarella')) fat = "un peu de fromage râpé ou en dés sur le dessus";

  return {
    nom: `Recette Mouv'Body : Bowl ${proteinTitle} ${carbTitle}`,
    recette: `Voici une vraie recette diététique étape par étape avec ce que vous avez :

⏱️ Préparation : 10 min | 🍳 Cuisson : 15 min

🔥 INSTRUCTIONS DE PRÉPARATION :
1. Préparez vos glucides : faites cuire ${carb} dans un grand volume d'eau bouillante salée. Égouttez et réservez.
2. Dans une grande poêle anti-adhésive, faites chauffer ${fat.includes('huile') ? fat : "un filet d'huile d'olive"} à feu moyen.
3. Ajoutez ${protein} et faites dorer uniformément pendant 5 à 7 minutes. Assaisonnez immédiatement avec du sel, du poivre, et une touche de paprika, curry ou herbes de Provence selon vos goûts.
4. Incorporez ${veg} directement dans la poêle avec la source de protéines. Laissez mijoter à couvert pendant 3 à 5 minutes pour garder les légumes légèrement croquants et préserver leurs vitamines.
5. Dressage : Dans une belle assiette creuse ou un grand bol, disposez la base de glucides, ajoutez le mélange poêlé par-dessus. ${fat.includes('huile') ? '' : `Terminez en ajoutant ${fat}.`} 
6. (Optionnel) : Un filet de jus de citron et quelques herbes fraîches (coriandre ou persil) relèveront parfaitement le goût de ce plat !

💡 Astuce Mouv'Body : Cette recette utilise vos ingrédients (${input.substring(0, 30)}${input.length > 30 ? '...' : ''}) et s'adapte parfaitement à un objectif sportif grâce à un bon ratio protéines/glucides.`
  };
}
