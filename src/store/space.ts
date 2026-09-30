import { create } from 'zustand';

export interface Space {
  id: string;
  name: string;
  group_id: string;
}

interface SpaceState {
  activeSpace: Space | null;
  spaces: Space[];
  setActiveSpace: (space: Space) => void;
  setSpaces: (spaces: Space[]) => void;
}

export const useSpace = create<SpaceState>((set) => ({
  activeSpace: null,
  spaces: [],
  setActiveSpace: (space) => set({ activeSpace: space }),
  setSpaces: (spaces) => set({ spaces }),
}));
