import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, CheckCircle2, Circle, Flame, Info, Sparkles, ChefHat } from 'lucide-react';
import { calculateMacros, calculateTDEE } from '../utils/calculations';
import { getMealPlan } from '../utils/nutritionGenerator';
import { generateRealRecipe } from '../utils/recipeMatcher';
import { addXP } from '../utils/gamification';

export default function Nutrition() {
  const { profile, user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [ingredients, setIngredients] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) return;
    setIsGenerating(true);
    
    // Calcul de la cible calorique pour un repas principal (~35% du total)
    // On utilise l'objet "macros" calculé plus bas dans le composant
    let targetKcal = 600;
    try {
      if (macros && macros.calories > 0) {
        targetKcal = Math.round(macros.calories * 0.35);
      }
    } catch (e) {
      console.error("Erreur calcul macros", e);
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: { ingredients, targetKcal }
      });
      
      if (error) throw error;
      
      setGeneratedRecipe({
        nom: data.nom,
        recette: data.recette
      });
    } catch (err) {
      console.error("Erreur de génération :", err);
      setGeneratedRecipe({
        nom: "Oups... Connexion IA échouée",
        recette: "Impossible de générer la recette avec l'IA pour le moment. Réessayez dans quelques instants."
      });
    } finally {
      setIsGenerating(false);
    }
  };

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
      const newConsomme = !existing.consomme;
      const { data, error } = await supabase
        .from('nutrition_logs')
        .update({ consomme: newConsomme })
        .eq('id', existing.id)
        .select()
        .single();
        
      if (!error && data) {
        setLogs(logs.map(l => l.id === existing.id ? data : l));
        // Add XP if checked
        if (newConsomme) {
          await addXP(user.id, 30);
        }
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
        // Add XP for first time logging
        await addXP(user.id, 30);
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
      { id: 'm1', type: 'Petit-déjeuner', nom: mealPlan.petit_dejeuner.nom, desc: mealPlan.petit_dejeuner.description, recette: mealPlan.petit_dejeuner.recette, options: mealPlan.petit_dejeuner.options, ratio: 0.20 },
      { id: 'm2', type: 'Déjeuner', nom: mealPlan.dejeuner.nom, desc: mealPlan.dejeuner.description, recette: mealPlan.dejeuner.recette, options: mealPlan.dejeuner.options, ratio: 0.30 },
      { id: 'm3', type: 'Pré-Workout', nom: mealPlan.pre_workout.nom, desc: mealPlan.pre_workout.description, recette: mealPlan.pre_workout.recette, options: mealPlan.pre_workout.options, ratio: 0.10 },
      { id: 'm4', type: 'Post-Workout', nom: mealPlan.post_workout.nom, desc: mealPlan.post_workout.description, recette: mealPlan.post_workout.recette, options: mealPlan.post_workout.options, ratio: 0.15 },
      { id: 'm5', type: 'Dîner', nom: mealPlan.diner.nom, desc: mealPlan.diner.description, recette: mealPlan.diner.recette, options: mealPlan.diner.options, ratio: 0.25 },
    ];
  } else {
    meals = [
      { id: 'm1', type: 'Petit-déjeuner', nom: mealPlan.petit_dejeuner.nom, desc: mealPlan.petit_dejeuner.description, recette: mealPlan.petit_dejeuner.recette, options: mealPlan.petit_dejeuner.options, ratio: 0.25 },
      { id: 'm2', type: 'Collation', nom: mealPlan.collation.nom, desc: mealPlan.collation.description, recette: mealPlan.collation.recette, options: mealPlan.collation.options, ratio: 0.10 },
      { id: 'm3', type: 'Déjeuner', nom: mealPlan.dejeuner.nom, desc: mealPlan.dejeuner.description, recette: mealPlan.dejeuner.recette, options: mealPlan.dejeuner.options, ratio: 0.35 },
      { id: 'm4', type: 'Dîner', nom: mealPlan.diner.nom, desc: mealPlan.diner.description, recette: mealPlan.diner.recette, options: mealPlan.diner.options, ratio: 0.30 },
    ];
  }

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

  return (
    <div className="page" style={{ paddingBottom: 'var(--space-8)' }}>
      <motion.div variants={container} initial="hidden" animate="show">
        {/* Editorial Header */}
        <motion.div variants={item} style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: 'var(--space-10)'
        }}>
          <div>
            <h1 className="display-sm" style={{ 
              textTransform: 'uppercase', 
              lineHeight: 0.9, 
              margin: 0,
              fontSize: '1.8rem'
            }}>
              NUTRITION<br />
              <span style={{ color: 'var(--primary)' }}>MOUV'BODY</span>
            </h1>
          </div>
          <div style={{ 
            background: 'var(--surface-container-high)', 
            padding: 'var(--space-2) var(--space-4)', 
            borderRadius: 'var(--radius-xl)', 
            border: '1px solid rgba(var(--outline-variant), 0.1)',
            flexShrink: 0
          }}>
            <span className="label-sm" style={{ color: isTrainingDay ? 'var(--primary)' : 'var(--on-surface-variant)', fontWeight: 'bold', textTransform: 'uppercase' }}>
              {isTrainingDay ? "TRAINING" : "REPOS"}
            </span>
          </div>
        </motion.div>

        {/* Macros Summary Bento */}
        <motion.div variants={item} className="card card--glow-primary" style={{ padding: 'var(--space-8)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--primary-rgb), 0.2)', marginBottom: 'var(--space-10)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Flame className="text-primary" size={32} />
            <div>
              <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OBJECTIF QUOTIDIEN</p>
              <h2 className="display-sm" style={{ margin: 0, lineHeight: 1 }}>{macros.calories} <span style={{ fontSize: '1.25rem', color: 'var(--on-surface-variant)' }}>KCAL</span></h2>
            </div>
          </div>
          
          <div className="flex gap-6">
            <div style={{ flex: 1 }}>
              <div className="flex justify-between mb-2">
                <span className="label-sm" style={{ color: 'var(--on-surface-variant)', fontWeight: 'bold' }}>PRO</span>
                <span className="label-md" style={{ fontWeight: 700, color: 'var(--primary)' }}>{macros.proteines}g</span>
              </div>
              <div className="progress-bar" style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.05)' }}><div className="progress-bar__fill" style={{ width: '100%', background: 'var(--primary)', boxShadow: '0 0 10px rgba(var(--primary-rgb), 0.5)' }} /></div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex justify-between mb-2">
                <span className="label-sm" style={{ color: 'var(--on-surface-variant)', fontWeight: 'bold' }}>GLU</span>
                <span className="label-md" style={{ fontWeight: 700, color: 'var(--secondary)' }}>{macros.glucides}g</span>
              </div>
              <div className="progress-bar" style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.05)' }}><div className="progress-bar__fill" style={{ width: '100%', background: 'var(--secondary)', boxShadow: '0 0 10px rgba(var(--secondary-rgb), 0.5)' }} /></div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="flex justify-between mb-2">
                <span className="label-sm" style={{ color: 'var(--on-surface-variant)', fontWeight: 'bold' }}>LIP</span>
                <span className="label-md" style={{ fontWeight: 700, color: 'var(--tertiary)' }}>{macros.lipides}g</span>
              </div>
              <div className="progress-bar" style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.05)' }}><div className="progress-bar__fill" style={{ width: '100%', background: 'var(--tertiary)', boxShadow: '0 0 10px rgba(var(--tertiary-rgb), 0.5)' }} /></div>
            </div>
          </div>
        </motion.div>

        {/* Meals List */}
        <motion.div variants={item} style={{ marginBottom: 'var(--space-10)' }}>
          <div className="flex justify-between items-end mb-6">
            <h2 className="title-lg" style={{ borderLeft: '4px solid var(--secondary)', paddingLeft: 'var(--space-4)', textTransform: 'uppercase', margin: 0 }}>PLAN ALIMENTAIRE</h2>
            <span className="label-sm text-muted" style={{ textTransform: 'uppercase' }}>CLIQUEZ POUR DÉTAILS</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {meals.map((meal) => {
              const isConsumed = logs.some(l => l.meal_id === meal.id && l.consomme);
              const isExpanded = expandedMeal === meal.id;
              const mCals = Math.round(macros.calories * meal.ratio);
              const mPro = Math.round(macros.proteines * meal.ratio);
              const mGlu = Math.round(macros.glucides * meal.ratio);
              const mLip = Math.round(macros.lipides * meal.ratio);

              return (
                <div key={meal.id} style={{ 
                     background: isConsumed ? 'var(--surface-container)' : 'var(--surface-container-low)', 
                     border: '1px solid',
                     borderColor: isConsumed ? 'rgba(var(--primary-rgb), 0.3)' : 'rgba(var(--outline-variant), 0.1)',
                     borderRadius: 'var(--radius-xl)',
                     padding: 'var(--space-6)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer',
                     opacity: isConsumed ? 0.7 : 1
                   }}
                   onClick={() => setExpandedMeal(isExpanded ? null : meal.id)}>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={(e) => toggleMeal(e, meal.id)} style={{ background: 'none', border: 'none', color: isConsumed ? 'var(--primary)' : 'var(--on-surface-variant)', cursor: 'pointer', marginRight: 'var(--space-6)', padding: 0, display: 'flex' }}>
                      {isConsumed ? <CheckCircle2 size={32} /> : <Circle size={32} />}
                    </button>
                    
                    <div style={{ flex: 1 }}>
                      <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>{meal.type}</p>
                      <h3 className="title-lg" style={{ textDecoration: isConsumed ? 'line-through' : 'none', color: isConsumed ? 'var(--on-surface-variant)' : 'var(--on-surface)', textTransform: 'uppercase', margin: 0 }}>
                        {meal.nom}
                      </h3>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <span className="title-md" style={{ color: 'var(--primary)', display: 'block' }}>{mCals} <span style={{ fontSize: '0.75rem' }}>KCAL</span></span>
                      <span className="label-sm" style={{ color: 'var(--on-surface-variant)', fontWeight: 'bold' }}>P:{mPro} G:{mGlu} L:{mLip}</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{ padding: 'var(--space-4)', background: 'var(--surface-container-highest)', borderRadius: 'var(--radius-lg)' }}>
                          <div className="flex items-start gap-3 mb-4">
                            <Info size={18} style={{ color: 'var(--secondary)', marginTop: '2px', flexShrink: 0 }} />
                            <p className="body-md" style={{ color: 'var(--on-surface)', lineHeight: 1.5 }}>{meal.desc}</p>
                          </div>
                          
                          {meal.recette && (
                            <div className="flex items-start gap-3 mb-4" style={{ background: 'var(--surface-container)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
                              <UtensilsCrossed size={18} style={{ color: 'var(--primary)', marginTop: '2px', flexShrink: 0 }} />
                              <div>
                                <p className="label-sm" style={{ color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>Recette rapide</p>
                                <p className="body-sm" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{meal.recette}</p>
                              </div>
                            </div>
                          )}
                          
                          {meal.options && meal.options.length > 0 && (
                            <div>
                              <p className="label-sm" style={{ color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: 'var(--space-3)', fontWeight: 'bold' }}>Alternatives suggérées</p>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-2)' }}>
                                {meal.options.map((opt, idx) => (
                                  <div key={idx} style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', height: '120px', border: '1px solid rgba(var(--outline-variant), 0.2)' }}>
                                    <img src={opt.image} alt={opt.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)', padding: '32px 12px 12px 12px' }}>
                                      <span className="label-sm text-white" style={{ display: 'block', textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontWeight: 'bold', lineHeight: 1.2 }}>{opt.nom}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Frigo Magique / Générateur de Recettes */}
        <motion.div variants={item} className="mb-10">
          <div className="card" style={{ background: 'var(--surface-container)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(var(--primary-rgb), 0.3)' }}>
            <div className="flex items-center gap-3 mb-4">
              <ChefHat size={28} style={{ color: 'var(--primary)' }} />
              <div>
                <h3 className="title-md" style={{ textTransform: 'uppercase', margin: 0 }}>Générateur de recettes</h3>
                <p className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>Saisissez les aliments que vous avez, on s'occupe du reste !</p>
              </div>
            </div>
            
            <div className="flex gap-3 mb-4" style={{ flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Ex: Poulet, riz, brocolis, 2 œufs..." 
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                style={{ flex: 1, minWidth: '200px', background: 'var(--surface-container-high)', border: '1px solid rgba(var(--outline-variant), 0.2)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-full)', color: 'var(--on-surface)', outline: 'none' }}
              />
              <button 
                className="btn btn--primary" 
                onClick={handleGenerateRecipe}
                disabled={isGenerating || !ingredients.trim()}
                style={{ borderRadius: 'var(--radius-full)', padding: 'var(--space-3) var(--space-6)', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isGenerating ? 'Création...' : (
                  <>
                    <Sparkles size={18} />
                    Générer
                  </>
                )}
              </button>
            </div>

            <AnimatePresence>
              {generatedRecipe && !isGenerating && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ background: 'var(--surface-container-high)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginTop: 'var(--space-4)', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
                    <h4 className="label-lg" style={{ color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 'var(--space-4)', fontWeight: 'bold' }}>{generatedRecipe.nom}</h4>
                    <div className="body-md" style={{ color: 'var(--on-surface)', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{generatedRecipe.recette}</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Advice based on objective */}
        <motion.div variants={item} className="mt-8">
          <div style={{ background: 'var(--surface-container-low)', padding: 'var(--space-6)', borderRadius: 'var(--radius-xl)', borderLeft: '4px solid var(--primary)', borderRight: '1px solid rgba(var(--outline-variant), 0.1)', borderTop: '1px solid rgba(var(--outline-variant), 0.1)', borderBottom: '1px solid rgba(var(--outline-variant), 0.1)' }}>
            <h4 className="title-md" style={{ textTransform: 'uppercase', marginBottom: 'var(--space-2)' }}>CONSEIL NUTRITION</h4>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
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
