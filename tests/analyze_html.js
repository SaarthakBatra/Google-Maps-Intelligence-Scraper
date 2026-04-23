const fs = require('fs');
const path = require('path');

const step1Path = path.join(__dirname, 'output/debug/step1_details_overview.html');
const step3Path = path.join(__dirname, 'output/debug/step3_sort_menu.html');

function searchInFile(filePath, searchTerms) {
    console.log(`\n--- Analyzing ${path.basename(filePath)} ---`);
    if (!fs.existsSync(filePath)) {
        console.log('File not found');
        return;
    }
    const content = fs.readFileSync(filePath, 'utf8');

    searchTerms.forEach(term => {
        console.log(`\nSearching for: "${term}"`);
        let index = content.indexOf(term);
        let count = 0;
        while (index !== -1 && count < 5) {
            const start = Math.max(0, index - 100);
            const end = Math.min(content.length, index + 300); // 300 chars after matches
            console.log(`Match ${count + 1}: ...${content.slice(start, end).replace(/\n/g, ' ')}...`);

            index = content.indexOf(term, index + 1);
            count++;
        }
        if (count === 0) console.log('No matches found.');
    });
}

searchInFile(step1Path, ['Reviews', 'aria-label="Reviews"', 'tab', 'role="tab"', 'Sort']);
searchInFile(step3Path, ['Newest', 'Highest', 'Lowest', 'menuitem', 'role="menuitem"']);
