import { supabase } from '../lib/supabase';

// Niveaux d'XP et Ligues
const RANKS = [
  { name: 'Recrue', minXP: 0 },
  { name: 'Bronze', minXP: 500 },
  { name: 'Argent', minXP: 2000 },
  { name: 'Or', minXP: 5000 },
  { name: 'Platine', minXP: 10000 },
  { name: 'Spartiate', minXP: 20000 },
];

export async function addXP(userId, amount) {
  try {
    // 1. Récupérer l'XP actuelle
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('xp, rank')
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    const currentXP = profile.xp || 0;
    const newXP = currentXP + amount;

    // 2. Déterminer le nouveau rang
    let newRank = 'Recrue';
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (newXP >= RANKS[i].minXP) {
        newRank = RANKS[i].name;
        break;
      }
    }

    // 3. Mettre à jour le profil
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp: newXP, rank: newRank })
      .eq('user_id', userId);

    if (updateError) throw updateError;

    return { success: true, xpAdded: amount, newXP, newRank, levelUp: newRank !== profile.rank };
  } catch (error) {
    console.error('Error adding XP:', error);
    return { success: false, error };
  }
}

export function getRankProgress(currentXP) {
  let currentRankIdx = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (currentXP >= RANKS[i].minXP) {
      currentRankIdx = i;
      break;
    }
  }

  const currentRank = RANKS[currentRankIdx];
  const nextRank = currentRankIdx < RANKS.length - 1 ? RANKS[currentRankIdx + 1] : null;

  if (!nextRank) {
    return { currentRank: currentRank.name, progress: 100, xpToNext: 0 };
  }

  const xpIntoRank = currentXP - currentRank.minXP;
  const rankSize = nextRank.minXP - currentRank.minXP;
  const progress = Math.min(100, Math.max(0, (xpIntoRank / rankSize) * 100));

  return {
    currentRank: currentRank.name,
    nextRank: nextRank.name,
    progress,
    xpToNext: nextRank.minXP - currentXP
  };
}
