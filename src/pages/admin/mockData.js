// ============================================
// MOUV'BODY Admin — Mock Data Layer
// Replace with real Supabase queries in production
// ============================================

export const kpiData = [
  { id: 'users-total', label: 'Utilisateurs totaux', value: '2 847', trend: '+12.3%', trendDir: 'up', color: 'primary', icon: '👥' },
  { id: 'users-active', label: 'Actifs (30j)', value: '1 923', trend: '+8.1%', trendDir: 'up', color: 'success', icon: '✅' },
  { id: 'sessions-live', label: 'Sessions actives', value: '47', trend: '', trendDir: '', color: 'secondary', icon: '⚡' },
  { id: 'revenue-month', label: 'Revenus du mois', value: '€14 230', trend: '+22.4%', trendDir: 'up', color: 'tertiary', icon: '💰' },
  { id: 'mrr', label: 'MRR', value: '€12 850', trend: '+5.2%', trendDir: 'up', color: 'primary', icon: '📈' },
  { id: 'churn', label: 'Taux de churn', value: '3.2%', trend: '-0.8%', trendDir: 'up', color: 'success', icon: '🔄' },
  { id: 'nps', label: 'Score NPS', value: '72', trend: '+4', trendDir: 'up', color: 'primary', icon: '⭐' },
  { id: 'errors-5xx', label: 'Erreurs 5xx (24h)', value: '3', trend: '-67%', trendDir: 'up', color: 'error', icon: '🐛' },
];

export const recentUsers = [
  { name: 'Lucas Martin', email: 'lucas.m@mail.com', role: 'Utilisateur', status: 'actif', joined: '07/05/2026', lastSeen: 'il y a 2min' },
  { name: 'Sophie Bernard', email: 'sophie.b@mail.com', role: 'Premium', status: 'actif', joined: '06/05/2026', lastSeen: 'il y a 15min' },
  { name: 'Thomas Petit', email: 'thomas.p@mail.com', role: 'Utilisateur', status: 'inactif', joined: '01/05/2026', lastSeen: 'il y a 3j' },
  { name: 'Emma Dubois', email: 'emma.d@mail.com', role: 'Premium', status: 'actif', joined: '28/04/2026', lastSeen: 'il y a 30min' },
  { name: 'Ali Hassan', email: 'ali.h@mail.com', role: 'Utilisateur', status: 'banni', joined: '20/04/2026', lastSeen: '—' },
  { name: 'Marie Laurent', email: 'marie.l@mail.com', role: 'Admin', status: 'actif', joined: '15/03/2026', lastSeen: 'il y a 1min' },
];

export const recentTransactions = [
  { id: 'TX-4821', user: 'Sophie Bernard', amount: '€9.99', type: 'Abonnement Premium', status: 'ok', date: '07/05 14:32' },
  { id: 'TX-4820', user: 'Emma Dubois', amount: '€9.99', type: 'Renouvellement', status: 'ok', date: '07/05 12:10' },
  { id: 'TX-4819', user: 'Pierre Durand', amount: '€9.99', type: 'Abonnement Premium', status: 'warn', date: '07/05 09:45' },
  { id: 'TX-4818', user: 'Julie Moreau', amount: '€9.99', type: 'Remboursement', status: 'error', date: '06/05 18:22' },
  { id: 'TX-4817', user: 'Lucas Martin', amount: '€9.99', type: 'Renouvellement', status: 'ok', date: '06/05 15:08' },
];

export const services = [
  { name: 'API REST', status: 'ok', latency: '45ms', uptime: '99.98%' },
  { name: 'Supabase DB', status: 'ok', latency: '12ms', uptime: '99.99%' },
  { name: 'Auth Service', status: 'ok', latency: '38ms', uptime: '99.97%' },
  { name: 'Edge Functions', status: 'ok', latency: '120ms', uptime: '99.95%' },
  { name: 'Storage', status: 'warn', latency: '210ms', uptime: '99.90%' },
  { name: 'AI Generation', status: 'ok', latency: '2.4s', uptime: '99.80%' },
  { name: 'Cron Jobs', status: 'ok', latency: '—', uptime: '100%' },
  { name: 'CDN / Assets', status: 'ok', latency: '18ms', uptime: '99.99%' },
];

