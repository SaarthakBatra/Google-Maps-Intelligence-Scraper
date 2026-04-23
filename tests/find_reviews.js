const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'output/debug/step1_details_overview.html');
const searchTerms = ['Reviews', 'Sort', 'Newest'];
const contextSize = 200;

const stream = fs.createReadStream(filePath, { encoding: 'utf8', highWaterMark: 64 * 1024 });

let buffer = '';
let overlap = '';

stream.on('data', (chunk) => {
    buffer = overlap + chunk;

    searchTerms.forEach(term => {
        let index = buffer.indexOf(term);
        while (index !== -1) {
            const start = Math.max(0, index - contextSize);
            const end = Math.min(buffer.length, index + term.length + contextSize);
            console.log(`\nMatch for "${term}":`);
            console.log(buffer.slice(start, end));

            // Find next match
            index = buffer.indexOf(term, index + 1);
        }
    });

    // Keep the last part of the chunk for overlap to catch split terms
    overlap = buffer.slice(-100);
});

stream.on('end', () => {
    console.log('\nSearch complete.');
});

stream.on('error', (err) => {
    console.error('Error reading file:', err);
});
