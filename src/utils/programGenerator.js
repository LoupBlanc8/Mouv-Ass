import { STREET_WORKOUT_PROGRAMS } from '../data/streetWorkoutSkills';

export function generateProgramSessions(formData, allExercises) {
  const sessions = [];
  const sessionExercises = [];
  const numDays = formData.jours_semaine.length;
  
  // Define split strategy based on number of days and level
  let splitType = 'full_body';
  if (numDays === 4) splitType = 'upper_lower';
  else if (numDays >= 5) splitType = 'ppl';
  
  // --- STREET WORKOUT LOGIC ---
  // We assume street workout uses bodyweight logic from our new data
  const isStreetWorkout = formData.mode_entrainement === 'street_workout' || formData.objectif === 'street_workout';
  
  if (isStreetWorkout) {
    const swProg = formData.niveau === 'debutant' ? STREET_WORKOUT_PROGRAMS.debutant : STREET_WORKOUT_PROGRAMS.intermediaire;
    
    // We try to match SW sessions to user's selected days
    formData.jours_semaine.forEach((jour, i) => {
      const sourceSession = swProg.sessions[i % swProg.sessions.length];
      
      const sessionObj = {
        jour_semaine: jour,
        nom: sourceSession.nom,
        type_session: sourceSession.type_session,
        duree_estimee: sourceSession.duree_estimee
      };
      sessions.push(sessionObj);
      
      const sessionExList = [];
      sourceSession.exercices.forEach((ex, j) => {
        // Find matching exercise in DB by name if possible, or fallback to random bodyweight
        let dbEx = allExercises.find(e => e.nom.toLowerCase().includes(ex.nom.toLowerCase()));
        if (!dbEx) {
          // Fallback
          dbEx = allExercises.find(e => e.equipement === 'aucun' || e.equipement === 'barre_traction');
        }
        
        if (dbEx) {
          sessionExList.push({
            exercise_id: dbEx.id,
            ordre: j,
            series: ex.series,
            reps_min: typeof ex.reps === 'string' ? 0 : ex.reps, // If time-based like "20s", reps_min is 0 (or we handle it differently)
            reps_max: typeof ex.reps === 'string' ? 0 : ex.reps
          });
        }
      });
      sessionExercises.push(sessionExList);
    });
    
    return { sessionsData: sessions, sessionExercisesData: sessionExercises, programType: 'street_workout' };
  }
  // --- END STREET WORKOUT LOGIC ---

  // Set reps and sets based on objective
  let sets = 3;
  let repsMin = 8;
  let repsMax = 12;
  
  if (formData.objectif === 'perte_poids' || formData.objectif === 'seche') {
    sets = 3; repsMin = 12; repsMax = 20;
  } else if (formData.objectif === 'masse') {
    sets = 4; repsMin = 8; repsMax = 12;
  } else if (formData.objectif === 'force') {
    sets = 4; repsMin = 4; repsMax = 8;
  } else {
    // tonification or maintain
    sets = 3; repsMin = 12; repsMax = 15;
  }

  // Filter out exercises that conflict with pathologies
  // In a real app we'd map pathologies to muscle groups. For now we use all.
  const safeExercises = allExercises;

  // Muscle mapping helper
  const isMuscleMatch = (exMuscles, targetGroup) => {
    if (!exMuscles || !Array.isArray(exMuscles)) return false;
    const tg = targetGroup.toLowerCase();
    return exMuscles.some(m => {
      const ml = m.toLowerCase();
      if (tg === 'jambes') return ml.includes('jambe') || ml.includes('quadriceps') || ml.includes('ischio') || ml.includes('mollet') || ml.includes('fessier');
      if (tg === 'epaules') return ml.includes('epaule') || ml.includes('deltoïde') || ml.includes('deltoide');
      if (tg === 'bras') return ml.includes('bras') || ml.includes('biceps') || ml.includes('triceps');
      if (tg === 'dos') return ml.includes('dos') || ml.includes('dorsaux') || ml.includes('lombaire') || ml.includes('trapèze');
      if (tg === 'abdos') return ml.includes('abdo') || ml.includes('oblique') || ml.includes('core');
      return ml.includes(tg) || tg.includes(ml);
    });
  };

  // Helper to pick a random exercise from a group
  const pickExercise = (group, maxLevel = 100) => {
    // Map string levels to numbers for comparison
    const levelMap = { 'debutant': 1, 'intermediaire': 2, 'avance': 3 };
    const userLevelNum = levelMap[formData.niveau] || 1;
    
    let options = safeExercises.filter(ex => {
      const exLevel = levelMap[ex.niveau_min] || 1;
      return isMuscleMatch(ex.muscles_principaux, group) && exLevel <= userLevelNum;
    });
    
    // Fallback if no matching level
    if (options.length === 0) {
      options = safeExercises.filter(ex => isMuscleMatch(ex.muscles_principaux, group));
    }
    
    // Fallback if no matching group
    if (options.length === 0) return safeExercises[Math.floor(Math.random() * safeExercises.length)];
    
    return options[Math.floor(Math.random() * options.length)];
  };

  formData.jours_semaine.forEach((jour, i) => {
    // Generate session
    let nom = `Séance ${i + 1}`;
    let dailySplit = splitType;
    let targetGroups = [];

    if (splitType === 'full_body') {
      nom = 'Full Body';
      targetGroups = ['Jambes', 'Pectoraux', 'Dos', 'Epaules', 'Bras', 'Abdos'];
    } else if (splitType === 'upper_lower') {
      dailySplit = i % 2 === 0 ? 'upper' : 'lower';
      if (dailySplit === 'upper') {
        nom = 'Haut du Corps';
        targetGroups = ['Pectoraux', 'Dos', 'Epaules', 'Bras', 'Abdos'];
      } else {
        nom = 'Bas du Corps';
        targetGroups = ['Jambes', 'Jambes', 'Abdos', 'Dos']; // Add some lower back/core
      }
    } else if (splitType === 'ppl') {
      const cycle = i % 3;
      if (cycle === 0) {
        nom = 'Push (Poussée)'; dailySplit = 'push';
        targetGroups = ['Pectoraux', 'Epaules', 'Bras', 'Pectoraux']; // Triceps fall under Bras
      } else if (cycle === 1) {
        nom = 'Pull (Tirage)'; dailySplit = 'pull';
        targetGroups = ['Dos', 'Bras', 'Dos', 'Abdos']; // Biceps under Bras
      } else {
        nom = 'Legs (Jambes)'; dailySplit = 'legs';
        targetGroups = ['Jambes', 'Jambes', 'Jambes', 'Abdos'];
      }
    }

    // Inject points_faibles
    if (formData.points_faibles && formData.points_faibles.length > 0) {
      const isPush = dailySplit === 'push' || dailySplit === 'upper' || dailySplit === 'full_body';
      const isPull = dailySplit === 'pull' || dailySplit === 'upper' || dailySplit === 'full_body';
      const isLegs = dailySplit === 'legs' || dailySplit === 'lower' || dailySplit === 'full_body';

      formData.points_faibles.forEach(pf => {
        if (pf === 'Pectoraux' && isPush) targetGroups.unshift('Pectoraux');
        if (pf === 'Epaules' && isPush) targetGroups.unshift('Epaules');
        if (pf === 'Bras' && isPush) targetGroups.unshift('Bras'); // Triceps
        if (pf === 'Bras' && isPull) targetGroups.unshift('Bras'); // Biceps
        if (pf === 'Dos' && isPull) targetGroups.unshift('Dos');
        if (pf === 'Jambes' && isLegs) targetGroups.unshift('Jambes');
        if (pf === 'Mollets' && isLegs) targetGroups.unshift('Mollets');
        if (pf === 'Abdos') targetGroups.unshift('Abdos');
      });
    }

    const sessionObj = {
      jour_semaine: jour,
      nom: nom,
      type_session: dailySplit,
      duree_estimee: formData.duree_seance
    };
    sessions.push(sessionObj);

    // Generate exercises for this session
    // Track how many times each exercise is used (max 2 per session)
    const MAX_SAME_EXERCISE = 2;
    const exerciseCount = {}; // { exercise_id: count }
    const sessionExList = [];
    
    // Add 4 to 6 exercises per session depending on duration (assume 1 ex = 10 min)
    const nbExercices = Math.max(4, Math.min(8, Math.floor(formData.duree_seance / 10)));
    
    // Related groups for fallback when a group runs out of unique exercises
    const relatedGroups = {
      'Pectoraux': ['Epaules', 'Bras'],
      'Dos': ['Bras', 'Epaules'],
      'Epaules': ['Pectoraux', 'Dos'],
      'Bras': ['Pectoraux', 'Dos'],
      'Jambes': ['Abdos'],
      'Abdos': ['Jambes', 'Dos']
    };
    
    // Fill with target groups first
    for (let j = 0; j < nbExercices; j++) {
      const groupToPick = targetGroups[j % targetGroups.length];
      let ex = pickExercise(groupToPick);
      
      // Try to find an exercise that hasn't exceeded the max count
      let attempts = 0;
      while ((exerciseCount[ex.id] || 0) >= MAX_SAME_EXERCISE && attempts < 15) {
        ex = pickExercise(groupToPick);
        attempts++;
      }
      
      // If still at max, try related muscle groups
      if ((exerciseCount[ex.id] || 0) >= MAX_SAME_EXERCISE) {
        const fallbackGroups = relatedGroups[groupToPick] || [];
        for (const fbGroup of fallbackGroups) {
          let fbEx = pickExercise(fbGroup);
          let fbAttempts = 0;
          while ((exerciseCount[fbEx.id] || 0) >= MAX_SAME_EXERCISE && fbAttempts < 10) {
            fbEx = pickExercise(fbGroup);
            fbAttempts++;
          }
          if ((exerciseCount[fbEx.id] || 0) < MAX_SAME_EXERCISE) {
            ex = fbEx;
            break;
          }
        }
      }
      
      exerciseCount[ex.id] = (exerciseCount[ex.id] || 0) + 1;
      
      sessionExList.push({
        // session_id will be filled later after insert
        exercise_id: ex.id,
        ordre: j,
        series: sets,
        reps_min: repsMin,
        reps_max: repsMax
      });
    }
    
    sessionExercises.push(sessionExList); // We keep a parallel array to link later
  });

  return { sessionsData: sessions, sessionExercisesData: sessionExercises, programType: splitType };
}
