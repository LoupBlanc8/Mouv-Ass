import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus, Check, X } from 'lucide-react';

const PENDING_REQUESTS = [
  { id: 'req1', name: 'David G.', rank: 'Bronze', avatar: 'https://i.pravatar.cc/150?u=5' }
];

const SUGGESTED_FRIENDS = [
  { id: 'sug1', name: 'Laura M.', rank: 'Argent', avatar: 'https://i.pravatar.cc/150?u=6' },
  { id: 'sug2', name: 'Marc E.', rank: 'Platine', avatar: 'https://i.pravatar.cc/150?u=7' },
  { id: 'sug3', name: 'Julie P.', rank: 'Recrue', avatar: 'https://i.pravatar.cc/150?u=8' }
];

export default function Social() {
  const [searchQuery, setSearchQuery] = useState('');
  
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
            border: 'none',
            borderRadius: '9999px',
            padding: 'var(--space-4) var(--space-4) var(--space-4) 48px',
            color: 'var(--on-surface)',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Demandes en attente */}
      {PENDING_REQUESTS.length > 0 && !searchQuery && (
        <section style={{ marginBottom: 'var(--space-8)' }}>
          <h2 className="title-md" style={{ marginBottom: 'var(--space-4)' }}>Demandes en attente</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {PENDING_REQUESTS.map(req => (
              <motion.div key={req.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <img src={req.avatar} alt={req.name} style={{ width: 48, height: 48, borderRadius: '50%' }} />
                  <div>
                    <h3 className="title-sm">{req.name}</h3>
                    <p className="label-sm text-muted">{req.rank}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <button className="btn btn--secondary" style={{ width: 40, height: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    <X size={20} />
                  </button>
                  <button className="btn btn--primary" style={{ width: 40, height: 40, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                    <Check size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Suggestions */}
      <section>
        <h2 className="title-md" style={{ marginBottom: 'var(--space-4)' }}>Suggestions d'athlètes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-4)' }}>
          {SUGGESTED_FRIENDS.map(friend => (
            <motion.div key={friend.id} className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-4)', textAlign: 'center' }}>
              <img src={friend.avatar} alt={friend.name} style={{ width: 64, height: 64, borderRadius: '50%', marginBottom: 'var(--space-3)' }} />
              <h3 className="title-sm">{friend.name}</h3>
              <p className="label-sm text-muted" style={{ marginBottom: 'var(--space-4)' }}>{friend.rank}</p>
              <button className="btn btn--secondary btn--sm" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}>
                <UserPlus size={16} /> Ajouter
              </button>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
