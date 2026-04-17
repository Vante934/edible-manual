
import React, { useState } from 'react';
import { MobileWrapper, AppHeader, BottomNav, AppButton } from '../components/Shared';
import { SharedProps, ScreenName } from '../types';
import { Search, Star, Plus, Minus, User as UserIcon } from 'lucide-react';
import { getDiscoverySuggestion } from '../services/geminiService';

export const RecipeListScreen: React.FC<SharedProps> = ({ navigate, recipes, toggleFavorite }) => {
    const [filter, setFilter] = useState<'ALL' | 'FAV'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredRecipes = recipes.filter(recipe => {
        // 1. Search query filter
        const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (recipe.ingredients && recipe.ingredients.some(ing => ing.includes(searchQuery)));
        // 2. Tab filter
        const matchesTab = filter === 'ALL' ? true : recipe.isFavorite;
        
        return matchesSearch && matchesTab;
    });

    const handleRecipeClick = (title: string) => {
        window.open(`https://search.bilibili.com/all?keyword=${encodeURIComponent(title)}`, '_blank');
    };

    return (
        <MobileWrapper>
            <AppHeader onBack={() => navigate(ScreenName.WIZARD_VEG)} className="pl-2" />
            <div className="px-6 pb-24 overflow-y-auto no-scrollbar h-full">
                {/* Search */}
                <div className="relative mb-6 px-2">
                    <div className="shadow-hard rounded-[30px]">
                        <input 
                            className="w-full h-[50px] rounded-[30px] pl-6 pr-12 bg-white/80 focus:outline-none text-[#6c6c6c] placeholder-[#9a9a9a] text-lg"
                            placeholder="请输入"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Search className="absolute right-6 top-3 text-[#9a9a9a]" strokeWidth={2.5} size={26} />
                </div>

                {/* Tabs */}
                <div className="flex mb-8 w-[263px] h-[32px] mx-auto shadow-hard rounded-sm overflow-hidden border border-[#54BCBD]">
                    <button 
                        onClick={() => setFilter('ALL')}
                        className={`flex-1 font-bold transition-colors flex items-center justify-center text-base italic ${filter === 'ALL' ? 'bg-[#54BCBD] text-white' : 'bg-white text-[#54BCBD]'}`}
                    >
                        全部
                    </button>
                    <button 
                        onClick={() => setFilter('FAV')}
                        className={`flex-1 font-bold transition-colors flex items-center justify-center text-base italic ${filter === 'FAV' ? 'bg-[#54BCBD] text-white' : 'bg-white text-[#54BCBD]'}`}
                    >
                        收藏
                    </button>
                </div>

                {/* List */}
                <div className="space-y-6 px-2">
                    {filteredRecipes.length === 0 ? (
                        <div className="text-center text-[#9a9a9a] italic pt-10">
                            {filter === 'FAV' ? '还没有收藏的菜谱哦~' : '没有找到相关菜谱'}
                        </div>
                    ) : (
                        filteredRecipes.map((recipe, index) => (
                            <div 
                                key={recipe.id} 
                                className="border-b border-[#bbbbbb] pb-2 flex justify-between items-center group transition-colors animate-pop-in"
                                style={{ animationDelay: `${index * 0.05}s` }}
                            >
                                <span 
                                    onClick={() => handleRecipeClick(recipe.title)}
                                    className="text-xl font-black text-[#6c6c6c] italic tracking-widest cursor-pointer active:opacity-60"
                                >
                                    {recipe.title}
                                </span>
                                <button onClick={() => toggleFavorite(recipe.id)} className="p-2 -mr-2">
                                    <Star 
                                        className={recipe.isFavorite ? "text-[#FFD700] fill-[#FFD700]" : "text-gray-300"} 
                                        size={28}
                                        strokeWidth={2}
                                    />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <BottomNav activeTab={ScreenName.RECIPE_LIST} onNavigate={navigate} />
        </MobileWrapper>
    );
};

export const DiscoveryScreen: React.FC<SharedProps> = ({ navigate }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [rolling, setRolling] = useState(false);
    const [count, setCount] = useState(1);

    const handleRandom = async () => {
        setRolling(true);
        setSuggestions([]);
        await new Promise(r => setTimeout(r, 300)); // 减少延迟时间，提高响应速度
        
        // 优化：一次性获取所有建议，而不是循环调用
        // 如果 count > 1，一次性获取多个菜名（用逗号分隔）
        try {
            const result = await getDiscoverySuggestion(count);
            // 处理返回的字符串（可能是多个菜名用逗号分隔）
            const dishList = result.split(/[,，]/).map(d => d.trim()).filter(d => d.length > 0);
            
            // 如果获取的数量不够，补充默认值
            while (dishList.length < count) {
                dishList.push("红烧肉");
            }
            
            setSuggestions(dishList.slice(0, count));
        } catch (error) {
            // 如果出错，使用默认值
            const fallback = Array(count).fill("红烧肉");
            setSuggestions(fallback);
        }
        
        setRolling(false);
    };

    return (
        <MobileWrapper>
             <AppHeader onBack={() => navigate(ScreenName.WIZARD_VEG)} className="pl-2" />
            <div className="flex flex-col items-center px-4 pt-4 h-full pb-24 relative">
                
                {/* Title Box */}
                <div className="w-full bg-[#FEFA83]/60 h-[83px] flex items-center justify-center shadow-hard mb-8 relative -mx-4">
                    <h1 className="text-[48px] font-black text-[#6c6c6c] text-center italic tracking-widest z-10 transform -skew-x-6 text-shadow-sticker">今天吃什么？</h1>
                </div>

                {/* Selector */}
                <div className="flex items-center justify-center w-full bg-[#33a1de]/0 py-2 mb-6">
                    <span className="text-[32px] font-bold text-[#6c6c6c] italic mr-4">想要</span>
                    <button className="w-8 h-8 border border-[#bbbbbb] rounded bg-white flex items-center justify-center shadow-sm active:scale-95" onClick={() => count > 1 && setCount(c => c-1)}><Minus size={16} /></button>
                    <span className="text-[32px] mx-4 text-[#6c6c6c] font-mono">{count}</span>
                    <button className="w-8 h-8 border border-[#bbbbbb] rounded bg-white flex items-center justify-center shadow-sm active:scale-95" onClick={() => count < 7 && setCount(c => c+1)}><Plus size={16} /></button>
                    <span className="text-[32px] font-bold text-[#6c6c6c] italic ml-4">个选择</span>
                </div>

                {/* Dashed Box Area */}
                <div className="w-[348px] h-[389px] border-[4px] border-dashed border-[#6c6c6c] flex flex-col items-center justify-center p-6 relative mb-8 space-y-4 overflow-hidden">
                     {rolling ? (
                        <div className="text-2xl font-bold animate-pulse text-app-gray">...</div>
                     ) : suggestions.length > 0 ? (
                         suggestions.map((s, i) => (
                             <div 
                                key={i} 
                                className="bg-[#FEFA83]/80 w-[90%] py-2 px-6 rounded-[30px_0_30px_0] shadow-hard transform -rotate-1 flex justify-center animate-pop-in"
                                style={{ animationDelay: `${i * 0.1}s` }}
                             >
                                 <span className="text-xl font-black text-[#6c6c6c] italic truncate">{s}</span>
                             </div>
                         ))
                     ) : (
                         // Empty State or Initial State
                         <>
                            <div className="bg-[#FEFA83]/80 w-[90%] py-3 px-6 rounded-[30px_0_30px_0] shadow-hard transform -rotate-2 opacity-0"></div>
                         </>
                     )}
                </div>

                <AppButton onClick={handleRandom} className="w-[140px] h-[45px] text-lg bg-[#FEFA83]/80 rounded-[5px] shadow-hard relative italic font-black text-[#6c6c6c] flex items-center justify-center">
                    Let's 随机
                </AppButton>
            </div>
            <BottomNav activeTab={ScreenName.DISCOVERY} onNavigate={navigate} />
        </MobileWrapper>
    );
};

export const ProfileScreen: React.FC<SharedProps> = ({ navigate, user, goBack }) => {
    return (
        <MobileWrapper>
            <div className="w-full h-[80px] bg-[#efffd6]"></div> {/* Spacer for Top Bar */}
            <div className="px-8 pt-4 pb-24 overflow-y-auto no-scrollbar relative flex flex-col items-center">
                
                {/* User Card */}
                <div className="bg-white/60 rounded-[4px] p-4 shadow-hard mb-8 relative w-[334px] h-[242px] flex flex-col">
                    <div className="flex justify-between items-start">
                        <div className="space-y-4 mt-6 ml-2">
                             <div className="bg-[#6c6c6c]/50 text-white px-2 h-[32px] flex items-center justify-center rounded-[16px] text-lg font-bold italic w-[148px]">
                                 名字：{user?.username || 'vante'}
                             </div>
                             <div className="bg-[#6c6c6c]/50 text-white px-2 h-[32px] flex items-center justify-center rounded-[16px] text-lg font-bold italic w-[148px]">
                                 密码：{user?.password || '123456'}
                             </div>
                        </div>
                        <div className="w-[115px] h-[119px] bg-[#6c6c6c]/50 rounded-[10px] flex items-center justify-center mr-2 mt-2">
                            <UserIcon size={70} className="text-white" strokeWidth={2} />
                        </div>
                    </div>
                    <div className="mt-auto mb-4 bg-[#6c6c6c]/50 text-white px-4 h-[32px] flex items-center justify-center rounded-[16px] text-lg font-bold italic w-[285px] mx-auto">
                        个性签名： 饭！一定要吃！
                    </div>
                </div>

                {/* Dev Card */}
                <div className="bg-white/60 rounded-[4px] p-4 shadow-hard mb-8 relative w-[334px] h-[242px] flex flex-col">
                    <div className="flex justify-between items-start">
                        <div className="space-y-4 mt-6 ml-2">
                             <div className="bg-[#6c6c6c]/50 text-white px-2 h-[32px] flex items-center justify-center rounded-[16px] text-lg font-bold italic w-[148px]">
                                 制作：赵香雪
                             </div>
                             <div className="bg-[#6c6c6c]/50 text-white px-2 h-[32px] flex items-center justify-center rounded-[16px] text-lg font-bold italic w-[148px]">
                                 设计：赵香雪
                             </div>
                        </div>
                        <div className="w-[115px] h-[119px] bg-[#6c6c6c]/50 rounded-[10px] flex items-center justify-center mr-2 mt-2">
                             <div className="flex flex-col items-center justify-center">
                                 <div className="w-8 h-8 bg-white rounded-full mb-1"></div>
                                 <div className="w-12 h-6 bg-white rounded-t-full"></div>
                             </div>
                        </div>
                    </div>
                    <div className="mt-auto mb-4 bg-[#6c6c6c]/50 text-white px-4 h-[32px] flex items-center justify-center rounded-[16px] text-lg font-bold italic w-[285px] mx-auto">
                        个性签名： nice~
                    </div>
                </div>

            </div>
            <BottomNav activeTab={ScreenName.PROFILE} onNavigate={navigate} />
        </MobileWrapper>
    );
};
