import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, CheckCircle2, Circle, Flame, Info } from 'lucide-react';
import { calculateMacros, calculateTDEE } from '../utils/calculations';
import { getMealPlan } from '../utils/nutritionGenerator';

export default function Nutrition() {
  const { profile, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMeal, setExpandedMeal] = useState(null);

  useEffect(() => {
    if (user) loadLogs();
  }, [user]);

  async function loadLogs() {
    setLoading(true);
    const todayStr = new Date().toISOString().split('T')[0];
    const { data } = await supabase.from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', todayStr);
    
    setLogs(data || []);
    setLoading(false);
  }

  async function toggleMeal(e, mealId) {
    e.stopPropagation();
    const todayStr = new Date().toISOString().split('T')[0];
    const existing = logs.find(l => l.meal_id === mealId);
    
    if (existing) {
      // Met à jour la BDD
      const { data, error } = await supabase
        .from('nutrition_logs')
        .update({ consomme: !existing.consomme })
        .eq('id', existing.id)
        .select()
        .single();
        
      if (!error && data) {
        setLogs(logs.map(l => l.id === existing.id ? data : l));
      }
    } else {
      // Insère dans la BDD
      const { data, error } = await supabase
        .from('nutrition_logs')
        .insert({
          user_id: user.id,
          meal_id: mealId,
          date: todayStr,
          consomme: true
        })
        .select()
        .single();
        
      if (!error && data) {
        setLogs([...logs, data]);
      } else {
        console.error("Erreur lors de l'insertion du repas", error);
      }
    }
  }

  const today = new Date();
  const jourSemaine = today.getDay();
  const isTrainingDay = (profile?.jours_semaine || []).includes(jourSemaine);

  const macros = profile?.metabolisme_base
    ? calculateMacros(
        calculateTDEE(Number(profile.metabolisme_base), (profile.jours_semaine || []).length),
        Number(profile.poids_kg), profile.objectif, profile.morphotype, isTrainingDay
      )
    : { calories: 0, proteines: 0, glucides: 0, lipides: 0 };

  const mealPlan = getMealPlan(profile?.objectif || 'maintien', {
    use_whey: profile?.use_whey !== false,
    use_creatine: profile?.use_creatine === true
  });
  let meals = [];
  if (isTrainingDay) {
    meals = [
      { id: 'm1', type: 'Petit-déjeuner', nom: mealPlan.petit_dejeuner.nom, desc: mealPlan.petit_dejeuner.description, ratio: 0.20 },
      { id: 'm2', type: 'Déjeuner', nom: mealPlan.dejeuner.nom, desc: mealPlan.dejeuner.description, ratio: 0.30 },
      { id: 'm3', type: 'Pré-Workout', nom: mealPlan.pre_workout.nom, desc: mealPlan.pre_workout.description, ratio: 0.10 },
      { id: 'm4', type: 'Post-Workout', nom: mealPlan.post_workout.nom, desc: mealPlan.post_workout.description, ratio: 0.15 },
      { id: 'm5', type: 'Dîner', nom: mealPlan.diner.nom, desc: mealPlan.diner.description, ratio: 0.25 },
    ];
  } else {
    meals = [
      { id: 'm1', type: 'Petit-déjeuner', nom: mealPlan.petit_dejeuner.nom, desc: mealPlan.petit_dejeuner.description, ratio: 0.25 },
      { id: 'm2', type: 'Collation', nom: mealPlan.collation.nom, desc: mealPlan.collation.description, ratio: 0.10 },
      { id: 'm3', type: 'Déjeuner', nom: mealPlan.dejeuner.nom, desc: mealPlan.dejeuner.description, ratio: 0.35 },
      { id: 'm4', type: 'Dîner', nom: mealPlan.diner.nom, desc: mealPlan.diner.description, ratio: 0.30 },
    ];
  }

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

  return (
    <div className="page" style={{ paddingBottom: 'var(--space-8)' }}>
      <motion.div variants={container} initial="hidden" animate="show">
        <motion.div variants={item} className="page-header">
          <h1 className="headline-md">Nutrition</h1>
          <span className="chip chip--secondary">{isTrainingDay ? "Jour d'entraînement" : "Jour de repos"}</span>
        </motion.div>

        {/* Macros Summary */}
        <motion.div variants={item} className="card card--glow-primary mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="text-primary" size={24} />
            <div>
              <p className="label-sm text-muted">Objectif Quotidien</p>
              <h2 className="title-lg">{macros.calories} kcal</h2>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div style={{ flex: 1 }}>
              <div className="flex justify-between mb-1">
                <span className="body-sm text-muted">Protéines</span>
                <span className="body-sm" style={{ fontWeight: 600 }}>{macros.proteines}g</span>
              </div>
              <div className="progress-bar"><div className="progress-bar__fill" style={{ width: '100%', background: 'var(--primary)' }} /></div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex justify-between mb-1">
                <span className="body-sm text-muted">Glucides</span>
                <span className="body-sm" style={{ fontWeight: 600 }}>{macros.glucides}g</span>
              </div>
              <div className="progress-bar"><div className="progress-bar__fill" style={{ width: '100%', background: 'var(--secondary)' }} /></div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex justify-between mb-1">
                <span className="body-sm text-muted">Lipides</span>
                <span className="body-sm" style={{ fontWeight: 600 }}>{macros.lipides}g</span>
              </div>
              <div className="progress-bar"><div className="progress-bar__fill" style={{ width: '100%', background: 'var(--tertiary)' }} /></div>
            </div>
          </div>
        </motion.div>

        {/* Meals List */}
        <motion.div variants={item}>
          <div className="flex justify-between items-center mb-4">
            <p className="section-label">Plan Alimentaire Suggéré</p>
            <span className="label-sm text-muted">Cliquez pour voir les ingrédients</span>
          </div>
          {meals.map((meal) => {
            const isConsumed = logs.some(l => l.meal_id === meal.id && l.consomme);
            const isExpanded = expandedMeal === meal.id;
            const mCals = Math.round(macros.calories * meal.ratio);
            const mPro = Math.round(macros.proteines * meal.ratio);
            const mGlu = Math.round(macros.glucides * meal.ratio);
            const mLip = Math.round(macros.lipides * meal.ratio);

            return (
              <div key={meal.id} className={`card mb-3 ${isConsumed ? 'card--recessed' : 'card--elevated'}`} 
                   style={{ padding: 'var(--space-4)', transition: 'all 0.3s', cursor: 'pointer' }}
                   onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}>
                
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <button onClick={(e) => toggleMeal(e, meal.id)} style={{ background: 'none', border: 'none', color: isConsumed ? 'var(--primary)' : 'var(--outline)', cursor: 'pointer', marginRight: 'var(--space-4)', marginTop: '2px' }}>
                    {isConsumed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                  </button>
                  
                  <div style={{ flex: 1 }}>
                    <p className="label-sm text-muted mb-1">{meal.type}</p>
                    <h3 className="title-md" style={{ textDecoration: isConsumed ? 'line-through' : 'none', color: isConsumed ? 'var(--on-surface-variant)' : 'var(--on-surface)' }}>
                      {meal.nom}
                    </h3>
                    <div className="flex gap-3 mt-1">
                      <span className="label-sm text-primary">{mCals} kcal</span>
                      <span className="label-sm text-muted">P:{mPro}g G:{mGlu}g L:{mLip}g</span>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, marginTop: 0 }}
                      animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                      exit={{ height: 0, opacity: 0, marginTop: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="card card--glass" style={{ padding: 'var(--space-3)', background: 'rgba(255,255,255,0.03)' }}>
                        <div className="flex items-start gap-2">
                          <Info size={16} className="text-muted" style={{ marginTop: '2px', flexShrink: 0 }} />
                          <p className="body-sm text-muted">{meal.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>

        {/* Advice based on objective */}
        <motion.div variants={item} className="mt-6">
          <div className="card card--glass" style={{ borderLeft: '4px solid var(--primary)' }}>
            <h4 className="title-md mb-2">Conseil Nutrition</h4>
            <p className="body-sm text-muted">
              {profile?.objectif === 'perte_poids' ? "Privilégie les aliments à faible densité calorique pour augmenter le volume de tes repas sans exploser ton compteur." :
               profile?.objectif === 'prise_masse' ? "N'hésite pas à utiliser des aliments denses en calories (oléagineux, huiles, beurre de cacahuète) si tu as du mal à atteindre ton quota." :
               "Maintiens une hydratation constante et répartis tes protéines de manière équitable sur l'ensemble de tes repas pour optimiser la synthèse protéique."}
            </p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
