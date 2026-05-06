/**
 * Calculs biométriques et nutritionnels pour Mouv'Body
 * Basé sur la documentation sport complète (Sections 1, 3, 4, 10, 11)
 */

// ============================================
// IMC
// ============================================
export function calculateIMC(poidsKg, tailleCm) {
  if (!poidsKg || !tailleCm || tailleCm === 0) return null;
  const tailleM = tailleCm / 100;
  return Math.round((poidsKg / (tailleM * tailleM)) * 10) / 10;
}

export function getIMCCategory(imc) {
  if (!imc) return null;
  if (imc < 16) return { label: 'Dénutrition', color: 'error', alert: true };
  if (imc < 18.5) return { label: 'Maigreur', color: 'warning', alert: false };
  if (imc < 25) return { label: 'Normal', color: 'success', alert: false };
  if (imc < 30) return { label: 'Surpoids', color: 'warning', alert: false };
  if (imc < 35) return { label: 'Obésité modérée', color: 'error', alert: false };
  if (imc < 40) return { label: 'Obésité sévère', color: 'error', alert: true };
  return { label: 'Obésité morbide', color: 'error', alert: true };
}

// ============================================
// MÉTABOLISME DE BASE (Harris-Benedict révisé)
// ============================================
export function calculateMetabolismeBase(poidsKg, tailleCm, age, sexe) {
  if (!poidsKg || !tailleCm || !age || !sexe) return null;
  if (sexe === 'homme') {
    return Math.round(88.362 + (13.397 * poidsKg) + (4.799 * tailleCm) - (5.677 * age));
  }
  return Math.round(447.593 + (9.247 * poidsKg) + (3.098 * tailleCm) - (4.330 * age));
}

// ============================================
// DÉPENSE ÉNERGÉTIQUE TOTALE
// ============================================
export function calculateTDEE(metabolismeBase, activityLevel) {
  if (!metabolismeBase) return null;
  const multipliers = {
    sedentaire: 1.2,
    leger: 1.375,
    actif: 1.55,
    tres_actif: 1.725,
    extreme: 1.9 // Not in onboarding but for completeness
  };
  const multiplier = multipliers[activityLevel] || 1.2;
  return Math.round(metabolismeBase * multiplier);
}

// ============================================
// MACROS (adapté par morphotype + objectif)
// ============================================
export function calculateMacros(tdee, poidsKg, objectif, morphotype, bodyFat = '15_20') {
  if (!tdee || !poidsKg) return null;

  let caloriesAjustees = tdee;
  let proteinesParKg = 2.0; // Default
  let pourcentageLipides = 0.25; // Default

  // 1. Ajustement calorique par objectif (BWS Logic)
  switch (objectif) {
    case 'perte_poids':
      caloriesAjustees = Math.round(tdee * 0.80); // Déficit -20%
      proteinesParKg = 2.2; // Plus de protéines en déficit pour préserver le muscle
      break;
    case 'deficit_calorique':
      caloriesAjustees = Math.round(tdee * 0.85); // Déficit -15%
      proteinesParKg = 2.0;
      break;
    case 'seche':
      caloriesAjustees = Math.round(tdee * 0.90); // Déficit -10%
      proteinesParKg = 2.4; // Très haut en protéines pour le "shred"
      break;
    case 'prise_masse':
      caloriesAjustees = Math.round(tdee * 1.10); // Surplus +10% (BWS recommande souvent +10-15%)
      proteinesParKg = 1.8; // Moins critique car surplus énergétique
      break;
    case 'recomposition':
      caloriesAjustees = tdee; // Maintenance
      proteinesParKg = 2.2;
      break;
    case 'tonification':
      caloriesAjustees = Math.round(tdee * 0.95); // Léger déficit -5%
      proteinesParKg = 2.0;
      break;
    case 'endurance':
      caloriesAjustees = tdee;
      proteinesParKg = 1.6;
      pourcentageLipides = 0.30; // Plus de gras pour l'énergie longue durée
      break;
    default:
      caloriesAjustees = tdee;
  }

  // 2. Ajustement selon le Body Fat (BWS Logic)
  // Plus on est gras, moins on a besoin de protéines par kg de poids total (car moins de masse sèche relative)
  if (bodyFat === 'plus_20') {
    proteinesParKg -= 0.2;
  } else if (bodyFat === 'moins_10') {
    proteinesParKg += 0.2;
  }

  const proteines = Math.round(poidsKg * proteinesParKg);
  const lipides = Math.round((caloriesAjustees * pourcentageLipides) / 9);
  const caloriesRestantes = caloriesAjustees - (proteines * 4) - (lipides * 9);
  const glucides = Math.round(caloriesRestantes / 4);

  return {
    calories: caloriesAjustees,
    proteines,
    glucides: Math.max(glucides, 50),
    lipides,
    ratios: {
      proteines: Math.round((proteines * 4 / caloriesAjustees) * 100),
      glucides: Math.round((Math.max(glucides, 50) * 4 / caloriesAjustees) * 100),
      lipides: Math.round((lipides * 9 / caloriesAjustees) * 100),
    }
  };
}

