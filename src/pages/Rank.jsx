import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { getRankProgress } from '../utils/gamification';

// Données fictives pour le classement
const MOCK_FRIENDS = [
  { id: '1', name: 'Alex M.', xp: 14500, avatar: 'https://i.pravatar.cc/150?u=1', isMe: false },
  { id: '2', name: 'Sarah J.', xp: 12200, avatar: 'https://i.pravatar.cc/150?u=2', isMe: false },
  { id: 'me', name: 'Moi', xp: 5000, avatar: null, isMe: true }, // Sera remplacé par les vraies stats
  { id: '3', name: 'Tom B.', xp: 4200, avatar: 'https://i.pravatar.cc/150?u=3', isMe: false },
  { id: '4', name: 'Emma L.', xp: 1500, avatar: 'https://i.pravatar.cc/150?u=4', isMe: false },
];

export default function Rank() {
  const { profile } = useAuth();
  
  const myData = {
    ...MOCK_FRIENDS.find(f => f.isMe),
    name: profile?.prenom || 'Moi',
    xp: profile?.xp || 0,
    avatar: profile?.avatar_url || `https://ui-avatars.com/api/?name=${profile?.prenom || 'M'}&background=FF6B00&color=fff`
  };

  const leaderboard = MOCK_FRIENDS.map(f => f.isMe ? myData : f).sort((a, b) => b.xp - a.xp);
  
  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);
  const myRank = leaderboard.findIndex(f => f.isMe) + 1;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="page-container" style={{ paddingBottom: 'calc(var(--space-24) + 80px)' }}>
      <header className="header" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="display-sm">Classement</h1>
        <p className="body-md text-muted">Mesure-toi à l'élite.</p>
      </header>

      {/* Podium */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        marginBottom: 'var(--space-10)',
        height: '200px'
      }}>
        {/* 2ème */}
        {top3[1] && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: '120px', opacity: 1 }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%', position: 'relative' }}>
            <img src={top3[1].avatar} alt={top3[1].name} style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: -24, zIndex: 2, border: '3px solid var(--surface-container)' }} />
            <div style={{ backgroundColor: 'var(--surface-container-high)', width: '100%', height: '100%', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32 }}>
              <span className="label-lg" style={{ color: '#C0C0C0' }}>2</span>
              <span className="label-sm" style={{ marginTop: 'auto', marginBottom: 8 }}>{top3[1].xp} XP</span>
            </div>
          </motion.div>
        )}

        {/* 1er */}
        {top3[0] && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: '160px', opacity: 1 }} transition={{ delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '35%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: -40, zIndex: 0 }}>👑</div>
            <img src={top3[0].avatar} alt={top3[0].name} style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: -32, zIndex: 2, border: '4px solid var(--primary)', boxShadow: '0 0 20px rgba(255,107,0,0.4)' }} />
            <div style={{ background: 'linear-gradient(to top, var(--primary-container), var(--surface-container-high))', width: '100%', height: '100%', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 40 }}>
              <span className="label-lg" style={{ color: '#FFD700' }}>1</span>
              <span className="label-sm" style={{ marginTop: 'auto', marginBottom: 8, color: 'var(--on-primary-container)' }}>{top3[0].xp} XP</span>
            </div>
          </motion.div>
        )}

        {/* 3ème */}
        {top3[2] && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: '100px', opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '30%', position: 'relative' }}>
            <img src={top3[2].avatar} alt={top3[2].name} style={{ width: 48, height: 48, borderRadius: '50%', marginBottom: -24, zIndex: 2, border: '3px solid var(--surface-container)' }} />
            <div style={{ backgroundColor: 'var(--surface-container-low)', width: '100%', height: '100%', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 32 }}>
              <span className="label-lg" style={{ color: '#CD7F32' }}>3</span>
              <span className="label-sm" style={{ marginTop: 'auto', marginBottom: 8 }}>{top3[2].xp} XP</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Liste des autres */}
      <motion.div variants={container} initial="hidden" animate="show" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {others.map((friend, index) => (
          <motion.div variants={item} key={friend.id} className="card" style={{ display: 'flex', alignItems: 'center', padding: 'var(--space-3)', background: friend.isMe ? 'var(--surface-container-highest)' : 'var(--surface-container-low)' }}>
            <span className="label-lg text-muted" style={{ width: 30 }}>{index + 4}</span>
            <img src={friend.avatar} alt={friend.name} style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 'var(--space-3)' }} />
            <div style={{ flex: 1 }}>
              <h3 className="title-sm">{friend.name}</h3>
              <p className="label-sm text-muted">{getRankProgress(friend.xp).currentRank}</p>
            </div>
            <span className="label-md" style={{ color: 'var(--primary)' }}>{friend.xp} XP</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Sticky Bottom Card for Current User */}
      <div style={{
        position: 'fixed',
        bottom: '80px', // Just above bottom nav
        left: 0,
        right: 0,
        padding: 'var(--space-4)',
        background: 'rgba(29, 16, 10, 0.8)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-primary-container)', fontWeight: 'bold' }}>
              #{myRank}
            </div>
            <div>
              <h3 className="title-sm">Votre Position</h3>
              <p className="label-sm text-muted">{myData.xp} XP total</p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p className="label-sm" style={{ color: 'var(--secondary)' }}>{getRankProgress(myData.xp).currentRank}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
