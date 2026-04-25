import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Activity, Target, AlertTriangle, MapPin, Beaker } from 'lucide-react';
import { calculateIMC, getIMCCategory, calculateMetabolismeBase } from '../utils/calculations';
import { generateProgramSessions } from '../utils/programGenerator';

const STEPS = 8;

export default function Onboarding() {
  const { user, updateProfile, refreshProfile, refreshProgram } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    prenom: '', nom: '', sexe: 'homme', age: 25, taille_cm: 175, poids_kg: 70,
    morphotype: '', objectif: '', niveau: 'debutant', jours_semaine: [1, 3, 5],
    duree_seance: 60, mode_entrainement: 'salle', pathologies: [], points_faibles: [],
    use_whey: true, use_creatine: false
  });

  const updateForm = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));

  const imc = calculateIMC(formData.poids_kg, formData.taille_cm);
  const imcCat = getIMCCategory(imc);

  async function handleComplete() {
    setLoading(true);
    try {
      console.log('[Onboarding] Démarrage...');
      const metabolisme_base = calculateMetabolismeBase(formData.poids_kg, formData.taille_cm, formData.age, formData.sexe);

      // ── Étape 1 : Mise à jour du profil ──
      console.log('[Onboarding] 1/5 Mise à jour profil...');
      await updateProfile({
        prenom: formData.prenom, nom: formData.nom, sexe: formData.sexe, age: formData.age,
        taille_cm: formData.taille_cm, poids_kg: formData.poids_kg, morphotype: formData.morphotype,
        objectif: formData.objectif, niveau: formData.niveau, jours_semaine: formData.jours_semaine,
        duree_seance: formData.duree_seance, mode_entrainement: formData.mode_entrainement, points_faibles: formData.points_faibles,
        metabolisme_base, use_whey: formData.use_whey, use_creatine: formData.use_creatine
      });
      console.log('[Onboarding] ✓ Profil OK');

      // ── Étape 2 : Pathologies & Conditions ──
      console.log('[Onboarding] 2/5 Santé...');
      if (formData.pathologies.length > 0) {
        const paths = formData.pathologies.map(p => ({ user_id: user.id, zone: p }));
        const { error: errPatho } = await supabase.from('user_pathologies').insert(paths);
        if (errPatho) throw errPatho;
      }

      // ── Étape 3 : Création du programme ──
      console.log('[Onboarding] 3/5 Programme...');
      const { data: allEx, error: errEx } = await supabase.from('exercises').select('*');
      if (errEx || !allEx || allEx.length === 0) throw new Error('Impossible de charger les exercices');

      const { sessionsData, sessionExercisesData, programType } = generateProgramSessions(formData, allEx);

      const { data: prog, error: errProg } = await supabase.from('programs').insert({
        user_id: user.id, nom: `Programme ${formData.objectif.replace('_', ' ')}`, type_split: programType
      }).select().single();

      if (errProg) throw errProg;

      console.log('[Onboarding] ✓ Programme créé:', prog.id);

      // ── Étape 4 : Séances ──
      console.log('[Onboarding] 4/5 Séances...');
      const sessionsToInsert = sessionsData.map(s => ({ ...s, program_id: prog.id }));
      
      const { data: insertedSessions, error: errSess } = await supabase
        .from('sessions').insert(sessionsToInsert).select();

      if (errSess) throw errSess;

      console.log('[Onboarding] ✓ Séances OK:', insertedSessions?.length);

      // ── Étape 5 : Exercices → Séances ──
      console.log('[Onboarding] 5/5 Exercices...');
      if (insertedSessions?.length > 0) {
        const sExs = [];
        insertedSessions.forEach((s) => {
          const originalIndex = sessionsData.findIndex(sd => sd.jour_semaine === s.jour_semaine);
          if (originalIndex !== -1 && sessionExercisesData[originalIndex]) {
            sessionExercisesData[originalIndex].forEach(ex => {
              sExs.push({
                session_id: s.id,
                ...ex
              });
            });
          }
        });
        const { error: errSExs } = await supabase
          .from('session_exercises').insert(sExs);
        if (errSExs) throw errSExs;
      }

      // ── Étape 6 : Validation finale ──
      console.log('[Onboarding] 6/6 Validation finale...');
      const { error: errFinal } = await supabase.from('profiles')
        .update({ onboarding_complete: true })
        .eq('user_id', user.id);
      if (errFinal) throw errFinal;

      // ── Finalisation ──
      console.log('[Onboarding] Rafraîchissement profil...');
      await refreshProfile();
      console.log('[Onboarding] ✓ Terminé ! Redirection...');
      navigate('/');
    } catch (err) {
      console.error('[Onboarding] ERREUR FATALE:', err);
      alert(`Erreur lors de la création du programme : ${err.message || 'Erreur inconnue'}`);
      setStep(1); // Return to first step to retry
    } finally {
      setLoading(false);
    }
  }

  const nextStep = () => { if (step < STEPS) setStep(s => s + 1); else handleComplete(); };
  const prevStep = () => { if (step > 1) setStep(s => s - 1); };

  const renderStep = () => {
    switch (step) {
      case 1: return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="headline-md mb-2">Commençons par les bases</h2>
          <p className="body-md text-muted mb-6">Ces informations nous permettent de calibrer ton métabolisme.</p>
          
          <div className="flex gap-4 mb-4">
            <div className="input-group flex-1">
              <label className="input-label">Prénom</label>
              <input className="input" value={formData.prenom} onChange={e=>updateForm('prenom', e.target.value)} placeholder="Prénom" />
            </div>
            <div className="input-group flex-1">
              <label className="input-label">Âge</label>
              <input className="input" type="number" value={formData.age} onChange={e=>updateForm('age', Number(e.target.value))} />
            </div>
          </div>
          
          <div className="flex gap-4 mb-4">
            <button className={`btn flex-1 ${formData.sexe === 'homme' ? 'btn--primary' : 'btn--secondary'}`} onClick={()=>updateForm('sexe', 'homme')}>Homme</button>
            <button className={`btn flex-1 ${formData.sexe === 'femme' ? 'btn--primary' : 'btn--secondary'}`} onClick={()=>updateForm('sexe', 'femme')}>Femme</button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="input-group flex-1">
              <label className="input-label">Taille (cm)</label>
              <input className="input" type="number" value={formData.taille_cm} onChange={e=>updateForm('taille_cm', Number(e.target.value))} />
            </div>
            <div className="input-group flex-1">
              <label className="input-label">Poids (kg)</label>
              <input className="input" type="number" step="0.1" value={formData.poids_kg} onChange={e=>updateForm('poids_kg', Number(e.target.value))} />
            </div>
          </div>

          {imc && (
            <div className="card card--recessed flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className={imcCat.alert ? 'text-error' : 'text-primary'} />
                <div><p className="label-sm text-muted">IMC Actuel</p><p className="title-md">{imc}</p></div>
              </div>
              <span className={`chip ${imcCat.alert ? 'chip--secondary text-error' : 'chip--primary'}`}>{imcCat.label}</span>
            </div>
          )}
        </motion.div>
      );
      case 2: return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="headline-md mb-2">Ton Morphotype</h2>
          <p className="body-md text-muted mb-6">Choisis la silhouette qui te correspond le plus naturellement.</p>
          
          <div className="flex flex-col gap-4">
            {[
              { id: 'ectomorphe', title: 'Ectomorphe', desc: 'Ossature fine, métabolisme rapide, difficulté à prendre du poids.' },
              { id: 'mesomorphe', title: 'Mésomorphe', desc: 'Carrure athlétique naturelle, gagne et perd du poids facilement.' },
              { id: 'endomorphe', title: 'Endomorphe', desc: 'Ossature large, stocke facilement, difficulté à perdre du poids.' }
            ].map(m => (
              <div key={m.id} className={`card card--interactive ${formData.morphotype === m.id ? 'card--selected' : ''}`} onClick={() => updateForm('morphotype', m.id)}>
                <h3 className="title-md text-primary mb-1">{m.title}</h3>
                <p className="body-sm text-muted">{m.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      );
      case 3: return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="headline-md mb-2">Objectif & Niveau</h2>
          
          <p className="section-label mt-4">Objectif principal</p>
          <div className="flex flex-col gap-3 mb-6">
            {[
              { id: 'perte_poids', title: '🔥 Perte de poids' },
              { id: 'prise_masse', title: '💪 Prise de masse' },
              { id: 'tonification', title: '✨ Tonification' },
              { id: 'endurance', title: '🏃 Endurance' },
              { id: 'street_workout', title: '🤸 Street Workout (Figures)' }
            ].map(o => (
              <div key={o.id} className={`card card--interactive ${formData.objectif === o.id ? 'card--selected' : ''}`} style={{ padding: 'var(--space-4)' }} onClick={() => updateForm('objectif', o.id)}>
                <h3 className="title-md">{o.title}</h3>
              </div>
            ))}
          </div>

          <p className="section-label">Niveau actuel</p>
          <div className="flex gap-3">
            {['debutant', 'intermediaire', 'avance'].map(n => (
              <button key={n} className={`btn flex-1 btn--sm ${formData.niveau === n ? 'btn--primary' : 'btn--secondary'}`} style={{ textTransform: 'capitalize' }} onClick={() => updateForm('niveau', n)}>{n}</button>
            ))}
          </div>
        </motion.div>
      );
      case 4: return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="headline-md mb-2">Santé & Blessures</h2>
          <p className="body-md text-muted mb-6">Sélectionne les zones où tu ressens des douleurs régulières pour que nous adaptions le programme.</p>
          
          <div className="flex flex-wrap gap-3">
            {['dos', 'genoux', 'epaules', 'poignets_coudes', 'hanches'].map(zone => {
              const selected = formData.pathologies.includes(zone);
              return (
                <button key={zone} className={`chip ${selected ? 'chip--secondary' : ''}`} style={{ padding: 'var(--space-3) var(--space-4)', fontSize: '1rem' }}
                  onClick={() => {
                    if (selected) updateForm('pathologies', formData.pathologies.filter(p => p !== zone));
                    else updateForm('pathologies', [...formData.pathologies, zone]);
                  }}>
                  {selected && <AlertTriangle size={16} className="text-secondary" />} {zone.replace('_', ' ')}
                </button>
              );
            })}
          </div>
        </motion.div>
      );
      case 5: return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="headline-md mb-2">Disponibilités & Lieu</h2>
          
          <p className="section-label mt-4">Jours d'entraînement</p>
          <div className="flex gap-2 mb-6">
            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((j, i) => {
              const selected = formData.jours_semaine.includes(i);
              return (
                <button key={i} className={`btn flex-1 ${selected ? 'btn--primary' : 'btn--secondary'}`} style={{ padding: 'var(--space-3) 0' }}
                  onClick={() => {
                    if (selected) updateForm('jours_semaine', formData.jours_semaine.filter(d => d !== i));
                    else updateForm('jours_semaine', [...formData.jours_semaine, i].sort());
                  }}>
                  {j}
                </button>
              );
            })}
          </div>

          <p className="section-label">Lieu d'entraînement</p>
          <div className="flex flex-col gap-3">
            {[
              { id: 'salle', title: 'Salle de sport', desc: 'Accès complet aux machines et poids libres' },
              { id: 'street_workout', title: 'Street Workout / Maison', desc: 'Poids du corps, barres de traction, espace réduit' },
              { id: 'mixte', title: 'Mixte', desc: 'Alternance entre salle et extérieur' }
            ].map(m => (
              <div key={m.id} className={`card card--interactive ${formData.mode_entrainement === m.id ? 'card--selected' : ''}`} onClick={() => updateForm('mode_entrainement', m.id)}>
                <h3 className="title-md text-primary mb-1">{m.title}</h3>
                <p className="body-sm text-muted">{m.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      );
      case 6: return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="headline-md mb-2">Points Faibles</h2>
          <p className="body-md text-muted mb-6">Quels groupes musculaires souhaites-tu améliorer en priorité ? Le programme mettra plus l'accent sur ces zones.</p>
          
          <div className="flex flex-wrap gap-3">
            {['Pectoraux', 'Dos', 'Epaules', 'Bras', 'Jambes', 'Abdos', 'Mollets'].map(muscle => {
              const selected = formData.points_faibles.includes(muscle);
              return (
                <button key={muscle} className={`chip ${selected ? 'chip--primary' : ''}`} style={{ padding: 'var(--space-3) var(--space-4)', fontSize: '1rem' }}
                  onClick={() => {
                    if (selected) updateForm('points_faibles', formData.points_faibles.filter(m => m !== muscle));
                    else if (formData.points_faibles.length < 3) updateForm('points_faibles', [...formData.points_faibles, muscle]);
                  }}>
                  {muscle} {selected && <Check size={16} />}
                </button>
              );
            })}
          </div>
          <p className="body-sm text-muted mt-4">Sélectionne jusqu'à 3 points faibles.</p>
        </motion.div>
      );
      case 7: return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <h2 className="headline-md mb-2">Nutrition & Suppléments</h2>
          <p className="body-md text-muted mb-6">Afin d'adapter tes recommandations de repas, utilises-tu ces compléments ?</p>
          
          <div className="flex flex-col gap-4">
            <div className={`card card--interactive ${formData.use_whey ? 'card--selected' : ''}`} onClick={() => updateForm('use_whey', !formData.use_whey)}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="title-md text-primary mb-1">Protéine en poudre (Whey)</h3>
                  <p className="body-sm text-muted">Facilite l'atteinte du quota protéique</p>
                </div>
                {formData.use_whey ? <Check className="text-primary" /> : <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--outline)' }} />}
              </div>
            </div>

            <div className={`card card--interactive ${formData.use_creatine ? 'card--selected' : ''}`} onClick={() => updateForm('use_creatine', !formData.use_creatine)}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="title-md text-primary mb-1">Créatine</h3>
                  <p className="body-sm text-muted">Améliore la force et la récupération</p>
                </div>
                {formData.use_creatine ? <Check className="text-primary" /> : <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid var(--outline)' }} />}
              </div>
            </div>
          </div>
        </motion.div>
      );
      case 8: return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center">
          <div className="orb orb--primary" style={{ width: 300, height: 300, top: '10%', left: '50%', transform: 'translateX(-50%)' }} />
          
          <Target size={64} className="text-primary mx-auto mb-6" />
          <h2 className="display-sm mb-4">Profil configuré !</h2>
          <p className="body-md text-muted mb-8">Ton moteur d'entraînement et ton plan nutritionnel sont prêts. Nous avons tout calibré selon ton profil {formData.morphotype}.</p>
          
          <div className="card card--glow-primary mb-6 text-left">
            <h3 className="title-md mb-2">Récapitulatif</h3>
            <ul className="body-sm text-muted" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <li>• Objectif : <span className="text-on-surface">{formData.objectif.replace('_', ' ')}</span></li>
              <li>• Entraînements : <span className="text-on-surface">{formData.jours_semaine.length}x / semaine</span></li>
              <li>• Nutrition : <span className="text-on-surface">{formData.use_whey ? 'Avec Whey' : 'Aliments complets'} {formData.use_creatine ? '+ Créatine' : ''}</span></li>
              {formData.points_faibles.length > 0 && <li>• Focus : <span className="text-primary">{formData.points_faibles.join(', ')}</span></li>}
              {formData.pathologies.length > 0 && <li>• Adaptations : <span className="text-secondary">{formData.pathologies.join(', ')}</span></li>}
            </ul>
          </div>
        </motion.div>
      );
    }
  };

  const isNextDisabled = () => {
    if (step === 1) return !formData.prenom || !formData.age || !formData.taille_cm || !formData.poids_kg;
    if (step === 2) return !formData.morphotype;
    if (step === 3) return !formData.objectif;
    if (step === 5) return formData.jours_semaine.length === 0;
    return false;
  };

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Progress */}
      <div className="progress-bar mb-8 mt-4">
        <div className="progress-bar__fill" style={{ width: `${(step / STEPS) * 100}%`, transition: 'width 0.4s var(--ease-kinetic)' }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* Footer Nav */}
      <div className="flex gap-4 mt-8" style={{ paddingBottom: 'var(--space-4)' }}>
        {step > 1 && (
          <button className="btn btn--secondary" onClick={prevStep} style={{ padding: 'var(--space-4)' }}>
            <ArrowLeft size={20} />
          </button>
        )}
        <button className="btn btn--primary flex-1" onClick={nextStep} disabled={isNextDisabled() || loading}>
          {loading ? 'Création...' : step === STEPS ? 'Découvrir mon programme' : 'Continuer'} 
          {!loading && step < STEPS && <ArrowRight size={20} />}
        </button>
      </div>
    </div>
  );
}
