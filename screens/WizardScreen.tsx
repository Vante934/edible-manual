
import React, { useState, useEffect } from 'react';
import { MobileWrapper, AppHeader, AppButton, BottomNav } from '../components/Shared';
import { SharedProps, ScreenName, SelectionState } from '../types';
import { Search, ChevronRight } from 'lucide-react';
import { generateRecipe } from '../services/geminiService';

interface WizardProps extends SharedProps {
  selection: SelectionState;
  setSelection: React.Dispatch<React.SetStateAction<SelectionState>>;
  setRecipeResult: (result: string) => void;
}

// --- DATABASE START ---

// Daily/Common Vegetables (Display by default)
// Reduced list to fit strictly above the search box line without scrolling
const DAILY_VEGETABLES = [
  '无', '土豆', '番茄', '黄瓜', '白菜', '青菜', 
  '胡萝卜', '茄子', '西兰花', '洋葱', '大蒜', '生姜', 
  '葱', '豆腐', '香菇'
];

// Full Vegetable Database (For Search)
const ALL_VEGETABLES = [
  '无',
  // 叶菜类
  '菠菜', '香菜', '生菜', '油菜', '油麦菜', '空心菜', '苋菜', '芥菜', '茼蒿', '韭菜', '芹菜', '白菜', '卷心菜', '紫甘蓝', '羽衣甘蓝', '西洋菜', '芝麻菜', '冰菜', '苦菊', '木耳菜', '红薯叶', '南瓜藤', '豌豆苗', '豆苗', '萝卜缨', '香椿芽', '花椒叶', '枸杞叶', '马齿苋', '荠菜', '蕨菜', '薇菜', '穿心莲', '紫背天葵', '富贵菜', '人参菜', '雪里蕻', '塌棵菜', '瓢儿菜', '京水菜', '观音菜', '紫苏叶', '薄荷叶', '九层塔', '罗勒', '欧芹', '迷迭香', '百里香', '莳萝', '鼠尾草', '牛至', '细香葱', '芦蒿', '水芹', '旱芹', '山芹菜', '鸭儿芹', '明日叶', '藤三七', '珍珠菜', '田七叶', '菊花脑', '柳蒿芽', '刺五加', '沙葱', '野蒜', '韭黄', '蒜黄',
  // 根茎类
  '胡萝卜', '白萝卜', '青萝卜', '心里美', '樱桃萝卜', '土豆', '红薯', '紫薯', '山药', '芋头', '莲藕', '荸荠', '慈姑', '洋葱', '大蒜', '生姜', '大葱', '小葱', '芦笋', '竹笋', '冬笋', '莴笋', '茭白', '牛蒡', '芜菁', '甜菜根', '婆罗门参', '菊芋', '魔芋', '木薯', '葛根', '粉葛', '洋姜', '沙葛', '凉薯', '茨菰', '甘露子', '草石蚕', '芋艿', '槟榔芋', '荔浦芋', '红菜头', '芜菁甘蓝', '美洲防风', '欧防风', '根芹菜', '鸦葱', '辣根', '山葵', '芥末', '姜黄', '高良姜', '沙姜', '美人腿', '茭儿菜', '蒲菜', '芦竹笋',
  // 果菜类
  '番茄', '黄瓜', '南瓜', '冬瓜', '苦瓜', '丝瓜', '西葫芦', '茄子', '辣椒', '甜椒', '秋葵', '玉米', '豌豆', '毛豆', '蚕豆', '扁豆', '豇豆', '四季豆', '荷兰豆', '刀豆', '蛇瓜', '佛手瓜', '金丝瓜', '砍瓜', '搅瓜', '节瓜', '毛瓜', '八棱瓜', '飞碟瓜', '香蕉瓜', '老鼠瓜', '辣椒叶', '南瓜花', '夜开花', '葫芦瓜', '癞葡萄', '金铃子', '人参果', '杨桃瓜', '五指山野菜', '树番茄', '酸浆', '灯笼果', '菇茑', '彩椒', '朝天椒', '小米椒', '杭椒', '线椒', '二荆条', '螺丝椒', '牛角椒',
  // 花菜类
  '花椰菜', '西兰花', '黄花菜', '朝鲜蓟', '菜薹', '紫菜薹', '芥蓝', '宝塔菜花', '松花菜', '白菜薹', '油菜薹', '韭菜花', '木槿花', '玫瑰花', '茉莉花', '槐花', '丁香花',
  // 菌菇类
  '香菇', '平菇', '金针菇', '杏鲍菇', '白玉菇', '蟹味菇', '秀珍菇', '草菇', '鸡腿菇', '牛肝菌', '松茸', '竹荪', '银耳', '黑木耳', '猴头菇', '茶树菇', '滑子菇', '姬松茸', '真姬菇', '海鲜菇', '鲍鱼菇', '凤尾菇', '白灵菇', '灰树花', '鸡枞菌', '干巴菌', '青头菌', '奶浆菌', '松露', '羊肚菌', '马勃', '榛蘑', '黄伞菇', '榆黄蘑', '猪肚菇', '金福菇', '绣球菌', '珊瑚菌', '虎掌菌', '老人头', '鸡油菌', '红菇', '喇叭菌', '北风菌', '冬菇', '花菇', '厚菇', '薄菇',
  // 豆制品及豆类
  '豆腐', '豆皮', '豆干', '腐竹', '面筋', '烤麸', '豆芽', '绿豆芽', '黄豆芽', '黑豆芽', '豌豆芽', '蚕豆芽', '纳豆', '天贝', '豆浆', '豆渣', '素鸡', '素鸭', '素火腿', '油豆腐', '冻豆腐', '臭豆腐', '毛豆腐', '豆腐脑', '豆腐乳', '豆豉', '鹰嘴豆', '赤小豆', '芸豆', '黑豆', '眉豆',
  // 海藻及水生类
  '海带', '紫菜', '裙带菜', '石花菜', '鹿角菜', '羊栖菜', '海白菜', '海芹菜', '海木耳', '发菜', '螺旋藻', '小球藻', '莼菜', '菱角', '芡实', '水蕨菜', '水芹菜', '水空心菜', '水韭菜', '水萝卜', '水芋', '水葵', '鸡头米',
  // 野生及特色类
  '刺嫩芽', '蒲公英', '灰灰菜', '苜蓿', '扫帚苗', '野苋菜', '车前草', '鱼腥草', '折耳根', '养心菜', '费菜', '景天三七', '神仙草', '长寿菜', '救心菜', '食用大黄', '大黄梗'
];

