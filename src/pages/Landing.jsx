import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, UtensilsCrossed, BarChart3, GraduationCap, Flame, Trophy, ArrowRight, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: Dumbbell, title: 'Programmes Personnalisés', desc: 'Adapté à ton morphotype, ton niveau et tes objectifs.', color: '#00E5FF' },
  { icon: UtensilsCrossed, title: 'Nutrition Adaptée', desc: 'Plans repas avec options halal et rotation automatique.', color: '#FF6B00' },
  { icon: BarChart3, title: 'Suivi de Progression', desc: 'Charges, volume, kcal brûlées — tout est tracké.', color: '#7C4DFF' },
  { icon: GraduationCap, title: 'Académie & Apprentissage', desc: 'Paliers de force, vidéos et progression infinie.', color: '#00E676' },
  { icon: Flame, title: 'Streaks & Défis', desc: 'Quêtes journalières, XP et système de niveaux.', color: '#FF4081' },
  { icon: Trophy, title: 'Classement & Social', desc: 'Mesure-toi à la communauté et grimpe les rangs.', color: '#FFD740' },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', color: '#fff', overflow: 'hidden' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 5%', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
          MOUV'<span style={{ background: 'linear-gradient(135deg, #00E5FF, #7C4DFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>BODY</span>
        </h2>
        <button onClick={() => navigate('/login')} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff', padding: '10px 24px', borderRadius: 999, fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
        }}>Connexion</button>
      </nav>

      {/* Hero */}
      <motion.section variants={stagger} initial="hidden" animate="show"
        style={{ textAlign: 'center', padding: '80px 5% 60px', maxWidth: 900, margin: '0 auto', position: 'relative' }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '10%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 250, height: 250, background: 'radial-gradient(circle, rgba(124,77,255,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }} />

        <motion.div variants={fadeUp} style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: 999, padding: '6px 16px', marginBottom: 24 }}>
            <Sparkles size={14} color="#00E5FF" />
            <span style={{ fontSize: '0.8rem', color: '#00E5FF', fontWeight: 600 }}>100% GRATUIT</span>
          </div>
        </motion.div>

        <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-0.03em' }}>
          Ton Coach Sportif{' '}
          <span style={{ background: 'linear-gradient(135deg, #00E5FF, #7C4DFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Intelligent</span>
        </motion.h1>

        <motion.p variants={fadeUp} style={{ fontSize: '1.15rem', color: 'rgba(255,255,255,0.6)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
          Programme personnalisé, nutrition adaptée, progression automatique. Mouv'Body s'adapte à ton corps et tes objectifs.
        </motion.p>

        <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'linear-gradient(135deg, #00E5FF, #7C4DFF)', color: '#fff', border: 'none',
            padding: '16px 36px', borderRadius: 999, fontWeight: 700, fontSize: '1rem', cursor: 'pointer',
            boxShadow: '0 0 40px rgba(0,229,255,0.25)', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            Commencer gratuitement <ArrowRight size={18} />
          </button>
          <a href="#features" style={{
            background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
            padding: '16px 36px', borderRadius: 999, fontWeight: 600, fontSize: '1rem', cursor: 'pointer', textDecoration: 'none',
          }}>En savoir plus</a>
        </motion.div>
      </motion.section>

      {/* Stats Bar */}
      <section style={{ background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '30px 5%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 60, flexWrap: 'wrap', maxWidth: 800, margin: '0 auto' }}>
          {[['50+', 'Exercices'], ['7', 'Programmes'], ['100%', 'Gratuit']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, background: 'linear-gradient(135deg, #00E5FF, #7C4DFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{val}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 5%', maxWidth: 1100, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: 12 }}>Tout ce qu'il te faut</h2>
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', marginBottom: 48, fontSize: '1.05rem' }}>
            Une app complète pour ta transformation physique.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 16, padding: 28, transition: 'all 0.3s',
              }}
              onMouseOver={e => { e.currentTarget.style.borderColor = f.color + '40'; e.currentTarget.style.background = f.color + '08'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: f.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <f.icon size={24} color={f.color} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.5 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ textAlign: 'center', padding: '80px 5% 100px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 16 }}>
            Prêt à transformer{' '}
            <span style={{ background: 'linear-gradient(135deg, #FF6B00, #FF4081)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ton corps</span> ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 32, fontSize: '1.05rem' }}>Rejoins Mouv'Body et commence ton parcours.</p>
          <button onClick={() => navigate('/login')} style={{
            background: 'linear-gradient(135deg, #FF6B00, #FF4081)', color: '#fff', border: 'none',
            padding: '18px 48px', borderRadius: 999, fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer',
            boxShadow: '0 0 40px rgba(255,107,0,0.25)',
          }}>
            Créer mon compte <ArrowRight size={18} style={{ marginLeft: 8, verticalAlign: 'middle' }} />
          </button>
        </motion.div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 5%', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem' }}>
        © 2026 Mouv'Body — Tous droits réservés
      </footer>
    </div>
  );
}
