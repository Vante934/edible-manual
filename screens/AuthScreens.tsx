
import React from 'react';
import { MobileWrapper, AppButton, AppInput } from '../components/Shared';
import { SharedProps, ScreenName } from '../types';
import { ChefHat, Cookie, Beer, Cherry, User as LucideUser } from 'lucide-react';

export const SplashScreen: React.FC<SharedProps> = ({ navigate, setUser }) => {
  const handleSelect = (type: 'NOOB' | 'PRO') => {
    setUser({ username: '', type });
    navigate(ScreenName.LOGIN);
  };

  return (
    <MobileWrapper className="items-center relative overflow-hidden">
      {/* Background Decor - Matched positions from slices approximately */}
      <ChefHat className="absolute top-[110px] left-[48px] text-[#6c6c6c]/20 rotate-[-15deg] animate-float" size={70} />
      <Cookie className="absolute top-[101px] right-[60px] text-[#6c6c6c]/20 rotate-[15deg] animate-float" style={{ animationDelay: '1s' }} size={65} />
      <Beer className="absolute top-[362px] left-[23px] text-[#6c6c6c]/20 rotate-[-10deg] animate-float" style={{ animationDelay: '2s' }} size={63} />
      <Cherry className="absolute top-[375px] right-[40px] text-[#6c6c6c]/20 rotate-[10deg] animate-float" style={{ animationDelay: '1.5s' }} size={62} />

      {/* Main Center Icon */}
      <div className="absolute top-[188px] w-[234px] h-[234px] bg-white rounded-full flex items-center justify-center shadow-hard z-10">
         <svg width="130" height="130" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#9ca3af]">
            {/* Steam - Wavy lines */}
            <path d="M22 10C22 10 19 14 19 18C19 22 22 24 22 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M32 6C32 6 29 10 29 14C29 18 32 20 32 20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M42 10C42 10 39 14 39 18C39 22 42 24 42 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>

            {/* Lid */}
            <rect x="14" y="28" width="36" height="8" rx="3" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            
            {/* Pot Body */}
            <path d="M16 36V46C16 51.5228 20.4772 56 26 56H38C43.5228 56 48 51.5228 48 46V36" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            
            {/* Handles */}
            <path d="M10 38H14" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M50 38H54" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
         </svg>
      </div>

      <div className="absolute top-[480px] w-full text-center z-20 px-8">
         <div className="border-2 border-[#54BCBD] p-4 bg-[#54BCBD]/10 backdrop-blur-sm hidden"></div>
         <h1 className="text-[36px] font-black text-[#6c6c6c] tracking-widest italic mb-4 text-shadow-sticker">欢迎来到食用手册!</h1>
         <h2 className="text-[36px] font-black text-[#6c6c6c] tracking-widest italic text-shadow-sticker">请选择您的身份</h2>
      </div>

      <div className="absolute bottom-[40px] w-full flex flex-col items-center space-y-8 z-20">
        <AppButton 
          onClick={() => handleSelect('NOOB')}
          className="w-[220px] h-[54px] flex flex-row items-center justify-center gap-2"
        >
           <span className="text-xl font-bold text-[#6c6c6c]">厨房小白</span>
           <span className="text-sm font-normal text-[#6c6c6c]">(首次使用)</span>
        </AppButton>

        <AppButton 
          onClick={() => handleSelect('PRO')}
          className="w-[220px] h-[54px] flex flex-row items-center justify-center gap-2"
        >
           <span className="text-xl font-bold text-[#6c6c6c]">厨房大佬</span>
           <span className="text-sm font-normal text-[#6c6c6c]">(使用过)</span>
        </AppButton>
      </div>
    </MobileWrapper>
  );
};

