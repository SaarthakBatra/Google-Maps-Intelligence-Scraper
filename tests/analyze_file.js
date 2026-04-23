const fs = require('fs');
const path = require('path');

const debugDir = path.join(__dirname, 'output', 'debug');
const searchTerms = ['Reviews', 'Sort', 'btba', 'role="tab"', 'aria-label="Reviews"', 'aria-label="Sort"'];

const files = ['step1_details_overview.html', 'step2_reviews_tab.html', 'step3_sort_menu.html'];

files.forEach(file => {
    const filePath = path.join(debugDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`\nAnalyzing ${file}...`);
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for <body>
        if (content.includes('<body')) {
            console.log('  Found <body> tag.');
        } else {
            console.log('  WARNING: No <body> tag found.');
        }

        searchTerms.forEach(term => {
            // Find ALL occurrences
            let idx = content.indexOf(term);
            let count = 0;
            while (idx !== -1 && count < 3) { // Limit to 3 matches per term
                console.log(`  Found "${term}" at index ${idx}. Context:`);
                const start = Math.max(0, idx - 100);
                const end = Math.min(content.length, idx + 150);
                // Escape newlines for readability
                const snippet = content.substring(start, end).replace(/\n/g, '\\n');
                console.log(`  ...${snippet}...`);

                idx = content.indexOf(term, idx + 1);
                count++;
            }
            if (count === 0) {
                console.log(`  "${term}" NOT FOUND.`);
            }
        });
    } else {
        console.log(`File ${file} not found.`);
    }
});
