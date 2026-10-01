const fs = require('fs');

function fixMeuDia() {
  let content = fs.readFileSync('app/(main)/meu-dia.tsx', 'utf-8');
  content = content.replace(
    /backgroundColor: '#e8f5e9'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#e8f5e9'"
  );
  content = content.replace(
    /backgroundColor: '#ffebee'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#ffebee'"
  );
  content = content.replace(
    /backgroundColor: '#fff3e0'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#fff3e0'"
  );
  content = content.replace(
    /backgroundColor: '#e0f7fa'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#e0f7fa'"
  );
  content = content.replace(
    /backgroundColor: '#fffde7'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#fffde7'"
  );
  fs.writeFileSync('app/(main)/meu-dia.tsx', content, 'utf-8');
}

function fixMural() {
  let content = fs.readFileSync('app/(main)/mural.tsx', 'utf-8');
  // Container background
  content = content.replace(
    /backgroundColor: '#f5f6f8'/g,
    "backgroundColor: theme.colors.background"
  );
  // Board column
  content = content.replace(
    /backgroundColor: '#F8FAFC'/g,
    "backgroundColor: theme.isDarkMode ? '#131417' : '#F8FAFC'"
  );
  content = content.replace(
    /borderColor: '#F1F5F9'/g,
    "borderColor: theme.isDarkMode ? '#1C1D22' : '#F1F5F9'"
  );
  // Column title
  content = content.replace(
    /color: '#1E293B'/g,
    "color: theme.colors.textPrimary"
  );
  // Column count
  content = content.replace(
    /backgroundColor: '#E2E8F0'/g,
    "backgroundColor: theme.isDarkMode ? '#272932' : '#E2E8F0'"
  );
  content = content.replace(
    /color: '#475569'/g,
    "color: theme.colors.textSecondary"
  );
  // Base card
  content = content.replace(
    /backgroundColor: '#fff'/g,
    "backgroundColor: theme.colors.surface"
  );
  content = content.replace(
    /backgroundColor: '#ffffff'/g,
    "backgroundColor: theme.colors.surface"
  );
  // Specific cards
  content = content.replace(
    /backgroundColor: '#e8f5e9'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#e8f5e9'"
  );
  content = content.replace(
    /backgroundColor: '#ffebee'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#ffebee'"
  );
  content = content.replace(
    /backgroundColor: '#fff3e0'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#fff3e0'"
  );
  content = content.replace(
    /backgroundColor: '#e0f7fa'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#e0f7fa'"
  );
  content = content.replace(
    /backgroundColor: '#fffde7'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#fffde7'"
  );
  fs.writeFileSync('app/(main)/mural.tsx', content, 'utf-8');
}

function fixCalendario() {
  let content = fs.readFileSync('app/(main)/calendario.tsx', 'utf-8');
  // Gradient background
  content = content.replace(
    /<LinearGradient colors=\{\['#FF9A9E', '#FECFEF'\]\} style=\{styles.container\}>/,
    "<LinearGradient colors={theme.isDarkMode ? ['#450a0a', '#171717'] : ['#FF9A9E', '#FECFEF']} style={styles.container}>"
  );
  
  // Base card
  content = content.replace(
    /backgroundColor: '#ffffff'/g,
    "backgroundColor: theme.colors.surface"
  );
  // Calendar card
  content = content.replace(
    /backgroundColor: '#ffffff'/g,
    "backgroundColor: theme.colors.surface"
  );

  // Card specific backgrounds
  content = content.replace(
    /backgroundColor: '#e8f5e9'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#e8f5e9'"
  );
  content = content.replace(
    /backgroundColor: '#ffebee'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#ffebee'"
  );
  content = content.replace(
    /backgroundColor: '#fff3e0'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#fff3e0'"
  );
  content = content.replace(
    /backgroundColor: '#e0f7fa'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#e0f7fa'"
  );
  content = content.replace(
    /backgroundColor: '#fffde7'/g,
    "backgroundColor: theme.isDarkMode ? '#1E1F24' : '#fffde7'"
  );
  
  // Calendar component props
  content = content.replace(
    /calendarBackground: '#ffffff'/g,
    "calendarBackground: 'transparent'"
  );
  content = content.replace(
    /textSectionTitleColor: '#b6c1cd'/g,
    "textSectionTitleColor: theme.colors.textSecondary"
  );
  content = content.replace(
    /dayTextColor: '#2d4150'/g,
    "dayTextColor: theme.colors.textPrimary"
  );
  content = content.replace(
    /textDisabledColor: '#d9e1e8'/g,
    "textDisabledColor: theme.isDarkMode ? '#333333' : '#d9e1e8'"
  );
  content = content.replace(
    /monthTextColor: '#2d4150'/g,
    "monthTextColor: theme.colors.textPrimary"
  );
  
  fs.writeFileSync('app/(main)/calendario.tsx', content, 'utf-8');
}

fixMeuDia();
fixMural();
fixCalendario();
console.log('Fixed screens!');
