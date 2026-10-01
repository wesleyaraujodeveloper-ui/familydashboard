const fs = require('fs');
let content = fs.readFileSync('app/(main)/index.tsx', 'utf-8');

// Tarefas de Hoje Card
content = content.replace(
  /<View style=\{styles\.metricCard\}>/g, 
  `<View style={[styles.metricCard, { backgroundColor: theme.isDarkMode ? '#1C1C1E' : 'rgba(255, 255, 255, 0.7)', borderColor: theme.isDarkMode ? '#2C2C2E' : 'rgba(255, 255, 255, 0.9)' }]}>`
);

content = content.replace(
  /<View style=\{\[styles\.iconBox, \{ backgroundColor: '#FEE2E2' \}\]\}>/g,
  `<View style={[styles.iconBox, { backgroundColor: theme.isDarkMode ? '#3A1515' : '#FEE2E2' }]}>`
);
content = content.replace(
  /<Feather name="check-circle" size=\{20\} color="#EF4444" \/>/g,
  `<Feather name="check-circle" size={20} color={theme.isDarkMode ? '#F87171' : '#EF4444'} />`
);
content = content.replace(
  /<View style=\{\[styles\.pill, \{ backgroundColor: '#FEE2E2' \}\]\}>/g,
  `<View style={[styles.pill, { backgroundColor: theme.isDarkMode ? '#3A1515' : '#FEE2E2' }]}>`
);
content = content.replace(
  /<Text style=\{\[styles\.pillText, \{ color: '#B91C1C' \}\]\}>/g,
  `<Text style={[styles.pillText, { color: theme.isDarkMode ? '#F87171' : '#B91C1C' }]}>`
);
content = content.replace(
  /<Text style=\{styles\.valNum\}>\{tasksToday\.done\}\/\{tasksToday\.total\}<\/Text>/g,
  `<Text style={[styles.valNum, { color: theme.isDarkMode ? '#FFFFFF' : '#1E1B4B' }]}>{tasksToday.done}/{tasksToday.total}</Text>`
);
content = content.replace(
  /<Text style=\{styles\.valNum\}>\{upcomingEvents\.length\}<\/Text>/g,
  `<Text style={[styles.valNum, { color: theme.isDarkMode ? '#FFFFFF' : '#1E1B4B' }]}>{upcomingEvents.length}</Text>`
);
content = content.replace(
  /<Text style=\{styles\.valLabel\}>tarefas hoje<\/Text>/g,
  `<Text style={[styles.valLabel, { color: theme.isDarkMode ? '#A78BFA' : '#6366F1' }]}>tarefas hoje</Text>`
);

// Progress Track
content = content.replace(
  /<View style=\{styles\.progressTrack\}>/g,
  `<View style={[styles.progressTrack, { backgroundColor: theme.isDarkMode ? 'rgba(248, 113, 113, 0.1)' : 'rgba(99, 102, 241, 0.1)' }]}>`
);
content = content.replace(
  /colors=\{\['#FCA5A5', '#EF4444'\]\}/g,
  `colors={theme.isDarkMode ? ['#991B1B', '#EF4444'] : ['#FCA5A5', '#EF4444']}`
);

// Compromissos Card
content = content.replace(
  /<View style=\{\[styles\.iconBox, \{ backgroundColor: '#E0E7FF' \}\]\}>/g,
  `<View style={[styles.iconBox, { backgroundColor: theme.isDarkMode ? '#1E1E3F' : '#E0E7FF' }]}>`
);
content = content.replace(
  /<Feather name="clock" size=\{20\} color="#6366F1" \/>/g,
  `<Feather name="clock" size={20} color={theme.isDarkMode ? '#818CF8' : '#6366F1'} />`
);
content = content.replace(
  /<View style=\{\[styles\.pill, \{ backgroundColor: '#E0E7FF' \}\]\}>/g,
  `<View style={[styles.pill, { backgroundColor: theme.isDarkMode ? '#1E1E3F' : '#E0E7FF' }]}>`
);
content = content.replace(
  /<Text style=\{\[styles\.pillText, \{ color: '#4338CA' \}\]\}>/g,
  `<Text style={[styles.pillText, { color: theme.isDarkMode ? '#818CF8' : '#4338CA' }]}>`
);
content = content.replace(
  /<Text style=\{styles\.valLabel\}>hoje & breve<\/Text>/g,
  `<Text style={[styles.valLabel, { color: theme.isDarkMode ? '#A78BFA' : '#6366F1' }]}>hoje & breve</Text>`
);
content = content.replace(
  /<Text style=\{styles\.infoText\} numberOfLines=\{1\}>/g,
  `<Text style={[styles.infoText, { color: theme.isDarkMode ? '#D1D5DB' : '#475569' }]} numberOfLines={1}>`
);
content = content.replace(
  /<Text style=\{styles\.infoText\}>Livre<\/Text>/g,
  `<Text style={[styles.infoText, { color: theme.isDarkMode ? '#D1D5DB' : '#475569' }]}>Livre</Text>`
);

fs.writeFileSync('app/(main)/index.tsx', content, 'utf-8');
console.log('Fixed cards in index.tsx');
