import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, UserPlus, UserCheck, UserX, Users, Clock, Check, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getRankProgress } from '../utils/gamification';

export default function Social() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [athletes, setAthletes] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'friends' | 'pending'
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (user) {
      Promise.all([loadAthletes(), loadFriendships()]).finally(() => setLoading(false));
    }
  }, [user]);

  async function loadAthletes() {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, prenom, nom, xp, avatar_url, photo_url, streak_current')
      .neq('user_id', user?.id || '')
      .order('xp', { ascending: false });
    if (!error) setAthletes(data || []);
  }

  async function loadFriendships() {
    const { data, error } = await supabase
      .from('friendships')
      .select('*')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
    if (!error) setFriendships(data || []);
  }

  function getFriendshipStatus(athleteId) {
    const f = friendships.find(
      fs => (fs.requester_id === user.id && fs.addressee_id === athleteId) ||
            (fs.addressee_id === user.id && fs.requester_id === athleteId)
    );
    if (!f) return { status: 'none', friendship: null };
    if (f.status === 'accepted') return { status: 'friends', friendship: f };
    if (f.status === 'pending' && f.requester_id === user.id) return { status: 'sent', friendship: f };
    if (f.status === 'pending' && f.addressee_id === user.id) return { status: 'received', friendship: f };
    return { status: 'none', friendship: f };
  }

  async function sendFriendRequest(athleteId) {
    setActionLoading(athleteId);
    try {
      const { error } = await supabase.from('friendships').insert({
        requester_id: user.id,
        addressee_id: athleteId,
        status: 'pending'
      });
      if (error) throw error;
      await loadFriendships();
    } catch (err) {
      console.error('Friend request error:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function acceptFriendRequest(friendshipId) {
    setActionLoading(friendshipId);
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', friendshipId);
      if (error) throw error;
      await loadFriendships();
    } catch (err) {
      console.error('Accept error:', err);
    } finally {
      setActionLoading(null);
    }
  }

  async function removeFriendship(friendshipId) {
    setActionLoading(friendshipId);
    try {
      const { error } = await supabase
        .from('friendships')
        .delete()
        .eq('id', friendshipId);
      if (error) throw error;
      await loadFriendships();
    } catch (err) {
      console.error('Remove error:', err);
    } finally {
      setActionLoading(null);
    }
  }

  // Derived lists
  const friendIds = friendships
    .filter(f => f.status === 'accepted')
    .map(f => f.requester_id === user.id ? f.addressee_id : f.requester_id);

  const pendingReceived = friendships
    .filter(f => f.status === 'pending' && f.addressee_id === user.id);

  const friendsList = athletes.filter(a => friendIds.includes(a.user_id));
  const pendingAthletes = pendingReceived.map(f => {
    const athlete = athletes.find(a => a.user_id === f.requester_id);
    return athlete ? { ...athlete, friendshipId: f.id } : null;
  }).filter(Boolean);

  const filteredAthletes = athletes.filter(a =>
    `${a.prenom} ${a.nom}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tabs = [
    { id: 'all', label: 'Tous', icon: <Users size={16} />, count: athletes.length },
    { id: 'friends', label: 'Amis', icon: <UserCheck size={16} />, count: friendsList.length },
    { id: 'pending', label: 'Demandes', icon: <Clock size={16} />, count: pendingReceived.length },
  ];

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

  function renderFriendButton(athlete) {
    const { status, friendship } = getFriendshipStatus(athlete.user_id);
    const isLoading = actionLoading === athlete.user_id || actionLoading === friendship?.id;

    if (isLoading) {
      return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--surface-container)', borderTopColor: 'var(--primary)', animation: 'spin 0.7s linear infinite' }} />
        </div>
      );
    }

    switch (status) {
      case 'friends':
        return (
          <button onClick={() => removeFriendship(friendship.id)}
            className="btn btn--sm" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 6, background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', border: '1px solid rgba(var(--primary-rgb), 0.25)' }}>
            <UserCheck size={15} /> Ami
          </button>
        );
      case 'sent':
        return (
          <button onClick={() => removeFriendship(friendship.id)}
            className="btn btn--sm" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 6, background: 'var(--surface-container)', color: 'var(--on-surface-variant)', border: '1px solid rgba(var(--outline-variant), 0.15)' }}>
            <Clock size={15} /> Envoyée
          </button>
        );
      case 'received':
        return (
          <div style={{ display: 'flex', gap: 6, width: '100%' }}>
            <button onClick={() => acceptFriendRequest(friendship.id)}
              className="btn btn--primary btn--sm" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 4 }}>
              <Check size={14} />
            </button>
            <button onClick={() => removeFriendship(friendship.id)}
              className="btn btn--sm" style={{ padding: '6px 10px', background: 'rgba(159,5,25,0.15)', color: 'var(--error)', border: '1px solid rgba(159,5,25,0.2)' }}>
              <X size={14} />
            </button>
          </div>
        );
      default:
        return (
          <button onClick={() => sendFriendRequest(athlete.user_id)}
            className="btn btn--secondary btn--sm" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 6 }}>
            <UserPlus size={15} /> Ajouter
          </button>
        );
    }
  }

  function renderAthleteCard(athlete) {
    const avatar = athlete.photo_url || athlete.avatar_url || `https://ui-avatars.com/api/?name=${athlete.prenom || 'A'}&background=1a1919&color=00E5FF&bold=true`;
    const rank = getRankProgress(athlete.xp || 0).currentRank;

    return (
      <motion.div variants={item} key={athlete.user_id} className="card" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: 'var(--space-6)', textAlign: 'center',
        background: 'var(--surface-container-low)',
      }}>
        <div style={{ position: 'relative' }}>
          <img src={avatar} alt={athlete.prenom} style={{
            width: 72, height: 72, borderRadius: '50%', marginBottom: 'var(--space-3)',
            objectFit: 'cover', border: '2px solid var(--surface-container-high)'
          }} />
          {(athlete.streak_current || 0) > 0 && (
            <div style={{
              position: 'absolute', bottom: 12, right: -4,
              background: '#FF6B00', color: '#fff', fontSize: '0.7rem', fontWeight: 'bold',
              padding: '2px 6px', borderRadius: 999, border: '2px solid var(--surface-container-low)'
            }}>
              🔥{athlete.streak_current}
            </div>
          )}
        </div>
        <h3 className="title-sm">{athlete.prenom} {athlete.nom?.charAt(0)}.</h3>
        <p className="label-sm" style={{ color: 'var(--secondary)', marginBottom: 'var(--space-4)', fontWeight: 'bold' }}>{rank}</p>
        {renderFriendButton(athlete)}
      </motion.div>
    );
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--surface-container-highest)', borderTopColor: 'var(--primary)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const displayList = activeTab === 'friends' ? friendsList
    : activeTab === 'pending' ? pendingAthletes
    : filteredAthletes;

  return (
    <div className="page-container" style={{ paddingBottom: 'calc(var(--space-24) + 60px)' }}>
      <header className="header" style={{ marginBottom: 'var(--space-6)' }}>
        <h1 className="display-sm">Réseau</h1>
        <p className="body-md text-muted">Trouvez d'autres athlètes Mouv'Body.</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', overflowX: 'auto', paddingBottom: 2 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 18px', borderRadius: 999, border: 'none', flexShrink: 0,
            background: activeTab === tab.id ? 'rgba(var(--primary-rgb), 0.15)' : 'var(--surface-container)',
            color: activeTab === tab.id ? 'var(--primary)' : 'var(--on-surface-variant)',
            fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem',
            borderWidth: 1, borderStyle: 'solid',
            borderColor: activeTab === tab.id ? 'rgba(var(--primary-rgb), 0.3)' : 'rgba(var(--outline-variant), 0.1)',
            transition: 'all 0.2s'
          }}>
            {tab.icon} {tab.label}
            {tab.count > 0 && (
              <span style={{
                background: activeTab === tab.id ? 'var(--primary)' : 'var(--surface-container-high)',
                color: activeTab === tab.id ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                fontSize: '0.7rem', fontWeight: 'bold',
                padding: '2px 7px', borderRadius: 999, minWidth: 20, textAlign: 'center'
              }}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search (only on 'all' tab) */}
      {activeTab === 'all' && (
        <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
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
              padding: '14px 16px 14px 48px',
              color: 'var(--on-surface)',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} variants={container} initial="hidden" animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
          {displayList.map(athlete => renderAthleteCard(athlete))}
          {displayList.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--space-12)', color: 'var(--on-surface-variant)' }}>
              {activeTab === 'friends' ? (
                <>
                  <UserPlus size={40} style={{ margin: '0 auto var(--space-4)', opacity: 0.4 }} />
                  <p className="title-sm" style={{ marginBottom: 4 }}>Aucun ami pour l'instant</p>
                  <p className="body-sm text-muted">Ajoute des athlètes depuis l'onglet "Tous" !</p>
                </>
              ) : activeTab === 'pending' ? (
                <>
                  <Clock size={40} style={{ margin: '0 auto var(--space-4)', opacity: 0.4 }} />
                  <p className="title-sm" style={{ marginBottom: 4 }}>Aucune demande en attente</p>
                  <p className="body-sm text-muted">Les demandes d'amis apparaîtront ici.</p>
                </>
              ) : (
                <>
                  <Users size={40} style={{ margin: '0 auto var(--space-4)', opacity: 0.4 }} />
                  <p>Aucun athlète trouvé.</p>
                </>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
