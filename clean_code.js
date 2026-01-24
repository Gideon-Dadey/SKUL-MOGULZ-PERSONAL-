const fs = require('fs');
const path = require('path');

// Configuration
const TARGET_DIRS = ['./client/src']; // Focus on the frontend code
const EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.css'];
const PRESERVE_PATTERNS = [
    '@ts-',        // TypeScript directives
    'eslint-',     // Linting rules
    'prettier-',   // Prettier rules
    'stylelint-',  // Style linting
    'lucide'       // Icon imports often have comments
];

/**
 * Safely removes comments from JS/TS/CSS content
 */
function removeComments(content, isCss = false) {
    if (isCss) {
        // Remove CSS multiline comments: /* ... */
        return content.replace(/\/\*[\s\S]*?\*\//g, (match) => {
            return PRESERVE_PATTERNS.some(p => match.includes(p)) ? match : '';
        });
    }

    // JS/TS Regex logic:
    // 1. Match strings (single, double, template) to skip over them
    // 2. Match single-line // comments (ignoring those inside URLs)
    // 3. Match multi-line /* */ comments
    return content.replace(/("([^"\\]|\\.)*"|'([^'\\]|\\.)*'|`([^`\\]|\\.)*`)|(\/\*[\s\S]*?\*\/|(?<!:)\/\/.+)/g, (match, string) => {
        if (string) return match; // It's a string, don't touch it

        // It's a comment, check if we should preserve it
        const shouldPreserve = PRESERVE_PATTERNS.some(p => match.includes(p));
        if (shouldPreserve) return match;

        return ''; // Remove the comment
    });
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                processDirectory(fullPath);
            }
        } else {
            const ext = path.extname(file);
            if (EXTENSIONS.includes(ext)) {
                console.log(`Cleaning: ${fullPath}`);
                const content = fs.readFileSync(fullPath, 'utf8');
                const cleanedContent = removeComments(content, ext === '.css');

                // Only write if changes were made to save disk performance
                if (cleanedContent !== content) {
                    fs.writeFileSync(fullPath, cleanedContent, 'utf8');
                }
            }
        }
    });
}

console.log('🚀 Starting Code Cleanup...');
TARGET_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
});
console.log('✨ Cleanup Complete! Code is now sleek and comment-free.');
