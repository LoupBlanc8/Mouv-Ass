import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, DollarSign, ShieldCheck, Database, 
  Bell, BarChart3, AlertTriangle, Search, Filter, 
  MoreVertical, ArrowUpRight, ArrowDownRight, 
  Settings, LogOut, RefreshCw, Server, Cpu, 
  Menu, X, CheckCircle2, AlertCircle, Clock, ArrowLeft, Ban, CreditCard, Shield, Zap, Trash2, CheckCircle, RefreshCcw
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import * as mock from './mockData';
import './AdminDashboard.css';

// --- MAIN DASHBOARD ---

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    kpis: [],
    recentUsers: [],
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
      // 1. Fetch Parallel Data
      const [profiles, progs, exers, logs, audits] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact' }),
        supabase.from('programs').select('*'),
        supabase.from('exercises').select('*'),
        supabase.from('workout_logs').select('*', { count: 'exact' }),
        supabase.from('admin_audit_logs').select('*').order('created_at', { ascending: false }).limit(20)
      ]);
      
      setLatency(Date.now() - startTime);

      // 2. Format Data for UI
      setStats({
        kpis: [
          { id: 'u-t', label: 'Utilisateurs', value: profiles.count || 0, color: 'primary', icon: <Users /> },
          { id: 's-t', label: 'Séances Totales', value: logs.count || 0, color: 'secondary', icon: <Activity /> },
          { id: 'p-t', label: 'Programmes', value: progs.data?.length || 0, color: 'tertiary', icon: <Database /> },
          { id: 'e-t', label: 'Exercices', value: exers.data?.length || 0, color: 'neutral', icon: <Zap /> },
        ],
        recentUsers: (profiles.data || []).slice(0, 10).map(u => ({
          name: `${u.full_name || u.prenom || 'Anonyme'}`,
          email: u.email || 'Donnée sécurisée',
          role: u.rank || 'Membre',
          status: u.onboarding_complete ? 'actif' : 'en cours',
          joined: new Date(u.created_at).toLocaleDateString('fr-FR')
        })),
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

  const renderContent = () => {
    if (loading) return (
      <div className="admin__loading">
        <RefreshCcw className="admin__loading-spinner" />
        <p>Synchronisation avec Supabase...</p>
      </div>
    );

    switch (activeTab) {
      case 'overview': return <OverviewView stats={stats} />;
      case 'users': return <UsersView stats={stats} />;
      case 'activity': return <ActivityView stats={stats} />;
      case 'financial': return <div className="admin__panel p-8 text-center opacity-50">Gestion financière désactivée.</div>;
      case 'system': return <SystemView latency={latency} />;
      case 'content': return <ContentView stats={stats} />;
      case 'security': return <SecurityView stats={stats} />;
      case 'alerts': return <AlertsView stats={stats} />;
      default: return <OverviewView stats={stats} />;
    }
  };

  return (
    <div className="admin">
      {/* Topbar */}
      <header className="admin__topbar">
        <div className="admin__topbar-left">
          <button className="admin__topbar-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
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
        {/* Sidebar */}
        {isSidebarOpen && (
          <aside className="admin__sidebar animate-fade-in">
            <div className="admin__sidebar-section">
              <p className="admin__sidebar-label">Principal</p>
              <SidebarItem 
                icon={<BarChart3 />} 
                label="Vue d'ensemble" 
                active={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')} 
              />
              <SidebarItem 
                icon={<Users />} 
                label="Utilisateurs" 
                active={activeTab === 'users'} 
                onClick={() => setActiveTab('users')} 
              />
              <SidebarItem 
                icon={<Activity />} 
                label="Activité" 
                active={activeTab === 'activity'}
                onClick={() => setActiveTab('activity')}
              />
            </div>

            <div className="admin__sidebar-section">
              <p className="admin__sidebar-label">Business</p>
              <SidebarItem 
                icon={<DollarSign />} 
                label="Financier" 
                active={activeTab === 'financial'} 
                onClick={() => setActiveTab('financial')} 
              />
              <SidebarItem 
                icon={<Database />} 
                label="Contenu" 
                active={activeTab === 'content'}
                onClick={() => setActiveTab('content')}
              />
            </div>

            <div className="admin__sidebar-section">
              <p className="admin__sidebar-label">Technique</p>
              <SidebarItem 
                icon={<Server />} 
                label="Système" 
                active={activeTab === 'system'} 
                onClick={() => setActiveTab('system')} 
              />
              <SidebarItem 
                icon={<ShieldCheck />} 
                label="Sécurité" 
                active={activeTab === 'security'}
                onClick={() => setActiveTab('security')}
              />
              <SidebarItem 
                icon={<AlertTriangle />} 
                label="Alertes" 
                active={activeTab === 'alerts'}
                onClick={() => setActiveTab('alerts')}
                badge={4}
              />
            </div>

            <button 
              className="admin__nav-item"
              onClick={() => window.location.href = '/'}
              style={{ marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 'var(--space-4)', color: 'var(--on-surface-variant)' }}
            >
              <ArrowLeft size={18} />
              <span>Retour à l'App</span>
            </button>
          </aside>
        )}

        {/* Main Content */}
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

// --- SUB-VIEWS ---

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

function UsersView({ stats }) {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Gestion Utilisateurs</h1>
        <p className="admin__page-subtitle">Visualisez et gérez la base utilisateur réelle.</p>
      </div>

      <div className="admin__panel mb-6">
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle / Rang</th>
                <th>Statut</th>
                <th>Inscrit le</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user, i) => (
                <tr key={i}>
                  <td>
                    <div className="flex flex-col">
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                      <span className="body-sm" style={{ fontSize: 11 }}>Compte Vérifié</span>
                    </div>
                  </td>
                  <td>
                    <span className="chip chip--sm">
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
                    <button className="admin__topbar-btn"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SystemView() {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Santé du Système</h1>
        <p className="admin__page-subtitle">Surveillance en temps réel des services et ressources.</p>
      </div>

      <div className="admin__section">
        <h2 className="admin__section-title">État des Services</h2>
        <div className="admin__service-grid">
          {mock.services.map((service, i) => (
            <div key={i} className="admin__service-card">
              <div className={`admin__service-indicator admin__service-indicator--${service.status}`}></div>
              <div className="admin__service-info">
                <div className="admin__service-name">{service.name}</div>
                <div className="admin__service-latency">{service.latency} • {service.uptime} uptime</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="admin__grid-2">
        <div className="admin__panel">
          <h3 className="admin__panel-title">Ressources Infrastructure</h3>
          <div className="flex flex-col gap-6 mt-4">
            <ResourceGauge label="CPU Usage" value={34} color="var(--primary)" />
            <ResourceGauge label="Memory Usage (8GB)" value={65} color="var(--secondary)" />
            <ResourceGauge label="Storage (50GB)" value={28} color="var(--success)" />
            <ResourceGauge label="API Throughput" value={42} color="var(--tertiary)" />
          </div>
        </div>

        <div className="admin__panel">
          <h3 className="admin__panel-title">Alertes actives</h3>
          <div className="flex flex-col gap-2">
            {mock.alerts.map(alert => (
              <div key={alert.id} className={`admin__alert admin__alert--${alert.type}`}>
                {alert.type === 'error' ? <AlertCircle size={18} /> : <AlertCircle size={18} />}
                <div className="flex-1">
                  <div>{alert.msg}</div>
                  <div className="body-sm" style={{ fontSize: 10, marginTop: 2 }}>{alert.time}</div>
                </div>
              </div>
            ))}
          </div>
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

      <div className="admin__panel mb-6">
        <h3 className="admin__panel-title">Transactions Récentes</h3>
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Montant</th>
                <th>Produit</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {mock.recentTransactions.map((tx, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'monospace' }}>{tx.id}</td>
                  <td>{tx.user}</td>
                  <td style={{ fontWeight: 600 }}>{tx.amount}</td>
                  <td>{tx.type}</td>
                  <td>
                    <div className={`admin__status admin__status--${tx.status}`}>
                       <span className="admin__status-dot"></span>
                       {tx.status === 'ok' ? 'Payé' : tx.status === 'warn' ? 'En attente' : 'Échoué'}
                    </div>
                  </td>
                  <td>{tx.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

function ResourceGauge({ label, value, color }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="body-sm" style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{label}</span>
        <span className="body-sm">{value}%</span>
      </div>
      <div className="admin__progress-mini">
        <div 
          className="admin__progress-mini-fill" 
          style={{ width: `${value}%`, background: color }}
        ></div>
      </div>
    </div>
  );
}
