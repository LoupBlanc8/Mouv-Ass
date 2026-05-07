import React, { useState } from 'react';
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
import './AdminDashboard.css';
import * as mock from './mockData';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Stats for the "Vue Synthétique"
  const kpis = mock.kpiData;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewView />;
      case 'users': return <UsersView />;
      case 'activity': return <ActivityView />;
      case 'financial': return <FinancialView />;
      case 'system': return <SystemView />;
      case 'content': return <ContentView />;
      case 'security': return <SecurityView />;
      case 'alerts': return <AlertsView />;
      default: return <OverviewView />;
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
          <span className="admin__topbar-title">Mouv'Body Admin</span>
          <span className="admin__topbar-badge">v2.4.1</span>
        </div>
        <div className="admin__topbar-right">
          <div className="admin__topbar-btn" onClick={() => alert('Recherche globale bientôt disponible')}>
            <Search size={18} />
          </div>
          <div className="admin__topbar-btn" onClick={() => alert('Aucune nouvelle notification')}>
            <Bell size={18} />
            <span className="notif-dot"></span>
          </div>
          <div className="admin__topbar-btn" onClick={() => alert('Paramètres du panel')}>
            <Settings size={18} />
          </div>
          <div 
            className="admin__topbar-btn" 
            style={{ marginLeft: 'var(--space-2)', background: 'var(--error)', color: 'white' }}
            onClick={() => confirm('Se déconnecter ?') && (window.location.href = '/login')}
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