// ============================================
// REPOS ENTRE SÉRIES (selon objectif)
// ============================================
export function getReposRecommande(objectif) {
  switch (objectif) {
    case 'perte_poids': return { secondes: 30, label: '30s' };
    case 'tonification': return { secondes: 60, label: '1 min' };
    case 'prise_masse': return { secondes: 120, label: '2 min' };
    case 'endurance': return { secondes: 45, label: '45s' };
    default: return { secondes: 90, label: '1m30' };
  }
}

// ============================================
// HYDRATATION recommandée
// ============================================
export function calculateHydratation(poidsKg, jourEntrainement = false) {
  let base = Math.round(poidsKg * 33); // 33ml/kg
  if (jourEntrainement) base += 500; // +500ml les jours d'entraînement
  return base;
}

// ============================================
// SURCHARGE PROGRESSIVE
// ============================================
export function suggestProgression(exerciceType, derniereCharge, dernieresReps, repsMax) {
  if (!derniereCharge || !dernieresReps) return null;

  // Si l'utilisateur atteint le max de reps, augmenter la charge
  if (dernieresReps >= repsMax) {
    return {
      type: 'augmenter_charge',
      nouvelleCharge: exerciceType === 'force' 
        ? derniereCharge + 2.5 
        : derniereCharge + 1.25,
      message: `Passez à ${derniereCharge + 2.5}kg, visez ${repsMax - 2} reps`
    };
  }

  // Sinon, augmenter les reps
  return {
    type: 'augmenter_reps',
    nouvelleCharge: derniereCharge,
    message: `Gardez ${derniereCharge}kg, visez ${dernieresReps + 1} reps`
  };
}

// ============================================
// FILTRAGE EXERCICES PAR PATHOLOGIES
// ============================================
export function filterExercisesByPathologies(exercises, userPathologies) {
  if (!userPathologies || userPathologies.length === 0) return exercises;
  
  const zones = userPathologies.map(p => p.zone);
  
  return exercises.filter(ex => {
    const exclues = ex.pathologies_exclues || [];
    return !exclues.some(z => zones.includes(z));
  });
}

// ============================================
// FILTRAGE CASCADE (Section 14 du doc)
// ============================================
export function filterExercisesCascade(exercises, profile) {
  let filtered = [...exercises];

  // 1. Filtrer par pathologies/IMC
  if (profile.pathologies) {
    filtered = filterExercisesByPathologies(filtered, profile.pathologies);
  }

  // IMC > 35 : exclure exercices à fort impact
  if (profile.imc > 35) {
    filtered = filtered.filter(ex => ex.type !== 'plyometrie');
  }

  // 2. Filtrer par mode (salle vs street workout)
  filtered = filtered.filter(ex => 
    ex.mode === profile.mode_entrainement || ex.mode === 'les_deux'
  );

  // 3. Filtrer par niveau
  const niveauOrder = { debutant: 0, intermediaire: 1, avance: 2 };
  const userLevel = niveauOrder[profile.niveau] || 0;
  filtered = filtered.filter(ex => {
    const exLevel = niveauOrder[ex.niveau_min] || 0;
    return exLevel <= userLevel;
  });

  return filtered;
}
