import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Update Priority texts
    # From:
    # <Text style={styles.badgeText}>{item.priority}</Text>
    # To:
    # <Text style={[styles.badgeText, (styles as any)[`priority_${item.priority}_text`]]}>{item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}</Text>
    content = content.replace(
        "<Text style={styles.badgeText}>{item.priority}</Text>",
        "<Text style={[styles.badgeText, (styles as any)[`priority_${item.priority}_text`]]}>{item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : item.priority === 'low' ? 'Baixa' : item.priority}</Text>"
    )

    # 2. Add Overdue Tag
    # In mural:
    # <View style={styles.taskHeader}>
    #   <Text style={[styles.taskTitle, item.status === 'done' && styles.taskTitleCompleted]}>✅ {item.title}</Text>
    #   <View style={[styles.badge, (styles as any)[`priority_${item.priority}`]]}>
    
    # We want:
    # <View style={styles.taskHeader}>
    #   <Text style={[styles.taskTitle, item.status === 'done' && styles.taskTitleCompleted]}>✅ {item.title}</Text>
    #   <View style={{flexDirection: 'row', alignItems: 'center'}}>
    #     {item.priority && (
    #       <View style={[styles.badge, (styles as any)[`priority_${item.priority}`]]}>
    #         ...
    #       </View>
    #     )}
    #     {item.due_date && new Date(item.due_date) < new Date() && item.status !== 'done' && (
    #       <View style={styles.overdueBadge}>
    #         <Text style={styles.overdueText}>ATRASADO</Text>
    #       </View>
    #     )}
    #   </View>
    
    if 'mural.tsx' in filepath:
        old_header = """          <View style={styles.taskHeader}>
            <Text style={[styles.taskTitle, item.status === 'done' && styles.taskTitleCompleted]}>✅ {item.title}</Text>
            <View style={[styles.badge, (styles as any)[`priority_${item.priority}`]]}>
              <Text style={[styles.badgeText, (styles as any)[`priority_${item.priority}_text`]]}>{item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : item.priority === 'low' ? 'Baixa' : item.priority}</Text>
            </View>
          </View>"""
        new_header = """          <View style={styles.taskHeader}>
            <Text style={[styles.taskTitle, item.status === 'done' && styles.taskTitleCompleted]} numberOfLines={2}>✅ {item.title}</Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              {item.priority && (
                <View style={[styles.badge, (styles as any)[`priority_${item.priority}`]]}>
                  <Text style={[styles.badgeText, (styles as any)[`priority_${item.priority}_text`]]}>{item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : item.priority === 'low' ? 'Baixa' : item.priority}</Text>
                </View>
              )}
              {item.due_date && new Date(item.due_date) < new Date() && item.status !== 'done' && (
                <View style={styles.overdueBadge}>
                  <Text style={styles.overdueText}>ATRASADO</Text>
                </View>
              )}
            </View>
          </View>"""
        content = content.replace(old_header, new_header)
        
    elif 'meu-dia.tsx' in filepath:
        old_header = """            <View style={styles.taskHeader}>
              <Text style={styles.itemTitle}>✅ {item.title}</Text>
              {item.priority && (
                <View style={[styles.badge, (styles as any)[`priority_${item.priority}`]]}>
                  <Text style={[styles.badgeText, (styles as any)[`priority_${item.priority}_text`]]}>{item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : item.priority === 'low' ? 'Baixa' : item.priority}</Text>
                </View>
              )}
            </View>"""
        new_header = """            <View style={styles.taskHeader}>
              <Text style={styles.itemTitle}>✅ {item.title}</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {item.priority && (
                  <View style={[styles.badge, (styles as any)[`priority_${item.priority}`]]}>
                    <Text style={[styles.badgeText, (styles as any)[`priority_${item.priority}_text`]]}>{item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : item.priority === 'low' ? 'Baixa' : item.priority}</Text>
                  </View>
                )}
                {item.due_date && new Date(item.due_date) < new Date() && item.status !== 'done' && (
                  <View style={styles.overdueBadge}>
                    <Text style={styles.overdueText}>ATRASADO</Text>
                  </View>
                )}
              </View>
            </View>"""
        content = content.replace(old_header, new_header)

    elif 'calendario.tsx' in filepath:
        old_header = """              <View style={styles.taskHeader}>
                <Text style={styles.itemTitle}>✅ {item.title}</Text>
                {item.priority && (
                  <View style={[styles.badge, (styles as any)[`priority_${item.priority}`]]}>
                    <Text style={[styles.badgeText, (styles as any)[`priority_${item.priority}_text`]]}>{item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : item.priority === 'low' ? 'Baixa' : item.priority}</Text>
                  </View>
                )}
              </View>"""
        new_header = """              <View style={styles.taskHeader}>
                <Text style={styles.itemTitle}>✅ {item.title}</Text>
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

    # 3. Add styles
    if 'overdueBadge:' not in content:
        style_insert = """  overdueBadge: { backgroundColor: theme.isDarkMode ? '#3f0f14' : '#FFE4E6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 6 },
  overdueText: { fontSize: 9, fontWeight: 'bold', color: theme.isDarkMode ? '#FDA4AF' : '#E11D48', textTransform: 'uppercase' },\n"""
        
        # Insert after priority_low_text: { color: '#4338CA' },
        content = content.replace("  priority_low_text: { color: '#4338CA' },\n", "  priority_low_text: { color: '#4338CA' },\n" + style_insert)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_file('app/(main)/mural.tsx')
update_file('app/(main)/meu-dia.tsx')
update_file('app/(main)/calendario.tsx')
print("Updated priority and overdue tags")
