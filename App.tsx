import React, { useState, useEffect } from 'react';
import { ScreenName, User, SelectionState, Recipe } from './types';
import { SplashScreen, LoginScreen } from './screens/AuthScreens';
import { WizardScreen, RecipeResultScreen } from './screens/WizardScreen';
import { RecipeListScreen, DiscoveryScreen, ProfileScreen } from './screens/TabScreens';
import { DISH_DATABASE } from './services/dishDatabase';

const INITIAL_RECIPES: Recipe[] = DISH_DATABASE.map((dish, index) => ({
  id: `dish-${index}`,
  title: dish.name,
  isFavorite: false,
  ingredients: dish.ingredients,
  description: dish.cuisine
}));

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenName>(ScreenName.SPLASH);
  const [history, setHistory] = useState<ScreenName[]>([]);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  
  // 从本地存储加载用户信息
  const loadUserFromStorage = (): User | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedUser = localStorage.getItem('edibleManual_user');
        if (savedUser) {
          return JSON.parse(savedUser);
        }
      }
    } catch (e) {
      console.error('Failed to load user from storage:', e);
    }
    return null;
  };
  
  const [user, setUser] = useState<User | null>(loadUserFromStorage());
  
  // 当用户信息更新时，保存到本地存储
  useEffect(() => {
    if (user && typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('edibleManual_user', JSON.stringify(user));
      } catch (e) {
        console.error('Failed to save user to storage:', e);
      }
    }
  }, [user]);
  
  // Global Data State
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);

  // Wizard State
  const [selection, setSelection] = useState<SelectionState>({
    vegetables: [],
    meats: [],
    staples: [],
    tool: ''
  });
  const [recipeResult, setRecipeResult] = useState<string>('');

  const navigate = (newScreen: ScreenName) => {
    if (newScreen !== screen) {
      setDirection('forward');
      setHistory(prev => [...prev, screen]);
      setScreen(newScreen);
    }
  };

  const goBack = () => {
    if (history.length === 0) return;
    setDirection('backward');
    const prev = history[history.length - 1];
    setHistory(prevHistory => prevHistory.slice(0, -1));
    setScreen(prev);
  };

  const addRecipes = (newRecipes: Recipe[]) => {
    setRecipes(prev => {
      // Filter out duplicates based on title
      const existingTitles = new Set(prev.map(r => r.title));
      const uniqueNew = newRecipes.filter(r => !existingTitles.has(r.title));
      return [...uniqueNew, ...prev];
    });
  };

  const toggleFavorite = (id: string) => {
    setRecipes(prev => prev.map(r => 
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    ));
  };

  // Render content
  const renderContent = (currentScreen: ScreenName) => {
    const sharedProps = { 
      navigate, 
      goBack, 
      user, 
      setUser,
      recipes,
      addRecipes,
      toggleFavorite
    };

    switch (currentScreen) {
      case ScreenName.SPLASH:
        return <SplashScreen {...sharedProps} />;
      case ScreenName.LOGIN:
        return <LoginScreen {...sharedProps} />;
      case ScreenName.REGISTER:
        return <LoginScreen {...sharedProps} />;
      case ScreenName.WIZARD_VEG:
      case ScreenName.WIZARD_MEAT:
      case ScreenName.WIZARD_STAPLE:
      case ScreenName.WIZARD_TOOL:
        return (
          <WizardScreen 
            {...sharedProps} 
            selection={selection} 
            setSelection={setSelection} 
            setRecipeResult={setRecipeResult}
          />
        );
      case ScreenName.RECIPE_RESULT:
        return <RecipeResultScreen {...sharedProps} result={recipeResult} />;
      case ScreenName.RECIPE_LIST:
        return <RecipeListScreen {...sharedProps} />;
      case ScreenName.DISCOVERY:
        return <DiscoveryScreen {...sharedProps} />;
      case ScreenName.PROFILE:
        return <ProfileScreen {...sharedProps} />;
      default:
        return <SplashScreen {...sharedProps} />;
    }
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-[#e0e0e0] font-serif">
      {/* Phone Frame */}
      <div className="relative w-full h-full md:max-w-[412px] md:max-h-[915px] md:rounded-[0px] bg-app-bg overflow-hidden shadow-2xl">
         {/* Status Bar Mock */}
         <div className="absolute top-0 w-full h-[40px] z-50 flex justify-between items-center px-6 bg-transparent">
             <span className="font-bold text-sm">12:00</span>
             <div className="flex space-x-1">
                 <div className="w-4 h-4 bg-black rounded-sm opacity-20"></div>
                 <div className="w-4 h-4 bg-black rounded-sm opacity-20"></div>
                 <div className="w-6 h-4 bg-black rounded-sm opacity-20"></div>
             </div>
         </div>

         {/* Screen Transition Wrapper */}
         <div key={screen} className={`screen-container ${direction === 'forward' ? 'slide-in-right' : 'slide-in-left'}`}>
             {renderContent(screen)}
         </div>

      </div>
    </div>
  );
};

export default App;