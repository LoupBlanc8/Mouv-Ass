import { STREET_WORKOUT_PROGRAMS } from '../data/streetWorkoutSkills';
import { supabase } from '../lib/supabase';

// ============================================
// VALEURS AUTORISEES PAR LA CONTRAINTE DB
// ============================================
const VALID_TYPE_SESSIONS = [
  'push', 'pull', 'legs', 'upper', 'lower', 'full_body',
  'cardio', 'repos_actif', 'repos', 'musculation', 'bras', 'ppl', 'seche', 'core'
];

/**
 * Sanitise un type_session pour qu'il soit compatible avec la contrainte DB.
 * Mappe les valeurs courantes de l'IA vers des valeurs autorisées.
 */
function sanitizeTypeSession(rawType) {
  if (!rawType) return 'musculation';
  const t = rawType.toLowerCase().trim().replace(/\s+/g, '_');
  
  // Déjà valide
  if (VALID_TYPE_SESSIONS.includes(t)) return t;
  
  // Mappings courants que l'IA pourrait renvoyer
  const mappings = {
    'chest': 'push', 'chest_triceps': 'push', 'poussee': 'push', 'poussée': 'push',
    'back': 'pull', 'back_biceps': 'pull', 'tirage': 'pull',
    'shoulders': 'push', 'epaules': 'push', 'épaules': 'push',
    'arms': 'bras', 'biceps': 'bras', 'triceps': 'bras',
    'leg': 'legs', 'jambes': 'legs', 'lower_body': 'lower',
    'upper_body': 'upper', 'haut_du_corps': 'upper', 'bas_du_corps': 'lower',
    'fullbody': 'full_body', 'total_body': 'full_body',
    'hiit': 'cardio', 'conditioning': 'cardio', 'circuit': 'cardio',
    'abs': 'core', 'abdos': 'core', 'abdominals': 'core',
    'rest': 'repos', 'recovery': 'repos_actif', 'recuperation': 'repos_actif',
    'hypertrophy': 'musculation', 'strength': 'musculation', 'force': 'musculation',
    'push_pull': 'ppl', 'push_pull_legs': 'ppl',
    'seche_upper': 'musculation', 'seche_lower': 'musculation',
  };
  
  if (mappings[t]) return mappings[t];
  
  // Recherche partielle
  if (t.includes('push')) return 'push';
  if (t.includes('pull')) return 'pull';
  if (t.includes('leg')) return 'legs';
  if (t.includes('upper')) return 'upper';
  if (t.includes('lower')) return 'lower';
  if (t.includes('full')) return 'full_body';
  if (t.includes('cardio') || t.includes('hiit')) return 'cardio';
  if (t.includes('bras') || t.includes('arm')) return 'bras';
  if (t.includes('core') || t.includes('abdo')) return 'core';
  
  // Fallback ultime
  console.warn(`[sanitizeTypeSession] Valeur inconnue: "${rawType}" → fallback "musculation"`);
  return 'musculation';
}

// ============================================
// GENERATEUR IA ASSISTE
// ============================================
export async function generateProgramSessionsAsync(formData, allExercises) {
  try {
    const { data, error } = await supabase.functions.invoke('generate-program', {
      body: { profile: formData, exercises: allExercises }
    });
    
    if (error) throw error;
    
    // Convertir la réponse de l'IA au format attendu par Onboarding
    const sessionsData = [];
    const sessionExercisesData = [];
    
    // Associer les jours de la semaine aux séances
    const joursDispo = formData.jours_semaine || [];
    
    data.sessions.forEach((sess, i) => {
      // Assigner le jour au prorata ou utiliser l'index s'il ne correspond pas
      const jourIndex = joursDispo[i % joursDispo.length] ?? 0;
      
      sessionsData.push({
        jour_semaine: jourIndex,
        nom: sess.nom,
        type_session: sanitizeTypeSession(sess.type_session),
        ordre: i
      });
      
      const exercicesList = sess.exercices.map(ex => ({
        exercise_id: ex.exercise_id,
        ordre: ex.ordre,
        series: ex.series,
        reps_min: ex.reps_min,
        reps_max: ex.reps_max,
        repos_secondes: ex.repos_secondes
      }));
      
      sessionExercisesData.push(exercicesList);
    });
    
    return {
      sessionsData,
      sessionExercisesData,
      programType: data.split_type || 'full_body'
    };
  } catch (err) {
    console.error("Génération IA échouée, fallback sur l'algorithme local", err);
    // Fallback à la fonction locale
    return generateProgramSessions(formData, allExercises);
  }
}