// Daily/Common Meats (Display by default)
// Reduced to fit above search box
const DAILY_MEATS = [
  '无', '猪肉', '排骨', '牛肉', '鸡肉', '鸡翅', '鸡蛋', 
  '鱼', '虾', '火腿', '香肠', '培根'
];

// Full Meat Database (For Search)
const ALL_MEATS = [
  '无',
  // 家畜类
  '猪肉', '猪排骨', '猪蹄', '猪肝', '猪肚', '猪腰', '猪耳', '猪舌', '猪心', '猪脑', '猪尾', '猪血', '猪大肠', '猪小肠', '猪皮', '猪油渣', '牛肉', '牛腩', '牛腱', '牛肚', '牛百叶', '牛舌', '牛心', '牛脑', '牛尾', '牛筋', '牛骨髓', '牛鞭', '牛蛋', '羊肉', '羊排', '羊腿', '羊杂', '羊蝎子', '羊腰', '羊肚', '羊肝', '羊心', '驴肉', '兔肉', '狗肉', '马肉',
  // 家禽类
  '鸡肉', '鸡胸肉', '鸡腿', '鸡翅', '鸡爪', '鸡脖', '鸡心', '鸡肝', '鸡胗', '鸡肠', '鸡血', '鸡皮', '鸡架', '鸡睾丸', '鸭肉', '鸭腿', '鸭翅', '鸭掌', '鸭脖', '鸭头', '鸭心', '鸭肝', '鸭胗', '鸭血', '鸭肠', '鹅肉', '鹅肝', '鹅胗', '鹅翅', '鹅掌', '鸽肉', '鹌鹑', '鹧鸪', '火鸡', '珍珠鸡', '鸵鸟肉', '鸸鹋肉', '野鸡',
  // 水产鱼类
  '鲤鱼', '草鱼', '鲫鱼', '鲈鱼', '鳜鱼', '鲑鱼', '金枪鱼', '带鱼', '黄花鱼', '鳕鱼', '罗非鱼', '多宝鱼', '石斑鱼', '秋刀鱼', '沙丁鱼', '马鲛鱼', '鳗鱼', '泥鳅', '黄鳝', '河豚', '青鱼', '鲢鱼', '鳙鱼', '鲶鱼', '黑鱼', '虹鳟鱼', '三文鱼', '比目鱼', '龙利鱼', '马面鱼', '剥皮鱼', '金线鱼', '红杉鱼', '老虎斑', '东星斑', '老鼠斑', '青衣鱼', '剥皮牛', '马头鱼', '方头鱼', '黄翅鱼', '黑鲷', '真鲷', '海鲈', '白鲳', '黑鲳', '刀鱼', '凤尾鱼', '银鱼', '柳叶鱼', '丁香鱼', '龙头鱼', '豆腐鱼', '九肚鱼', '巴浪鱼', '竹荚鱼', '午鱼', '章雄鱼', '油甘鱼', '鬼头刀', '旗鱼', '剑鱼',
  // 虾蟹贝类
  '对虾', '基围虾', '龙虾', '皮皮虾', '螃蟹', '大闸蟹', '青蟹', '花蛤', '蛏子', '牡蛎', '扇贝', '鲍鱼', '海参', '海胆', '田螺', '明虾', '草虾', '斑节虾', '白虾', '河虾', '小龙虾', '鳌虾', '牡丹虾', '甜虾', '帝王蟹', '面包蟹', '珍宝蟹', '雪蟹', '蓝蟹', '石蟹', '蟳', '梭子蟹', '文蛤', '青蛤', '白蛤', '油蛤', '贻贝', '青口', '海虹', '淡菜', '蛤蜊', '蚬子', '海瓜子', '象拔蚌', '北极贝', '鸟贝', '贵妃蚌', '蛏王', '竹蛏', '血蚶', '毛蚶', '泥蚶', '香螺', '辣螺', '东风螺',
  // 加工肉类
  '午餐肉', '香肠', '腊肠', '腊肉', '火腿', '培根', '肉松', '肉脯', '牛肉干', '酱牛肉', '卤鸡爪', '鸭脖', '鸡柳', '肉丸', '鱼丸'
];