export const LoginScreen: React.FC<SharedProps> = ({ navigate, goBack, setUser }) => {
  // 从本地存储加载用户信息作为初始值
  const loadSavedUser = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedUser = localStorage.getItem('edibleManual_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          return {
            username: userData.username || '',
            password: userData.password || ''
          };
        }
      }
    } catch (e) {
      console.error('Failed to load user data:', e);
    }
    return { username: '', password: '' };
  };

  const savedData = loadSavedUser();
  const [username, setUsername] = React.useState(savedData.username);
  const [password, setPassword] = React.useState(savedData.password);
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

  // 组件挂载时再次检查并加载（确保数据是最新的）
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedUser = localStorage.getItem('edibleManual_user');
        console.log('Loading user data from localStorage:', savedUser);
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          console.log('Parsed user data:', userData);
          if (userData.username) {
            setUsername(userData.username);
            console.log('Set username to:', userData.username);
          }
          if (userData.password) {
            setPassword(userData.password);
            console.log('Set password (length):', userData.password.length);
          }
        } else {
          console.log('No saved user data found in localStorage');
        }
      } else {
        console.warn('localStorage is not available');
      }
    } catch (e) {
      console.error('Failed to load user data:', e);
    }
  }, []);

  const handleLogin = () => {
    // 验证密码和确认密码是否一致
    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError('密码与确认密码不一致，请重新输入');
      return;
    }
    
    // 如果密码为空，使用默认值（兼容旧逻辑）
    const finalUsername = username || 'vante';
    const finalPassword = password || '123456';
    
    const userData = {
      username: finalUsername,
      password: finalPassword,
      type: 'NOOB' as const
    };
    
    // 保存用户信息到本地存储
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const dataToSave = JSON.stringify(userData);
        localStorage.setItem('edibleManual_user', dataToSave);
        console.log('Saved user data to localStorage:', dataToSave);
        // 验证保存是否成功
        const verify = localStorage.getItem('edibleManual_user');
        console.log('Verified saved data:', verify);
      } else {
        console.warn('localStorage is not available, cannot save user data');
      }
    } catch (e) {
      console.error('Failed to save user data:', e);
    }
    
    setUser(userData);
    setPasswordError('');
    navigate(ScreenName.WIZARD_VEG);
  };

  return (
    <MobileWrapper className="items-center relative">
       {/* Avatar */}
       <div className="absolute top-[130px] w-[234px] h-[234px] bg-white rounded-full flex items-center justify-center shadow-hard z-10">
           <LucideUser size={140} className="text-[#9ca3af]" strokeWidth={2} />
       </div>

       {/* Form */}
       <div className="absolute top-[430px] w-full px-10 space-y-8">
         <AppInput 
            label="账户名：" 
            placeholder="请输入" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
         />
         
         <AppInput 
            label="密码：" 
            type="password" 
            placeholder="请输入" 
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              // 实时验证密码一致性
              if (confirmPassword && e.target.value && e.target.value !== confirmPassword) {
                setPasswordError('密码与确认密码不一致');
              } else {
                setPasswordError('');
              }
            }}
         />

         <div className="flex items-center">
           <span className="text-lg font-bold text-[#6c6c6c] w-[100px]">确认密码：</span>
           <input 
              type="password" 
              placeholder="请输入" 
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                // 实时验证密码一致性
                if (password && e.target.value && password !== e.target.value) {
                  setPasswordError('密码与确认密码不一致');
                } else {
                  setPasswordError('');
                }
              }}
              className="flex-1 h-12 px-4 rounded bg-white/80 focus:outline-none text-[#6c6c6c] placeholder-[#9a9a9a] border border-transparent focus:border-[#bbbbbb]"
           />
         </div>
         {passwordError && (
           <div className="text-red-500 text-sm mt-[-20px] px-2">
             {passwordError}
           </div>
         )}
       </div>

       {/* Buttons */}
       <div className="absolute bottom-[120px] w-full px-12 flex justify-between">
          <AppButton 
            className="w-[140px] h-[48px] text-xl" 
            onClick={handleLogin}
          >
            确认
          </AppButton>
          <AppButton 
            className="w-[140px] h-[48px] text-xl" 
            variant="white" 
            onClick={goBack}
          >
            返回
          </AppButton>
       </div>
    </MobileWrapper>
  );
};