/**
 * Générateur de programmes d'entraînement intelligent pour Mouv'Body
 * 
 * Splits supportés :
 * - Full Body (2-3 jours)
 * - Upper/Lower (4 jours)
 * - Upper/Lower + Bras (5 jours)
 * - Push/Pull/Legs (5-6 jours)
 * 
 * Règles :
 * - AUCUN exercice en double dans la même séance
 * - Séances adaptées au niveau, objectif, morphotype et pathologies
 * - Repos adapté à l'objectif
 */

// ============================================
// CONFIGURATION PAR OBJECTIF
// ============================================
const OBJECTIVE_CONFIG = {
  perte_poids: { sets: 3, repsMin: 12, repsMax: 20, repos: 45, label: 'Perte de poids' },
  seche: { sets: 3, repsMin: 10, repsMax: 15, repos: 60, label: 'Sèche' },
  deficit_calorique: { sets: 3, repsMin: 10, repsMax: 15, repos: 60, label: 'Déficit calorique' },
  prise_masse: { sets: 4, repsMin: 8, repsMax: 12, repos: 120, label: 'Prise de masse' },
  recomposition: { sets: 4, repsMin: 8, repsMax: 12, repos: 90, label: 'Recomposition corporelle' },
  tonification: { sets: 3, repsMin: 12, repsMax: 15, repos: 60, label: 'Tonification' },
  endurance: { sets: 3, repsMin: 15, repsMax: 25, repos: 30, label: 'Endurance' },
  street_workout: { sets: 3, repsMin: 8, repsMax: 15, repos: 90, label: 'Street Workout' },
};

// ============================================
// TEMPLATES DE SÉANCES PAR SPLIT
// ============================================

// Groupes musculaires par type de séance
const SESSION_TEMPLATES = {
  upper: {
    nom: 'Haut du Corps',
    type_session: 'upper',
    groups: [
      { group: 'Pectoraux', count: 2 },
      { group: 'Dos', count: 2 },
      { group: 'Epaules', count: 1 },
      { group: 'Bras', count: 1 },
    ]
  },
  lower: {
    nom: 'Bas du Corps',
    type_session: 'lower',
    groups: [
      { group: 'Quadriceps', count: 2 },
      { group: 'Ischio-jambiers', count: 1 },
      { group: 'Fessiers', count: 1 },
      { group: 'Mollets', count: 1 },
      { group: 'Abdos', count: 1 },
    ]
  },
  push: {
    nom: 'Push (Poussée)',
    type_session: 'push',
    groups: [
      { group: 'Pectoraux', count: 2 },
      { group: 'Epaules', count: 2 },
      { group: 'Triceps', count: 2 },
    ]
  },
  pull: {
    nom: 'Pull (Tirage)',
    type_session: 'pull',
    groups: [
      { group: 'Dos', count: 3 },
      { group: 'Biceps', count: 2 },
      { group: 'Abdos', count: 1 },
    ]
  },
  legs: {
    nom: 'Legs (Jambes)',
    type_session: 'legs',
    groups: [
      { group: 'Quadriceps', count: 2 },
      { group: 'Ischio-jambiers', count: 2 },
      { group: 'Fessiers', count: 1 },
      { group: 'Mollets', count: 1 },
    ]
  },
  full_body: {
    nom: 'Full Body',
    type_session: 'full_body',
    groups: [
      { group: 'Pectoraux', count: 1 },
      { group: 'Dos', count: 1 },
      { group: 'Epaules', count: 1 },
      { group: 'Quadriceps', count: 1 },
      { group: 'Ischio-jambiers', count: 1 },
      { group: 'Abdos', count: 1 },
    ]
  },
  bras: {
    nom: 'Séance Bras',
    type_session: 'bras',
    groups: [
      { group: 'Biceps', count: 3 },
      { group: 'Triceps', count: 3 },
    ]
  },
  // Séance sèche mixte (musculation + cardio)
  seche_upper: {
    nom: 'Sèche - Haut du Corps',
    type_session: 'musculation',
    groups: [
      { group: 'Pectoraux', count: 2 },
      { group: 'Dos', count: 2 },
      { group: 'Epaules', count: 1 },
      { group: 'Abdos', count: 1 },
    ]
  },
  seche_lower: {
    nom: 'Sèche - Bas du Corps',
    type_session: 'musculation',
    groups: [
      { group: 'Quadriceps', count: 2 },
      { group: 'Ischio-jambiers', count: 1 },
      { group: 'Fessiers', count: 1 },
      { group: 'Mollets', count: 1 },
      { group: 'Abdos', count: 1 },
    ]
  },
  hiit: {
    nom: 'HIIT & Core',
    type_session: 'cardio',
    isCardio: true,
    groups: []
  },
};

