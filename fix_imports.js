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

    if (!content.includes('import { useAppTheme }')) {
        content = content.replace(/\n\s*const theme = useAppTheme\(\);/g, '');
        content = content.replace(/\n\s*const styles = getStyles\(theme\);/g, '');
    } else {
        // Fix duplicate theme declarations in collapsible, themed-text, themed-view
        // If there's already `const theme = useTheme()` and `const theme = useAppTheme()`, remove useAppTheme()
        if (content.includes('const theme = useTheme();') && content.includes('const theme = useAppTheme();')) {
            content = content.replace(/\n\s*const theme = useAppTheme\(\);/g, '');
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Fixed imports:', filePath);
    }
}

processDir(path.join(__dirname, 'app'));
processDir(path.join(__dirname, 'src', 'components'));