// --- DATABASE END ---

const GRID_ITEMS_DAILY = {
  VEG: DAILY_VEGETABLES,
  MEAT: DAILY_MEATS,
  STAPLE: ['无', '面食', '米', '方便面', '馒头', '面包'],
  TOOL: ['空气炸锅', '烤箱', '微波炉', '电饭煲', '一口能炒又能煮的大锅']
};

const GRID_ITEMS_ALL = {
  VEG: ALL_VEGETABLES,
  MEAT: ALL_MEATS,
  // Staples and Tools don't usually have hundreds of options, so we keep them same
  STAPLE: GRID_ITEMS_DAILY.STAPLE,
  TOOL: GRID_ITEMS_DAILY.TOOL
};

export const WizardScreen: React.FC<WizardProps> = ({ 
  navigate, 
  goBack, 
  selection, 
  setSelection,
  setRecipeResult,
}) => {
  const [step, setStep] = useState<'VEG' | 'MEAT' | 'STAPLE' | 'TOOL'>('VEG');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset search query when stepping
  useEffect(() => {
      setSearchQuery('');
  }, [step]);

  const toggleItem = (category: 'vegetables' | 'meats' | 'staples', item: string) => {
    setSelection(prev => {
      const list = prev[category];
      
      // Logic for "None" (无)
      if (item === '无') {
          return { ...prev, [category]: ['无'] };
      }

      // If selecting a normal item, first remove '无' if it exists
      let newList = list.filter(i => i !== '无');
      
      if (newList.includes(item)) {
        newList = newList.filter(i => i !== item);
      } else {
        newList = [...newList, item];
      }
      
      return { ...prev, [category]: newList };
    });
  };

  const selectTool = (tool: string) => {
    setSelection(prev => ({ ...prev, tool }));
  };

  const handleNext = async () => {
    if (step === 'VEG') setStep('MEAT');
    else if (step === 'MEAT') setStep('STAPLE');
    else if (step === 'STAPLE') setStep('TOOL');
    else if (step === 'TOOL') {
      if (!selection.tool) {
          alert('请选择一种烹饪工具哦~');
          return;
      }

      setLoading(true);
      const result = await generateRecipe(selection);
      setRecipeResult(result);
      setLoading(false);
      navigate(ScreenName.RECIPE_RESULT);
    }
  };

  const handleBack = () => {
      if (step === 'VEG') goBack();
      if (step === 'MEAT') setStep('VEG');
      if (step === 'STAPLE') setStep('MEAT');
      if (step === 'TOOL') setStep('STAPLE');
  }

  // Config based on step
  let categoryTitle = "";
  let defaultItems: string[] = [];
  let allItems: string[] = [];
  let categoryKey: any = '';
  let isSingleSelect = false;
  let categoryIcon = null;

  switch (step) {
    case 'VEG':
      categoryTitle = "菜菜们";
      defaultItems = GRID_ITEMS_DAILY.VEG;
      allItems = GRID_ITEMS_ALL.VEG;
      categoryKey = 'vegetables';
      categoryIcon = <span className="text-3xl mr-2 mb-1">🥬</span>;
      break;
    case 'MEAT':
      categoryTitle = "肉肉们";
      defaultItems = GRID_ITEMS_DAILY.MEAT;
      allItems = GRID_ITEMS_ALL.MEAT;
      categoryKey = 'meats';
      categoryIcon = <span className="text-3xl mr-2 mb-1">🥩</span>;
      break;
    case 'STAPLE':
      categoryTitle = "主食也要一起下锅吗?\n(不选也行)";
      defaultItems = GRID_ITEMS_DAILY.STAPLE;
      allItems = GRID_ITEMS_ALL.STAPLE;
      categoryKey = 'staples';
      categoryIcon = <span className="text-3xl mr-2 mb-1">🍚</span>;
      break;
    case 'TOOL':
      categoryTitle = "再选下锅具";
      categoryIcon = <span className="text-3xl mr-2 mb-1">🥘</span>;
      defaultItems = GRID_ITEMS_DAILY.TOOL;
      allItems = GRID_ITEMS_ALL.TOOL;
      categoryKey = 'tool';
      isSingleSelect = true;
      break;
  }

  // Logic: Use Full Database if searching, otherwise Daily List
  const sourceList = searchQuery ? allItems : defaultItems;
  
  const filteredItems = sourceList.filter(item => 
      item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
      return (
        <MobileWrapper className="justify-center items-center">
             <div className="animate-bounce text-6xl mb-4">🍳</div>
             <h2 className="text-2xl font-bold text-[#6c6c6c] italic">AI大厨正在思考中...</h2>
        </MobileWrapper>
      )
  }

  // Layout config: Flex wrap for Veg/Meat (Cloud), Grid for Staple/Tool (Blocks)
  const isCloudLayout = step === 'VEG' || step === 'MEAT';

  return (
    <MobileWrapper>
      <AppHeader onBack={handleBack} />
      
      {/* Changed 'custom-scrollbar' to 'no-scrollbar' to hide it */}
      <div className="px-6 pb-24 h-full overflow-y-auto no-scrollbar relative flex flex-col">
        {/* Title Block */}
        <div className="relative mb-4">
            <div className="flex items-center text-[#6c6c6c]/80 text-xl italic font-bold mb-1 pl-2">
                 用美食开启美好的一天~
            </div>
            <div className="w-full h-[1px] bg-[#bbbbbb] mb-2"></div>
            
            <h2 className="text-[36px] font-black text-[#6c6c6c] italic text-center tracking-wider py-2">选择食材吧!</h2>
            
            <div className="w-full h-[1px] bg-[#bbbbbb] mt-2"></div>
        </div>

        {/* Category Header */}
        <div className="flex justify-center items-end mb-4 py-2 mx-auto w-fit px-6 relative">
            {categoryIcon}
            <h3 className={`font-bold text-[#6c6c6c] italic ${step === 'STAPLE' ? 'text-2xl whitespace-pre text-center' : 'text-3xl'}`}>{categoryTitle}</h3>
        </div>

        {/* Grid/Cloud Wrapper */}
        <div className="px-1 relative flex-1 min-h-[300px]">
            {/* If searching and lots of results, maybe stick to cloud layout */}
            <div className={isCloudLayout 
                ? "flex flex-wrap justify-center gap-4 px-1 content-start animate-pop-in" 
                : "grid grid-cols-2 gap-x-6 gap-y-5 auto-rows-min animate-pop-in px-2"
            }>
            {filteredItems.map((item, index) => {
                const isSelected = isSingleSelect 
                    ? selection.tool === item 
                    : (selection[categoryKey as keyof SelectionState] as string[]).includes(item);
                
                let bgClass = "bg-[#FEFA83]"; // Default
                let opacityClass = "bg-opacity-40"; // Default unselected opacity

                // Match Colors to Slice
                if (step === 'VEG') bgClass = "bg-[#9BCF53]"; 
                if (step === 'MEAT') bgClass = "bg-[#FF9B9B]";
                if (step === 'STAPLE' || step === 'TOOL') { bgClass = "bg-[#EFEFEF]"; opacityClass="bg-opacity-100"; }

                // Selected State Override
                if (isSelected) {
                    opacityClass = "bg-opacity-100 shadow-inner ring-2 ring-[#bbbbbb]";
                    if (step === 'VEG' || step === 'MEAT') opacityClass = "bg-opacity-100 shadow-none"; 
                } else {
                    if (step === 'VEG' || step === 'MEAT') opacityClass = "bg-opacity-40";
                }

                // Rotate randomly slightly for hand-drawn feel
                const rotation = isCloudLayout ? (index % 2 === 0 ? 'rotate-1' : '-rotate-1') : 'rotate-0';

                return (
                <button
                    key={item}
                    onClick={() => isSingleSelect ? selectTool(item) : toggleItem(categoryKey, item)}
                    className={`
                        ${bgClass} ${opacityClass} ${rotation}
                        rounded-[10px] shadow-hard text-[#6c6c6c] font-bold transition-all active:scale-95 hover:animate-wiggle
                        ${isCloudLayout ? 'h-[54px] px-6 text-xl w-auto min-w-[80px]' : 'h-[80px] w-full text-lg'}
                        flex items-center justify-center whitespace-nowrap
                    `}
                    style={{ animationDelay: `${Math.min(index * 0.02, 0.5)}s` }} // Staggered effect (capped)
                >
                    {item}
                </button>
                );
            })}
            {filteredItems.length === 0 && (
                <div className="w-full text-center text-[#9a9a9a] italic py-10">
                    没有找到 "{searchQuery}" 相关的食材
                </div>
            )}
            </div>
        </div>

        {!isSingleSelect && (
            <div className="mt-4 mb-4 text-center relative">
                 <div className="w-full h-[1px] bg-[#bbbbbb] absolute top-1/2 left-0 z-0"></div>
                 <span className="bg-app-bg px-4 relative z-10 text-[#6c6c6c] text-base font-bold italic">没有找到? 在这里输入吧~</span>
            </div>
        )}

        {/* Search Input - Real functionality */}
        <div className="relative mb-6 px-2">
            <div className="shadow-hard rounded-[30px]">
                <input 
                    type="text" 
                    placeholder="请输入" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-[50px] rounded-[30px] pl-6 pr-12 bg-white/80 focus:outline-none text-[#6c6c6c] placeholder-[#9a9a9a] border border-transparent focus:border-[#bbbbbb]"
                />
            </div>
            <Search className="absolute right-6 top-3 text-[#9a9a9a]" strokeWidth={2.5} size={26} />
        </div>

        {/* Next Button */}
        <div className="flex justify-center pb-4">
            <AppButton onClick={handleNext} className="w-[180px] h-[60px] text-2xl relative group bg-[#FEFA83]/80 rounded-[12px] shadow-hard">
                {step === 'TOOL' ? '选好了' : '选好了'} 
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6c6c6c]/50" size={32} />
            </AppButton>
        </div>
      </div>

      <BottomNav activeTab={ScreenName.WIZARD_VEG} onNavigate={navigate} />
    </MobileWrapper>
  );
};

