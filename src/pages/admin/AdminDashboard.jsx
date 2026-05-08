import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, DollarSign, ShieldCheck, Database, 
  Bell, BarChart3, AlertTriangle, Search, Filter, 
  MoreVertical, ArrowUpRight, ArrowDownRight, 
  Settings, LogOut, RefreshCw, Server, Cpu, 
  Menu, X, CheckCircle2, AlertCircle, Clock, ArrowLeft, Ban, CreditCard, Zap, Trash, CheckCircle, RefreshCcw, Shield
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import * as mock from './mockData';
import './AdminDashboard.css';

// --- MAIN DASHBOARD ---

export default function AdminDashboard() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    kpis: [],
    recentUsers: [],
    allUsers: [],
    programs: [],
    exercises: [],
    auditLogs: [],
    activityStats: {},
    contentStats: {},
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [latency, setLatency] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    setLoading(true);
    const startTime = Date.now();
    try {
      const [profiles, progs, exers, logs, audits] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('programs').select('*'),
        supabase.from('exercises').select('*'),
        supabase.from('workout_logs').select('*', { count: 'exact' }),
        supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(20)
      ]);
      
      setLatency(Date.now() - startTime);

      const formattedUsers = (profiles.data || []).map(u => ({
        id: u.user_id,
        profile_id: u.id,
        name: `${u.prenom || ''} ${u.nom || ''}`.trim() || 'Anonyme',
        email: u.email || 'Non renseigné',
        role: u.rank || 'Recrue',
        status: u.onboarding_complete ? 'actif' : 'en cours',
        joined: new Date(u.created_at).toLocaleDateString('fr-FR'),
        xp: u.xp || 0
      }));

      setStats({
        kpis: [
          { id: 'u-t', label: 'Utilisateurs', value: profiles.count || 0, color: 'primary', icon: <Users /> },
          { id: 's-t', label: 'Séances Totales', value: logs.count || 0, color: 'secondary', icon: <Activity /> },
          { id: 'p-t', label: 'Programmes', value: progs.data?.length || 0, color: 'tertiary', icon: <Database /> },
          { id: 'e-t', label: 'Exercices', value: exers.data?.length || 0, color: 'neutral', icon: <Zap /> },
        ],
        recentUsers: formattedUsers.slice(0, 10),
        allUsers: formattedUsers,
        programs: progs.data || [],
        exercises: exers.data || [],
        auditLogs: audits.data || [],
        contentStats: {
          totalPrograms: progs.data?.length || 0,
          totalExercises: exers.data?.length || 0
        },
        activityStats: {
          activeSessions: logs.count || 0,
          avgSessionTime: '—',
          actionsPerDay: '—'
        }
      });
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Se déconnecter ?')) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${userName} ? Cette action est irréversible.`)) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.rpc('delete_user_account', { target_user_id: userId });
      if (error) throw error;
      alert('Utilisateur supprimé avec succès.');
      fetchRealStats();
    } catch (err) {
      console.error("Delete Error:", err);
      alert(`Erreur lors de la suppression : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'Admin' ? 'Recrue' : 'Admin';
    if (!confirm(`Changer le rôle de l'utilisateur en ${newRole} ?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ rank: newRole })
        .eq('user_id', userId);

      if (error) throw error;
      fetchRealStats();
    } catch (err) {
      console.error("Role Update Error:", err);
      alert(`Erreur lors du changement de rôle : ${err.message}`);
    }
  };

  const renderContent = () => {
    if (loading) return (
      <div className="admin__loading">
        <RefreshCcw className="admin__loading-spinner" />
        <p>Synchronisation avec Supabase...</p>
      </div>
    );

    const TABS = [
      { id: 'overview', label: "Vue d'ensemble", icon: <BarChart3 size={16} /> },
      { id: 'users', label: "Utilisateurs", icon: <Users size={16} /> },
      { id: 'activity', label: "Activité", icon: <Activity size={16} /> },
      { id: 'financial', label: "Financier", icon: <DollarSign size={16} /> },
      { id: 'content', label: "Contenu", icon: <Database size={16} /> },
      { id: 'system', label: "Système", icon: <Server size={16} /> },
      { id: 'security', label: "Sécurité", icon: <ShieldCheck size={16} /> },
      { id: 'alerts', label: "Alertes", icon: <AlertTriangle size={16} /> },
    ];

    const currentTab = TABS.find(t => t.id === activeTab) || TABS[0];

    return (
      <>
        <div className="admin__mobile-tabs show-mobile">
          <div className="admin__tab-selector-wrap">
            <select 
              className="admin__tab-select" 
              value={activeTab} 
              onChange={(e) => setActiveTab(e.target.value)}
            >
              {TABS.map(tab => (
                <option key={tab.id} value={tab.id}>{tab.label}</option>
              ))}
            </select>
            <div className="admin__tab-select-icon">
              {currentTab.icon}
            </div>
          </div>
        </div>

        {(() => {
          switch (activeTab) {
            case 'overview': return <OverviewView stats={stats} />;
            case 'users': return (
              <UsersView 
                users={stats.allUsers} 
                searchTerm={searchTerm} 
                onDelete={handleDeleteUser}
                onToggleRole={handleToggleRole}
              />
            );
            case 'activity': return <ActivityView stats={stats} />;
            case 'financial': return <div className="admin__panel p-8 text-center opacity-50">Gestion financière désactivée.</div>;
            case 'system': return <SystemView latency={latency} />;
            case 'content': return <ContentView stats={stats} />;
            case 'security': return <SecurityView stats={stats} />;
            case 'alerts': return <AlertsView stats={stats} />;
            default: return <OverviewView stats={stats} />;
          }
        })()}
      </>
    );
  };

  return (
    <div className="admin">
      <header className="admin__topbar">
        <div className="admin__topbar-left">
          <button className="admin__topbar-btn admin__menu-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <img src="/logo-mouvbody.png" alt="Mouv'Body" className="admin__topbar-logo" />
          <div className="admin__search-box ml-4 hidden-mobile">
            <Search size={16} />
            <input 
              type="text" 
              placeholder="Rechercher utilisateur..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="admin__topbar-right">
          <div className="admin__latency-tag mr-4">
             <span className={`dot dot--${latency > 500 ? 'warning' : 'ok'}`}></span>
             {latency}ms
          </div>
          <div className="admin__topbar-btn" onClick={() => fetchRealStats()}>
            <RefreshCw size={18} />
          </div>
          <div className="admin__topbar-btn" onClick={() => setActiveTab('alerts')}>
            <Bell size={18} />
            <span className="notif-dot"></span>
          </div>
          <div className="admin__topbar-btn" onClick={toggleTheme} title="Changer le thème">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </div>
          <div className="admin__topbar-btn" onClick={() => setActiveTab('system')}>
            <Settings size={18} />
          </div>
          <div 
            className="admin__topbar-btn" 
            style={{ marginLeft: 'var(--space-2)', background: 'var(--error)', color: 'white' }}
            onClick={handleLogout}
          >
            <LogOut size={18} />
          </div>
        </div>
      </header>

      <div className="admin__body">
        {isSidebarOpen && <div className="admin__sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
        
        <aside className={`admin__sidebar ${isSidebarOpen ? 'admin__sidebar--open' : ''}`}>
          <div className="admin__sidebar-content">
            <div className="admin__sidebar-section">
              <p className="admin__sidebar-label">Principal</p>
              <SidebarItem 
                icon={<BarChart3 />} 
                label="Vue d'ensemble" 
                active={activeTab === 'overview'} 
                onClick={() => { setActiveTab('overview'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }} 
              />
              <SidebarItem 
                icon={<Users />} 
                label="Utilisateurs" 
                active={activeTab === 'users'} 
                onClick={() => { setActiveTab('users'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }} 
              />
              <SidebarItem 
                icon={<Activity />} 
                label="Activité" 
                active={activeTab === 'activity'}
                onClick={() => { setActiveTab('activity'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}
              />
            </div>

            <div className="admin__sidebar-section">
              <p className="admin__sidebar-label">Business</p>
              <SidebarItem 
                icon={<DollarSign />} 
                label="Financier" 
                active={activeTab === 'financial'} 
                onClick={() => { setActiveTab('financial'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }} 
              />
              <SidebarItem 
                icon={<Database />} 
                label="Contenu" 
                active={activeTab === 'content'}
                onClick={() => { setActiveTab('content'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}
              />
            </div>

            <div className="admin__sidebar-section">
              <p className="admin__sidebar-label">Technique</p>
              <SidebarItem 
                icon={<Server />} 
                label="Système" 
                active={activeTab === 'system'} 
                onClick={() => { setActiveTab('system'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }} 
              />
              <SidebarItem 
                icon={<ShieldCheck />} 
                label="Sécurité" 
                active={activeTab === 'security'}
                onClick={() => { setActiveTab('security'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}
              />
              <SidebarItem 
                icon={<AlertTriangle />} 
                label="Alertes" 
                active={activeTab === 'alerts'}
                onClick={() => { setActiveTab('alerts'); if (window.innerWidth <= 1024) setIsSidebarOpen(false); }}
                badge={4}
              />
            </div>

            <button 
              className="admin__nav-item"
              onClick={() => window.location.href = '/'}
              style={{ marginTop: 'auto', borderTop: '1px solid rgba(var(--outline-rgb, 118, 117, 117), 0.1)', paddingTop: 'var(--space-4)', color: 'var(--on-surface-variant)' }}
            >
              <ArrowLeft size={18} />
              <span>Retour à l'App</span>
            </button>
          </div>
        </aside>
        )}

        <main className="admin__main animate-slide-up">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, badge }) {
  return (
    <button className={`admin__nav-item ${active ? 'admin__nav-item--active' : ''}`} onClick={onClick}>
      <span className="admin__nav-icon">{React.cloneElement(icon, { size: 18 })}</span>
      <span>{label}</span>
      {badge && <span className="admin__nav-badge">{badge}</span>}
    </button>
  );
}

function KPICard({ title, value, trend, trendDir, icon, color = 'primary' }) {
  return (
    <div className={`admin__kpi admin__kpi--${color}`}>
      <div className="admin__kpi-header">
        <span className="admin__kpi-label">{title}</span>
        <span className={`admin__kpi-icon admin__kpi-icon--${color}`}>
          {React.cloneElement(icon, { size: 20 })}
        </span>
      </div>
      <div className="admin__kpi-value">{value}</div>
      {trend && (
        <div className={`admin__kpi-trend admin__kpi-trend--${trendDir || (trend.includes('+') ? 'up' : 'down')}`}>
          { (trendDir === 'up' || trend.includes('+')) ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {trend}
        </div>
      )}
    </div>
  );
}

function OverviewView({ stats }) {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Tableau de bord</h1>
        <p className="admin__page-subtitle">Données réelles synchronisées avec Supabase.</p>
      </div>

      <div className="admin__kpi-grid">
        {stats.kpis.map(kpi => (
          <KPICard 
            key={kpi.id}
            title={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
          />
        ))}
      </div>

      <div className="admin__grid-2">
        <div className="admin__panel">
          <h3 className="admin__panel-title">Inscriptions (Données Brutes)</h3>
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
            <div className="text-center">
              <p>Analyse des séries temporelles...</p>
              <span className="body-sm">Les graphiques réels seront affichés dès que suffisamment de données seront cumulées.</span>
            </div>
          </div>
        </div>

        <div className="admin__panel">
          <h3 className="admin__panel-title">Inscriptions Récentes</h3>
          <div className="admin__log-list">
            {stats.recentUsers.map((user, i) => (
              <div key={i} className="admin__log-item">
                <span className="admin__log-time">{user.joined}</span>
                <span className="admin__log-msg admin__log-msg--info">Nouveau : <b>{user.name}</b></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function UsersView({ users, searchTerm, onDelete, onToggleRole }) {
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Gestion Utilisateurs</h1>
        <p className="admin__page-subtitle">Recherchez, modifiez les rôles ou supprimez des comptes.</p>
      </div>

      <div className="admin__panel mb-6">
        <div className="admin__panel-header flex justify-between items-center mb-4">
          <h3 className="admin__panel-title">{filteredUsers.length} Utilisateurs trouvés</h3>
          <div className="flex gap-2">
            <button className="chip chip--sm chip--outline"><Filter size={14} /> Filtres</button>
          </div>
        </div>

        <div className="admin__table-wrap hidden-mobile">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Contact</th>
                <th>Rôle / Rang</th>
                <th>Statut</th>
                <th>Inscrit le</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                    Aucun utilisateur ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="admin__user-avatar">
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span style={{ fontWeight: 600 }}>{user.name}</span>
                          <span className="body-sm" style={{ fontSize: 11, color: 'var(--primary)' }}>XP: {user.xp}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="body-sm">{user.email}</span>
                    </td>
                    <td>
                      <span className={`chip chip--sm ${user.role === 'Admin' ? 'chip--tertiary' : ''}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <div className={`admin__status admin__status--${user.status === 'actif' ? 'ok' : 'neutral'}`}>
                        <span className="admin__status-dot"></span>
                        {user.status}
                      </div>
                    </td>
                    <td>{user.joined}</td>
                    <td>
                      <div className="flex justify-end gap-2">
                        <button 
                          className="admin__action-btn admin__action-btn--edit"
                          title={user.role === 'Admin' ? "Rétrograder en Recrue" : "Promouvoir en Admin"}
                          onClick={() => onToggleRole(user.id, user.role)}
                          style={{ fontSize: '18px' }}
                        >
                          🛡️
                        </button>
                        <button 
                          className="admin__action-btn admin__action-btn--danger"
                          title="Supprimer définitivement"
                          onClick={() => onDelete(user.id, user.name)}
                          style={{ fontSize: '18px' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE CARDS VIEW */}
        <div className="admin__mobile-cards show-mobile">
          {filteredUsers.length === 0 ? (
            <p className="text-center opacity-50 p-8">Aucun utilisateur.</p>
          ) : (
            filteredUsers.map(user => (
              <div key={user.id} className="admin__mobile-card">
                <div className="admin__mobile-card-header">
                  <div className="admin__user-avatar">{user.name.charAt(0)}</div>
                  <div className="flex flex-col flex-1">
                    <span className="font-bold">{user.name}</span>
                    <span className="body-sm">{user.email}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="admin__action-btn" onClick={() => onToggleRole(user.id, user.role)}>🛡️</button>
                    <button className="admin__action-btn admin__action-btn--danger" onClick={() => onDelete(user.id, user.name)}>🗑️</button>
                  </div>
                </div>
                <div className="admin__mobile-card-body">
                  <div className="flex justify-between items-center">
                    <span className="label-sm">Rôle</span>
                    <span className={`chip chip--sm ${user.role === 'Admin' ? 'chip--tertiary' : ''}`}>{user.role}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="label-sm">Statut</span>
                    <div className={`admin__status admin__status--${user.status === 'actif' ? 'ok' : 'neutral'}`}>
                      <span className="admin__status-dot"></span>
                      {user.status}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="label-sm">XP / Inscrit</span>
                    <span className="body-sm">{user.xp} XP • {user.joined}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

function FinancialView() {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Finance & Revenus</h1>
        <p className="admin__page-subtitle">Analyse des transactions et performance commerciale.</p>
      </div>

      <div className="admin__kpi-grid">
         <div className="admin__kpi admin__kpi--tertiary">
            <div className="admin__kpi-header">
              <span className="admin__kpi-label">MRR (Mensuel)</span>
              <span className="admin__kpi-icon admin__kpi-icon--tertiary">📈</span>
            </div>
            <div className="admin__kpi-value">€12,850</div>
            <div className="admin__kpi-trend admin__kpi-trend--up">
                <ArrowUpRight size={12} /> +5.2%
            </div>
         </div>
         <div className="admin__kpi admin__kpi--primary">
            <div className="admin__kpi-header">
              <span className="admin__kpi-label">ARR (Annuel)</span>
              <span className="admin__kpi-icon admin__kpi-icon--primary">💎</span>
            </div>
            <div className="admin__kpi-value">€154,200</div>
            <div className="admin__kpi-trend admin__kpi-trend--up">
                <ArrowUpRight size={12} /> +12%
            </div>
         </div>
         <div className="admin__kpi admin__kpi--success">
            <div className="admin__kpi-header">
              <span className="admin__kpi-label">LTV Moyenne</span>
              <span className="admin__kpi-icon admin__kpi-icon--success">👤</span>
            </div>
            <div className="admin__kpi-value">€142.00</div>
         </div>
      </div>
    </>
  );
}

function ActivityView({ stats }) {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Analyse d'Activité</h1>
        <p className="admin__page-subtitle">Suivi des séances réelles enregistrées.</p>
      </div>
      <div className="admin__kpi-grid">
         <KPICard title="Total Séances" value={stats.activityStats.activeSessions} icon={<Activity />} color="primary" />
         <KPICard title="Rétention Moyenne" value="—" icon={<Clock />} color="secondary" />
         <KPICard title="Actions IA" value="—" icon={<Zap />} color="tertiary" />
      </div>
      <div className="admin__panel mt-8">
        <h3 className="admin__panel-title">Activité cumulée</h3>
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
           <p>Données historiques en cours de compilation...</p>
        </div>
      </div>
    </>
  );
}

function ContentView({ stats }) {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Gestion du Contenu</h1>
        <p className="admin__page-subtitle">Programmes et exercices réels en base.</p>
      </div>
      <div className="admin__grid-2">
        <div className="admin__panel">
          <h3 className="admin__panel-title">Programmes ({stats.programs.length})</h3>
          <div className="admin__log-list">
            {stats.programs.map((p, i) => (
              <div key={i} className="admin__log-item">
                <span className="admin__log-msg"><b>{p.title}</b> • {p.duration_weeks} sem.</span>
              </div>
            ))}
          </div>
        </div>
        <div className="admin__panel">
          <h3 className="admin__panel-title">Derniers Exercices</h3>
          <div className="admin__log-list">
            {stats.exercises.slice(0, 10).map((ex, i) => (
              <div key={i} className="admin__log-item">
                <span className="admin__log-msg"><b>{ex.name}</b> • {ex.target_muscle}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function SystemView({ latency }) {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Santé du Système</h1>
        <p className="admin__page-subtitle">Statut de l'API et de la base de données.</p>
      </div>
      <div className="admin__panel p-8">
        <div className="flex flex-col items-center gap-6">
          <div className={`admin__latency-gauge ${latency > 500 ? 'warn' : 'ok'}`}>
            <span className="latency-val">{latency}ms</span>
            <span className="latency-label">Latence API</span>
          </div>
          <div className="flex gap-4">
            <div className="chip chip--ok">Supabase : Connecté</div>
            <div className="chip chip--ok">Auth Service : Actif</div>
          </div>
        </div>
      </div>
    </>
  );
}

function SecurityView({ stats }) {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Journal de Sécurité <span className="chip chip--ok" style={{fontSize: '0.7rem', verticalAlign: 'middle', marginLeft: '10px'}}>LIVE</span></h1>
        <p className="admin__page-subtitle">Données réelles extraites en direct de Supabase (admin_audit_logs).</p>
      </div>
      <div className="admin__panel">
        <div style={{ padding: '10px', color: 'var(--primary)', fontSize: '0.8rem' }}>
          {stats.auditLogs.length} logs chargés depuis Supabase.
        </div>
        <div className="hidden-mobile">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Action</th>
                <th>Admin</th>
                <th>Détails</th>
              </tr>
            </thead>
            <tbody>
              {stats.auditLogs.map((log, i) => (
                <tr key={i}>
                  <td style={{ opacity: 0.7 }}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>{log.action}</td>
                  <td>{log.user_email}</td>
                  <td style={{ fontSize: '0.8rem', opacity: 0.7 }}>{JSON.stringify(log.details)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin__mobile-cards show-mobile">
          {stats.auditLogs.map((log, i) => (
            <div key={i} className="admin__mobile-card">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold">{log.action}</span>
                <span className="body-sm opacity-50">{new Date(log.created_at).toLocaleTimeString()}</span>
              </div>
              <div className="body-sm mb-2">{log.user_email}</div>
              <div className="admin__log-details">{JSON.stringify(log.details)}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function AlertsView({ stats }) {
  const alerts = [];
  if (stats.programs.length === 0) alerts.push({ id: 1, type: 'error', msg: 'Aucun programme détecté en base', time: 'Urgent' });
  if (stats.exercises.length < 5) alerts.push({ id: 2, type: 'warning', msg: 'Base d\'exercices critique (< 5)', time: 'Aujourd\'hui' });
  
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Alertes & Notifications</h1>
        <p className="admin__page-subtitle">Incidents réels détectés par l'analyse automatique.</p>
      </div>
      <div className="flex flex-col gap-4">
        {alerts.length === 0 ? (
          <div className="admin__alert admin__alert--ok">Aucun incident détecté. Système sain.</div>
        ) : (
          alerts.map(alert => (
            <div key={alert.id} className={`admin__alert admin__alert--${alert.type}`} style={{ padding: '1.5rem' }}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{alert.msg}</h3>
                  <p style={{ opacity: 0.8 }}>Détecté automatiquement via Supabase.</p>
                </div>
                <span className="chip chip--sm">{alert.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
