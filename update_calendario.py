import sys

def update_calendario():
    with open('app/(main)/calendario.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace priority render
    old_priority = "<Text style={[styles.badgeText, (styles as any)[`priority_${item.priority}_text`]]}>{item.priority}</Text>"
    new_priority = "<Text style={[styles.badgeText, (styles as any)[`priority_${item.priority}_text`]]}>{item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : item.priority === 'low' ? 'Baixa' : item.priority}</Text>"
    content = content.replace(old_priority, new_priority)
    
    # Replace the task header structure
    old_header = """            <View style={styles.taskHeader}>
              <Text style={[styles.itemTitle, item.status === 'done' && { textDecorationLine: 'line-through' }]}>✅ {item.title}</Text>
              {item.priority && (
                <View style={[styles.badge, (styles as any)[`priority_${item.priority}`]]}>
                  <Text style={[styles.badgeText, (styles as any)[`priority_${item.priority}_text`]]}>{item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : item.priority === 'low' ? 'Baixa' : item.priority}</Text>
                </View>
              )}
            </View>"""
    
    new_header = """            <View style={styles.taskHeader}>
              <Text style={[styles.itemTitle, item.status === 'done' && { textDecorationLine: 'line-through' }]}>✅ {item.title}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {item.priority && (
                  <View style={[styles.badge, (styles as any)[`priority_${item.priority}`]]}>
                    <Text style={[styles.badgeText, (styles as any)[`priority_${item.priority}_text`]]}>{item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : item.priority === 'low' ? 'Baixa' : item.priority}</Text>
                  </View>
                )}
                {item.date_iso && new Date(item.date_iso) < new Date(new Date().setHours(0,0,0,0)) && item.status !== 'done' && (
                  <View style={styles.overdueBadge}>
                    <Text style={styles.overdueText}>ATRASADO</Text>
                  </View>
                )}
              </View>
            </View>"""
    content = content.replace(old_header, new_header)
    
    with open('app/(main)/calendario.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

update_calendario()
print("Updated calendario.tsx")
