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
const ACTIVITY_MULTIPLIERS = {
  sedentaire: 1.2,
  leger: 1.375,       // 1-3 jours/semaine
  modere: 1.55,        // 3-5 jours/semaine
  actif: 1.725,        // 6-7 jours/semaine
  tres_actif: 1.9,     // 2x/jour
};

export function calculateTDEE(metabolismeBase, joursSemaine) {
  if (!metabolismeBase) return null;
  let level = 'sedentaire';
  if (joursSemaine >= 6) level = 'actif';
  else if (joursSemaine >= 3) level = 'modere';
  else if (joursSemaine >= 1) level = 'leger';
  return Math.round(metabolismeBase * ACTIVITY_MULTIPLIERS[level]);
}

// ============================================
// MACROS (adapté par morphotype + objectif)
// ============================================
export function calculateMacros(tdee, poidsKg, objectif, morphotype, jourEntrainement = true) {
  if (!tdee || !poidsKg) return null;

  let caloriesAjustees = tdee;
  let proteinesParKg, pourcentageLipides;

  // Ajustement calorique par objectif
  switch (objectif) {
    case 'perte_poids':
      caloriesAjustees = Math.round(tdee * 0.80); // -20%
      proteinesParKg = 2.2;
      pourcentageLipides = 0.25;
      break;
    case 'prise_masse':
      caloriesAjustees = Math.round(tdee * 1.15); // +15%
      proteinesParKg = 2.0;
      pourcentageLipides = 0.25;
      break;
    case 'tonification':
      caloriesAjustees = Math.round(tdee * 0.95); // -5%
      proteinesParKg = 2.0;
      pourcentageLipides = 0.28;
      break;
    case 'endurance':
    default:
      caloriesAjustees = tdee;
      proteinesParKg = 1.6;
      pourcentageLipides = 0.30;
      break;
  }

  // Ajustement morphotype
  switch (morphotype) {
    case 'ectomorphe':
      caloriesAjustees = Math.round(caloriesAjustees * 1.10); // +10% car métabolisme rapide
      proteinesParKg = Math.min(proteinesParKg + 0.2, 2.4);
      break;
    case 'endomorphe':
      caloriesAjustees = Math.round(caloriesAjustees * 0.92); // -8% tendance au stockage
      pourcentageLipides = Math.max(pourcentageLipides - 0.03, 0.20);
      break;
    // Mésomorphe = baseline
  }

  // Jour repos : réduire glucides
  if (!jourEntrainement) {
    caloriesAjustees = Math.round(caloriesAjustees * 0.90);
  }

  const proteines = Math.round(poidsKg * proteinesParKg);
  const lipides = Math.round((caloriesAjustees * pourcentageLipides) / 9);
  const caloriesRestantes = caloriesAjustees - (proteines * 4) - (lipides * 9);
  const glucides = Math.round(caloriesRestantes / 4);

  return {
    calories: caloriesAjustees,
    proteines,
    glucides: Math.max(glucides, 50), // minimum 50g glucides
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
