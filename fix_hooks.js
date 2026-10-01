const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    // 1. Remove all instances of the injected lines
    content = content.replace(/\n\s*const theme = useAppTheme\(\);/g, '');
    content = content.replace(/\n\s*const styles = getStyles\(theme\);/g, '');

    // 2. Add them back ONLY at the start of component functions
    // Component functions usually start with an uppercase letter
    content = content.replace(/export default function\s+([A-Z][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{/g, (match) => {
        if (content.includes('const getStyles =')) {
            return match + '\n  const theme = useAppTheme();\n  const styles = getStyles(theme);';
        }
        return match + '\n  const theme = useAppTheme();';
    });
    content = content.replace(/export function\s+([A-Z][a-zA-Z0-9_]*)\s*\([^)]*\)\s*\{/g, (match) => {
        if (content.includes('const getStyles =')) {
            return match + '\n  const theme = useAppTheme();\n  const styles = getStyles(theme);';
        }
        return match + '\n  const theme = useAppTheme();';
    });
    content = content.replace(/const\s+([A-Z][a-zA-Z0-9_]*)\s*=\s*(?:function)?\s*\([^)]*\)\s*=>\s*\{/g, (match) => {
        if (content.includes('const getStyles =')) {
            return match + '\n  const theme = useAppTheme();\n  const styles = getStyles(theme);';
        }
        return match + '\n  const theme = useAppTheme();';
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Fixed:', filePath);
    }
}

processDir(path.join(__dirname, 'app'));
processDir(path.join(__dirname, 'src', 'components'));
