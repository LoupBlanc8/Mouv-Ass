-- ============================================
-- MOUV'BODY - Schéma Base de Données Supabase
-- ============================================

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILS UTILISATEURS
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nom TEXT,
  prenom TEXT,
  age INTEGER CHECK (age >= 14 AND age <= 99),
  sexe TEXT CHECK (sexe IN ('homme', 'femme')),
  taille_cm NUMERIC(5,1) CHECK (taille_cm >= 100 AND taille_cm <= 250),
  poids_kg NUMERIC(5,1) CHECK (poids_kg >= 30 AND poids_kg <= 300),
  imc NUMERIC(4,1),
  morphotype TEXT CHECK (morphotype IN ('ectomorphe', 'mesomorphe', 'endomorphe')),
  objectif TEXT CHECK (objectif IN ('perte_poids', 'prise_masse', 'tonification', 'endurance')),
  niveau TEXT CHECK (niveau IN ('debutant', 'intermediaire', 'avance')) DEFAULT 'debutant',
  jours_semaine INTEGER[] DEFAULT '{}',
  duree_seance INTEGER DEFAULT 60,
  mode_entrainement TEXT CHECK (mode_entrainement IN ('salle', 'street_workout', 'mixte')) DEFAULT 'salle',
  metabolisme_base NUMERIC(6,1),
  avatar_url TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PATHOLOGIES UTILISATEUR
-- ============================================
CREATE TABLE user_pathologies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  zone TEXT NOT NULL CHECK (zone IN ('dos', 'genoux', 'epaules', 'poignets_coudes', 'hanches')),
  description TEXT,
  severity TEXT CHECK (severity IN ('legere', 'moderee', 'severe')) DEFAULT 'legere',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_conditions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('diabete', 'hypertension', 'asthme', 'cardiaque', 'grossesse')),
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. CATALOGUE D'EXERCICES
-- ============================================
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  type TEXT CHECK (type IN ('force', 'hypertrophie', 'endurance', 'cardio', 'mobilite', 'plyometrie')),
  materiel TEXT[] DEFAULT '{}',
  muscles_principaux TEXT[] DEFAULT '{}',
  muscles_secondaires TEXT[] DEFAULT '{}',
  niveau_min TEXT CHECK (niveau_min IN ('debutant', 'intermediaire', 'avance')) DEFAULT 'debutant',
  pathologies_exclues TEXT[] DEFAULT '{}',
  pathologies_compatibles TEXT[] DEFAULT '{}',
  variantes_sw TEXT[] DEFAULT '{}',
  description_technique TEXT,
  conseils TEXT[],
  image_url TEXT,
  video_url TEXT,
  mode TEXT CHECK (mode IN ('salle', 'street_workout', 'les_deux')) DEFAULT 'salle',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. PROGRAMMES
-- ============================================
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nom TEXT NOT NULL,
  type_split TEXT CHECK (type_split IN ('full_body', 'upper_lower', 'push_pull_legs', 'ppl', 'bro_split')),
  semaines_cycle INTEGER DEFAULT 6,
  semaine_actuelle INTEGER DEFAULT 1,
  actif BOOLEAN DEFAULT TRUE,
  deload_semaine INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. SÉANCES (Template)
-- ============================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
  jour_semaine INTEGER CHECK (jour_semaine >= 0 AND jour_semaine <= 6),
  nom TEXT NOT NULL,
  type_session TEXT CHECK (type_session IN ('push', 'pull', 'legs', 'upper', 'lower', 'full_body', 'cardio', 'repos_actif', 'repos')),
  duree_estimee INTEGER DEFAULT 60,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. EXERCICES PAR SÉANCE
-- ============================================
CREATE TABLE session_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id TEXT REFERENCES exercises(id) NOT NULL,
  ordre INTEGER DEFAULT 0,
  series INTEGER DEFAULT 4,
  reps_min INTEGER DEFAULT 8,
  reps_max INTEGER DEFAULT 12,
  repos_secondes INTEGER DEFAULT 90,
  tempo TEXT DEFAULT '2-0-2-0',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. LOGS D'ENTRAÎNEMENT
-- ============================================
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id),
  exercise_id TEXT REFERENCES exercises(id) NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  serie INTEGER NOT NULL,
  poids_kg NUMERIC(5,1),
  reps INTEGER,
  rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10),
  tempo TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 8. PLANS NUTRITIONNELS
