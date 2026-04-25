# Spécifications Techniques & Design : Mouv'Ass V2

## 1. Objectif du projet
Transformer l'application fitness Mouv'Ass d'un simple générateur de routines statiques en un écosystème dynamique incluant :
- Un Tracker d'entraînement en direct.
- L'Académie Street Workout (basée sur la documentation officielle PDF).
- De l'Analytique (suivi de la surcharge progressive).
- De la Gamification (Rangs et XP).

## 2. Architecture des bases de données (Supabase)
### Modifications à prévoir :
- **workout_logs** : Doit stocker le volume total de la séance, la durée exacte, l'xp gagnée.
- **exercise_logs** (Nouvelle table) : `id`, `user_id`, `workout_log_id`, `exercise_id`, `set_number`, `reps`, `weight`, `created_at`. Permet la traçabilité de chaque série.
- **profiles** : Ajout des colonnes `xp` (integer, default 0), `rank` (text, default 'Bronze'), `current_skill_focus` (text, nullable).

## 3. Le Tracker d'Entraînement Actif (`WorkoutTracker.jsx`)
- **UI** : Mode plein écran, navigation entre les exercices (Carousel ou défilement vertical).
- **Logique** : 
  - Affichage de l'exercice en cours, nombre de séries prévues, reps cibles.
  - Saisie input pour `Reps réalisées` et `Poids` (ou leste).
  - Bouton "Valider la série".
- **Chronomètre** :
  - Déclenchement automatique post-série.
  - Temps suggéré selon l'objectif (ex: 90s hypertrophie, 3min force).
  - Alerte visuelle (et sonore si l'API navigateur le permet).
- **Écran de fin** : Résumé de la séance, volume total soulevé, records battus, XP gagnée.

## 4. L'Académie Street Workout
- **Source de vérité** : `doc_street_workout_extract.txt`.
- **Refonte `workoutGenerator.js`** :
  - Intégrer les filtres stricts : IMC > 30 (pas de sauts, pompes au mur), Âge > 60 (réduire densité, focus mobilité).
  - Si l'utilisateur n'a pas de barre (défini dans l'onboarding/profil), substituer les tractions par des *Inverted Rows* ou autres alternatives.
- **Nouvelle Section UI "Académie"** :
  - L'utilisateur sélectionne un "Skill" à masteriser (Muscle-up, Front lever, Handstand, Planche).
  - L'app vérifie les prérequis via les perfs passées (ex: a-t-il validé 10 tractions dans `exercise_logs` ?).
  - Intégration automatique de 2 "Exercices de Progression" au début de chaque séance PUSH/PULL.

## 5. Analytique & Graphiques (`Analytics.jsx` ou dans `Dashboard.jsx`)
- Intégration de `recharts` ou d'une librairie légère pour tracer l'évolution.
- **Métrique 1** : Poids de corps au fil du temps (depuis `user_pathologies` ou `profiles`).
- **Métrique 2** : Volume Total Soulevé par semaine (Surcharge progressive). Calculé via `SUM(reps * weight)`.

## 6. Gamification
- **Règles d'XP** :
  - Séance terminée : +100 XP
  - Eau journalière atteinte : +20 XP
  - Macros respectés : +30 XP
  - Record personnel battu (1RM) : +50 XP
- **Grades / Ligues** :
  - 0 - 500 XP : Recrue
  - 500 - 2000 XP : Bronze
  - 2000 - 5000 XP : Argent
  - 5000 - 10000 XP : Or
  - 10000 - 20000 XP : Platine
  - 20000+ XP : Spartiate
- **Affichage** : Jauge d'XP en haut du Dashboard avec animation de montée en niveau.

## 7. Plan d'exécution (Phases)
1. **Phase 1** : Base de données (Création table `exercise_logs`, update `profiles`).
2. **Phase 2** : Le Tracker d'Entraînement Actif (UI et logique de log).
3. **Phase 3** : Gamification et Analytique (Dashboard XP + Graphiques).
4. **Phase 4** : Refonte du générateur pour intégrer l'Académie Street Workout de manière intelligente.
