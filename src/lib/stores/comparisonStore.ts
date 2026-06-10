import { create } from "zustand";

interface ComparisonState {
  companies: string[];
  levels: string[];
  locations: string[];
  addCompany: (company: string) => void;
  removeCompany: (company: string) => void;
  addLevel: (level: string) => void;
  removeLevel: (level: string) => void;
  addLocation: (location: string) => void;
  removeLocation: (location: string) => void;
  setAll: (companies: string[], levels: string[], locations: string[]) => void;
  clearAll: () => void;
}

export const useComparisonStore = create<ComparisonState>((set) => ({
  companies: [],
  levels: [],
  locations: [],
  
  addCompany: (company) =>
    set((state) => ({
      companies: state.companies.includes(company)
        ? state.companies
        : [...state.companies, company],
    })),
    
  removeCompany: (company) =>
    set((state) => ({
      companies: state.companies.filter((c) => c !== company),
    })),
    
  addLevel: (level) =>
    set((state) => ({
      levels: state.levels.includes(level)
        ? state.levels
        : [...state.levels, level],
    })),
    
  removeLevel: (level) =>
    set((state) => ({
      levels: state.levels.filter((l) => l !== level),
    })),
    
  addLocation: (location) =>
    set((state) => ({
      locations: state.locations.includes(location)
        ? state.locations
        : [...state.locations, location],
    })),
    
  removeLocation: (location) =>
    set((state) => ({
      locations: state.locations.filter((l) => l !== location),
    })),

  setAll: (companies, levels, locations) =>
    set(() => ({
      companies,
      levels,
      locations,
    })),
    
  clearAll: () =>
    set(() => ({
      companies: [],
      levels: [],
      locations: [],
    })),
}));