-- ============================================
CREATE TABLE nutrition_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type_jour TEXT CHECK (type_jour IN ('entrainement', 'repos')) NOT NULL,
  calories_total INTEGER NOT NULL,
  proteines_g INTEGER NOT NULL,
  glucides_g INTEGER NOT NULL,
  lipides_g INTEGER NOT NULL,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. REPAS
-- ============================================
CREATE TABLE meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES nutrition_plans(id) ON DELETE CASCADE NOT NULL,
  timing TEXT CHECK (timing IN ('petit_dejeuner', 'pre_workout', 'post_workout', 'dejeuner', 'collation', 'diner')),
  nom TEXT NOT NULL,
  aliments TEXT[] DEFAULT '{}',
  proteines_g INTEGER DEFAULT 0,
  glucides_g INTEGER DEFAULT 0,
  lipides_g INTEGER DEFAULT 0,
  calories INTEGER DEFAULT 0,
  ordre INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. SUIVI NUTRITION QUOTIDIEN
-- ============================================
CREATE TABLE nutrition_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_id UUID REFERENCES meals(id),
  date DATE DEFAULT CURRENT_DATE,
  consomme BOOLEAN DEFAULT FALSE,
  eau_ml INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 11. BADGES
-- ============================================
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  description TEXT,
  icone TEXT,
  categorie TEXT CHECK (categorie IN ('entrainement', 'nutrition', 'streak', 'force', 'street_workout', 'social')),
  critere_type TEXT,
  critere_valeur INTEGER,
  xp_reward INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT REFERENCES badges(id) NOT NULL,
  date_obtention TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ============================================
-- 12. SUIVI CORPOREL
-- ============================================
CREATE TABLE body_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  poids_kg NUMERIC(5,1),
  imc NUMERIC(4,1),
  tour_taille_cm NUMERIC(5,1),
  tour_hanches_cm NUMERIC(5,1),
  sommeil_heures NUMERIC(3,1),
  fatigue INTEGER CHECK (fatigue >= 1 AND fatigue <= 5),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. SUIVI HYDRATATION
-- ============================================
CREATE TABLE hydration_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  eau_ml INTEGER DEFAULT 0,
  objectif_ml INTEGER DEFAULT 2500,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ============================================
-- FONCTIONS
-- ============================================

-- Calcul automatique de l'IMC
CREATE OR REPLACE FUNCTION calculate_imc()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.taille_cm > 0 AND NEW.poids_kg > 0 THEN
    NEW.imc := ROUND((NEW.poids_kg / ((NEW.taille_cm / 100.0) * (NEW.taille_cm / 100.0)))::numeric, 1);
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_imc
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_imc();

-- Calcul du métabolisme de base (Harris-Benedict révisé)
CREATE OR REPLACE FUNCTION calculate_metabolisme()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.poids_kg > 0 AND NEW.taille_cm > 0 AND NEW.age > 0 THEN
    IF NEW.sexe = 'homme' THEN
      NEW.metabolisme_base := ROUND((88.362 + (13.397 * NEW.poids_kg) + (4.799 * NEW.taille_cm) - (5.677 * NEW.age))::numeric, 1);
    ELSE
      NEW.metabolisme_base := ROUND((447.593 + (9.247 * NEW.poids_kg) + (3.098 * NEW.taille_cm) - (4.330 * NEW.age))::numeric, 1);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_metabolisme
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION calculate_metabolisme();

-- Profil auto-créé à l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pathologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;

-- Policies : chaque utilisateur voit/modifie ses propres données
CREATE POLICY "Users see own profile" ON profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own pathologies" ON user_pathologies FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own conditions" ON user_conditions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own programs" ON programs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own sessions" ON sessions FOR ALL USING (
  program_id IN (SELECT id FROM programs WHERE user_id = auth.uid())
);
CREATE POLICY "Users see own session_exercises" ON session_exercises FOR ALL USING (
  session_id IN (SELECT s.id FROM sessions s JOIN programs p ON s.program_id = p.id WHERE p.user_id = auth.uid())
);
CREATE POLICY "Users manage own workout_logs" ON workout_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own nutrition_plans" ON nutrition_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users see own meals" ON meals FOR ALL USING (
  plan_id IN (SELECT id FROM nutrition_plans WHERE user_id = auth.uid())
);
CREATE POLICY "Users manage own nutrition_logs" ON nutrition_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own badges" ON user_badges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own body_tracking" ON body_tracking FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own hydration" ON hydration_logs FOR ALL USING (auth.uid() = user_id);

