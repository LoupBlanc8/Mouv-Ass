const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('street workout documentation.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('doc_street_workout_extract.txt', data.text);
    console.log('Successfully extracted PDF');
}).catch(err => {
    console.error(err);
});
