export const GYM_SKILLS = [
  // PECTORAUX / TRICEPS
  { id: 'bench_1', name: 'Développé Couché : Initié', prereq: '0.75x ton Poids de Corps', time: '3-6 mois', difficulty: 1, focus: 'Pectoraux / Triceps', type: 'Force Pure', multiplier: 0.75, image: '/exercises/developpe-couche.gif' },
  { id: 'bench_2', name: 'Développé Couché : Intermédiaire', prereq: '1x ton Poids de Corps', time: '6-12 mois', difficulty: 2, focus: 'Pectoraux / Triceps', type: 'Force Pure', multiplier: 1, image: '/exercises/developpe-couche.gif' },
  { id: 'bench_3', name: 'Développé Couché : Confirmé', prereq: '1.25x ton Poids de Corps', time: '1-2 ans', difficulty: 3, focus: 'Pectoraux / Triceps', type: 'Force Pure', multiplier: 1.25, image: '/exercises/developpe-couche.gif' },
  { id: 'bench_4', name: 'Développé Couché : Elite', prereq: '1.5x ton Poids de Corps', time: '2-4 ans', difficulty: 4, focus: 'Pectoraux / Triceps', type: 'Force Pure', multiplier: 1.5, image: '/exercises/developpe-couche.gif' },
  { id: 'bench_5', name: 'Développé Couché : Maître', prereq: '1.75x ton Poids de Corps', time: '3-5 ans', difficulty: 5, focus: 'Pectoraux / Triceps', type: 'Force Pure', multiplier: 1.75, image: '/exercises/developpe-couche.gif' },
  { id: 'bench_bonus', name: 'Développé Couché : Légende (Bonus)', prereq: '2x ton Poids de Corps', time: '5+ ans', difficulty: 6, focus: 'Pectoraux / Triceps', type: 'Force Pure', multiplier: 2, image: '/exercises/developpe-couche.gif' },

  // DOS / ISCHIOS
  { id: 'deadlift_1', name: 'Soulevé de Terre : Initié', prereq: '1x ton Poids de Corps', time: '3-6 mois', difficulty: 1, focus: 'Dos / Ischios', type: 'Force Pure', multiplier: 1, image: '/exercises/souleve-de-terre.gif' },
  { id: 'deadlift_2', name: 'Soulevé de Terre : Intermédiaire', prereq: '1.25x ton Poids de Corps', time: '6-12 mois', difficulty: 2, focus: 'Dos / Ischios', type: 'Force Pure', multiplier: 1.25, image: '/exercises/souleve-de-terre.gif' },
  { id: 'deadlift_3', name: 'Soulevé de Terre : Confirmé', prereq: '1.5x ton Poids de Corps', time: '1-2 ans', difficulty: 3, focus: 'Dos / Ischios', type: 'Force Pure', multiplier: 1.5, image: '/exercises/souleve-de-terre.gif' },
  { id: 'deadlift_4', name: 'Soulevé de Terre : Elite', prereq: '2x ton Poids de Corps', time: '2-4 ans', difficulty: 4, focus: 'Dos / Ischios', type: 'Force Pure', multiplier: 2, image: '/exercises/souleve-de-terre.gif' },
  { id: 'deadlift_5', name: 'Soulevé de Terre : Maître', prereq: '2.5x ton Poids de Corps', time: '3-5 ans', difficulty: 5, focus: 'Dos / Ischios', type: 'Force Pure', multiplier: 2.5, image: '/exercises/souleve-de-terre.gif' },
  { id: 'deadlift_bonus', name: 'Soulevé de Terre : Titan (Bonus)', prereq: '3x ton Poids de Corps', time: '5+ ans', difficulty: 6, focus: 'Dos / Ischios', type: 'Force Pure', multiplier: 3, image: '/exercises/souleve-de-terre.gif' },

  // EPAULES / TRICEPS
  { id: 'ohp_1', name: 'Presse Militaire : Initié', prereq: '0.5x ton Poids de Corps', time: '3-6 mois', difficulty: 1, focus: 'Epaules / Triceps', type: 'Force Pure', multiplier: 0.5, image: '/exercises/presse-militaire.gif' },
  { id: 'ohp_2', name: 'Presse Militaire : Intermédiaire', prereq: '0.75x ton Poids de Corps', time: '6-12 mois', difficulty: 2, focus: 'Epaules / Triceps', type: 'Force Pure', multiplier: 0.75, image: '/exercises/presse-militaire.gif' },
  { id: 'ohp_3', name: 'Presse Militaire : Confirmé', prereq: '0.85x ton Poids de Corps', time: '1-2 ans', difficulty: 3, focus: 'Epaules / Triceps', type: 'Force Pure', multiplier: 0.85, image: '/exercises/presse-militaire.gif' },
  { id: 'ohp_4', name: 'Presse Militaire : Elite', prereq: '1x ton Poids de Corps', time: '2-4 ans', difficulty: 4, focus: 'Epaules / Triceps', type: 'Force Pure', multiplier: 1, image: '/exercises/presse-militaire.gif' },
  { id: 'ohp_5', name: 'Presse Militaire : Maître', prereq: '1.25x ton Poids de Corps', time: '3-5 ans', difficulty: 5, focus: 'Epaules / Triceps', type: 'Force Pure', multiplier: 1.25, image: '/exercises/presse-militaire.gif' },
  { id: 'ohp_bonus', name: 'Presse Militaire : Atlas (Bonus)', prereq: '1.5x ton Poids de Corps', time: '5+ ans', difficulty: 6, focus: 'Epaules / Triceps', type: 'Force Pure', multiplier: 1.5, image: '/exercises/presse-militaire.gif' },

  // JAMBES / FESSIERS
  { id: 'squat_1', name: 'Squat : Initié', prereq: '1x ton Poids de Corps', time: '3-6 mois', difficulty: 1, focus: 'Jambes / Fessiers', type: 'Force Pure', multiplier: 1, image: '/exercises/squat.gif' },
  { id: 'squat_2', name: 'Squat : Intermédiaire', prereq: '1.25x ton Poids de Corps', time: '6-12 mois', difficulty: 2, focus: 'Jambes / Fessiers', type: 'Force Pure', multiplier: 1.25, image: '/exercises/squat.gif' },
  { id: 'squat_3', name: 'Squat : Confirmé', prereq: '1.5x ton Poids de Corps', time: '1-2 ans', difficulty: 3, focus: 'Jambes / Fessiers', type: 'Force Pure', multiplier: 1.5, image: '/exercises/squat.gif' },
  { id: 'squat_4', name: 'Squat : Elite', prereq: '2x ton Poids de Corps', time: '2-4 ans', difficulty: 4, focus: 'Jambes / Fessiers', type: 'Force Pure', multiplier: 2, image: '/exercises/squat.gif' },
  { id: 'squat_5', name: 'Squat : Maître', prereq: '2.25x ton Poids de Corps', time: '3-5 ans', difficulty: 5, focus: 'Jambes / Fessiers', type: 'Force Pure', multiplier: 2.25, image: '/exercises/squat.gif' },
  { id: 'squat_bonus', name: 'Squat : Centaure (Bonus)', prereq: '2.5x ton Poids de Corps', time: '5+ ans', difficulty: 6, focus: 'Jambes / Fessiers', type: 'Force Pure', multiplier: 2.5, image: '/exercises/squat.gif' },
];