-- Exercices : lecture publique
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exercises are public" ON exercises FOR SELECT USING (true);

-- Badges : lecture publique
CREATE POLICY "Badges are public" ON badges FOR SELECT USING (true);

-- ============================================
-- SEED DATA : EXERCICES
-- ============================================
INSERT INTO exercises (id, nom, type, materiel, muscles_principaux, muscles_secondaires, niveau_min, pathologies_exclues, variantes_sw, description_technique, mode) VALUES
-- PUSH
('ex_dc_01', 'Développé Couché', 'force', '{"Barre", "Banc plat"}', '{"Pectoraux"}', '{"Triceps", "Deltoïdes antérieurs"}', 'debutant', '{"epaules"}', '{"Pompes classiques"}', 'Allongé sur banc plat, descendre la barre au niveau des pectoraux et pousser.', 'salle'),
('ex_di_01', 'Développé Incliné Haltères', 'hypertrophie', '{"Haltères", "Banc incliné"}', '{"Pectoraux supérieurs"}', '{"Triceps", "Deltoïdes antérieurs"}', 'intermediaire', '{"epaules"}', '{"Pompes déclinées"}', 'Sur banc incliné à 30-45°, développé avec haltères.', 'salle'),
('ex_de_01', 'Développé Épaules', 'force', '{"Haltères"}', '{"Deltoïdes"}', '{"Triceps", "Trapèzes"}', 'debutant', '{"epaules"}', '{"Pike Push-ups"}', 'Debout ou assis, pousser les haltères au-dessus de la tête.', 'salle'),
('ex_dips_01', 'Dips', 'force', '{"Barres parallèles"}', '{"Pectoraux", "Triceps"}', '{"Deltoïdes antérieurs"}', 'intermediaire', '{"epaules", "poignets_coudes"}', '{"Dips sur banc"}', 'Sur barres parallèles, descendre en fléchissant les coudes.', 'les_deux'),
('ex_el_01', 'Élévations Latérales', 'hypertrophie', '{"Haltères"}', '{"Deltoïdes latéraux"}', '{}', 'debutant', '{"epaules"}', '{}', 'Debout, lever les bras sur les côtés à hauteur des épaules.', 'salle'),
('ex_tp_01', 'Triceps Poulie', 'hypertrophie', '{"Poulie haute", "Corde"}', '{"Triceps"}', '{}', 'debutant', '{"poignets_coudes"}', '{"Pompes diamant"}', 'À la poulie haute, extension des triceps.', 'salle'),

-- PULL
('ex_rb_01', 'Rowing Barre', 'force', '{"Barre"}', '{"Dorsaux", "Rhomboïdes"}', '{"Biceps", "Trapèzes"}', 'intermediaire', '{"dos"}', '{"Rowing inversé (TRX)"}', 'Penché en avant, tirer la barre vers le nombril.', 'salle'),
('ex_tv_01', 'Tirage Vertical', 'hypertrophie', '{"Poulie haute"}', '{"Grand dorsal"}', '{"Biceps", "Rhomboïdes"}', 'debutant', '{}', '{"Tractions assistées"}', 'Assis à la poulie haute, tirer la barre vers la poitrine.', 'salle'),
('ex_rh_01', 'Rowing Haltère Unilatéral', 'hypertrophie', '{"Haltère", "Banc"}', '{"Dorsaux"}', '{"Biceps", "Rhomboïdes"}', 'debutant', '{}', '{}', 'Un genou et une main sur le banc, tirer l''haltère.', 'salle'),
('ex_fp_01', 'Face Pull', 'hypertrophie', '{"Poulie", "Corde"}', '{"Deltoïdes postérieurs", "Trapèzes"}', '{"Rhomboïdes"}', 'debutant', '{}', '{"Band Pull-Apart"}', 'À la poulie, tirer la corde vers le visage.', 'salle'),
('ex_cb_01', 'Curl Biceps', 'hypertrophie', '{"Haltères"}', '{"Biceps"}', '{"Avant-bras"}', 'debutant', '{"poignets_coudes"}', '{"Chin-ups"}', 'Debout, flexion des avant-bras avec haltères.', 'salle'),
('ex_trac_01', 'Tractions', 'force', '{"Barre de traction"}', '{"Grand dorsal", "Biceps"}', '{"Rhomboïdes", "Trapèzes"}', 'intermediaire', '{"epaules"}', '{"Tractions"}', 'Suspendu à la barre, se hisser jusqu''au menton.', 'les_deux'),

