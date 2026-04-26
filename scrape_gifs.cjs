const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const EXERCISES = [
  "Développé Couché", "Développé Épaules", "Élévations Latérales", "Triceps Poulie", 
  "Rowing Barre", "Tirage Vertical", "Rowing Haltère Unilatéral", "Face Pull", 
  "Curl Biceps", "Squat Goblet", "Squat Barre", "Hip Thrust", "Leg Press", 
  "Leg Curl", "Mollets Debout", "Gainage Planche", "Crunch", "Développé Couché Haltères", 
  "Écarté Haltères", "Cross-Over Câble", "Tirage Horizontal", "Soulevé de Terre", 
  "Soulevé de Terre Roumain", "Pullover Haltère", "Élévations Frontales", "Shrugs", 
  "Oiseau", "Développé Arnold", "Curl Incliné", "Curl Marteau", "Barre au Front", 
  "Kickback Triceps", "Dips Banc", "Fentes Marchées", "Leg Extension", 
  "Soulevé de Terre Sumo", "Squat Bulgare", "Relevé de Jambes", "Russian Twist", 
  "Ab Wheel Rollout", "Crunch Poulie", "Mollets Assis", "Pompes Diamant", 
  "Pike Push-Up", "Pistol Squat", "Muscle-Up"
];

function normalize(str) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

async function scrape() {
  console.log("Fetching main page...");
  const mainRes = await axios.get('https://www.docteur-fitness.com/exercice-musculation');
  const $ = cheerio.load(mainRes.data);
  
  const links = [];
  $('a').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href && href.includes('docteur-fitness.com') && text.length > 2) {
      links.push({ text: normalize(text), href });
    }
  });

  const destDir = path.join(__dirname, 'public', 'exercises');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  for (const ex of EXERCISES) {
    const exNorm = normalize(ex);
    
    // Find best link match
    let match = links.find(l => l.text === exNorm || l.text.includes(exNorm) || exNorm.includes(l.text));
    
    // some manual overrides if needed
    if (ex === "Curl Biceps") match = links.find(l => l.href.includes('curl-biceps'));
    if (ex === "Tirage Vertical") match = links.find(l => l.href.includes('tirage-poitrine'));
    if (ex === "Face Pull") match = links.find(l => l.href.includes('face-pull'));
    if (ex === "Fentes Marchées") match = links.find(l => l.href.includes('fentes'));
    if (ex === "Triceps Poulie") match = links.find(l => l.href.includes('extension-triceps-poulie'));

    if (match) {
      console.log(`Found link for ${ex}: ${match.href}`);
      try {
        const pageRes = await axios.get(match.href);
        const $page = cheerio.load(pageRes.data);
        
        let gifUrl = null;
        $page('img').each((i, img) => {
          const src = $(img).attr('src') || $(img).attr('data-src');
          if (src && src.endsWith('.gif')) {
            gifUrl = src;
          }
        });

        if (gifUrl) {
          const filename = exNorm + '.gif';
          const destPath = path.join(destDir, filename);
          if (!fs.existsSync(destPath)) {
            const writer = fs.createWriteStream(destPath);
            const imgRes = await axios.get(gifUrl, { responseType: 'stream' });
            imgRes.data.pipe(writer);
            await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            });
            console.log(`✅ Downloaded: ${filename}`);
          } else {
            console.log(`⏭️ Already exists: ${filename}`);
          }
        } else {
          console.log(`❌ No GIF found on page for ${ex}`);
        }
      } catch (err) {
        console.log(`❌ Error fetching page for ${ex}: ${err.message}`);
      }
    } else {
      console.log(`❌ No link found for ${ex}`);
    }
  }
}

scrape().then(() => console.log('Done!'));
