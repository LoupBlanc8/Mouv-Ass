export const STREET_WORKOUT_SKILLS = [
  // PULL (Tirage)
  { id: 'pull_1', name: 'Tractions : Initié', prereq: '1 Traction stricte', time: '1-3 mois', difficulty: 1, focus: 'Pull', type: 'Dynamique', image: '/exercises/traction.gif' },
  { id: 'pull_2', name: 'Tractions : Intermédiaire', prereq: '10 Tractions strictes', time: '3-6 mois', difficulty: 2, focus: 'Pull', type: 'Dynamique', image: '/exercises/traction.gif' },
  { id: 'pull_3', name: 'Muscle-up (Barre)', prereq: '15 Tractions strictes', time: '6-12 mois', difficulty: 3, focus: 'Pull', type: 'Dynamique', image: '/exercises/traction.gif' },
  { id: 'pull_4', name: 'Front Lever : Initié', prereq: 'Straddle Front Lever 5s', time: '1-2 ans', difficulty: 4, focus: 'Pull', type: 'Isométrique', image: '/exercises/traction.gif' },
  { id: 'pull_5', name: 'Front Lever : Full', prereq: 'Full Front Lever 10s', time: '2-3 ans', difficulty: 5, focus: 'Pull', type: 'Isométrique', image: '/exercises/traction.gif' },
  { id: 'pull_bonus', name: 'Front Lever : Pull-ups (Bonus)', prereq: '5 Front Lever Pull-ups', time: '3+ ans', difficulty: 6, focus: 'Pull', type: 'Dynamique', image: '/exercises/traction.gif' },

  // PUSH (Poussée)
  { id: 'push_1', name: 'Pompes & Dips : Initié', prereq: '15 Pompes / 5 Dips', time: '1-3 mois', difficulty: 1, focus: 'Push', type: 'Dynamique', image: '/exercises/pompe.gif' },
  { id: 'push_2', name: 'Handstand : Initié', prereq: 'Handstand contre mur 30s', time: '3-6 mois', difficulty: 2, focus: 'Push', type: 'Isométrique', image: '/exercises/presse-militaire.gif' },
  { id: 'push_3', name: 'Handstand Push-up', prereq: '5 HSPU strictes (mur)', time: '6-12 mois', difficulty: 3, focus: 'Push', type: 'Dynamique', image: '/exercises/presse-militaire.gif' },
  { id: 'push_4', name: 'Planche : Initié (Tuck)', prereq: 'Tuck Planche 15s', time: '1-2 ans', difficulty: 4, focus: 'Push', type: 'Isométrique', image: '/exercises/pompe.gif' },
  { id: 'push_5', name: 'Planche : Full', prereq: 'Full Planche 5s', time: '2-4 ans', difficulty: 5, focus: 'Push', type: 'Isométrique', image: '/exercises/pompe.gif' },
  { id: 'push_bonus', name: 'Planche : Push-ups (Bonus)', prereq: '3 Full Planche Push-ups', time: '4+ ans', difficulty: 6, focus: 'Push', type: 'Dynamique', image: '/exercises/pompe.gif' },

  // CORE (Gainage / Acrobatie)
  { id: 'core_1', name: 'L-Sit : Initié', prereq: 'L-Sit sol 5s', time: '1-3 mois', difficulty: 1, focus: 'Core', type: 'Isométrique', image: '/exercises/Gainage.gif' },
  { id: 'core_2', name: 'L-Sit : Confirmé', prereq: 'L-Sit sol 20s', time: '3-6 mois', difficulty: 2, focus: 'Core', type: 'Isométrique', image: '/exercises/Gainage.gif' },
  { id: 'core_3', name: 'V-Sit', prereq: 'V-Sit 10s', time: '6-12 mois', difficulty: 3, focus: 'Core', type: 'Isométrique', image: '/exercises/Gainage.gif' },
  { id: 'core_4', name: 'Human Flag : Initié', prereq: 'Tuck Flag 10s', time: '1-2 ans', difficulty: 4, focus: 'Core', type: 'Isométrique', image: '/exercises/Gainage.gif' },
  { id: 'core_5', name: 'Human Flag : Full', prereq: 'Full Flag 10s', time: '2-3 ans', difficulty: 5, focus: 'Core', type: 'Isométrique', image: '/exercises/Gainage.gif' },
  { id: 'core_bonus', name: 'Human Flag : Pull-ups (Bonus)', prereq: '3 Human Flag Pull-ups', time: '3+ ans', difficulty: 6, focus: 'Core', type: 'Dynamique', image: '/exercises/Gainage.gif' }
];

export const STREET_WORKOUT_PROGRAMS = {
  debutant: {
    name: "Programme DÉBUTANT ABSOLU",
    duration: "4 semaines",
    freq: 3,
    description: "Créer les bases motrices, habituer les tendons et ligaments.",
    sessions: [
      {
        nom: "Full Body Fondations",
        type_session: "Full Body",
        duree_estimee: 35,
        exercices: [
          { nom: "Pompes inclinées", series: 3, reps: 8, recup: 90 },
          { nom: "Squat assisté", series: 3, reps: 10, recup: 90 },
          { nom: "Planche (genoux)", series: 3, reps: "20s", recup: 60 },
          { nom: "Bird-dog", series: 2, reps: 8, recup: 60 },
          { nom: "Dead hang", series: 2, reps: "15s", recup: 90 }
        ]
      }
    ]
  },
  intermediaire: {
    name: "Programme INTERMÉDIAIRE",
    duration: "8 semaines",
    freq: 4,
    description: "Augmenter la force et l'endurance musculaire, atteindre la première traction.",
    sessions: [
      {
        nom: "Push (Poussée)",
        type_session: "Push",
        duree_estimee: 45,
        exercices: [
          { nom: "Pompes", series: 4, reps: 12, recup: 90 },
          { nom: "Dips assistés", series: 3, reps: 10, recup: 90 },
          { nom: "Pike push-up", series: 3, reps: 8, recup: 90 },
          { nom: "Planche RKC", series: 3, reps: "30s", recup: 60 }
        ]
      },
      {
        nom: "Pull (Tirage)",
        type_session: "Pull",
        duree_estimee: 45,
        exercices: [
          { nom: "Tractions (assistées ou neg)", series: 4, reps: 5, recup: 120 },
          { nom: "Inverted rows", series: 3, reps: 12, recup: 90 },
          { nom: "Dead hang", series: 2, reps: "30s", recup: 90 }
        ]
      },
      {
        nom: "Bas du corps",
        type_session: "Legs",
        duree_estimee: 40,
        exercices: [
          { nom: "Squat libre", series: 4, reps: 15, recup: 90 },
          { nom: "Fentes marchées", series: 3, reps: 10, recup: 60 },
          { nom: "Pont fessier", series: 3, reps: 12, recup: 60 }
        ]
      },
      {
        nom: "Core & Mobilité",
        type_session: "Core",
        duree_estimee: 35,
        exercices: [
          { nom: "Hollow body hold", series: 3, reps: "25s", recup: 60 },
          { nom: "Planche latérale", series: 3, reps: "25s", recup: 60 },
          { nom: "Leg raises", series: 3, reps: 12, recup: 60 }
        ]
      }
    ]
  }
};