export const RecipeResultScreen: React.FC<{ result: string } & SharedProps> = ({ result, navigate, goBack, addRecipes }) => {
    // Parse result
    const recipeNames = result.includes(',') ? result.split(',').map(s => s.trim()) : [result];
    // Fallback if parsing fails/is weird
    const displayRecipes = recipeNames.length > 0 ? recipeNames : ['番茄炒蛋'];

    // Add generated recipes to global list on mount
    useEffect(() => {
        const newRecipes = displayRecipes.map(title => ({
            id: Date.now().toString() + Math.random(),
            title: title,
            isFavorite: false
        }));
        addRecipes(newRecipes);
    }, []); // Run once

    const handleRecipeClick = (recipeName: string) => {
        window.open(`https://search.bilibili.com/all?keyword=${encodeURIComponent(recipeName)}`, '_blank');
    };

    return (
        <MobileWrapper>
            <AppHeader onBack={() => navigate(ScreenName.WIZARD_VEG)} />
            
            <div className="px-6 pb-24 h-full overflow-y-auto no-scrollbar relative flex flex-col">
                {/* Title Block */}
                <div className="relative mb-4">
                    <div className="flex items-center text-[#6c6c6c]/80 text-xl italic font-bold mb-1 pl-2">
                        用美食开启美好的一天~
                    </div>
                    <div className="w-full h-[1px] bg-[#bbbbbb] mb-2"></div>
                    
                    <div className="text-center py-4">
                        <h2 className="text-[36px] font-black text-[#6c6c6c] italic leading-tight">来看看组合出的<br/>菜谱吧!</h2>
                    </div>
                    
                    <div className="w-full h-[1px] bg-[#bbbbbb] mt-2"></div>
                </div>

                {/* Grid of Results */}
                <div className="grid grid-cols-2 gap-4 py-6 px-2">
                    {displayRecipes.map((recipe, index) => {
                        const isFullWidth = index === 4 || index === 9;
                        return (
                            <button 
                                key={index} 
                                onClick={() => handleRecipeClick(recipe)}
                                className={`bg-[#FFDC99] rounded-[6px] h-[50px] flex items-center justify-center shadow-hard active:scale-95 transition-transform animate-pop-in
                                ${isFullWidth ? 'col-span-2' : 'col-span-1'}`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <span className="text-[#6c6c6c] font-bold text-lg italic">{recipe}</span>
                            </button>
                        )
                    })}
                </div>

                {/* Action Button */}
                <div className="flex justify-center mt-8">
                    <AppButton onClick={() => navigate(ScreenName.RECIPE_LIST)} className="w-[180px] h-[60px] text-2xl bg-[#FEFA83]/80 rounded-[12px] shadow-hard relative">
                        做这个
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6c6c6c]/50" size={32} />
                    </AppButton>
                </div>
            </div>
            <BottomNav activeTab={ScreenName.WIZARD_VEG} onNavigate={navigate} />
        </MobileWrapper>
    )
}
