import re

def update_meu_dia():
    with open('app/(main)/meu-dia.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update MyDayItem
    content = content.replace(
        "space_name?: string;",
        "space_name?: string;\n  group_name?: string;"
    )

    # 2. Update Map logic
    old_map_logic = """    let allSpacesMap = new Map<string, string>();

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
    }"""
    
    new_map_logic = """    let allSpacesMap = new Map<string, {name: string, group_id: string}>();

    if (filterAllGroups) {
      const groupIds = groups.map(g => g.id);
      if (groupIds.length > 0) {
        const { data: allSpaces } = await supabase.from('spaces').select('id, name, group_id').in('group_id', groupIds);
        if (allSpaces) {
          spaceIdsToFetch = allSpaces.map(s => s.id);
          allSpaces.forEach(s => allSpacesMap.set(s.id, { name: s.name, group_id: s.group_id }));
        }
      }
    } else {
      if (spaces && spaces.length > 0) {
        spaceIdsToFetch = spaces.map(s => s.id);
        spaces.forEach(s => allSpacesMap.set(s.id, { name: s.name, group_id: s.group_id }));
      }
    }"""
    
    content = content.replace(old_map_logic, new_map_logic)
    
    # 3. Update space_name resolution
    # Find the function body that resolves it
    old_task_res = "const spaceName = allSpacesMap.get(t.space_id) || 'Desconhecido';"
    new_task_res = "const spaceData = allSpacesMap.get(t.space_id);\n          const spaceName = spaceData?.name || 'Desconhecido';\n          const groupName = groups.find(g => g.id === spaceData?.group_id)?.name || 'Desconhecido';"
    content = content.replace(old_task_res, new_task_res)
    
    old_event_res = "const spaceName = allSpacesMap.get(e.space_id) || 'Desconhecido';"
    new_event_res = "const spaceData = allSpacesMap.get(e.space_id);\n        const spaceName = spaceData?.name || 'Desconhecido';\n        const groupName = groups.find(g => g.id === spaceData?.group_id)?.name || 'Desconhecido';"
    content = content.replace(old_event_res, new_event_res)
    
    old_generic_res = "const spaceName = allSpacesMap.get(item.space_id) || 'Desconhecido';"
    new_generic_res = "const spaceData = allSpacesMap.get(item.space_id);\n              const spaceName = spaceData?.name || 'Desconhecido';\n              const groupName = groups.find(g => g.id === spaceData?.group_id)?.name || 'Desconhecido';"
    content = content.replace(old_generic_res, new_generic_res)
    
    # Push updates
    content = content.replace("type: 'task', space_name: spaceName } as MyDayItem);", "type: 'task', space_name: spaceName, group_name: groupName } as MyDayItem);")
    content = content.replace("type: 'event', space_name: spaceName } as MyDayItem);", "type: 'event', space_name: spaceName, group_name: groupName } as MyDayItem);")
    content = content.replace("type, space_name: spaceName, title: item.title || item.text } as MyDayItem);", "type, space_name: spaceName, group_name: groupName, title: item.title || item.text } as MyDayItem);")
    
    # 4. Render updates
    content = content.replace("<Text style={styles.spaceBadge}>📍 {item.space_name}</Text>", "<Text style={styles.spaceBadge}>🏢 {item.group_name} / 📍 {item.space_name}</Text>")

    with open('app/(main)/meu-dia.tsx', 'w', encoding='utf-8') as f:
        f.write(content)


def update_calendario():
    with open('app/(main)/calendario.tsx', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Update CalendarItem
    content = content.replace(
        "space_name?: string;",
        "space_name?: string;\n  group_name?: string;"
    )

    # 2. Update Map logic
    old_map_logic = """    let allSpacesMap = new Map<string, string>();

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
    }"""
    
    new_map_logic = """    let allSpacesMap = new Map<string, {name: string, group_id: string}>();

    if (filterAllGroups) {
      const groupIds = groups.map(g => g.id);
      if (groupIds.length > 0) {
        const { data: allSpaces } = await supabase.from('spaces').select('id, name, group_id').in('group_id', groupIds);
        if (allSpaces) {
          spaceIdsToFetch = allSpaces.map(s => s.id);
          allSpaces.forEach(s => allSpacesMap.set(s.id, { name: s.name, group_id: s.group_id }));
        }
      }
    } else {
      if (spaces && spaces.length > 0) {
        spaceIdsToFetch = spaces.map(s => s.id);
        spaces.forEach(s => allSpacesMap.set(s.id, { name: s.name, group_id: s.group_id }));
      }
    }"""
    
    content = content.replace(old_map_logic, new_map_logic)
    
    # 3. Update space_name resolution
    # `const getSpaceName = (id: string) => allSpacesMap.get(id) || 'Desconhecido';`
    old_resolver = "const getSpaceName = (id: string) => allSpacesMap.get(id) || 'Desconhecido';"
    new_resolver = "const getSpaceData = (id: string) => allSpacesMap.get(id);\n    const getGroupName = (groupId: string | undefined) => groups.find(g => g.id === groupId)?.name || 'Desconhecido';"
    content = content.replace(old_resolver, new_resolver)
    
    old_push = """              space_id: item.space_id,
              space_name: getSpaceName(item.space_id),
              priority: item.priority,"""
              
    new_push = """              space_id: item.space_id,
              space_name: getSpaceData(item.space_id)?.name || 'Desconhecido',
              group_name: getGroupName(getSpaceData(item.space_id)?.group_id),
              priority: item.priority,"""
    content = content.replace(old_push, new_push)
    
    # 4. Render updates
    content = content.replace("<Text style={styles.spaceBadge}>📍 {item.space_name}</Text>", "<Text style={styles.spaceBadge}>🏢 {item.group_name} / 📍 {item.space_name}</Text>")
    
    with open('app/(main)/calendario.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

update_meu_dia()
update_calendario()
print("Updated tags in Meu Dia and Calendario")
