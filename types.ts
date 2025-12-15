
export enum ScreenName {
  SPLASH = 'SPLASH',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  WIZARD_VEG = 'WIZARD_VEG',
  WIZARD_MEAT = 'WIZARD_MEAT',
  WIZARD_STAPLE = 'WIZARD_STAPLE',
  WIZARD_TOOL = 'WIZARD_TOOL',
  RECIPE_RESULT = 'RECIPE_RESULT',
  RECIPE_LIST = 'RECIPE_LIST',
  DISCOVERY = 'DISCOVERY',
  PROFILE = 'PROFILE',
}

export interface User {
  username: string;
  password?: string;
  type: 'NOOB' | 'PRO';
}

export interface Recipe {
  id: string;
  title: string;
  isFavorite: boolean;
  description?: string;
  ingredients?: string[];
}

export interface SelectionState {
  vegetables: string[];
  meats: string[];
  staples: string[];
  tool: string;
}

export interface SharedProps {
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  recipes: Recipe[];
  addRecipes: (newRecipes: Recipe[]) => void;
  toggleFavorite: (id: string) => void;
}