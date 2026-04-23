try {
    require('node-html-parser');
    console.log('node-html-parser found');
} catch (e) {
    console.error('node-html-parser NOT found');
    console.error(e.message);
}
console.log('Node version:', process.version);
