/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');

console.log("Structured Analysis Started");

try {
    const debugDir = '/home/saarthak.batra/Documents/Antigravity/Metadrix - Google Maps Scraping/Node Scraper/tests/output/debug';
    const files = ['error_dump_v2.html'];

    files.forEach(file => {
        const filePath = path.join(debugDir, file);
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            return;
        }

        console.log(`\nAnalyzing ${file}...`);
        const content = fs.readFileSync(filePath, 'utf8');
        const root = parse(content);

        // 1. Find role="tab"
        const tabs = root.querySelectorAll('[role="tab"]');
        console.log(`  Found ${tabs.length} tabs:`);
        tabs.forEach((tab, i) => {
            console.log(`    [${i}] Tag: ${tab.tagName}, Class: "${tab.getAttribute('class')}", Aria: "${tab.getAttribute('aria-label')}"`);
        });

        // 2. Find aria-label="Reviews" (fuzzy)
        const allElements = root.querySelectorAll('*');
        const reviews = allElements.filter(el => {
            const aria = el.getAttribute('aria-label');
            return aria && aria.includes('Reviews');
        });

        console.log(`  Found ${reviews.length} elements with "Reviews" in aria-label:`);
        reviews.forEach((el, i) => {
            console.log(`    [${i}] Tag: ${el.tagName}, role: "${el.getAttribute('role')}", Aria: "${el.getAttribute('aria-label')}"`);
        });

        // 3. Check for specific containers
        const tabList = root.querySelector('[role="tablist"]');
        console.log(`  TabList found? ${!!tabList}`);

        // 4. Check page title
        const title = root.querySelector('title');
        console.log(`  Page Title: ${title ? title.text : 'None'}`);

    });

} catch (err) {
    console.error("Error:", err);
    process.exit(1);
}
