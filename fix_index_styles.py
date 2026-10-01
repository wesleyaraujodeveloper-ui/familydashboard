import re

with open("app/(main)/index.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace gradient
content = content.replace(
    "['#201025', '#161625', '#0E0F12']",
    "['#2E1534', '#151733', '#0C0F1A']" 
)

# Update getStyles
# badge
content = content.replace(
    "backgroundColor: 'rgba(255, 255, 255, 0.6)',",
    "backgroundColor: theme.isDarkMode ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255, 255, 255, 0.6)',"
)
content = content.replace(
    "color: '#831843',",
    "color: theme.isDarkMode ? '#F472B6' : '#831843',"
)
# greeting
content = content.replace(
    "color: '#1E1B4B',",
    "color: theme.isDarkMode ? '#FFFFFF' : '#1E1B4B',"
)
# subGreeting
content = content.replace(
    "color: '#4F46E5',",
    "color: theme.isDarkMode ? '#A78BFA' : '#4F46E5',"
)
# avatarWrapper
content = content.replace(
    "backgroundColor: 'rgba(255, 255, 255, 0.4)',",
    "backgroundColor: theme.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.4)',"
)
content = content.replace(
    "borderColor: '#FCE7F3'",
    "borderColor: theme.isDarkMode ? '#1F1235' : '#FCE7F3'"
)
# quickActionLabel
content = content.replace(
    "color: '#4338CA'",
    "color: theme.isDarkMode ? '#E2E8F0' : '#4338CA'"
)
# metricCard
content = content.replace(
    "backgroundColor: 'rgba(255, 255, 255, 0.7)',",
    "backgroundColor: theme.isDarkMode ? '#191924' : 'rgba(255, 255, 255, 0.7)',"
)
content = content.replace(
    "borderColor: 'rgba(255, 255, 255, 0.9)',",
    "borderColor: theme.isDarkMode ? '#2D2D44' : 'rgba(255, 255, 255, 0.9)',"
)
content = content.replace(
    "shadowColor: '#4F46E5',",
    "shadowColor: theme.isDarkMode ? '#000' : '#4F46E5',"
)
# valLabel
content = content.replace(
    "color: '#6366F1',",
    "color: theme.isDarkMode ? '#818CF8' : '#6366F1',"
)
# infoText
content = content.replace(
    "color: '#475569',",
    "color: theme.isDarkMode ? '#94A3B8' : '#475569',"
)

with open("app/(main)/index.tsx", "w", encoding="utf-8") as f:
    f.write(content)