// ============================================
// STRATÉGIE DE SPLIT PAR NOMBRE DE JOURS
// ============================================
function determineSplit(formData) {
  const numDays = formData.jours_semaine.length;
  const objectif = formData.objectif;
  const niveau = formData.niveau;

  // Street Workout → logique dédiée
  if (formData.mode_entrainement === 'street_workout' || objectif === 'street_workout') {
    return 'street_workout';
  }

  // Sèche / Déficit calorique → split spécialisé
  if (objectif === 'seche' || objectif === 'deficit_calorique') {
    return 'seche';
  }

  // Split basé sur le nombre de jours
  if (numDays <= 3) return 'full_body';
  if (numDays === 4) return 'upper_lower';
  if (numDays === 5) return 'upper_lower_arms';
  return 'ppl'; // 6+ jours
}

// ============================================
// ASSIGNATION DES TEMPLATES PAR JOUR
// ============================================
function getSessionSchedule(splitType, numDays) {
  switch (splitType) {
    case 'full_body':
      return Array(numDays).fill('full_body');

    case 'upper_lower':
      if (numDays === 4) return ['upper', 'lower', 'upper', 'lower'];
      if (numDays === 3) return ['upper', 'lower', 'full_body'];
      return ['upper', 'lower'].slice(0, numDays);

    case 'upper_lower_arms':
      return ['upper', 'lower', 'push', 'pull', 'legs'].slice(0, numDays);

    case 'ppl':
      if (numDays === 6) return ['push', 'pull', 'legs', 'push', 'pull', 'legs'];
      if (numDays === 5) return ['push', 'pull', 'legs', 'upper', 'lower'];
      return ['push', 'pull', 'legs', 'push', 'pull', 'legs'].slice(0, numDays);

    case 'seche':
      if (numDays <= 3) return ['seche_upper', 'seche_lower', 'hiit'].slice(0, numDays);
      if (numDays === 4) return ['seche_upper', 'hiit', 'seche_lower', 'seche_upper'];
      if (numDays === 5) return ['seche_upper', 'hiit', 'seche_lower', 'seche_upper', 'hiit'];
      return ['seche_upper', 'hiit', 'seche_lower', 'seche_upper', 'hiit', 'seche_lower'];

    default:
      return Array(numDays).fill('full_body');
  }
}

