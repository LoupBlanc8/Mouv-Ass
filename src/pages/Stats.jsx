import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, Activity, Calendar, Trophy } from 'lucide-react';

export default function Stats() {
  const { profile, user } = useAuth();
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadStats();
  }, [user]);

  async function loadStats() {
    setLoading(true);
    // Get last 30 days of workouts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: logs } = await supabase.from('workout_logs')
      .select('*, exercises(nom)')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });
      
    setWorkoutLogs(logs || []);
    setLoading(false);
  }

  // Process data for charts
  const volumeByDate = workoutLogs.reduce((acc, log) => {
    const date = log.date.substring(5, 10); // MM-DD
    const volume = (log.poids_kg || 0) * (log.reps || 0);
    acc[date] = (acc[date] || 0) + volume;
    return acc;
  }, {});

  const volumeChartData = Object.keys(volumeByDate).map(date => ({
    date,
    volume: volumeByDate[date]
  })).slice(-7); // Last 7 active days

  const totalWorkouts = new Set(workoutLogs.map(l => `${l.date}-${l.session_id}`)).size;
  const totalVolume = workoutLogs.reduce((sum, log) => sum + ((log.poids_kg || 0) * (log.reps || 0)), 0);

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

  return (
    <div className="page" style={{ paddingBottom: 'var(--space-8)' }}>
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="page-header">
          <h1 className="headline-md">Statistiques</h1>
        </motion.div>

        {/* Key Metrics */}
        <motion.div variants={item} className="flex gap-4 mb-6">
          <div className="card card--elevated" style={{ flex: 1, padding: 'var(--space-4)', textAlign: 'center' }}>
            <Calendar className="text-primary mx-auto mb-2" size={24} />
            <h3 className="display-sm text-primary">{totalWorkouts}</h3>
            <p className="label-sm text-muted">Séances (30j)</p>
          </div>
          <div className="card card--elevated" style={{ flex: 1, padding: 'var(--space-4)', textAlign: 'center' }}>
            <Activity className="text-secondary mx-auto mb-2" size={24} />
            <h3 className="display-sm text-secondary">{Math.round(totalVolume / 1000)}k</h3>
            <p className="label-sm text-muted">Tonnage (kg)</p>
          </div>
        </motion.div>

        {/* Volume Chart */}
        <motion.div variants={item} className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="title-md">Volume d'entraînement</h3>
            <TrendingUp size={18} className="text-primary" />
          </div>
          <div style={{ height: 200, width: '100%' }}>
            {volumeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeChartData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--on-surface-variant)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface-container-highest)', border: 'none', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--primary)' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted body-sm">
                Pas assez de données
              </div>
            )}
          </div>
        </motion.div>

        {/* Consistency */}
        <motion.div variants={item} className="card card--glow-secondary mb-6">
          <h3 className="title-md mb-4">Adhérence au programme</h3>
          <div className="flex justify-between items-end mb-2">
            <span className="display-sm">
              {profile?.jours_semaine?.length > 0 
                ? Math.min(100, Math.round((totalWorkouts / (profile.jours_semaine.length * 4)) * 100)) 
                : 0}%
            </span>
            <Trophy size={24} className="text-secondary" />
          </div>
          <div className="progress-bar" style={{ height: 6 }}>
            <div className="progress-bar__fill" style={{ 
              width: `${profile?.jours_semaine?.length > 0 ? Math.min(100, (totalWorkouts / (profile.jours_semaine.length * 4)) * 100) : 0}%`, 
              background: 'linear-gradient(90deg, var(--secondary), var(--primary))' 
            }} />
          </div>
          <p className="body-sm text-muted mt-3">Basé sur ton objectif de {profile?.jours_semaine?.length || 0} séances par semaine.</p>
        </motion.div>

      </motion.div>
    </div>
  );
}
