const fs = require('fs');
const path = require('path');

console.log("Script started");

try {
    // Hardcode path
    const debugDir = '/home/saarthak.batra/Documents/Antigravity/Metadrix - Google Maps Scraping/Node Scraper/tests/output/debug';
    console.log(`Debug directory: ${debugDir}`);

    if (!fs.existsSync(debugDir)) {
        console.error('Debug directory does not exist!');
        process.exit(1);
    }

    const files = ['step3_sort_menu.html', 'step1_details_overview.html'];

    files.forEach(file => {
        const filePath = path.join(debugDir, file);
        if (fs.existsSync(filePath)) {
            console.log(`\nProcessing ${file}...`);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                console.log(`  File size: ${content.length} bytes`);

                const bodyIndex = content.indexOf('<body');
                console.log(`  <body> tag index: ${bodyIndex}`);

                const terms = ['Reviews', 'Sort', 'Tab', 'role="tab"', 'aria-label="Reviews"'];

                terms.forEach(term => {
                    let idx = content.indexOf(term);
                    if (idx !== -1) {
                        console.log(`  Found "${term}" at index ${idx}`);
                        // Print context safely
                        const start = Math.max(0, idx - 100);
                        const end = Math.min(content.length, idx + 200);
                        const snippet = content.substring(start, end)
                            .replace(/\n/g, ' ')
                            .replace(/\r/g, ' ');
                        console.log(`    Context: ...${snippet}...`);
                    } else {
                        console.log(`  "${term}" NOT FOUND`);
                    }
                });

            } catch (readErr) {
                console.error(`  Error reading ${file}:`, readErr);
            }
        } else {
            console.log(`  File not found: ${filePath}`);
        }
    });

    console.log("\nAnalysis complete.");

} catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
}
