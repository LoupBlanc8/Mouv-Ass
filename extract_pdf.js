import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const dataBuffer = fs.readFileSync('D:/Projets Antigravity/Application sport/documentation_seche_complete.pdf');

console.log('PDF Object Type:', typeof pdf);

if (typeof pdf === 'function') {
    pdf(dataBuffer).then(function(data) {
        fs.writeFileSync('D:/Projets Antigravity/Application sport/extracted_seche.txt', data.text);
        console.log('Extraction complete!');
    }).catch(err => {
        console.error(err);
    });
} else if (pdf && typeof pdf.default === 'function') {
    pdf.default(dataBuffer).then(function(data) {
        fs.writeFileSync('D:/Projets Antigravity/Application sport/extracted_seche.txt', data.text);
        console.log('Extraction complete!');
    }).catch(err => {
        console.error(err);
    });
} else {
    console.log('PDF-parse is not a function and has no default function');
    console.log('Keys:', Object.keys(pdf));
}
