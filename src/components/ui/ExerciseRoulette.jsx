import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice5, Play, X, Flame, Target } from 'lucide-react';
import { estimateKcalBurned } from '../../utils/loadCalculator';

const COLORS = [
  '#00E5FF', '#7C4DFF', '#FF6B00', '#00E676', '#FF4081', '#FFD740',
  '#00BCD4', '#9C27B0', '#FF5722', '#4CAF50', '#E91E63', '#FFC107',
];

export default function ExerciseRoulette({ exercises, profile, onStart, onClose }) {
  const [spinning, setSpinning] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const canvasRef = useRef(null);

  const filteredExercises = exercises?.slice(0, 12) || [];
  const segmentAngle = 360 / filteredExercises.length;

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || filteredExercises.length === 0) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);

    filteredExercises.forEach((ex, i) => {
      const startAngle = (i * segmentAngle - 90) * (Math.PI / 180);
      const endAngle = ((i + 1) * segmentAngle - 90) * (Math.PI / 180);

      // Segment
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Border
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate((startAngle + endAngle) / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px "Space Grotesk", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      const name = ex.nom.length > 14 ? ex.nom.substring(0, 12) + '...' : ex.nom;
      ctx.fillText(name, radius - 16, 4);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(center, center, 28, 0, 2 * Math.PI);
    ctx.fillStyle = '#0e0e0e';
    ctx.fill();
    ctx.strokeStyle = '#00E5FF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#00E5FF';
    ctx.font = 'bold 14px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎲', center, center + 5);
  }, [filteredExercises, segmentAngle]);

  function spin() {
    if (spinning || filteredExercises.length === 0) return;
    setSpinning(true);
    setShowResult(false);
    setSelectedExercise(null);

    // Random result
    const randomIdx = Math.floor(Math.random() * filteredExercises.length);
    const targetAngle = 360 - (randomIdx * segmentAngle + segmentAngle / 2);
    
    // Calcul de la rotation absolue correcte
    const currentSpins = Math.floor(rotation / 360);
    const totalRotation = (currentSpins + 5) * 360 + targetAngle; // 5 tours complets + angle cible

    setRotation(totalRotation);

    setTimeout(() => {
      setSelectedExercise(filteredExercises[randomIdx]);
      setSpinning(false);
      setShowResult(true);
    }, 3500);
  }

  const kcal = selectedExercise
    ? estimateKcalBurned(profile?.poids_kg || 70, 10, selectedExercise.type, profile?.niveau)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)',
        zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: 'var(--space-6)',
      }}
    >
      <button onClick={onClose} style={{
        position: 'absolute', top: 16, right: 16, background: 'var(--surface-container-high)',
        border: 'none', color: 'var(--on-surface)', width: 40, height: 40, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        <X size={20} />
      </button>

      <h2 className="display-sm" style={{
        textAlign: 'center', marginBottom: 'var(--space-6)', textTransform: 'uppercase',
        background: 'linear-gradient(135deg, #00E5FF, #7C4DFF)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Exercice Surprise 🎲
      </h2>

      {/* Wheel */}
      <div style={{ position: 'relative', marginBottom: 'var(--space-8)' }}>
        {/* Pointer */}
        <div style={{
          position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
          width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent',
          borderTop: '20px solid #00E5FF', zIndex: 10, filter: 'drop-shadow(0 0 6px #00E5FF)',
        }} />
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 3.5, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ width: 280, height: 280 }}
        >
          <canvas ref={canvasRef} width={280} height={280} style={{ width: 280, height: 280 }} />
        </motion.div>
      </div>

      {/* Spin Button */}
      {!showResult && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={spin}
          disabled={spinning}
          style={{
            background: spinning
              ? 'var(--surface-container-high)'
              : 'linear-gradient(135deg, #00E5FF, #7C4DFF)',
            color: spinning ? 'var(--on-surface-variant)' : '#fff',
            border: 'none', padding: '16px 48px', borderRadius: '999px',
            fontSize: '1.1rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', cursor: spinning ? 'not-allowed' : 'pointer',
            boxShadow: spinning ? 'none' : '0 0 30px rgba(0,229,255,0.3)',
          }}
        >
          <Dice5 size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          {spinning ? 'En cours...' : 'LANCER !'}
        </motion.button>
      )}

      {/* Result Card */}
      <AnimatePresence>
        {showResult && selectedExercise && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30 }}
            style={{
              width: '100%', maxWidth: 360, background: 'var(--surface-container)',
              borderRadius: 'var(--radius-xl)', padding: 'var(--space-6)',
              border: '1px solid rgba(0,229,255,0.2)',
              boxShadow: '0 8px 32px rgba(0,229,255,0.15)',
            }}
          >
            <h3 className="title-lg" style={{
              textTransform: 'uppercase', color: 'var(--primary)',
              marginBottom: 'var(--space-2)',
            }}>
              {selectedExercise.nom}
            </h3>
            <p className="body-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: 'var(--space-4)' }}>
              {selectedExercise.description_technique || 'Exercice sélectionné par la roulette !'}
            </p>

            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
              <div style={{
                flex: 1, background: 'var(--surface-container-high)',
                padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', textAlign: 'center',
              }}>
                <Target size={16} style={{ color: 'var(--primary)', marginBottom: 4 }} />
                <div className="title-md" style={{ color: 'var(--on-surface)' }}>3 × 12</div>
                <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>REPS</span>
              </div>
              <div style={{
                flex: 1, background: 'var(--surface-container-high)',
                padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', textAlign: 'center',
              }}>
                <Flame size={16} style={{ color: '#FF6B00', marginBottom: 4 }} />
                <div className="title-md" style={{ color: 'var(--on-surface)' }}>~{kcal}</div>
                <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>KCAL</span>
              </div>
            </div>

            {/* Muscle tags */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
              {(selectedExercise.muscles_principaux || []).map(m => (
                <span key={m} style={{
                  background: 'rgba(0,229,255,0.1)', color: '#00E5FF',
                  padding: '4px 10px', borderRadius: '999px', fontSize: '0.7rem',
                  fontWeight: 600, textTransform: 'uppercase',
                }}>
                  {m}
                </span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <button onClick={spin} style={{
                flex: 1, background: 'var(--surface-container-high)', border: 'none',
                color: 'var(--on-surface)', padding: '14px', borderRadius: 'var(--radius-xl)',
                fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.85rem',
              }}>
                Relancer
              </button>
              <button onClick={() => onStart && onStart(selectedExercise)} style={{
                flex: 2, background: 'linear-gradient(135deg, #00E5FF, #7C4DFF)', border: 'none',
                color: '#fff', padding: '14px', borderRadius: 'var(--radius-xl)',
                fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', fontSize: '0.85rem',
                boxShadow: '0 4px 16px rgba(0,229,255,0.3)',
              }}>
                <Play size={16} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Commencer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
