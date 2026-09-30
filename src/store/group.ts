import { create } from 'zustand';

export interface Group {
  id: string;
  name: string;
}

interface GroupState {
  activeGroup: Group | null;
  groups: Group[];
  setActiveGroup: (group: Group) => void;
  setGroups: (groups: Group[]) => void;
}

export const useGroup = create<GroupState>((set) => ({
  activeGroup: null,
  groups: [],
  setActiveGroup: (group) => set({ activeGroup: group }),
  setGroups: (groups) => set({ groups }),
}));