// ============================================
// HIIT / CARDIO EXERCISES (en dur car pas toujours en BDD)
// ============================================
const HIIT_EXERCISES = [
  { nom: 'Burpees', series: 4, reps_min: 0, reps_max: 0, repos: 30, notes: 'Travailler pendant 30s' },
  { nom: 'Mountain Climbers', series: 4, reps_min: 0, reps_max: 0, repos: 30, notes: 'Travailler pendant 30s' },
  { nom: 'Jumping Jacks', series: 4, reps_min: 0, reps_max: 0, repos: 30, notes: 'Travailler pendant 30s' },
  { nom: 'Gainage Planche', series: 3, reps_min: 0, reps_max: 0, repos: 45, notes: 'Maintenir 45s' },
  { nom: 'Russian Twists', series: 3, reps_min: 20, reps_max: 20, repos: 30, notes: '' },
];

// ============================================
// MATCHING EXERCICE → GROUPE MUSCULAIRE
// ============================================
function isMuscleMatch(exMuscles, targetGroup) {
  if (!exMuscles || !Array.isArray(exMuscles)) return false;
  const tg = targetGroup.toLowerCase();

  return exMuscles.some(m => {
    const ml = m.toLowerCase();

    // Matching spécifique pour chaque groupe
    if (tg === 'quadriceps') return ml.includes('quadriceps') || ml.includes('jambe');
    if (tg === 'ischio-jambiers' || tg === 'ischios') return ml.includes('ischio') || ml.includes('ischios');
    if (tg === 'fessiers') return ml.includes('fessier') || ml.includes('glutéal');
    if (tg === 'mollets') return ml.includes('mollet');
    if (tg === 'pectoraux') return ml.includes('pectora');
    if (tg === 'dos') return ml.includes('dos') || ml.includes('dorsa') || ml.includes('lombaire') || ml.includes('trapèze') || ml.includes('rhomboïde');
    if (tg === 'epaules' || tg === 'épaules') return ml.includes('epaule') || ml.includes('épaule') || ml.includes('deltoïde') || ml.includes('deltoide') || ml.includes('deltoid');
    if (tg === 'biceps') return ml.includes('biceps');
    if (tg === 'triceps') return ml.includes('triceps');
    if (tg === 'bras') return ml.includes('bras') || ml.includes('biceps') || ml.includes('triceps');
    if (tg === 'abdos') return ml.includes('abdo') || ml.includes('oblique') || ml.includes('core') || ml.includes('transverse');
    if (tg === 'jambes') return ml.includes('quadriceps') || ml.includes('ischio') || ml.includes('mollet') || ml.includes('fessier') || ml.includes('jambe');

    return ml.includes(tg) || tg.includes(ml);
  });
}

// ============================================
// SÉLECTION D'EXERCICES SANS DOUBLONS
// ============================================
function pickUniqueExercises(targetGroups, allExercises, formData, usedIds = new Set()) {
  const levelMap = { 'debutant': 1, 'intermediaire': 2, 'avance': 3 };
  const userLevelNum = levelMap[formData.niveau] || 1;
  const config = OBJECTIVE_CONFIG[formData.objectif] || OBJECTIVE_CONFIG.tonification;

  const selectedExercises = [];

  for (const { group, count } of targetGroups) {
    // Filtrer les exercices compatibles avec ce groupe
    let candidates = allExercises.filter(ex => {
      const exLevel = levelMap[ex.niveau_min] || 1;
      return isMuscleMatch(ex.muscles_principaux, group) && exLevel <= userLevelNum && !usedIds.has(ex.id);
    });

    // Fallback si pas assez de candidats au niveau
    if (candidates.length < count) {
      candidates = allExercises.filter(ex =>
        isMuscleMatch(ex.muscles_principaux, group) && !usedIds.has(ex.id)
      );
    }

    // Fallback ultime : chercher dans les muscles secondaires
    if (candidates.length === 0) {
      candidates = allExercises.filter(ex =>
        isMuscleMatch(ex.muscles_secondaires, group) && !usedIds.has(ex.id)
      );
    }

    // Mélanger pour varier
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);

    for (let i = 0; i < Math.min(count, shuffled.length); i++) {
      const ex = shuffled[i];
      usedIds.add(ex.id);
      selectedExercises.push({
        exercise_id: ex.id,
        ordre: selectedExercises.length,
        series: config.sets,
        reps_min: config.repsMin,
        reps_max: config.repsMax,
        repos_secondes: config.repos,
      });
    }
  }

  return selectedExercises;
}

