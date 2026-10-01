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
    
    // Skip if it doesn't use the theme
    if (!content.includes('import { theme }') && !content.includes('theme.')) return;
    
    let originalContent = content;

    // 1. Replace import { theme } with useAppTheme
    // Note: Paths could be '../../src/theme' or '../theme' etc.
    content = content.replace(/import\s+\{\s*theme\s*\}\s+from\s+['"]([^'"]+)['"];?/g, (match, p1) => {
        // e.g. p1 is '../../src/theme'
        let themePath = p1;
        if (themePath.endsWith('/theme')) {
            themePath = themePath + '/useAppTheme';
        } else {
            themePath = themePath + '/useAppTheme'; // Approximation
        }
        return `import { useAppTheme } from '${themePath}';`;
    });

    // 2. Modify component to use the hook
    // Look for export default function XYZ() { or const XYZ = () => {
    // We will do a generic replacement
    let hasGetStyles = content.includes('const getStyles =');
    let hasStyleSheet = content.includes('const styles = StyleSheet.create(');
    
    if (hasStyleSheet && !hasGetStyles) {
        content = content.replace(/const styles = StyleSheet\.create\(/g, 'const getStyles = (theme: any) => StyleSheet.create(');
        
        // Find the main component function to inject const theme = useAppTheme(); const styles = getStyles(theme);
        // This regex tries to find the default export or main function.
        // It's a bit naive but works for standard Expo screens.
        content = content.replace(/export default function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{/g, (match) => {
            return match + '\n  const theme = useAppTheme();\n  const styles = getStyles(theme);';
        });
        content = content.replace(/export function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{/g, (match) => {
            return match + '\n  const theme = useAppTheme();\n  const styles = getStyles(theme);';
        });
        content = content.replace(/const\s+[a-zA-Z0-9_]+\s*=\s*(?:function)?\s*\([^)]*\)\s*=>\s*\{/g, (match) => {
            return match + '\n  const theme = useAppTheme();\n  const styles = getStyles(theme);';
        });
    } else if (!hasStyleSheet && !content.includes('const theme = useAppTheme();')) {
        // Just inject const theme
        content = content.replace(/export default function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{/g, (match) => {
            return match + '\n  const theme = useAppTheme();';
        });
        content = content.replace(/export function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{/g, (match) => {
            return match + '\n  const theme = useAppTheme();';
        });
        content = content.replace(/const\s+[a-zA-Z0-9_]+\s*=\s*(?:function)?\s*\([^)]*\)\s*=>\s*\{/g, (match) => {
            return match + '\n  const theme = useAppTheme();';
        });
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log('Processed:', filePath);
    }
}

console.log('Starting refactor...');
processDir(path.join(__dirname, 'app'));
processDir(path.join(__dirname, 'src', 'components'));
console.log('Done!');
