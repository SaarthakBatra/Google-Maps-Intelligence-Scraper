const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');

const step1Path = path.join(__dirname, 'output/debug/step1_details_overview.html');
const step3Path = path.join(__dirname, 'output/debug/step3_sort_menu.html');

function analyzeFile(filePath) {
    console.log(`\n--- Analyzing ${path.basename(filePath)} ---`);
    if (!fs.existsSync(filePath)) {
        console.log('File not found');
        return;
    }
    const html = fs.readFileSync(filePath, 'utf8');
    const root = parse(html);

    // 1. Check for details panel role
    const mains = root.querySelectorAll('div[role="main"]');
    console.log(`Found ${mains.length} div[role="main"]`);
    mains.forEach((main, i) => {
        const hasFeed = main.querySelector('div[role="feed"]');
        console.log(`  Main ${i}: hasFeed=${!!hasFeed} class="${main.getAttribute('class')}" aria-label="${main.getAttribute('aria-label')}"`);
    });

    // 2. Check for Reviews tab
    // Try broadly
    const tabs = root.querySelectorAll('button[role="tab"]');
    console.log(`Found ${tabs.length} tabs`);
    tabs.forEach((tab, i) => {
        console.log(`  Tab ${i}: text="${tab.textContent.trim()}" aria-label="${tab.getAttribute('aria-label')}" class="${tab.getAttribute('class')}"`);
    });

    // 3. Search for "Reviews" text in any button/div
    console.log('Searching for elements with text "Reviews"...');
    const reviewsEls = root.querySelectorAll('*');
    let reviewsCount = 0;
    for (const el of reviewsEls) {
        if (reviewsCount > 5) break;
        const text = el.textContent || '';
        const aria = el.getAttribute('aria-label') || '';
        if ((text.includes('Reviews') || aria.includes('Reviews')) && (el.tagName === 'BUTTON' || el.tagName === 'DIV')) {
            // filter out huge containers
            if (text.length < 100) {
                console.log(`  Match: <${el.tagName} class="${el.getAttribute('class')}" aria-label="${aria}" role="${el.getAttribute('role')}">${text}</${el.tagName}>`);
                reviewsCount++;
            }
        }
    }

    // 4. Check for Sort button
    console.log('Searching for "Sort"...');
    // ... similar logic
}

analyzeFile(step1Path);
analyzeFile(step3Path);