function OverviewView() {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Tableau de bord</h1>
        <p className="admin__page-subtitle">Bienvenue dans le centre de commande de Mouv'Body.</p>
      </div>

      {/* Vue Synthétique: KPIs */}
      <div className="admin__kpi-grid">
        {mock.kpiData.map(kpi => (
          <div key={kpi.id} className={`admin__kpi admin__kpi--${kpi.color}`}>
            <div className="admin__kpi-header">
              <span className="admin__kpi-label">{kpi.label}</span>
              <span className={`admin__kpi-icon admin__kpi-icon--${kpi.color}`}>{kpi.icon}</span>
            </div>
            <div className="admin__kpi-value">{kpi.value}</div>
            {kpi.trend && (
              <div className={`admin__kpi-trend admin__kpi-trend--${kpi.trendDir}`}>
                {kpi.trendDir === 'up' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {kpi.trend}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="admin__grid-2">
        {/* Signups Chart */}
        <div className="admin__panel">
          <h3 className="admin__panel-title">Inscriptions (7 derniers jours)</h3>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mock.chartSignups}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'var(--on-surface-variant)', fontSize: 12}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ background: 'var(--surface-container-high)', border: 'none', borderRadius: 'var(--radius-md)' }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Logs */}
        <div className="admin__panel">
          <div className="admin__section-header">
            <h3 className="admin__panel-title">Journal de sécurité en temps réel</h3>
            <button className="btn btn--ghost btn--sm"><RefreshCw size={14} /></button>
          </div>
          <div className="admin__log-list">
            {mock.securityLogs.map((log, i) => (
              <div key={i} className="admin__log-item">
                <span className="admin__log-time">{log.time}</span>
                <span className={`admin__log-msg admin__log-msg--${log.type}`}>{log.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vue Action: Quick Tasks */}
      <div className="admin__section mt-8">
        <h2 className="admin__section-title">Actions rapides</h2>
        <div className="admin__actions">
          <button className="admin__action-btn" onClick={() => alert('Ouverture du créateur de programme...')}>Nouveau programme Global</button>
          <button className="admin__action-btn" onClick={() => alert('Gestion des badges')}>Gérer les Badges</button>
          <button className="admin__action-btn" onClick={() => alert('Cache vidé avec succès !')}>Vider le cache CDN</button>
          <button className="admin__action-btn" onClick={() => alert('Ouverture du modérateur...')}>Modérer le contenu ({mock.contentStats.pendingModeration})</button>
          <button className="admin__action-btn admin__action-btn--danger" onClick={() => confirm('Lancer la maintenance ?') && alert('Maintenance activée')}>Maintenance Système</button>
        </div>
      </div>
    </>
  );
}

function UsersView() {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Gestion Utilisateurs</h1>
        <p className="admin__page-subtitle">Visualisez et gérez la base utilisateur de Mouv'Body.</p>
      </div>

      <div className="admin__panel mb-6">
        <div className="admin__section-header">
          <div className="flex items-center gap-4">
            <div className="input-group mb-0" style={{ minWidth: 300 }}>
              <input type="text" className="input" placeholder="Rechercher un utilisateur..." />
            </div>
            <button className="btn btn--secondary btn--sm"><Filter size={16} /> Filtres</button>
          </div>
          <button className="btn btn--primary btn--sm">Exporter CSV</button>
        </div>

        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Inscrit le</th>
                <th>Dernière vue</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {mock.recentUsers.map((user, i) => (
                <tr key={i}>
                  <td>
                    <div className="flex flex-col">
                      <span style={{ fontWeight: 600 }}>{user.name}</span>
                      <span className="body-sm" style={{ fontSize: 11 }}>{user.email}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`chip chip--sm ${user.role === 'Premium' ? 'chip--selected' : ''}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className={`admin__status admin__status--${user.status === 'actif' ? 'ok' : user.status === 'banni' ? 'error' : 'neutral'}`}>
                      <span className="admin__status-dot"></span>
                      {user.status}
                    </div>
                  </td>
                  <td>{user.joined}</td>
                  <td>{user.lastSeen}</td>
                  <td>
                    <button className="admin__topbar-btn"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin__grid-2">
        <div className="admin__panel">
          <h3 className="admin__panel-title">Répartition par Morphotype</h3>
          <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             {/* Mock chart representation */}
             <div className="flex gap-4 items-end" style={{ height: 100 }}>
                <div className="flex flex-col items-center gap-2">
                  <div style={{ width: 40, height: 60, background: 'var(--primary)', borderRadius: '4px 4px 0 0' }}></div>
                  <span className="body-sm">Ecto</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div style={{ width: 40, height: 90, background: 'var(--secondary)', borderRadius: '4px 4px 0 0' }}></div>
                  <span className="body-sm">Meso</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div style={{ width: 40, height: 45, background: 'var(--tertiary)', borderRadius: '4px 4px 0 0' }}></div>
                  <span className="body-sm">Endo</span>
                </div>
             </div>
          </div>
        </div>
        <div className="admin__panel">
          <h3 className="admin__panel-title">Taux de Rétention (W1 &rarr; W4)</h3>
           <div className="admin__funnel mt-4">
             {mock.funnelData.slice(2).map((step, i) => (
               <div key={i} className="admin__funnel-step">
                 <span className="admin__funnel-label">{step.step}</span>
                 <div className="admin__funnel-bar" style={{ width: `${step.pct}%` }}>{step.pct}%</div>
                 <span className="admin__funnel-value">{step.value}</span>
               </div>
             ))}
           </div>
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

function ActivityView() {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Analyse d'Activité</h1>
        <p className="admin__page-subtitle">Suivi des sessions et des interactions utilisateurs.</p>
      </div>
      <div className="admin__kpi-grid">
         <KPICard title="Sessions Actives" value={mock.activityStats.activeSessions} icon={<Activity />} color="primary" />
         <KPICard title="Temps Moyen" value={mock.activityStats.avgSessionTime} icon={<Clock />} color="secondary" />
         <KPICard title="Actions / Jour" value={mock.activityStats.actionsPerDay} icon={<Zap />} color="tertiary" />
      </div>
      <div className="admin__panel mt-8">
        <h3 className="admin__panel-title">Pics d'utilisation (Dernières 24h)</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mock.activityData}>
              <XAxis dataKey="time" stroke="var(--on-surface-variant)" fontSize={12} />
              <YAxis stroke="var(--on-surface-variant)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--surface-container-high)', border: 'none' }} />
              <Area type="monotone" dataKey="users" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}

function ContentView() {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Gestion du Contenu</h1>
        <p className="admin__page-subtitle">Modération et gestion des ressources Mouv'Body.</p>
      </div>
      <div className="admin__kpi-grid">
         <KPICard title="Programmes" value={mock.contentStats.totalPrograms} icon={<Database />} color="neutral" />
         <KPICard title="Exercices" value={mock.contentStats.totalExercises} icon={<Zap />} color="neutral" />
         <KPICard title="En attente" value={mock.contentStats.pendingModeration} icon={<AlertTriangle />} color="warning" />
      </div>
      <div className="admin__panel mt-8">
         <p style={{ textAlign: 'center', opacity: 0.6, padding: '4rem 0' }}>Interface de modération avancée en cours de développement.</p>
      </div>
    </>
  );
}

function SecurityView() {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Journal de Sécurité</h1>
        <p className="admin__page-subtitle">Historique des accès et tentatives de connexion.</p>
      </div>
      <div className="admin__panel">
        <table className="admin__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Utilisateur</th>
              <th>Événement</th>
              <th>IP</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {mock.securityLogs.map((log, i) => (
              <tr key={i}>
                <td style={{ opacity: 0.7 }}>{log.time}</td>
                <td style={{ fontWeight: 600 }}>{log.msg.split(' par ')[1] || 'Système'}</td>
                <td>{log.msg.split(' par ')[0]}</td>
                <td style={{ fontFamily: 'monospace', opacity: 0.6 }}>192.168.1.{10 + i}</td>
                <td>
                  <span className={`chip chip--sm ${log.type === 'error' ? 'chip--danger' : 'chip--success'}`}>
                    {log.type === 'error' ? 'Échec' : 'Réussite'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AlertsView() {
  return (
    <>
      <div className="admin__page-header">
        <h1 className="admin__page-title">Alertes & Notifications</h1>
        <p className="admin__page-subtitle">Incidents critiques et avertissements système.</p>
      </div>
      <div className="flex flex-col gap-4">
        {mock.alerts.map(alert => (
          <div key={alert.id} className={`admin__alert admin__alert--${alert.type}`} style={{ padding: '1.5rem' }}>
            <div className="flex justify-between items-start">
              <div>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{alert.msg}</h3>
                <p style={{ opacity: 0.8 }}>Incident détecté à {alert.time}. Une action immédiate est requise.</p>
              </div>
              <button className="btn btn--secondary btn--sm" onClick={() => alert('Alerte acquittée')}>Acquitter</button>
            </div>
          </div>
        ))}
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
