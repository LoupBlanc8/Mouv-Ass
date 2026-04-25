export const STREET_WORKOUT_SKILLS = [
  { id: 'muscle_up_bar', name: 'Muscle-up (barre)', prereq: '10+ tractions, 15+ dips', time: '3-12 mois', difficulty: 4, focus: 'Pull/Push', type: 'dynamique', image: '/exercises/traction.gif' },
  { id: 'muscle_up_rings', name: 'Muscle-up (anneaux)', prereq: 'Muscle-up barre maîtrisé', time: '6-18 mois', difficulty: 5, focus: 'Pull/Push', type: 'dynamique', image: '/exercises/traction.gif' },
  { id: 'front_lever', name: 'Front lever', prereq: '10+ tractions, L-sit', time: '6-24 mois', difficulty: 5, focus: 'Pull/Core', type: 'isométrique', image: '/exercises/traction.gif' },
  { id: 'back_lever', name: 'Back lever', prereq: 'Bonne mobilité épaule', time: '3-12 mois', difficulty: 4, focus: 'Pull/Core', type: 'isométrique', image: '/exercises/traction.gif' },
  { id: 'human_flag', name: 'Human flag', prereq: 'Force latérale exceptionnelle', time: '12-36 mois', difficulty: 5, focus: 'Core/Push', type: 'isométrique', image: '/exercises/Gainage.gif' },
  { id: 'planche', name: 'Planche', prereq: 'Handstand solide, force pectoraux', time: '24-60 mois', difficulty: 6, focus: 'Push/Core', type: 'isométrique', image: '/exercises/pompe.gif' },
  { id: 'handstand', name: 'Handstand (équilibre)', prereq: 'Force épaules, gainage', time: '3-12 mois', difficulty: 3, focus: 'Push/Equilibre', type: 'isométrique', image: '/exercises/presse-militaire.gif' },
  { id: 'l_sit', name: 'L-sit', prereq: 'Abdominaux de base', time: '1-3 mois', difficulty: 2, focus: 'Core/Push', type: 'isométrique', image: '/exercises/Gainage.gif' }
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
