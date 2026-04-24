export function generateProgramSessions(formData, allExercises) {
  const sessions = [];
  const sessionExercises = [];
  const numDays = formData.jours_semaine.length;
  
  // Define split strategy based on number of days and level
  let splitType = 'full_body';
  if (numDays === 4) splitType = 'upper_lower';
  else if (numDays >= 5) splitType = 'ppl';
  
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

  // Helper to pick a random exercise from a group
  const pickExercise = (group, maxLevel = 100) => {
    // Map string levels to numbers for comparison
    const levelMap = { 'debutant': 1, 'intermediaire': 2, 'avance': 3 };
    const userLevelNum = levelMap[formData.niveau] || 1;
    
    let options = safeExercises.filter(ex => {
      const exLevel = levelMap[ex.niveau] || 1;
      return ex.groupe_musculaire.toLowerCase() === group.toLowerCase() && exLevel <= userLevelNum;
    });
    
    // Fallback if no matching level
    if (options.length === 0) {
      options = safeExercises.filter(ex => ex.groupe_musculaire.toLowerCase() === group.toLowerCase());
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

    const sessionObj = {
      jour_semaine: jour,
      nom: nom,
      type_session: dailySplit,
      duree_estimee: formData.duree_seance
    };
    sessions.push(sessionObj);

    // Generate exercises for this session
    // Make sure we pick unique exercises per session
    const pickedIds = new Set();
    const sessionExList = [];
    
    // Add 4 to 6 exercises per session depending on duration (assume 1 ex = 10 min)
    const nbExercices = Math.max(4, Math.min(8, Math.floor(formData.duree_seance / 10)));
    
    // Fill with target groups first
    for (let j = 0; j < nbExercices; j++) {
      const groupToPick = targetGroups[j % targetGroups.length];
      let ex = pickExercise(groupToPick);
      
      // Try to avoid duplicates in the same session
      let attempts = 0;
      while (pickedIds.has(ex.id) && attempts < 10) {
        ex = pickExercise(groupToPick);
        attempts++;
      }
      
      pickedIds.add(ex.id);
      
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
