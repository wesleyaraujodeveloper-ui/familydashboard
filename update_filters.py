import re

def update_meu_dia():
    with open('app/(main)/meu-dia.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add imports
    if 'useGroup' not in content:
        content = content.replace("import { useSpace } from '../../src/store/space';", "import { useSpace } from '../../src/store/space';\nimport { useGroup } from '../../src/store/group';")
    
    # 2. Add state
    if 'const [filterAllGroups' not in content:
        content = content.replace(
            "const { spaces } = useSpace();",
            "const { spaces } = useSpace();\n  const { groups } = useGroup();\n  const [filterAllGroups, setFilterAllGroups] = useState(false);"
        )

    # 3. Update fetchMyDay
    old_fetch_start = """  const fetchMyDay = useCallback(async () => {
    if (!spaces || spaces.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const spaceIds = spaces.map(s => s.id);"""
    
    new_fetch_start = """  const fetchMyDay = useCallback(async () => {
    setLoading(true);

    let spaceIdsToFetch: string[] = [];
    let allSpacesMap = new Map<string, string>();

    if (filterAllGroups) {
      const groupIds = groups.map(g => g.id);
      if (groupIds.length > 0) {
        const { data: allSpaces } = await supabase.from('spaces').select('id, name').in('group_id', groupIds);
        if (allSpaces) {
          spaceIdsToFetch = allSpaces.map(s => s.id);
          allSpaces.forEach(s => allSpacesMap.set(s.id, s.name));
        }
      }
    } else {
      if (spaces && spaces.length > 0) {
        spaceIdsToFetch = spaces.map(s => s.id);
        spaces.forEach(s => allSpacesMap.set(s.id, s.name));
      }
    }

    if (spaceIdsToFetch.length === 0) {
      setLoading(false);
      setItems([]);
      return;
    }

    const spaceIds = spaceIdsToFetch;"""
    
    content = content.replace(old_fetch_start, new_fetch_start)
    
    # 4. Replace spaces.find with allSpacesMap.get
    content = content.replace("spaces.find(s => s.id === t.space_id)?.name", "allSpacesMap.get(t.space_id)")
    content = content.replace("spaces.find(s => s.id === e.space_id)?.name", "allSpacesMap.get(e.space_id)")
    content = content.replace("spaces.find(s => s.id === item.space_id)?.name", "allSpacesMap.get(item.space_id)")
    
    # 5. Fix dependency array
    content = content.replace("}, [spaces]);", "}, [spaces, groups, filterAllGroups]);")
    
    # 6. Add UI Toggle
    old_header = """      <View style={styles.header}>
        <Text style={styles.title}>🌞 Meu Dia</Text>
        <Text style={styles.subtitle}>Sua visão geral de todas as tarefas e eventos de hoje</Text>
      </View>"""
      
    new_header = """      <View style={styles.header}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <View style={{flex: 1}}>
            <Text style={styles.title}>🌞 Meu Dia</Text>
            <Text style={styles.subtitle}>Sua visão geral de todas as tarefas e eventos de hoje</Text>
          </View>
          <TouchableOpacity 
            style={styles.filterBtn} 
            onPress={() => setFilterAllGroups(!filterAllGroups)}
          >
            <Feather name={filterAllGroups ? "layers" : "folder"} size={16} color={theme.colors.primary} />
            <Text style={styles.filterBtnText}>{filterAllGroups ? "Todos os Grupos" : "Grupo Atual"}</Text>
          </TouchableOpacity>
        </View>
      </View>"""
      
    content = content.replace(old_header, new_header)
    
    # 7. Add style
    if 'filterBtn:' not in content:
        style_insert = """  title: { fontSize: theme.typography.sizes.headlineXl, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },
  
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border },
  filterBtnText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.primary, marginLeft: 6 },"""
        content = content.replace("  title: { fontSize: theme.typography.sizes.headlineXl, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: theme.spacing.xs },\n  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: theme.colors.textSecondary, marginBottom: theme.spacing.lg },", style_insert)

    with open('app/(main)/meu-dia.tsx', 'w', encoding='utf-8') as f:
        f.write(content)


def update_calendario():
    with open('app/(main)/calendario.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add imports
    if 'useGroup' not in content:
        content = content.replace("import { useSpace } from '../../src/store/space';", "import { useSpace } from '../../src/store/space';\nimport { useGroup } from '../../src/store/group';")
    
    # 2. Add state
    if 'const [filterAllGroups' not in content:
        content = content.replace(
            "const { spaces } = useSpace();",
            "const { spaces } = useSpace();\n  const { groups } = useGroup();\n  const [filterAllGroups, setFilterAllGroups] = useState(false);"
        )

    # 3. Update fetchCalendar
    old_fetch_start = """  const fetchCalendar = useCallback(async () => {
    if (!spaces || spaces.length === 0) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const spaceIds = spaces.map(s => s.id);"""
    
    new_fetch_start = """  const fetchCalendar = useCallback(async () => {
    setLoading(true);

    let spaceIdsToFetch: string[] = [];
    let allSpacesMap = new Map<string, string>();

    if (filterAllGroups) {
      const groupIds = groups.map(g => g.id);
      if (groupIds.length > 0) {
        const { data: allSpaces } = await supabase.from('spaces').select('id, name').in('group_id', groupIds);
        if (allSpaces) {
          spaceIdsToFetch = allSpaces.map(s => s.id);
          allSpaces.forEach(s => allSpacesMap.set(s.id, s.name));
        }
      }
    } else {
      if (spaces && spaces.length > 0) {
        spaceIdsToFetch = spaces.map(s => s.id);
        spaces.forEach(s => allSpacesMap.set(s.id, s.name));
      }
    }

    if (spaceIdsToFetch.length === 0) {
      setLoading(false);
      setItems([]);
      return;
    }

    const spaceIds = spaceIdsToFetch;"""
    
    content = content.replace(old_fetch_start, new_fetch_start)
    
    # 4. Replace space mapping
    content = content.replace("const getSpaceName = (id: string) => spaces.find(s => s.id === id)?.name || 'Desconhecido';", "const getSpaceName = (id: string) => allSpacesMap.get(id) || 'Desconhecido';")
    
    # 5. Fix dependency array
    content = content.replace("}, [spaces]);", "}, [spaces, groups, filterAllGroups]);")
    
    # 6. Add UI Toggle
    old_header = """      <View style={styles.header}>
        <Text style={styles.title}>📅 Calendário</Text>
        <Text style={styles.subtitle}>Visão geral dos seus compromissos e prazos</Text>
      </View>"""
      
    new_header = """      <View style={styles.header}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'}}>
          <View style={{flex: 1}}>
            <Text style={styles.title}>📅 Calendário</Text>
            <Text style={styles.subtitle}>Visão geral dos seus compromissos e prazos</Text>
          </View>
          <TouchableOpacity 
            style={styles.filterBtn} 
            onPress={() => setFilterAllGroups(!filterAllGroups)}
          >
            <Feather name={filterAllGroups ? "layers" : "folder"} size={16} color="#ffffff" />
            <Text style={styles.filterBtnText}>{filterAllGroups ? "Todos os Grupos" : "Grupo Atual"}</Text>
          </TouchableOpacity>
        </View>
      </View>"""
      
    content = content.replace(old_header, new_header)
    
    # 7. Add style
    if 'filterBtn:' not in content:
        style_insert = """  title: { fontSize: 32, fontWeight: '900', color: '#ffffff', marginBottom: theme.spacing.xs, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: 'rgba(255,255,255,0.9)', marginBottom: theme.spacing.lg },
  
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16 },
  filterBtnText: { fontSize: 12, fontWeight: 'bold', color: '#ffffff', marginLeft: 6 },"""
        content = content.replace("  title: { fontSize: 32, fontWeight: '900', color: '#ffffff', marginBottom: theme.spacing.xs, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },\n  subtitle: { fontSize: theme.typography.sizes.bodyLg, color: 'rgba(255,255,255,0.9)', marginBottom: theme.spacing.lg },", style_insert)

    with open('app/(main)/calendario.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

update_meu_dia()
update_calendario()
print("Updated Meu Dia and Calendario")
