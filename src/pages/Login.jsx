import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) await signIn(email, password);
      else await signUp(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect.' : err.message);
    } finally { setLoading(false); }
  }

  const ease = [0.33, 1, 0.68, 1];

  return (
    <div className="page" style={{ display:'flex', flexDirection:'column', justifyContent:'center', minHeight:'100vh', position:'relative', overflow:'hidden', paddingBottom:'var(--space-8)' }}>
      <div className="orb orb--primary" style={{ width:320, height:320, top:-100, right:-120 }} />
      <div className="orb orb--secondary" style={{ width:260, height:260, bottom:60, left:-100 }} />

      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease }} style={{ textAlign:'center', marginBottom:'var(--space-12)' }}>
        <img src="/logo-mouvbody.png" alt="Mouv'Body" className="app-logo app-logo--hero" style={{ marginBottom: 'var(--space-4)' }} />
        <p className="body-md text-muted" style={{ marginTop:'var(--space-2)' }}>{isLogin ? 'Content de te revoir 💪' : 'Prêt à transformer ton corps ?'}</p>
      </motion.div>

      <motion.form onSubmit={handleSubmit} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.15, ease }}>
        <div className="input-group">
          <label className="input-label" htmlFor="login-email">Email</label>
          <div style={{ position:'relative' }}>
            <Mail size={18} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--outline)', pointerEvents:'none' }} />
            <input id="login-email" className="input" type="email" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft:44 }} required />
          </div>
        </div>
        <div className="input-group">
          <label className="input-label" htmlFor="login-pw">Mot de passe</label>
          <div style={{ position:'relative' }}>
            <Lock size={18} style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', color:'var(--outline)', pointerEvents:'none' }} />
            <input id="login-pw" className="input" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft:44, paddingRight:48 }} required minLength={6} />
            <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'var(--outline)', padding:4 }}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
              style={{ background:'rgba(159,5,25,0.25)', padding:'var(--space-3) var(--space-4)', marginBottom:'var(--space-4)', borderRadius:'var(--radius-lg)' }}>
              <span className="body-sm" style={{ color:'var(--error)' }}>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button type="submit" className="btn btn--primary btn--full btn--lg" disabled={loading} style={{ marginTop:'var(--space-2)' }}>
          {loading
            ? <div style={{ width:22, height:22, borderRadius:'50%', border:'2.5px solid var(--on-primary)', borderTopColor:'transparent', animation:'spin 0.7s linear infinite' }} />
            : <>{isLogin ? 'Se connecter' : "S'inscrire"}<ArrowRight size={18} /></>
          }
        </button>
      </motion.form>

      <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }} className="body-sm" style={{ textAlign:'center', marginTop:'var(--space-8)' }}>
        {isLogin ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
        <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
          style={{ background:'none', border:'none', color:'var(--primary)', cursor:'pointer', fontWeight:600, fontFamily:'var(--font-body)', fontSize:'inherit' }}>
          {isLogin ? "S'inscrire" : 'Se connecter'}
        </button>
      </motion.p>
    </div>
  );
}
