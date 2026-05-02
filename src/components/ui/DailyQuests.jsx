import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { generateDailyQuests, checkQuestCompletion } from '../../utils/questGenerator';

const QUEST_ICONS = {
  workout: '🏋️', sets: '💪', volume: '⚡', exercises: '🎯',
  meals: '🥗', protein: '🥩', water: '💧', skill: '🏆',
  streak: '🔥', login: '📱', log_weight: '⚖️',
};

export default function DailyQuests() {
  const { profile, user } = useAuth();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadQuests();
  }, [user]);

  async function loadQuests() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('daily_quests').select('*')
        .eq('user_id', user.id).eq('date', today);

      if (existing?.length > 0) {
        setQuests(existing);
      } else {
        const generated = generateDailyQuests(profile);
        const toInsert = generated.map(q => ({
          user_id: user.id, date: today, quest_type: q.quest_type,
          quest_description: q.quest_description, target_value: q.target_value,
          current_value: 0, completed: false, xp_reward: q.xp_reward,
        }));
        const { data: inserted } = await supabase.from('daily_quests').insert(toInsert).select();
        setQuests(inserted || generated.map((q, i) => ({ ...q, id: `local-${i}`, current_value: 0, completed: false })));
      }
    } catch (err) {
      console.error('Quest load error:', err);
      setQuests(generateDailyQuests(profile).map((q, i) => ({ ...q, id: `local-${i}`, current_value: 0, completed: false })));
    } finally {
      setLoading(false);
    }
  }

  const completedCount = quests.filter(q => q.completed).length;
  const totalXP = quests.filter(q => q.completed).reduce((s, q) => s + (q.xp_reward || 0), 0);
  const streak = profile?.streak_current || 0;
  const streakRecord = profile?.streak_record || 0;

  if (loading) return (
    <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--surface-container-highest)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
    </div>
  );

  return (
    <div>
      {/* Streak Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{
        background: 'linear-gradient(135deg, rgba(255,107,0,0.15), rgba(255,64,129,0.1))',
        borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)', marginBottom: 'var(--space-6)',
        border: '1px solid rgba(255,107,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Flame size={24} color="#FF6B00" />
            <span className="display-sm" style={{ background: 'linear-gradient(135deg, #FF6B00, #FF4081)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>{streak}</span>
            <span className="title-md" style={{ color: 'var(--on-surface-variant)' }}>jours</span>
          </div>
          <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>Record : {streakRecord} 🏆</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="label-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: 4 }}>QUÊTES DU JOUR</div>
          <div className="title-lg" style={{ color: 'var(--primary)' }}>{completedCount}/{quests.length}</div>
        </div>
      </motion.div>

      {/* Quest Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {quests.map((quest, i) => {
          const done = quest.completed || checkQuestCompletion(quest);
          const pct = quest.target_value > 0 ? Math.min(100, (quest.current_value / quest.target_value) * 100) : 0;
          return (
            <motion.div key={quest.id || i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              style={{ background: done ? 'rgba(0,230,118,0.08)' : 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-4)', border: done ? '1px solid rgba(0,230,118,0.3)' : '1px solid rgba(var(--outline-variant), 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: done ? 'rgba(0,230,118,0.15)' : 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                  {done ? <CheckCircle2 size={22} color="#00E676" /> : (QUEST_ICONS[quest.quest_type] || '🎯')}
                </div>
                <div style={{ flex: 1 }}>
                  <p className="body-md" style={{ fontWeight: 600, margin: 0, textDecoration: done ? 'line-through' : 'none', opacity: done ? 0.6 : 1 }}>{quest.quest_description}</p>
                  <div style={{ height: 4, background: 'var(--surface-container-highest)', borderRadius: 99, marginTop: 8, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
                      style={{ height: '100%', borderRadius: 99, background: done ? '#00E676' : 'linear-gradient(90deg, #00E5FF, #7C4DFF)' }} />
                  </div>
                </div>
                <span className="label-sm" style={{ background: done ? 'rgba(0,230,118,0.15)' : 'rgba(var(--primary-rgb), 0.1)', padding: '4px 10px', borderRadius: '999px', color: done ? '#00E676' : 'var(--primary)', fontWeight: 700 }}>+{quest.xp_reward} XP</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {totalXP > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 'var(--space-6)', textAlign: 'center', padding: 'var(--space-4)', background: 'rgba(var(--primary-rgb), 0.08)', borderRadius: 'var(--radius-xl)' }}>
          <Zap size={20} style={{ color: 'var(--primary)', marginRight: 6, verticalAlign: 'middle' }} />
          <span className="title-md" style={{ color: 'var(--primary)' }}>+{totalXP} XP aujourd'hui</span>
        </motion.div>
      )}
    </div>
  );
}