// ============================================
// INJECTION DES POINTS FAIBLES
// ============================================
function injectWeakPoints(templateGroups, pointsFaibles, sessionType) {
  if (!pointsFaibles || pointsFaibles.length === 0) return templateGroups;

  const groups = [...templateGroups];

  // Mapping points faibles → groupes musculaires spécifiques
  const weakPointMap = {
    'Pectoraux': ['Pectoraux'],
    'Dos': ['Dos'],
    'Epaules': ['Epaules'],
    'Bras': ['Biceps', 'Triceps'],
    'Jambes': ['Quadriceps', 'Ischio-jambiers'],
    'Abdos': ['Abdos'],
    'Mollets': ['Mollets'],
  };

  // Groupes pertinents pour ce type de séance
  const upperGroups = ['Pectoraux', 'Dos', 'Epaules', 'Biceps', 'Triceps'];
  const lowerGroups = ['Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets'];
  const pushGroups = ['Pectoraux', 'Epaules', 'Triceps'];
  const pullGroups = ['Dos', 'Biceps'];

  for (const pf of pointsFaibles) {
    const mappedGroups = weakPointMap[pf] || [pf];
    for (const mg of mappedGroups) {
      let isRelevant = false;
      switch (sessionType) {
        case 'upper': isRelevant = upperGroups.includes(mg); break;
        case 'lower': case 'legs': isRelevant = lowerGroups.includes(mg) || mg === 'Abdos'; break;
        case 'push': isRelevant = pushGroups.includes(mg); break;
        case 'pull': isRelevant = pullGroups.includes(mg) || mg === 'Abdos'; break;
        case 'full_body': case 'seche_upper': case 'seche_lower': isRelevant = true; break;
        default: isRelevant = true;
      }

      if (isRelevant) {
        groups.push({ group: mg, count: 1 });
      }
    }
  }

  return groups;
}

// ============================================
// POINT D'ENTRÉE PRINCIPAL
// ============================================
export function generateProgramSessions(formData, allExercises) {
  const sessions = [];
  const sessionExercises = [];
  const numDays = formData.jours_semaine.length;

  if (numDays === 0) {
    return { sessionsData: [], sessionExercisesData: [], programType: 'full_body' };
  }

  // ── Déterminer le split ──
  const splitType = determineSplit(formData);

  // ── STREET WORKOUT : logique dédiée ──
  if (splitType === 'street_workout') {
    return generateStreetWorkoutProgram(formData, allExercises);
  }

  // ── Obtenir le planning des séances ──
  const schedule = getSessionSchedule(splitType, numDays);

  // ── Générer chaque séance ──
  const globalUsedIds = new Set(); // Tracking global pour varier entre séances du même type

  formData.jours_semaine.forEach((jour, i) => {
    const templateKey = schedule[i % schedule.length];
    const template = SESSION_TEMPLATES[templateKey];

    if (!template) return;

    // Créer la séance
    const sessionObj = {
      jour_semaine: jour,
      nom: template.nom,
      type_session: template.type_session,
      duree_estimee: formData.duree_seance || 60,
    };
    sessions.push(sessionObj);

    // Gérer les séances HIIT/Cardio
    if (template.isCardio) {
      const hiitExList = [];
      HIIT_EXERCISES.forEach((hex, j) => {
        // Chercher en BDD pour matcher l'ID
        let dbEx = allExercises.find(e =>
          e.nom.toLowerCase().includes(hex.nom.toLowerCase()) ||
          hex.nom.toLowerCase().includes(e.nom.toLowerCase())
        );

        if (dbEx) {
          hiitExList.push({
            exercise_id: dbEx.id,
            ordre: j,
            series: hex.series,
            reps_min: hex.reps_min,
            reps_max: hex.reps_max,
            repos_secondes: hex.repos,
            notes: hex.notes,
          });
        }
      });
      sessionExercises.push(hiitExList);
      return;
    }

    // Injecter les points faibles dans les groupes
    const enrichedGroups = injectWeakPoints(template.groups, formData.points_faibles, templateKey);

    // Limiter le nombre d'exercices selon la durée
    const maxExercises = Math.max(4, Math.min(8, Math.floor((formData.duree_seance || 60) / 10)));

    // Ajuster le nombre de groupes à la durée disponible
    const adjustedGroups = enrichedGroups.slice(0, maxExercises);

    // Sélectionner les exercices SANS doublons dans la séance
    const sessionUsedIds = new Set();
    const exList = pickUniqueExercises(adjustedGroups, allExercises, formData, sessionUsedIds);

    sessionExercises.push(exList);
  });

  return { sessionsData: sessions, sessionExercisesData: sessionExercises, programType: splitType };
}

