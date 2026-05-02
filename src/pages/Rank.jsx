import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getRankProgress } from '../utils/gamification';
import { Flame, Globe, Users } from 'lucide-react';

export default function Rank() {
  const { profile, user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [friendIds, setFriendIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('global'); // 'global' | 'friends'

  useEffect(() => {
    if (user) {
      Promise.all([loadLeaderboard(), loadFriends()]).finally(() => setLoading(false));
    }
  }, [user]);

  async function loadLeaderboard() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, prenom, nom, xp, rank, avatar_url, photo_url, streak_current, streak_record')
        .order('xp', { ascending: false })
        .limit(50);
      if (error) throw error;
      setLeaderboard(data || []);
    } catch (err) {
      console.error('Leaderboard error:', err);
    }
  }

  async function loadFriends() {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .eq('status', 'accepted');
      if (error) throw error;
      const ids = (data || []).map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id);
      setFriendIds(ids);
    } catch (err) {
      console.error('Friends error:', err);
    }
  }

  function buildRankedList(source) {
    return source.map(p => ({
      id: p.user_id,
      name: p.prenom ? `${p.prenom} ${(p.nom || '').charAt(0)}.` : 'Athlète',
      xp: p.xp || 0,
      avatar: p.photo_url || p.avatar_url || `https://ui-avatars.com/api/?name=${p.prenom || 'A'}&background=1a1919&color=00E5FF&bold=true`,
      isMe: p.user_id === user?.id,
      streak: p.streak_current || 0,
      streakRecord: p.streak_record || 0,
    }));
  }

  const allRanked = buildRankedList(leaderboard);
  
  // Friends leaderboard: friends + me, re-sorted
  const friendsLeaderboard = leaderboard
    .filter(p => friendIds.includes(p.user_id) || p.user_id === user?.id)
    .sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const friendsRanked = buildRankedList(friendsLeaderboard);

  const rankedList = activeTab === 'friends' ? friendsRanked : allRanked;

  const top3 = rankedList.slice(0, 3);
  const others = rankedList.slice(3);
  const myRank = rankedList.findIndex(f => f.isMe) + 1;
  const myData = rankedList.find(f => f.isMe) || { name: profile?.prenom || 'Moi', xp: profile?.xp || 0, streak: profile?.streak_current || 0 };

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--surface-container-highest)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const tabs = [
    { id: 'global', label: 'Global', icon: <Globe size={16} /> },
    { id: 'friends', label: 'Amis', icon: <Users size={16} />, count: friendIds.length },
  ];

  return (
    <div className="page-container" style={{ paddingBottom: 'calc(var(--space-24) + 80px)' }}>
      <header className="header" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="display-sm">Classement</h1>
        <p className="body-md text-muted">Mesure-toi à l'élite. Données réelles.</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 16px', borderRadius: 'var(--radius-xl)', border: 'none',
            background: activeTab === tab.id ? 'rgba(var(--primary-rgb), 0.15)' : 'var(--surface-container)',
            color: activeTab === tab.id ? 'var(--primary)' : 'var(--on-surface-variant)',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
            borderWidth: 1, borderStyle: 'solid',
            borderColor: activeTab === tab.id ? 'rgba(var(--primary-rgb), 0.3)' : 'rgba(var(--outline-variant), 0.1)',
            transition: 'all 0.25s ease'
          }}>
            {tab.icon} {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                background: activeTab === tab.id ? 'var(--primary)' : 'var(--surface-container-high)',
                color: activeTab === tab.id ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                fontSize: '0.7rem', fontWeight: 'bold',
                padding: '2px 8px', borderRadius: 999
              }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

          {/* Empty friends state */}
          {activeTab === 'friends' && friendIds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--on-surface-variant)' }}>
              <Users size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.4 }} />
              <p className="title-md" style={{ marginBottom: 4 }}>Aucun ami ajouté</p>
              <p className="body-sm text-muted">Ajoute des amis depuis l'onglet Réseau pour te comparer avec eux !</p>
            </div>
          ) : (
            <>
              {/* Podium */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-10)', height: '200px' }}>
                {/* 2ème */}
                {top3[1] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: '120px', opacity: 1 }} transition={{ delay: 0.2 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%', position: 'relative' }}>
                    <img src={top3[1].avatar} alt={top3[1].name} style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: -24, zIndex: 2, border: top3[1].isMe ? '3px solid var(--primary)' : '3px solid var(--surface-container)', objectFit: 'cover' }} />
                    <div style={{ backgroundColor: 'var(--surface-container-high)', width: '100%', height: '100%', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32 }}>
                      <span className="label-lg" style={{ color: '#C0C0C0' }}>2</span>
                      <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>{top3[1].name}</span>
                      {top3[1].streak > 0 && <span style={{ fontSize: '0.7rem' }}>🔥{top3[1].streak}</span>}
                      <span className="label-sm" style={{ marginTop: 'auto', marginBottom: 8, color: 'var(--primary)' }}>{top3[1].xp} XP</span>
                    </div>
                  </motion.div>
                )}

                {/* 1er */}
                {top3[0] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: '160px', opacity: 1 }} transition={{ delay: 0.1 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35%', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: -40, zIndex: 0 }}>👑</div>
                    <img src={top3[0].avatar} alt={top3[0].name} style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: -32, zIndex: 2, border: '4px solid var(--primary)', boxShadow: '0 0 20px rgba(0,229,255,0.4)', objectFit: 'cover' }} />
                    <div style={{ background: 'linear-gradient(to top, var(--primary-container), var(--surface-container-high))', width: '100%', height: '100%', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 }}>
                      <span className="label-lg" style={{ color: '#FFD700' }}>1</span>
                      <span className="label-sm" style={{ color: 'var(--on-primary-container)' }}>{top3[0].name}</span>
                      {top3[0].streak > 0 && <span style={{ fontSize: '0.7rem' }}>🔥{top3[0].streak}</span>}
                      <span className="label-sm" style={{ marginTop: 'auto', marginBottom: 8, color: 'var(--on-primary-container)' }}>{top3[0].xp} XP</span>
                    </div>
                  </motion.div>
                )}

                {/* 3ème */}
                {top3[2] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: '100px', opacity: 1 }} transition={{ delay: 0.3 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%', position: 'relative' }}>
                    <img src={top3[2].avatar} alt={top3[2].name} style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: -24, zIndex: 2, border: top3[2].isMe ? '3px solid var(--primary)' : '3px solid var(--surface-container)', objectFit: 'cover' }} />
                    <div style={{ backgroundColor: 'var(--surface-container-low)', width: '100%', height: '100%', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32 }}>
                      <span className="label-lg" style={{ color: '#CD7F32' }}>3</span>
                      <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>{top3[2].name}</span>
                      {top3[2].streak > 0 && <span style={{ fontSize: '0.7rem' }}>🔥{top3[2].streak}</span>}
                      <span className="label-sm" style={{ marginTop: 'auto', marginBottom: 8 }}>{top3[2].xp} XP</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Liste des autres */}
              <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {others.map((friend, index) => (
                  <motion.div variants={item} key={friend.id} className="card" style={{
                    display: 'flex', alignItems: 'center', padding: 'var(--space-3)',
                    background: friend.isMe ? 'rgba(var(--primary-rgb), 0.08)' : 'var(--surface-container-low)',
                    border: friend.isMe ? '1px solid rgba(var(--primary-rgb), 0.2)' : '1px solid rgba(var(--outline-variant), 0.05)',
                  }}>
                    <span className="label-lg text-muted" style={{ width: 30 }}>{index + 4}</span>
                    <img src={friend.avatar} alt={friend.name} style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 'var(--space-3)', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <h3 className="title-sm">{friend.name} {friend.isMe && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(vous)</span>}</h3>
                      <p className="label-sm text-muted">{getRankProgress(friend.xp).currentRank}</p>
                    </div>
                    {friend.streak > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 2, marginRight: 'var(--space-3)', color: '#FF6B00', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Flame size={14} /> {friend.streak}
                      </span>
                    )}
                    <span className="label-md" style={{ color: 'var(--primary)' }}>{friend.xp} XP</span>
                  </motion.div>
                ))}

                {rankedList.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 'var(--space-10)', color: 'var(--on-surface-variant)' }}>
                    <p className="title-md">Aucun utilisateur pour le moment</p>
                    <p className="body-sm">Le classement se remplira avec de vrais athlètes.</p>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sticky Bottom Card for Current User */}
      <div style={{
        position: 'fixed',
        bottom: '80px',
        left: 0, right: 0,
        padding: 'var(--space-4)',
        background: 'rgba(14, 14, 14, 0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-primary-container)', fontWeight: 'bold' }}>
              #{myRank || '?'}
            </div>
            <div>
              <h3 className="title-sm">Votre Position {activeTab === 'friends' && <span className="label-sm text-muted">(Amis)</span>}</h3>
              <p className="label-sm text-muted">{myData.xp || profile?.xp || 0} XP total</p>
            </div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            {(myData.streak || profile?.streak_current || 0) > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#FF6B00', fontSize: '0.85rem', fontWeight: 700 }}>
                <Flame size={16} /> {myData.streak || profile?.streak_current || 0}
              </span>
            )}
            <p className="label-sm" style={{ color: 'var(--secondary)' }}>{getRankProgress(myData.xp || profile?.xp || 0).currentRank}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