-- LEGS
('ex_sq_01', 'Squat Goblet', 'force', '{"Haltère", "Kettlebell"}', '{"Quadriceps", "Fessiers"}', '{"Ischio-jambiers", "Core"}', 'debutant', '{}', '{"Squat au poids du corps"}', 'Tenir l''haltère contre la poitrine, s''accroupir.', 'salle'),
('ex_sq_02', 'Squat Barre', 'force', '{"Barre", "Rack"}', '{"Quadriceps", "Fessiers"}', '{"Ischio-jambiers", "Lombaires"}', 'intermediaire', '{"dos", "genoux"}', '{"Squat bulgare PDC"}', 'Barre sur les trapèzes, s''accroupir jusqu''à parallèle.', 'salle'),
('ex_ht_01', 'Hip Thrust', 'force', '{"Barre", "Banc"}', '{"Fessiers"}', '{"Ischio-jambiers"}', 'debutant', '{}', '{"Glute Bridge PDC"}', 'Dos sur le banc, pousser les hanches vers le haut avec la barre.', 'salle'),
('ex_lp_01', 'Leg Press', 'force', '{"Machine Leg Press"}', '{"Quadriceps", "Fessiers"}', '{"Ischio-jambiers"}', 'debutant', '{}', '{"Squat au poids du corps"}', 'Sur la machine, pousser la plateforme avec les pieds.', 'salle'),
('ex_lc_01', 'Leg Curl', 'hypertrophie', '{"Machine Leg Curl"}', '{"Ischio-jambiers"}', '{}', 'debutant', '{}', '{"Nordic Curl"}', 'Allongé sur la machine, fléchir les jambes.', 'salle'),
('ex_mol_01', 'Mollets Debout', 'hypertrophie', '{"Machine", "Haltères"}', '{"Mollets"}', '{}', 'debutant', '{}', '{"Mollets sur marche PDC"}', 'Extension des chevilles en position debout.', 'salle'),

-- CORE & CARDIO
('ex_ga_01', 'Gainage Planche', 'endurance', '{}', '{"Core", "Transverse"}', '{"Épaules", "Fessiers"}', 'debutant', '{"dos"}', '{"Gainage Planche"}', 'Position de pompe sur les avant-bras, maintenir.', 'les_deux'),
('ex_cr_01', 'Crunch', 'hypertrophie', '{}', '{"Abdominaux"}', '{}', 'debutant', '{"dos"}', '{"Crunch PDC"}', 'Allongé, fléchir le tronc en contractant les abdos.', 'les_deux');

-- ============================================
-- SEED DATA : BADGES
-- ============================================
INSERT INTO badges (id, nom, description, icone, categorie, critere_type, critere_valeur, xp_reward) VALUES
('badge_first_session', 'Première séance', 'Compléter votre première séance d''entraînement', '🏋️', 'entrainement', 'sessions_completed', 1, 100),
('badge_10_sessions', '10 séances', 'Compléter 10 séances d''entraînement', '💪', 'entrainement', 'sessions_completed', 10, 250),
('badge_dc_bodyweight', 'DC au poids de corps', 'Développé couché à votre poids de corps', '🏆', 'force', 'dc_bodyweight', 1, 500),
('badge_streak_7', 'Streak 7 jours', '7 jours consécutifs d''entraînement', '🔥', 'streak', 'streak_days', 7, 300),
('badge_streak_30', 'Streak 30 jours', '30 jours consécutifs', '💎', 'streak', 'streak_days', 30, 1000),
('badge_nutrition_4w', '4 semaines nutrition', 'Suivre le plan nutrition pendant 4 semaines', '🥗', 'nutrition', 'nutrition_weeks', 4, 400),
('badge_first_pullup', 'Première traction', 'Réussir votre première traction stricte', '🦅', 'street_workout', 'first_pullup', 1, 500),
('badge_100_sets', '100 séries totales', 'Compléter 100 séries au total', '⚡', 'entrainement', 'total_sets', 100, 200),
('badge_1month', '1 mois d''entraînement', 'Être inscrit depuis 1 mois', '📅', 'entrainement', 'account_days', 30, 150),
('badge_objectif_hebdo', 'Objectif hebdo', 'Atteindre votre objectif de séances sur une semaine', '🎯', 'entrainement', 'weekly_goal', 1, 200);
