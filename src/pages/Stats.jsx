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
        <motion.div variants={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-10)', marginTop: 'var(--space-4)' }}>
          <div>
            <h1 className="display-sm" style={{ textTransform: 'uppercase', lineHeight: 1, margin: 0 }}>
              MOUV'ASS<br />
              <span style={{ color: 'var(--primary)' }}>ANALYTICS</span>
            </h1>
          </div>
        </motion.div>

        {/* Key Metrics Bento */}
        <motion.div variants={item} className="flex gap-4 mb-6">
          <div className="card" style={{ flex: 1, padding: 'var(--space-6)', textAlign: 'center', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(var(--primary-rgb), 0.1)' }}>
              <Calendar className="text-primary" size={24} />
            </div>
            <h3 className="display-sm text-primary" style={{ margin: 0, lineHeight: 1 }}>{totalWorkouts}</h3>
            <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 'var(--space-2)' }}>SÉANCES (30J)</p>
          </div>
          <div className="card" style={{ flex: 1, padding: 'var(--space-6)', textAlign: 'center', background: 'var(--surface-container-low)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
            <div style={{ width: '48px', height: '48px', margin: '0 auto var(--space-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'rgba(var(--secondary-rgb), 0.1)' }}>
              <Activity className="text-secondary" size={24} />
            </div>
            <h3 className="display-sm text-secondary" style={{ margin: 0, lineHeight: 1 }}>{Math.round(totalVolume / 1000)}k</h3>
            <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 'var(--space-2)' }}>TONNAGE (KG)</p>
          </div>
        </motion.div>

        {/* Volume Chart Bento */}
        <motion.div variants={item} className="card mb-6" style={{ background: 'var(--surface-container-low)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--outline-variant), 0.1)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="title-lg" style={{ textTransform: 'uppercase', margin: 0 }}>VOLUME GLOBAL</h3>
            <TrendingUp size={24} className="text-primary" />
          </div>
          <div style={{ height: 220, width: '100%' }}>
            {volumeChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeChartData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--on-surface-variant)" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--surface-container-highest)', border: '1px solid rgba(var(--outline-variant), 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--on-surface)' }}
                    itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--surface)', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: 'var(--on-surface-variant)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.875rem' }}>
                PAS ASSEZ DE DONNÉES
              </div>
            )}
          </div>
        </motion.div>

        {/* Consistency Bento */}
        <motion.div variants={item} className="card card--glow-secondary mb-6" style={{ background: 'var(--surface-container)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--secondary-rgb), 0.2)' }}>
          <h3 className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>ADHÉRENCE AU PROGRAMME</h3>
          <div className="flex justify-between items-end mb-4">
            <span className="display-sm" style={{ color: 'var(--on-surface)', lineHeight: 1 }}>
              {profile?.jours_semaine?.length > 0 
                ? Math.min(100, Math.round((totalWorkouts / (profile.jours_semaine.length * 4)) * 100)) 
                : 0}%
            </span>
            <Trophy size={32} className="text-secondary" />
          </div>
          <div className="progress-bar" style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <div className="progress-bar__fill" style={{ 
              width: `${profile?.jours_semaine?.length > 0 ? Math.min(100, (totalWorkouts / (profile.jours_semaine.length * 4)) * 100) : 0}%`, 
              background: 'linear-gradient(90deg, var(--secondary), var(--primary))',
              boxShadow: '0 0 10px rgba(var(--secondary-rgb), 0.5)'
            }} />
          </div>
          <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginTop: 'var(--space-4)' }}>Basé sur ton objectif de <strong style={{ color: 'var(--on-surface)' }}>{profile?.jours_semaine?.length || 0}</strong> séances par semaine.</p>
        </motion.div>

      </motion.div>
    </div>
  );
}