export const alerts = [
  { id: 1, type: 'warn', msg: 'Storage latence élevée — temps de réponse supérieur à 200ms', time: 'il y a 15min' },
  { id: 2, type: 'info', msg: 'Déploiement v2.4.1 en cours de propagation', time: 'il y a 45min' },
  { id: 3, type: 'error', msg: '3 notifications push en échec (timeout FCM)', time: 'il y a 2h' },
  { id: 4, type: 'warn', msg: '12 tickets support non résolus depuis +48h', time: 'il y a 3h' },
];

export const securityLogs = [
  { time: '14:32:10', msg: 'Login admin: marie.l@mail.com depuis 92.184.xx.xx (Paris)', type: 'info' },
  { time: '14:28:45', msg: 'Tentative login échouée: unknown@test.com (5ème tentative)', type: 'warn' },
  { time: '13:55:00', msg: 'Compte ali.h@mail.com banni — raison: spam signalé', type: 'error' },
  { time: '13:12:33', msg: 'Accès API admin depuis nouvelle IP: 185.xx.xx.xx (Allemagne)', type: 'warn' },
  { time: '12:40:00', msg: 'Certificat SSL renouvelé — expiration: 07/08/2026', type: 'info' },
  { time: '11:00:00', msg: 'Login admin: admin@mouvbody.com depuis 92.184.xx.xx', type: 'info' },
  { time: '09:15:22', msg: 'Rate limiting activé pour IP 45.xx.xx.xx (100 req/min)', type: 'warn' },
];

export const topFeatures = [
  { name: 'Workout Tracker', usage: 89, sessions: '1 247' },
  { name: 'Plan Nutrition', usage: 72, sessions: '983' },
  { name: 'Onboarding IA', usage: 65, sessions: '841' },
  { name: 'Classement Rank', usage: 58, sessions: '752' },
  { name: 'Academy / Skills', usage: 41, sessions: '531' },
  { name: 'Social Feed', usage: 34, sessions: '440' },
];

export const funnelData = [
  { step: 'Visiteurs Landing', value: 8420, pct: 100 },
  { step: 'Inscription', value: 3218, pct: 38 },
  { step: 'Onboarding complété', value: 2847, pct: 34 },
  { step: 'Première séance', value: 2105, pct: 25 },
  { step: 'Semaine 2 active', value: 1640, pct: 19 },
  { step: 'Conversion Premium', value: 412, pct: 5 },
];

export const chartSignups = [
  { day: 'Lun', value: 42 }, { day: 'Mar', value: 38 },
  { day: 'Mer', value: 55 }, { day: 'Jeu', value: 48 },
  { day: 'Ven', value: 61 }, { day: 'Sam', value: 72 },
  { day: 'Dim', value: 65 },
];

export const chartRevenue = [
  { month: 'Jan', value: 8200 }, { month: 'Fév', value: 9100 },
  { month: 'Mar', value: 10400 }, { month: 'Avr', value: 11800 },
  { month: 'Mai', value: 14230 },
];

export const chartUsagePeaks = [
  { hour: '06h', value: 12 }, { hour: '07h', value: 45 },
  { hour: '08h', value: 78 }, { hour: '09h', value: 52 },
  { hour: '10h', value: 38 }, { hour: '11h', value: 41 },
  { hour: '12h', value: 85 }, { hour: '13h', value: 62 },
  { hour: '14h', value: 35 }, { hour: '15h', value: 28 },
  { hour: '16h', value: 32 }, { hour: '17h', value: 68 },
  { hour: '18h', value: 95 }, { hour: '19h', value: 110 },
  { hour: '20h', value: 88 }, { hour: '21h', value: 55 },
  { hour: '22h', value: 25 },
];

export const systemResources = {
  cpu: { label: 'CPU', value: 34, max: 100, unit: '%' },
  memory: { label: 'Mémoire', value: 2.8, max: 8, unit: 'GB' },
  storage: { label: 'Stockage', value: 12.4, max: 50, unit: 'GB' },
  bandwidth: { label: 'Bande passante', value: 45, max: 100, unit: 'GB' },
};

export const contentStats = {
  programsCreated: 2847,
  exercisesLogged: 34520,
  mealsTracked: 18940,
  pendingModeration: 3,
  openTickets: 12,
  reports: 5,
};

export const subscriptionBreakdown = {
  active: 412,
  trial: 89,
  cancelled: 34,
  pending: 12,
};