// ============================================
// STREET WORKOUT : PROGRAMME DÉDIÉ
// ============================================
function generateStreetWorkoutProgram(formData, allExercises) {
  const sessions = [];
  const sessionExercises = [];

  const swProg = formData.niveau === 'debutant' ? STREET_WORKOUT_PROGRAMS.debutant : STREET_WORKOUT_PROGRAMS.intermediaire;

  formData.jours_semaine.forEach((jour, i) => {
    const sourceSession = swProg.sessions[i % swProg.sessions.length];

    const sessionObj = {
      jour_semaine: jour,
      nom: sourceSession.nom,
      type_session: sourceSession.type_session.toLowerCase().replace(/ /g, '_'),
      duree_estimee: sourceSession.duree_estimee,
    };
    sessions.push(sessionObj);

    const sessionExList = [];
    sourceSession.exercices.forEach((ex, j) => {
      // Fuzzy match
      let dbEx = allExercises.find(e =>
        e.nom.toLowerCase().includes(ex.nom.toLowerCase()) ||
        ex.nom.toLowerCase().includes(e.nom.toLowerCase())
      );

      // Specific fallbacks
      if (!dbEx) {
        const lowerNom = ex.nom.toLowerCase();
        if (lowerNom.includes('pompe')) {
          dbEx = allExercises.find(e => e.nom.toLowerCase() === 'pompes' || e.nom.toLowerCase().includes('pompe'));
        } else if (lowerNom.includes('squat')) {
          dbEx = allExercises.find(e => e.nom.toLowerCase().includes('squat') && (e.materiel?.includes('aucun') || !e.materiel?.length));
        } else if (lowerNom.includes('planche') || lowerNom.includes('gainage')) {
          dbEx = allExercises.find(e => e.nom.toLowerCase().includes('planche') || e.nom.toLowerCase().includes('gainage'));
        }
      }

      // Ultimate fallback
      if (!dbEx) {
        dbEx = allExercises.find(e => {
          const mat = e.materiel || [];
          const matArray = Array.isArray(mat) ? mat : [mat];
          return matArray.some(m => {
            const ml = m.toLowerCase();
            return ml.includes('aucun') || ml.includes('traction') || ml.includes('poids du corps');
          });
        });
      }

      if (dbEx) {
        const isTimed = typeof ex.reps === 'string' && ex.reps.includes('s');
        const numReps = isTimed ? 0 : (parseInt(ex.reps) || 10);

        sessionExList.push({
          exercise_id: dbEx.id,
          ordre: j,
          series: ex.series,
          reps_min: numReps,
          reps_max: numReps,
          repos_secondes: ex.recup || 90,
          notes: isTimed ? `Maintenir pendant ${ex.reps}` : '',
        });
      }
    });
    sessionExercises.push(sessionExList);
  });

  return { sessionsData: sessions, sessionExercisesData: sessionExercises, programType: 'street_workout' };
}
