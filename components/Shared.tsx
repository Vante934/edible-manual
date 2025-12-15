
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScreenName } from '../types';

interface WrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const MobileWrapper: React.FC<WrapperProps> = ({ children, className = '', style }) => {
  return (
    <div 
      className={`w-full h-full bg-app-bg relative flex flex-col ${className}`}
      style={style}
    >
      {children}
    </div>
  );
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'yellow' | 'white' | 'orange' | 'green' | 'transparent';
  fullWidth?: boolean;
}

export const AppButton: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'yellow', 
  fullWidth = false,
  ...props 
}) => {
  const baseStyle = "rounded-[4px] font-bold text-[#6c6c6c] shadow-hard active:translate-y-1 active:shadow-none transition-all flex items-center justify-center italic";
  
  const variants = {
    yellow: "bg-[#FEFA83]/90 border-none backdrop-blur-sm", 
    white: "bg-white/90 border border-none backdrop-blur-sm",
    orange: "bg-app-orange text-app-gray",
    green: "bg-[#8fd3bd] text-white",
    transparent: "bg-transparent shadow-none border border-app-border"
  };

  const widthClass = fullWidth ? "w-full" : "px-6";

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${widthClass} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

export const AppInput: React.FC<InputProps> = ({ label, className = '', containerClassName='', ...props }) => {
  return (
    <div className={`flex items-center w-full ${containerClassName}`}>
      {label && <span className="text-[#6c6c6c] font-bold text-xl w-24 text-right mr-2 shrink-0 tracking-wide italic font-serif">{label}</span>}
      <div className="relative flex-1 shadow-hard rounded-[4px]">
        <input 
            className={`w-full h-11 border border-[#BBBBBB] rounded-[4px] px-3 bg-white focus:outline-none text-[#6c6c6c] ${className}`}
            {...props}
        />
      </div>
    </div>
  );
};

interface HeaderProps {
  onBack?: () => void;
  title?: string;
  className?: string;
}

export const AppHeader: React.FC<HeaderProps> = ({ onBack, title, className = '' }) => {
  return (
    <div className={`pt-12 pb-2 px-4 flex items-center relative z-10 ${className}`}>
      {onBack && (
        <button onClick={onBack} className="p-2 -ml-2 text-[#bbbbbb] hover:text-[#6c6c6c] transition-colors rounded-full">
          <ArrowLeft size={36} strokeWidth={2.5} />
        </button>
      )}
      {title && <h1 className="text-xl font-bold text-[#6c6c6c] ml-2 italic">{title}</h1>}
    </div>
  );
};

interface BottomNavProps {
  activeTab: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {
  const isActive = (s: ScreenName) => activeTab === s || (activeTab.startsWith('WIZARD') && s === ScreenName.WIZARD_VEG);

  return (
    <div className="h-[85px] bg-white/90 backdrop-blur-md absolute bottom-0 left-0 right-0 flex justify-around items-end pb-4 rounded-t-[35px] shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
      <NavItem 
        icon={<IconCook active={isActive(ScreenName.WIZARD_VEG)} />}
        label="做菜" 
        active={isActive(ScreenName.WIZARD_VEG)} 
        onClick={() => onNavigate(ScreenName.WIZARD_VEG)} 
      />
      <NavItem 
        icon={<IconRecipe active={isActive(ScreenName.RECIPE_LIST)} />}
        label="菜谱" 
        active={isActive(ScreenName.RECIPE_LIST)} 
        onClick={() => onNavigate(ScreenName.RECIPE_LIST)} 
      />
      <NavItem 
        icon={<IconDiscovery active={isActive(ScreenName.DISCOVERY)} />}
        label="发现" 
        active={isActive(ScreenName.DISCOVERY)} 
        onClick={() => onNavigate(ScreenName.DISCOVERY)} 
      />
      <NavItem 
        icon={<IconMine active={isActive(ScreenName.PROFILE)} />}
        label="我的" 
        active={isActive(ScreenName.PROFILE)} 
        onClick={() => onNavigate(ScreenName.PROFILE)} 
      />
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-end w-16 h-14 relative group`}>
    <div className="mb-1 transform group-active:scale-95 transition-transform">
      {icon}
    </div>
    <span className={`text-[14px] font-bold tracking-widest ${active ? 'text-[#6c6c6c]' : 'text-[#9a9a9a]'} italic`}>{label}</span>
  </button>
);

// --- Custom SVGs to match design slices ---

const IconCook = ({ active }: { active: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke={active ? "#6c6c6c" : "#9a9a9a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 16h24" />
    <path d="M24 16v8a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4v-8" />
    <path d="M10 8v5" />
    <path d="M16 7v6" />
    <path d="M22 8v5" />
    <path d="M6 8h20" stroke="none" /> 
    {/* Simplified steam lines */}
    <path d="M9 4c0-1.5 1-2 2-2" />
    <path d="M15 3c0-1.5 1-2 2-2" />
    <path d="M21 4c0-1.5 1-2 2-2" />
  </svg>
);

const IconRecipe = ({ active }: { active: boolean }) => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={active ? "#6c6c6c" : "#9a9a9a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M9 6h5" />
    <path d="M9 10h5" />
  </svg>
);

const IconDiscovery = ({ active }: { active: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={active ? "#6c6c6c" : "#9a9a9a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M3.6 9h16.8" />
    <path d="M3.6 15h16.8" />
    <path d="M11.5 3a17 17 0 0 0 0 18" />
    <path d="M12.5 3a17 17 0 0 1 0 18" />
    {/* Making it look more like a planet with ring as per slice if possible, but compass/planet hybrid is standard */}
    <path d="M2 12h20" stroke="none" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="none"/>
    {/* Custom Planet-like path to match slice better */}
    <circle cx="12" cy="12" r="6" fill="none" strokeWidth="2"/>
    <path d="M4 18s2-4 8-4 8 4 8 4" transform="rotate(-45 12 12)" />
  </svg>
);

const IconMine = ({ active }: { active: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={active ? "#6c6c6c" : "#9a9a9a"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
