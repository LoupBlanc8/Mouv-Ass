import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { profile, exercises } = await req.json()
    // NOTE: This should ideally be an environment variable Deno.env.get('GEMINI_API_KEY')
    const apiKey = 'AIzaSyB1Wi1S8dTrppxhJqVNCPrrUoXvWBsjBXE'

    const objectifLabels: Record<string, string> = {
      perte_poids: 'Perte de poids (déficit -20%)',
      deficit_calorique: 'Déficit calorique contrôlé (-15%)',
      seche: 'Sèche / Définition musculaire (déficit -10%, cardio/HIIT recommandé)',
      prise_masse: 'Prise de masse (surplus +15%)',
      recomposition: 'Recomposition corporelle (déficit léger -5%, haute protéine)',
      tonification: 'Tonification (déficit léger -5%)',
      endurance: 'Endurance musculaire',
      street_workout: 'Street Workout / Calisthenics',
    }

    const niveauLabels: Record<string, string> = {
      debutant: 'Débutant (< 6 mois)',
      intermediaire: 'Intermédiaire (6 mois - 2 ans)',
      avance: 'Avancé (2+ ans)',
    }

    const bodyFatLabels: Record<string, string> = {
      moins_10: '< 10% (Très sec)',
      '10_15': '10-15% (Athlétique)',
      '15_20': '15-20% (Moyenne)',
      plus_20: '> 20% (Surpoids)'
    }

    const sleepLabels: Record<string, string> = {
      moins_6: '< 6 heures (Déficit de récupération)',
      '6_7': '6-7 heures (Moyen)',
      '7_9': '7-9 heures (Optimal)',
      plus_9: '> 9 heures'
    }

    const activityLabels: Record<string, string> = {
      sedentaire: 'Sédentaire (Bureau, peu de marche)',
      leger: 'Légèrement actif',
      actif: 'Actif',
      tres_actif: 'Très actif (Travail physique/Debout)'
    }

    const jourNoms = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']
    const joursStr = (profile.jours_semaine || []).map((j: number) => jourNoms[j]).join(', ')
    const nbJours = (profile.jours_semaine || []).length
    const exList = exercises.map((e: any) => `- ${e.nom} (ID: ${e.id}, muscles: ${(e.muscles_principaux || []).join(', ')}, niveau: ${e.niveau_min})`).join('\n')

    const prompt = `Tu es un expert scientifique de l'entraînement (comme Built With Science) certifié NSCA. Tu dois créer un programme d'entraînement HYPER-PERSONNALISÉ basé sur la littérature scientifique.

PROFIL ATHLÈTE :
- Sexe : ${profile.sexe || 'homme'}
- Âge : ${profile.age} ans
- Poids : ${profile.poids_kg} kg
- Taille : ${profile.taille_cm} cm
- Morphotype : ${profile.morphotype || 'mésomorphe'}
- Niveau : ${niveauLabels[profile.niveau] || profile.niveau}
- Objectif : ${objectifLabels[profile.objectif] || profile.objectif}
- Points faibles : ${(profile.points_faibles || []).join(', ') || 'Aucun'}
- Mode : ${profile.mode_entrainement || 'salle'}
- Jours disponibles : ${joursStr} (${nbJours} jours/semaine)
- Durée séance souhaitée : ${profile.duree_seance || 60} min

DONNÉES MODE DE VIE (Facteurs de récupération & dépense) :
- Estimation Masse Grasse : ${bodyFatLabels[profile.body_fat] || profile.body_fat}
- Sommeil Moyen : ${sleepLabels[profile.sleep_hours] || profile.sleep_hours}
- Activité Quotidienne (NEAT) : ${activityLabels[profile.activity_level] || profile.activity_level}
- Cardio actuel : ${profile.cardio_freq || 'occasionnel'}

EXERCICES DISPONIBLES EN BASE DE DONNÉES (utilise UNIQUEMENT ces exercices avec leurs IDs exacts) :
${exList}

RÈGLES SCIENTIFIQUES DE PROGRAMMATION (STRICT) :
1. SÉLECTION DU SPLIT (Optimisation de la fréquence par groupe musculaire) :
   - 2-3 jours → Full Body (Privilégier exercices polyarticulaires).
   - 4 jours → Upper/Lower.
1. OBJECTIF & NUTRITION (BWS Standards) :
   - Si "Perte de gras" : Déficit 300-500 kcal, Protéines 2.2-2.5g/kg, Volume modéré.
   - Si "Prise de masse" : Surplus 200-350 kcal, Protéines 1.8-2.2g/kg, Volume élevé.
   - Si "Recomposition" : Maintenance, Protéines 2.5g+/kg.
2. ADAPTATION PAR ÂGE (BWS Recovery) :
   - 36-45 ans : Réduire le volume de 10%, maintenir l'intensité (charges lourdes <= 6 reps).
   - 46-55 ans : Réduire le volume de 20%, augmenter les protéines (2.4-2.6g/kg).
   - 55+ ans : Focus sur exercices unilatéraux et santé fonctionnelle.
3. STRUCTURE DU SPLIT :
   - 2 jours : Full Body A/B.
   - 3 jours : Full Body 3x ou PPL.
   - 4 jours : Upper/Lower (2x Upper, 2x Lower).
   - 5 jours : PPL + Upper.
   - 6 jours : PPL x2.
4. DURÉE DE SÉANCE :
   - 30 min : 3-4 exercices composés, Supersets, repos < 60s.
   - 60 min : 5-7 exercices, repos 90-120s.
5. PERSONNALISATION :
   - Priorise les points faibles (${(profile.points_faibles || []).join(', ') || 'Aucun'}) en début de séance.
   - Évite les zones douloureuses : ${(profile.pathologies || []).join(', ') || 'Aucune'}.
6. INTÉGRITÉ :
   - Utilise UNIQUEMENT les exercise_id fournis. Aucun doublon par séance.

RÉPONDS UNIQUEMENT en JSON valide :
{
  "split_type": "string",
  "sessions": [
    {
      "jour": number,
      "nom": "string",
      "type_session": "push|pull|legs|upper|lower|full_body|cardio|musculation|bras|core",
      "exercices": [
        { "exercise_id": "uuid", "ordre": number, "series": number, "reps_min": number, "reps_max": number, "repos_secondes": number }
      ]
    }
  ]
}

IMPORTANT: type_session doit être EXACTEMENT une de ces valeurs: push, pull, legs, upper, lower, full_body, cardio, musculation, bras, core. Aucune autre valeur n'est acceptée.`

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    })

    const data = await res.json()
    if (data.error) throw new Error(data.error.message || "Erreur API Gemini")

    const text = data.candidates[0].content.parts[0].text
    const program = JSON.parse(text)

    return new Response(
      JSON.stringify(program),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
