import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getRankProgress } from '../utils/gamification';

export default function Social() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAthletes();
  }, [user]);

  async function loadAthletes() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, prenom, nom, xp, avatar_url, photo_url, streak_current')
        .neq('user_id', user?.id || '') // Exclude current user
        .order('xp', { ascending: false });

      if (error) throw error;
      setAthletes(data || []);
    } catch (err) {
      console.error('Athletes load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const filteredAthletes = athletes.filter(a => 
    `${a.prenom} ${a.nom}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container" style={{ paddingBottom: 'calc(var(--space-24) + 60px)' }}>
      <header className="header" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="display-sm">Réseau</h1>
        <p className="body-md text-muted">Trouvez d'autres athlètes Mouv'Body.</p>
      </header>

      {/* Barre de recherche */}
      <div style={{ position: 'relative', marginBottom: 'var(--space-8)' }}>
        <Search style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} size={20} />
        <input 
          type="text" 
          placeholder="Rechercher un athlète..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--surface-container-highest)',
            border: '1px solid rgba(var(--outline-variant), 0.2)',
            borderRadius: '9999px',
            padding: '16px 16px 16px 48px',
            color: 'var(--on-surface)',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Liste globale */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h2 className="title-md">Tous les athlètes</h2>
          <span className="label-sm" style={{ background: 'var(--surface-container-high)', padding: '4px 12px', borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Users size={14} /> {athletes.length}
          </span>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-10)' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid var(--surface-container)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
            {filteredAthletes.map(friend => {
              const avatar = friend.photo_url || friend.avatar_url || `https://ui-avatars.com/api/?name=${friend.prenom || 'A'}&background=1a1919&color=00E5FF&bold=true`;
              const rank = getRankProgress(friend.xp || 0).currentRank;
              
              return (
                <motion.div key={friend.user_id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-6)', textAlign: 'center', background: 'var(--surface-container-low)' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={avatar} alt={friend.prenom} style={{ width: 72, height: 72, borderRadius: '50%', marginBottom: 'var(--space-3)', objectFit: 'cover', border: '2px solid var(--surface-container-high)' }} />
                    {(friend.streak_current || 0) > 0 && (
                      <div style={{ position: 'absolute', bottom: 12, right: -4, background: '#FF6B00', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: 999, border: '2px solid var(--surface-container-low)' }}>
                        🔥{friend.streak_current}
                      </div>
                    )}
                  </div>
                  <h3 className="title-sm">{friend.prenom} {friend.nom?.charAt(0)}.</h3>
                  <p className="label-sm" style={{ color: 'var(--secondary)', marginBottom: 'var(--space-4)', fontWeight: 'bold' }}>{rank}</p>
                  <button className="btn btn--secondary btn--sm" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}>
                    <UserPlus size={16} /> Suivre
                  </button>
                </motion.div>
              );
            })}

            {filteredAthletes.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-10)', color: 'var(--on-surface-variant)' }}>
                <Users size={32} style={{ margin: '0 auto var(--space-4)', opacity: 0.5 }} />
                <p>Aucun athlète trouvé.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
