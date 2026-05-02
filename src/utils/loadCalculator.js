/**
 * Calcul des charges de travail basé sur le 1RM
 * Formule d'Epley : 1RM = poids × (1 + reps/30)
 */

// Pourcentages du 1RM selon l'objectif
const LOAD_PERCENTAGES = {
  force: { min: 0.80, max: 0.90, reps: '3-6' },
  prise_masse: { min: 0.65, max: 0.80, reps: '8-12' },
  hypertrophie: { min: 0.65, max: 0.80, reps: '8-12' },
  tonification: { min: 0.55, max: 0.65, reps: '12-15' },
  endurance: { min: 0.40, max: 0.55, reps: '15-20' },
  perte_poids: { min: 0.50, max: 0.65, reps: '12-20' },
  seche: { min: 0.55, max: 0.70, reps: '10-15' },
};

/**
 * Estimer le 1RM à partir d'un poids et d'un nombre de reps
 */
export function estimate1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Calculer la charge de travail recommandée selon l'objectif
 */
export function getWorkingLoad(maxLoad1RM, objectif) {
  if (!maxLoad1RM || maxLoad1RM <= 0) return null;
  const config = LOAD_PERCENTAGES[objectif] || LOAD_PERCENTAGES.prise_masse;
  
  return {
    minLoad: Math.round(maxLoad1RM * config.min * 2) / 2, // arrondi au 0.5
    maxLoad: Math.round(maxLoad1RM * config.max * 2) / 2,
    repsRange: config.reps,
    percentage: `${Math.round(config.min * 100)}-${Math.round(config.max * 100)}%`,
  };
}

/**
 * Suggérer une progression de charge
 * +0.5kg quand l'utilisateur atteint le haut de la plage de reps
 */
export function suggestNextLoad(currentLoad, repsAchieved, repsMax, objectif) {
  if (!currentLoad || !repsAchieved) return null;
  
  if (repsAchieved >= repsMax) {
    // L'utilisateur a atteint le max : on augmente la charge
    const increment = objectif === 'force' ? 2.5 : 0.5;
    return {
      action: 'increase',
      newLoad: currentLoad + increment,
      message: `Bravo ! Passe à ${currentLoad + increment} kg`,
    };
  }
  
  return {
    action: 'maintain',
    newLoad: currentLoad,
    message: `Continue à ${currentLoad} kg, vise ${repsAchieved + 1} reps`,
  };
}

/**
 * Estimer les kcal brûlées par exercice
 * Formule simplifiée : MET × poids (kg) × durée (heures)
 * MET musculation ≈ 3-8 selon l'intensité
 */
export function estimateKcalBurned(poidsKg, durationMinutes, exerciseType = 'hypertrophie', niveau = 'debutant') {
  if (!poidsKg || !durationMinutes) return 0;
  
  const MET_VALUES = {
    force: 6.0,
    hypertrophie: 5.0,
    endurance: 4.5,
    cardio: 8.0,
    mobilite: 2.5,
    plyometrie: 7.5,
  };
  
  const LEVEL_MULTIPLIER = {
    debutant: 0.85,
    intermediaire: 1.0,
    avance: 1.15,
  };
  
  const met = MET_VALUES[exerciseType] || 5.0;
  const levelMult = LEVEL_MULTIPLIER[niveau] || 1.0;
  const durationHours = durationMinutes / 60;
  
  return Math.round(met * poidsKg * durationHours * levelMult);
}
