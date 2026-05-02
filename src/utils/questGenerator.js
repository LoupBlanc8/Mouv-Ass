/**
 * Générateur de quêtes journalières
 * Génère 3 quêtes aléatoires adaptées au profil utilisateur
 */

const QUEST_POOL = [
  // Entraînement
  { type: 'workout', description: 'Termine une séance complète', target: 1, xp: 100, icon: '🏋️' },
  { type: 'sets', description: 'Réalise 20 séries aujourd\'hui', target: 20, xp: 80, icon: '💪' },
  { type: 'volume', description: 'Soulève 2000 kg au total', target: 2000, xp: 120, icon: '⚡' },
  { type: 'exercises', description: 'Fais au moins 5 exercices différents', target: 5, xp: 60, icon: '🎯' },
  
  // Nutrition
  { type: 'meals', description: 'Valide tous tes repas du jour', target: 4, xp: 80, icon: '🥗' },
  { type: 'protein', description: 'Atteins ton objectif protéines', target: 1, xp: 60, icon: '🥩' },
  { type: 'water', description: 'Bois 2.5L d\'eau', target: 2500, xp: 50, icon: '💧' },
  
  // Académie
  { type: 'skill', description: 'Valide un palier en Académie', target: 1, xp: 150, icon: '🏆' },
  
  // Social
  { type: 'streak', description: 'Maintiens ton streak', target: 1, xp: 40, icon: '🔥' },
  
  // Général
  { type: 'login', description: 'Connecte-toi à l\'application', target: 1, xp: 20, icon: '📱' },
  { type: 'log_weight', description: 'Enregistre ton poids du jour', target: 1, xp: 30, icon: '⚖️' },
];

/**
 * Génère 3 quêtes journalières basées sur le seed du jour
 */
export function generateDailyQuests(profile) {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  
  // Sélection pseudo-aléatoire déterministe (même quêtes pour le même jour)
  const shuffled = [...QUEST_POOL].sort((a, b) => {
    const hashA = ((seed * 31 + a.type.charCodeAt(0)) % 997);
    const hashB = ((seed * 31 + b.type.charCodeAt(0)) % 997);
    return hashA - hashB;
  });
  
  // Prendre 3 quêtes de types différents
  const selected = [];
  const usedTypes = new Set();
  
  for (const quest of shuffled) {
    if (usedTypes.has(quest.type)) continue;
    
    // Adapter les quêtes au profil
    if (quest.type === 'workout' && profile?.jours_semaine) {
      const isTrainingDay = profile.jours_semaine.includes(today.getDay());
      if (!isTrainingDay) continue; // Pas de quête workout les jours de repos
    }
    
    selected.push({
      ...quest,
      quest_type: quest.type,
      quest_description: quest.description,
      target_value: quest.target,
      xp_reward: quest.xp,
    });
    usedTypes.add(quest.type);
    
    if (selected.length >= 3) break;
  }
  
  return selected;
}

/**
 * Vérifie si une quête est complétée
 */
export function checkQuestCompletion(quest) {
  return quest.current_value >= quest.target_value;
}
