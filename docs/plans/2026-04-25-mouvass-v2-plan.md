# Plan d'implémentation de Mouv'Body V2

> **Pour l'agent d'exécution :** Utilisez ce plan détaillé pour implémenter la tâche étape par étape. Mettez à jour les cases (`- [ ]` en `- [x]`) au fur et à mesure que les étapes sont complétées.

**Objectif :** Transformer Mouv'Body en une app dynamique en ajoutant le Tracker de Séance, la Gamification (XP/Rangs), l'Analytics et l'Académie Street Workout.

**Architecture :** 
L'application utilisera Supabase pour stocker les nouveaux logs d'exercices, le système d'XP et les rangs. Le Front-End s'appuiera sur React et Framer Motion pour les animations du tracker et du dashboard.

**Stack / Technologies clés :** React, Supabase, Framer Motion, recharts (optionnel, pour l'analytics).

---

### Tâche 1 : Base de Données & Schéma (Supabase)

**Fichiers impactés :**
- Modifier : Schéma Supabase via des requêtes SQL

- [x] **Étape 1 : Création de la table `exercise_logs`**
Exécuter une requête SQL pour créer une table `exercise_logs` (id, user_id, workout_log_id, exercise_nom, set_number, reps, weight, created_at). Lier `user_id` aux profiles.
- [x] **Étape 2 : Modification de la table `workout_logs`**
Ajouter la colonne `volume_total` (integer) et `duree_secondes` (integer) à `workout_logs`.
- [x] **Étape 3 : Modification de la table `profiles`**
Ajouter les colonnes `xp` (integer, default 0) et `rank` (text, default 'Bronze').

---

### Tâche 2 : Le Tracker d'Entraînement Actif

**Fichiers impactés :**
- Modifier : `src/pages/Workout.jsx` (ou créer `src/pages/WorkoutTracker.jsx`)
- Modifier : `src/App.jsx` (pour la nouvelle route)

- [x] **Étape 1 : Créer le composant `WorkoutTracker.jsx`**
Créer une interface de saisie avec le nom de l'exercice, un input pour `Poids` et `Reps`, et un bouton "Valider Série".
- [x] **Étape 2 : Implémenter le Chronomètre**
Ajouter un timer visuel (Countdown) de 90 secondes qui se déclenche quand on valide une série.
- [x] **Étape 3 : Sauvegarde dans Supabase**
À la fin du timer, passer à la série/exercice suivant. À la fin de la séance, insérer un `workout_logs` avec le volume total calculé et insérer toutes les séries dans `exercise_logs`.
- [x] **Étape 4 : Redirection post-entraînement**
Rediriger l'utilisateur vers le Dashboard avec un effet visuel (+ XP).

---

### Tâche 3 : Gamification (Rangs et XP)

**Fichiers impactés :**
- Créer : `src/utils/gamification.js`
- Modifier : `src/pages/Dashboard.jsx`

- [x] **Étape 1 : Logique d'XP**
Créer `gamification.js` avec la fonction `addXP(userId, amount)` qui met à jour le profil dans Supabase. Définir les seuils des ligues.
- [x] **Étape 2 : Affichage sur le Dashboard**
Ajouter une belle barre de progression (Jauge XP) en haut du Dashboard affichant le rang actuel (ex: "Argent") et les points manquants pour le rang suivant.
- [x] **Étape 3 : Intégration de l'XP dans les actions**
Appeler `addXP` quand un entraînement est validé, quand une case "nutrition" est cochée, etc.

---

### Tâche 4 : L'Académie Street Workout (Générateur intelligent)

**Fichiers impactés :**
- Créer : `src/data/streetWorkoutSkills.json` (ou dans le code)
- Modifier : `src/utils/workoutGenerator.js`
- Modifier : `src/pages/Programs.jsx` (ou une nouvelle page `Academy.jsx`)

- [x] **Étape 1 : Digitaliser les Skills**
Transformer la section "Skills" du PDF en un objet JSON avec prérequis (ex: Muscle-up demande 10 tractions).
- [x] **Étape 2 : Mettre à jour `workoutGenerator.js`**
Adapter la logique pour qu'elle exclue les exercices selon les paramètres (IMC > 30, pas de sauts, etc.) et l'équipement disponible, comme défini dans le PDF.
- [x] **Étape 3 : Afficher l'Académie**
Ajouter une section "Académie" où l'utilisateur peut cibler un Skill, et si validé, intégrer les progressions dans son `workoutGenerator`.

---

### Tâche 5 : Analytics & Surcharge Progressive

**Fichiers impactés :**
- Créer : `src/pages/Analytics.jsx`
- Modifier : `src/App.jsx` et menu de navigation.

- [ ] **Étape 1 : Créer la vue Graphique**
Installer `recharts` si besoin, ou utiliser un affichage minimal CSS. Afficher un graphique du poids corporel.
- [ ] **Étape 2 : Requête des logs d'exercices**
Récupérer tous les `workout_logs` et afficher un graphique (barres) montrant le "Volume total soulevé par séance" semaine après semaine.
- [ ] **Étape 3 : Lien depuis le Menu**
Ajouter l'onglet "Stats" ou "Analytique" dans la navbar principale.
