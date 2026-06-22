import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Input, XStack, YStack, styled, useTheme } from 'tamagui';
import { Card, CardTitle, CardSubtitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../store/useUserStore';
import { useNutritionStore, NutritionLog } from '../../store/useNutritionStore';
import { Sparkles, Plus, Trash2, Calendar, ShieldAlert, Check, Flame, Compass } from 'lucide-react-native';
import { TouchableOpacity, Alert } from 'react-native';

const HUDInput = styled(Input, {
  backgroundColor: '$bgSurface',
  borderColor: '$borderHairline',
  borderWidth: 1,
  borderRadius: '$2',
  color: '$textPrimary',
  fontFamily: '$mono',
  fontSize: '$2',
  paddingHorizontal: '$3',
  height: 44,
  
  focusStyle: {
    borderColor: '$accentPrimary',
    borderWidth: 1,
  },
});

const ProgressBar = ({ 
  label, 
  value, 
  target, 
  unit = 'g' 
}: { 
  label: string; 
  value: number; 
  target: number; 
  unit?: string 
}) => {
  const percent = Math.min(100, target > 0 ? (value / target) * 100 : 0);
  const isOverload = value > target;

  return (
    <YStack gap="$1" w="100%">
      <XStack jc="space-between" ai="center">
        <Text color="$textSecondary" fontSize="$1" fontFamily="$body">{label.toUpperCase()}</Text>
        <Text color={isOverload ? '$stateWarning' : '$textPrimary'} fontSize="$1" fontFamily="$mono">
          {value} / {target} {unit.toUpperCase()} {isOverload ? '[OVERLOAD]' : percent === 100 ? '[MAXED]' : ''}
        </Text>
      </XStack>
      <View h={8} bg="$bgBase" br="$1" borderWidth={1} borderColor="$borderHairline" overflow="hidden">
        <View 
          h="100%" 
          bg={isOverload ? '$stateWarning' : '$accentPrimary'} 
          w={`${percent}%`} 
          br="$1" 
          shadowColor={isOverload ? '$stateWarning' : '$accentGlow'}
          shadowRadius={6}
          shadowOpacity={1}
        />
      </View>
    </YStack>
  );
};

// Local parsing dictionary
const LOCAL_FOOD_CATALOG: Record<string, { name: string; calories: number; protein: number; carbs: number; fats: number }> = {
  egg: { name: 'Large Egg', calories: 75, protein: 6.3, carbs: 0.6, fats: 5.0 },
  eggs: { name: 'Large Egg', calories: 75, protein: 6.3, carbs: 0.6, fats: 5.0 },
  toast: { name: 'Slice of Toast', calories: 80, protein: 3.0, carbs: 15.0, fats: 1.0 },
  bread: { name: 'Slice of Bread', calories: 80, protein: 3.0, carbs: 15.0, fats: 1.0 },
  chicken: { name: 'Chicken Breast (100g)', calories: 165, protein: 31.0, carbs: 0, fats: 3.6 },
  breast: { name: 'Chicken Breast (100g)', calories: 165, protein: 31.0, carbs: 0, fats: 3.6 },
  rice: { name: 'Cooked White Rice (150g)', calories: 200, protein: 4.0, carbs: 44.0, fats: 0.4 },
  milk: { name: 'Glass of Milk (240ml)', calories: 120, protein: 8.0, carbs: 12.0, fats: 5.0 },
  banana: { name: 'Banana', calories: 105, protein: 1.3, carbs: 27.0, fats: 0.3 },
  bananas: { name: 'Banana', calories: 105, protein: 1.3, carbs: 27.0, fats: 0.3 },
  oats: { name: 'Rolled Oats (40g)', calories: 150, protein: 5.0, carbs: 27.0, fats: 2.5 },
  oatmeal: { name: 'Rolled Oats (40g)', calories: 150, protein: 5.0, carbs: 27.0, fats: 2.5 },
  peanut: { name: 'Peanut Butter (1 tbsp)', calories: 95, protein: 3.5, carbs: 3.0, fats: 8.0 },
  butter: { name: 'Peanut Butter (1 tbsp)', calories: 95, protein: 3.5, carbs: 3.0, fats: 8.0 },
  whey: { name: 'Whey Protein (1 scoop)', calories: 120, protein: 24.0, carbs: 3.0, fats: 1.5 },
  protein: { name: 'Whey Protein (1 scoop)', calories: 120, protein: 24.0, carbs: 3.0, fats: 1.5 },
  apple: { name: 'Apple', calories: 95, protein: 0.5, carbs: 25.0, fats: 0.3 },
  apples: { name: 'Apple', calories: 95, protein: 0.5, carbs: 25.0, fats: 0.3 },
  shake: { name: 'Whey Protein (1 scoop)', calories: 120, protein: 24.0, carbs: 3.0, fats: 1.5 },
  // Indian & Hostel Food Catalog
  dosa: { name: 'Dosa', calories: 120, protein: 3.0, carbs: 24.0, fats: 2.0 },
  chapathi: { name: 'Chapathi', calories: 90, protein: 3.0, carbs: 18.0, fats: 1.0 },
  roti: { name: 'Roti', calories: 90, protein: 3.0, carbs: 18.0, fats: 1.0 },
  paneer: { name: 'Paneer Curry', calories: 250, protein: 12.0, carbs: 6.0, fats: 20.0 },
  biryani: { name: 'Biryani', calories: 350, protein: 15.0, carbs: 50.0, fats: 10.0 },
  dal: { name: 'Dal Curry', calories: 150, protein: 8.0, carbs: 22.0, fats: 4.0 },
  poori: { name: 'Poori', calories: 100, protein: 2.0, carbs: 15.0, fats: 4.5 },
  vada: { name: 'Vada', calories: 120, protein: 3.0, carbs: 14.0, fats: 6.0 },
  pongal: { name: 'Pongal', calories: 250, protein: 6.0, carbs: 40.0, fats: 8.0 },
  kichadi: { name: 'Kichadi', calories: 220, protein: 5.0, carbs: 38.0, fats: 6.0 },
  curd: { name: 'Curd', calories: 60, protein: 3.2, carbs: 4.0, fats: 3.0 },
  sambar: { name: 'Sambar', calories: 80, protein: 2.5, carbs: 12.0, fats: 2.0 },
  burger: { name: 'Burger', calories: 280, protein: 8.0, carbs: 40.0, fats: 10.0 },
  puff: { name: 'Puff', calories: 200, protein: 3.0, carbs: 24.0, fats: 10.0 },
  donut: { name: 'Donut', calories: 250, protein: 3.0, carbs: 30.0, fats: 13.0 },
  idly: { name: 'Idly', calories: 60, protein: 1.5, carbs: 12.0, fats: 0.2 },
};

const parseFoodInput = (text: string) => {
  const normalized = text.toLowerCase();
  const parts = normalized.split(/,|\band\b|\bwith\b|\bplus\b/);
  
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFats = 0;
  const matchedNames: string[] = [];

  parts.forEach((part) => {
    const trimmed = part.trim();
    if (!trimmed) return;

    let qty = 1;
    const numMatch = trimmed.match(/^(\d+(\.\d+)?)\b/);
    if (numMatch) {
      qty = parseFloat(numMatch[1]);
    } else if (trimmed.startsWith('a ') || trimmed.startsWith('an ') || trimmed.startsWith('one ')) {
      qty = 1;
    } else if (trimmed.startsWith('two ')) {
      qty = 2;
    } else if (trimmed.startsWith('three ')) {
      qty = 3;
    }

    let matched = false;
    for (const key in LOCAL_FOOD_CATALOG) {
      if (trimmed.includes(key)) {
        const item = LOCAL_FOOD_CATALOG[key];
        totalCalories += item.calories * qty;
        totalProtein += item.protein * qty;
        totalCarbs += item.carbs * qty;
        totalFats += item.fats * qty;
        matchedNames.push(`${qty}x ${item.name}`);
        matched = true;
        break;
      }
    }

    if (!matched) {
      let nameWithoutQty = trimmed;
      if (numMatch) {
        nameWithoutQty = trimmed.substring(numMatch[0].length).trim();
      } else if (trimmed.startsWith('a ')) {
        nameWithoutQty = trimmed.substring(2).trim();
      } else if (trimmed.startsWith('an ')) {
        nameWithoutQty = trimmed.substring(3).trim();
      } else if (trimmed.startsWith('one ')) {
        nameWithoutQty = trimmed.substring(4).trim();
      } else if (trimmed.startsWith('two ')) {
        nameWithoutQty = trimmed.substring(4).trim();
      } else if (trimmed.startsWith('three ')) {
        nameWithoutQty = trimmed.substring(6).trim();
      }
      
      const displayName = nameWithoutQty.charAt(0).toUpperCase() + nameWithoutQty.slice(1);
      totalCalories += 150 * qty;
      totalProtein += 5.0 * qty;
      totalCarbs += 20.0 * qty;
      totalFats += 5.0 * qty;
      matchedNames.push(`${qty}x Generic ${displayName}`);
    }
  });

  return {
    success: true,
    description: matchedNames.join(', ') || text,
    calories: Math.round(totalCalories),
    protein: parseFloat(totalProtein.toFixed(1)),
    carbs: parseFloat(totalCarbs.toFixed(1)),
    fats: parseFloat(totalFats.toFixed(1)),
  };
};

const HIGH_PROTEIN_KEYWORDS = [
  { words: ['chicken', 'non-veg', 'mutton', 'egg', 'fish'], protein: 25, label: 'High Protein (Animal Source)' },
  { words: ['paneer', 'tofu', 'soya', 'soy'], protein: 18, label: 'High Protein (Veg Source)' },
  { words: ['dal', 'chana', 'rajma', 'sprouts', 'lentil', 'sambhar', 'sambar', 'peas'], protein: 8, label: 'Moderate Protein (Legumes)' },
  { words: ['milk', 'curd', 'lassi', 'kheer'], protein: 6, label: 'Dairy Protein Source' }
];

const analyzeProteinInMenu = (menu: any[]) => {
  const proteinDishes: { mealLabel: string; dish: string; estProtein: number; type: string }[] = [];
  
  menu.forEach((meal: any) => {
    const mealLabel = meal.type === 1 ? 'BREAKFAST' : meal.type === 2 ? 'LUNCH' : meal.type === 3 ? 'SNACKS' : 'DINNER';
    const dishes = meal.menu.split(',').map((d: string) => d.trim()).filter((d: string) => d.length > 0);
    
    dishes.forEach((dish: string) => {
      const lowerDish = dish.toLowerCase();
      for (const group of HIGH_PROTEIN_KEYWORDS) {
        if (group.words.some(word => lowerDish.includes(word))) {
          proteinDishes.push({
            mealLabel,
            dish,
            estProtein: group.protein,
            type: group.label
          });
          break;
        }
      }
    });
  });
  
  return proteinDishes;
};

export const NutritionScreen = () => {
  const theme = useTheme();
  
  // Budget selectors
  const dailyCaloriesTarget = useUserStore((state) => state.daily_calories);
  const dailyProteinTarget = useUserStore((state) => state.daily_protein_g);
  const dailyCarbsTarget = useUserStore((state) => state.daily_carbs_g);
  const dailyFatsTarget = useUserStore((state) => state.daily_fats_g);

  // Nutrition logs store selectors
  const logs = useNutritionStore((state) => state.logs);
  const loadingLogs = useNutritionStore((state) => state.loading);
  const fetchLogs = useNutritionStore((state) => state.fetchDailyLogs);
  const addLog = useNutritionStore((state) => state.addLog);
  const deleteLog = useNutritionStore((state) => state.deleteLog);

  // View state
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  });
  
  const [isManualMode, setIsManualMode] = useState(false);
  const [parsingLoading, setParsingLoading] = useState(false);

  // AI input states
  const [aiText, setAiText] = useState('');
  
  // Manual input states
  const [desc, setDesc] = useState('');
  const [cals, setCals] = useState('');
  const [prot, setProt] = useState('');
  const [carb, setCarb] = useState('');
  const [fat, setFat] = useState('');

  const [error, setError] = useState<string | null>(null);

  const defaultHostel = useUserStore((state) => state.hostel) || '1';
  const defaultMess = useUserStore((state) => state.mess) || '1';
  const fitnessGoal = useUserStore((state) => state.fitness_goal) || 'general';

  // VIT Mess Menu State
  const [selectedHostel, setSelectedHostel] = useState(defaultHostel);
  const [selectedMess, setSelectedMess] = useState(defaultMess);
  const [vitMenuData, setVitMenuData] = useState<any[]>([]);
  const [vitMenuLoading, setVitMenuLoading] = useState(false);
  const [vitMenuError, setVitMenuError] = useState<string | null>(null);

  // Sync state with store default values if they change (e.g. edited via Profile Editor Modal)
  useEffect(() => {
    setSelectedHostel(defaultHostel);
    setSelectedMess(defaultMess);
  }, [defaultHostel, defaultMess]);

  const fetchVitMenu = async (h = selectedHostel, m = selectedMess) => {
    setVitMenuLoading(true);
    setVitMenuError(null);
    try {
      const response = await fetch(`https://messit.vinnovateit.com/menu-data/hostel-${h}-mess-${m}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      if (json && json.menu) {
        setVitMenuData(json.menu);
      } else {
        setVitMenuData([]);
        throw new Error('Menu list not found in JSON');
      }
    } catch (err: any) {
      console.error('[NutritionScreen] VIT Mess Menu fetch error:', err);
      setVitMenuError(err.message || 'Network fault fetching mess menu.');
    } finally {
      setVitMenuLoading(false);
    }
  };

  const getTodayMessMenu = () => {
    if (!vitMenuData || vitMenuData.length === 0) return null;
    const dayStr = selectedDate.split('-')[2];
    if (!dayStr) return null;
    const match = vitMenuData.find(item => {
      const itemDay = item.date.split('-')[2];
      return itemDay === dayStr;
    });
    return match ? match.menu : null;
  };

  const todayMessMenu = getTodayMessMenu();

  // Load mess menu on selected hostel/mess change (including initial mount with profile defaults)
  useEffect(() => {
    fetchVitMenu(selectedHostel, selectedMess);
  }, [selectedHostel, selectedMess]);

  // Load logs on date changes
  useEffect(() => {
    fetchLogs(selectedDate);
  }, [selectedDate]);

  // Aggregate daily consumed macros
  const consumedCals = logs.reduce((acc, curr) => acc + curr.calories, 0);
  const consumedProtein = logs.reduce((acc, curr) => acc + curr.protein_g, 0);
  const consumedCarbs = logs.reduce((acc, curr) => acc + curr.carbs_g, 0);
  const consumedFats = logs.reduce((acc, curr) => acc + curr.fats_g, 0);

  const calRemaining = dailyCaloriesTarget - consumedCals;
  const isCalsOverload = consumedCals > dailyCaloriesTarget;
  const calPercent = Math.min(100, (consumedCals / dailyCaloriesTarget) * 100);

  // Handle AI food parser execution
  const handleAIParse = async () => {
    if (!aiText.trim()) {
      setError('Please enter a meal description.');
      return;
    }

    setError(null);
    setParsingLoading(true);

    // Dynamic NLP local generator parsing (with hybrid remote fetch stub)
    setTimeout(async () => {
      try {
        const result = parseFoodInput(aiText);
        
        if (!result.success) {
          // Food not matching keyword dictionary, prompt manual override
          setError('DIRECTIVE UNRESOLVED. SWITCH TO MANUAL SPEC ENTRY.');
          setIsManualMode(true);
          setDesc(aiText);
          setParsingLoading(false);
          return;
        }

        // Write parsed macros to database
        await addLog({
          log_date: selectedDate,
          description: result.description,
          calories: result.calories,
          protein_g: result.protein,
          carbs_g: result.carbs,
          fats_g: result.fats,
          source: 'ai_parsed',
        });

        setAiText('');
        setParsingLoading(false);
        Alert.alert('MEAL LOGGED', `${result.description.toUpperCase()} added successfully.`);
      } catch (err: any) {
        setError('Parser system fault: ' + err.toString());
        setParsingLoading(false);
      }
    }, 800); // 800ms loading effect for tech telemetry feel
  };

  // Handle Manual Log Submission
  const handleManualSubmit = async () => {
    if (!desc.trim() || !cals || !prot || !carb || !fat) {
      setError('Please fill out all manual specification fields.');
      return;
    }

    const c = parseInt(cals, 10);
    const p = parseFloat(prot);
    const cb = parseFloat(carb);
    const f = parseFloat(fat);

    if (isNaN(c) || c < 0 || isNaN(p) || p < 0 || isNaN(cb) || cb < 0 || isNaN(f) || f < 0) {
      setError('Invalid numeric metrics entered.');
      return;
    }

    try {
      setError(null);
      await addLog({
        log_date: selectedDate,
        description: desc.trim(),
        calories: c,
        protein_g: p,
        carbs_g: cb,
        fats_g: f,
        source: 'manual',
      });

      // Clear fields
      setDesc('');
      setCals('');
      setProt('');
      setCarb('');
      setFat('');
      setIsManualMode(false);
    } catch (err: any) {
      setError('Manual log commit failure: ' + err.toString());
    }
  };

  const remainingProtein = Math.max(0, dailyProteinTarget - consumedProtein);
  const proteinDishes = todayMessMenu ? analyzeProteinInMenu(todayMessMenu) : [];

  return (
    <View flex={1} bg="$background">
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 40, paddingBottom: 80 }} keyboardShouldPersistTaps="handled">
        
        {/* Screen Header */}
        <XStack jc="space-between" ai="center" mb="$4" mt="$4">
          <YStack>
            <Text color="$color" fontSize="$5" fontFamily="$heading">NUTRITION HUD</Text>
            <Text color="$textSecondary" fontSize="$1" fontFamily="$body">
              DAILY ENERGY METRIC BALANCER
            </Text>
          </YStack>
          
          <XStack bg="$bgSurface" py="$1" px="$3" br="$2" borderWidth={1} borderColor="$borderHairline" ai="center" gap="$1.5">
            <Calendar size={12} color={theme.accentPrimary.get() as string} />
            <Text color="$accentPrimary" fontSize="$1" fontFamily="$mono" fontWeight="bold">
              {selectedDate.substring(5)}
            </Text>
          </XStack>
        </XStack>

        {/* Card 1: Concentric Progress Budgets Meter */}
        <Card mb="$4" raised>
          <YStack gap="$4" ai="center" py="$4">
            
            {/* Calorie Progress Ring Emulator (Horizontal Bar styled dynamically) */}
            <YStack ai="center" w="100%" gap="$1">
              <XStack ai="flex-end" gap="$1.5">
                <Text 
                  color={isCalsOverload ? '$stateWarning' : '$textPrimary'} 
                  fontFamily="$heading" 
                  fontSize="$5" 
                  fontWeight="bold"
                >
                  {consumedCals}
                </Text>
                <Text color="$textSecondary" fontFamily="$body" fontSize="$2" mb="$1.5">
                  / {dailyCaloriesTarget} KCAL
                </Text>
              </XStack>
              <Text color="$textSecondary" fontFamily="$body" fontSize="$1">
                {isCalsOverload ? `ENERGY OVERLOAD: +${Math.abs(calRemaining)} KCAL` : `BUDGET REMAINING: ${calRemaining} KCAL`}
              </Text>

              {/* Main Calorie bar */}
              <View w="90%" h={14} bg="$bgBase" br="$2" borderWidth={1} borderColor="$borderHairline" mt="$2" overflow="hidden">
                <View 
                  h="100%" 
                  bg={isCalsOverload ? '$stateWarning' : '$accentPrimary'} 
                  w={`${calPercent}%`}
                  shadowColor={isCalsOverload ? '$stateWarning' : '$accentGlow'}
                  shadowRadius={12}
                  shadowOpacity={1}
                />
              </View>
            </YStack>

            <XStack w="100%" h={1} bg="$borderHairline" my="$2" />

            {/* Concentric Macro Progress list */}
            <YStack w="100%" gap="$3" px="$2">
              <ProgressBar label="Protein" value={consumedProtein} target={dailyProteinTarget} />
              <ProgressBar label="Carbs" value={consumedCarbs} target={dailyCarbsTarget} />
              <ProgressBar label="Fats" value={consumedFats} target={dailyFatsTarget} />
            </YStack>

          </YStack>
        </Card>

        {/* Card 2: AI Parser Console */}
        <Card mb="$4">
          <XStack ai="center" gap="$2" mb="$2">
            <Sparkles size={16} color={theme.accentPrimary.get() as string} />
            <CardTitle>LOG FOOD (AI)</CardTitle>
          </XStack>
          <CardSubtitle mb="$3">Calibrate nutrition vectors using natural directives.</CardSubtitle>

          <YStack gap="$3">
            {!isManualMode ? (
              <YStack gap="$3">
                <HUDInput 
                  placeholder="e.g. 2 eggs and 1 glass of milk..." 
                  value={aiText} 
                  onChangeText={setAiText}
                  disabled={parsingLoading}
                />
                
                <XStack gap="$3">
                  <Button 
                    title={parsingLoading ? 'PARSING DIRECTIVES...' : 'PARSE MEAL PROTOCOL'} 
                    flex={1}
                    disabled={parsingLoading}
                    onPress={handleAIParse}
                  />
                  <TouchableOpacity onPress={() => setIsManualMode(true)} style={{ justifyContent: 'center' }}>
                    <View bg="$bgSurfaceRaised" py="$3" px="$4" br="$2" borderWidth={1} borderColor="$borderHairline" h="100%" jc="center">
                      <Text color="$textSecondary" fontFamily="$heading" fontSize="$1" fontWeight="bold">MANUAL</Text>
                    </View>
                  </TouchableOpacity>
                </XStack>
              </YStack>
            ) : (
              <YStack gap="$3" p="$3" bg="$bgSurfaceRaised" br="$2" borderWidth={1} borderColor="$borderHairline">
                <Text color="$accentPrimary" fontFamily="$mono" fontSize="$1" fontWeight="bold">MANUAL OVERRIDE INTERFACE</Text>
                
                <YStack gap="$1">
                  <Text color="$textSecondary" fontSize="$1" fontFamily="$body">FOOD DESCRIPTION</Text>
                  <HUDInput placeholder="e.g. Tuna Salad" value={desc} onChangeText={setDesc} />
                </YStack>

                <XStack gap="$3">
                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">CALORIES (KCAL)</Text>
                    <HUDInput placeholder="0" value={cals} onChangeText={setCals} keyboardType="numeric" />
                  </YStack>
                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">PROTEIN (G)</Text>
                    <HUDInput placeholder="0" value={prot} onChangeText={setProt} keyboardType="numeric" />
                  </YStack>
                </XStack>

                <XStack gap="$3">
                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">CARBS (G)</Text>
                    <HUDInput placeholder="0" value={carb} onChangeText={setCarb} keyboardType="numeric" />
                  </YStack>
                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">FATS (G)</Text>
                    <HUDInput placeholder="0" value={fat} onChangeText={setFat} keyboardType="numeric" />
                  </YStack>
                </XStack>

                <XStack gap="$3" mt="$2">
                  <Button title="LOG PROTOCOL MEAL" flex={2} onPress={handleManualSubmit} />
                  <Button title="CANCEL" flex={1} variant="secondary" onPress={() => { setIsManualMode(false); setError(null); }} />
                </XStack>
              </YStack>
            )}

            {error && (
              <XStack bg="$bgSurface" borderColor="$stateError" borderWidth={1} br="$2" p="$2.5" ai="center" gap="$2">
                <ShieldAlert size={14} color={theme.stateError.get() as string} />
                <Text color="$stateError" fontFamily="$mono" fontSize="$1" flex={1}>
                  SYS WARNING: {error.toUpperCase()}
                </Text>
              </XStack>
            )}
          </YStack>
        </Card>

        {/* Card 3: VIT Mess Menu integration */}
        <Card mb="$4">
          <XStack ai="center" gap="$2" mb="$2">
            <Calendar size={16} color={theme.accentPrimary.get() as string} />
            <CardTitle>VIT MESS MENU DIRECTIVE</CardTitle>
          </XStack>
          <CardSubtitle mb="$3">Load daily hostel mess meals and tap to auto-fill logging parser.</CardSubtitle>

          <YStack gap="$3">
            <XStack gap="$3">
              {/* Hostel Select */}
              <YStack flex={1} gap="$1">
                <Text color="$textSecondary" fontSize="$1" fontFamily="$body">HOSTEL</Text>
                <XStack bg="$bgSurface" br="$2" p="$1" borderWidth={1} borderColor="$borderHairline">
                  <TouchableOpacity onPress={() => setSelectedHostel('1')} style={{ flex: 1 }}>
                    <View py="$2" ai="center" br="$1" bg={selectedHostel === '1' ? '$bgSurfaceRaised' : 'transparent'}>
                      <Text fontFamily="$heading" fontSize="$1" color={selectedHostel === '1' ? '$accentPrimary' : '$textSecondary'}>HOSTEL 1</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedHostel('2')} style={{ flex: 1 }}>
                    <View py="$2" ai="center" br="$1" bg={selectedHostel === '2' ? '$bgSurfaceRaised' : 'transparent'}>
                      <Text fontFamily="$heading" fontSize="$1" color={selectedHostel === '2' ? '$accentPrimary' : '$textSecondary'}>HOSTEL 2</Text>
                    </View>
                  </TouchableOpacity>
                </XStack>
              </YStack>

              {/* Mess Select */}
              <YStack flex={1.5} gap="$1">
                <Text color="$textSecondary" fontSize="$1" fontFamily="$body">MESS TYPE</Text>
                <XStack bg="$bgSurface" br="$2" p="$1" borderWidth={1} borderColor="$borderHairline">
                  <TouchableOpacity onPress={() => setSelectedMess('1')} style={{ flex: 1 }}>
                    <View py="$2" ai="center" br="$1" bg={selectedMess === '1' ? '$bgSurfaceRaised' : 'transparent'}>
                      <Text fontFamily="$heading" fontSize="$1" color={selectedMess === '1' ? '$accentPrimary' : '$textSecondary'}>MESS 1</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedMess('2')} style={{ flex: 1 }}>
                    <View py="$2" ai="center" br="$1" bg={selectedMess === '2' ? '$bgSurfaceRaised' : 'transparent'}>
                      <Text fontFamily="$heading" fontSize="$1" color={selectedMess === '2' ? '$accentPrimary' : '$textSecondary'}>MESS 2</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setSelectedMess('3')} style={{ flex: 1 }}>
                    <View py="$2" ai="center" br="$1" bg={selectedMess === '3' ? '$bgSurfaceRaised' : 'transparent'}>
                      <Text fontFamily="$heading" fontSize="$1" color={selectedMess === '3' ? '$accentPrimary' : '$textSecondary'}>MESS 3</Text>
                    </View>
                  </TouchableOpacity>
                </XStack>
              </YStack>
            </XStack>

            <Button 
              title={vitMenuLoading ? 'CONNECTING TO MESSIT API...' : 'FETCH VIT MESS DIARY'} 
              onPress={() => fetchVitMenu()}
              disabled={vitMenuLoading}
            />

            {vitMenuError && (
              <XStack bg="$bgSurface" borderColor="$stateError" borderWidth={1} br="$2" p="$2.5" ai="center" gap="$2">
                <ShieldAlert size={14} color={theme.stateError.get() as string} />
                <Text color="$stateError" fontFamily="$mono" fontSize="$1" flex={1}>
                  VIT NET FAULT: {vitMenuError.toUpperCase()}
                </Text>
              </XStack>
            )}

            {/* Menu details rendering */}
            {todayMessMenu ? (
              <YStack gap="$3" mt="$2" p="$3" bg="$bgSurfaceRaised" br="$2" borderWidth={1} borderColor="$borderHairline">
                <Text color="$accentPrimary" fontFamily="$mono" fontSize="$1" fontWeight="bold">
                  DIETARY DIRECTIVE: DAY {selectedDate.split('-')[2]} FEED
                </Text>
                
                {todayMessMenu.map((meal: any, idx: number) => {
                  const mealLabel = meal.type === 1 ? 'BREAKFAST' : meal.type === 2 ? 'LUNCH' : meal.type === 3 ? 'SNACKS' : 'DINNER';
                  const dishes = meal.menu.split(',').map((d: string) => d.trim()).filter((d: string) => d.length > 0);

                  return (
                    <YStack key={idx} gap="$1.5">
                      <Text color="$textSecondary" fontSize="$1" fontFamily="$heading">{mealLabel}</Text>
                      <XStack gap="$1.5" flexWrap="wrap">
                        {dishes.map((dish: string, dishIdx: number) => (
                          <TouchableOpacity 
                            key={dishIdx} 
                            onPress={() => {
                              setAiText(dish);
                              setIsManualMode(false);
                              setError(null);
                              Alert.alert('AUTO-FILL PROTOCOL', `"${dish.toUpperCase()}" loaded into parser. Tap Parse below.`);
                            }}
                          >
                            <View 
                              bg="$bgBase" 
                              px="$2" py="$1.5" 
                              br="$1" 
                              borderWidth={1} 
                              borderColor="$accentDim"
                              pressStyle={{ borderColor: '$accentPrimary' }}
                            >
                              <Text color="$textPrimary" fontSize="$1" fontFamily="$body">
                                {dish}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </XStack>
                    </YStack>
                  );
                })}
              </YStack>
            ) : (
              !vitMenuLoading && vitMenuData.length > 0 && (
                <Text color="$textSecondary" fontSize="$1" fontFamily="$body" textAlign="center" py="$2">
                  No mess data matching day {selectedDate.split('-')[2]} found.
                </Text>
              )
            )}

          </YStack>
        </Card>

        {/* AI PROTEIN OPTIMIZER */}
        <Card mb="$4" borderColor="$accentPrimary" borderWidth={1}>
          <XStack ai="center" gap="$2" mb="$2">
            <Sparkles size={16} color={theme.accentPrimary.get() as string} />
            <CardTitle>AI PROTEIN OPTIMIZER</CardTitle>
          </XStack>
          <CardSubtitle mb="$3">
            Real-time scanner matching remaining protein goals with today's mess menu items.
          </CardSubtitle>

          <YStack gap="$3">
            <XStack jc="space-between" ai="center" bg="$bgSurfaceRaised" p="$3" br="$2" borderWidth={1} borderColor="$borderHairline">
              <YStack>
                <Text color="$textSecondary" fontSize="$1" fontFamily="$body">REMAINING PROTEIN TARGET</Text>
                <Text color={remainingProtein > 0 ? '$accentPrimary' : '$textPrimary'} fontSize="$4" fontFamily="$mono" fontWeight="bold">
                  {remainingProtein.toFixed(1)}g
                </Text>
              </YStack>
              <View py="$1" px="$2.5" br="$1" bg={remainingProtein === 0 ? '$accentDim' : '$bgBase'} borderWidth={1} borderColor={remainingProtein === 0 ? '$accentPrimary' : '$borderHairline'}>
                <Text color={remainingProtein === 0 ? '$accentPrimary' : '$textSecondary'} fontSize="$1" fontFamily="$mono" fontWeight="bold">
                  {remainingProtein === 0 ? 'TARGET MET' : 'INCOMPLETE'}
                </Text>
              </View>
            </XStack>

            {remainingProtein === 0 ? (
              <XStack bg="$bgSurface" borderColor="$accentPrimary" borderWidth={1} br="$2" p="$3" ai="center" gap="$2.5">
                <Check size={16} color={theme.accentPrimary.get() as string} />
                <Text color="$accentPrimary" fontFamily="$mono" fontSize="$1" flex={1}>
                  PROTEIN TARGET MET! DYNAMIC HYPERTROPHY RECOVERY ACTIVE. NO FURTHER PROTEIN INTAKE MANDATORY TODAY.
                </Text>
              </XStack>
            ) : !todayMessMenu ? (
              <XStack bg="$bgSurface" borderColor="$borderHairline" borderWidth={1} br="$2" p="$3" ai="center" gap="$2.5">
                <Calendar size={16} color={theme.textSecondary.get() as string} />
                <Text color="$textSecondary" fontFamily="$body" fontSize="$1" flex={1}>
                  No active mess menu loaded. Please fetch the VIT Mess Menu above to evaluate protein options.
                </Text>
              </XStack>
            ) : proteinDishes.length === 0 ? (
              <XStack bg="$bgSurface" borderColor="$stateWarning" borderWidth={1} br="$2" p="$3" ai="center" gap="$2.5">
                <ShieldAlert size={16} color={theme.stateWarning.get() as string} />
                <Text color="$stateWarning" fontFamily="$mono" fontSize="$1" flex={1}>
                  ALERT: NO HIGH-PROTEIN DISHES DETECTED IN TODAY'S MESS MENU. WE RECOMMEND ADDING 1 SCOOP WHEY (24g) OR 2-3 EGGS (12-18g) TO YOUR LOGS.
                </Text>
              </XStack>
            ) : (
              <YStack gap="$2">
                <Text color="$textSecondary" fontSize="$1" fontFamily="$heading">DETECTED MESS PROTEIN SOURCES</Text>
                {proteinDishes.map((item: any, idx: number) => (
                  <XStack key={idx} jc="space-between" ai="center" bg="$bgBase" p="$2" br="$1" borderWidth={1} borderColor="$accentDim">
                    <YStack flex={2}>
                      <Text color="$textPrimary" fontSize="$2" fontFamily="$body" fontWeight="bold">{item.dish.toUpperCase()}</Text>
                      <Text color="$textSecondary" fontSize="$1" fontFamily="$mono">{item.mealLabel} • {item.type}</Text>
                    </YStack>
                    <Text color="$accentPrimary" fontSize="$2" fontFamily="$mono" fontWeight="bold">+{item.estProtein}g P</Text>
                  </XStack>
                ))}
                
                <YStack mt="$2" p="$3" bg="$bgSurfaceRaised" br="$2" borderWidth={1} borderColor="$borderHairline" gap="$1">
                  <Text color="$accentPrimary" fontSize="$1" fontFamily="$mono" fontWeight="bold">AI DIETARY INSTRUCTION DIRECTIVE</Text>
                  <Text color="$textPrimary" fontSize="$1" fontFamily="$body" lineHeight={16}>
                    To close your remaining {remainingProtein.toFixed(1)}g protein gap, prioritize eating: {proteinDishes.map((d: any) => `${d.dish} (${d.mealLabel})`).slice(0, 3).join(', ')}. Tapping the items in the VIT Menu card above will auto-fill your tracker!
                  </Text>
                </YStack>
              </YStack>
            )}
          </YStack>
        </Card>

        {/* DIETARY RECOMMENDATIONS MATRIX */}
        <Card mb="$4">
          <XStack ai="center" gap="$2" mb="$2">
            {(() => {
              switch (fitnessGoal) {
                case 'bulk': return <Flame size={16} color={theme.accentPrimary.get() as string} />;
                case 'cut': return <Compass size={16} color={theme.accentPrimary.get() as string} />;
                default: return <Sparkles size={16} color={theme.accentPrimary.get() as string} />;
              }
            })()}
            <CardTitle>
              {fitnessGoal === 'bulk' && 'HYPERTROPHY DIETARY STRATEGY (BULK)'}
              {fitnessGoal === 'cut' && 'FAT LOSS DIETARY STRATEGY (CUT)'}
              {fitnessGoal === 'maintain' && 'BODY RECOMPOSITION STRATEGY (MAINTAIN)'}
              {fitnessGoal === 'general' && 'GENERAL HEALTH & FITNESS STRATEGY'}
            </CardTitle>
          </XStack>
          <CardSubtitle mb="$3">
            {fitnessGoal === 'bulk' && 'Targeting positive caloric surplus (+300 to +500 kcal) with high protein synthesis.'}
            {fitnessGoal === 'cut' && 'Targeting energy deficit (-300 to -500 kcal) while preserving lean tissue.'}
            {fitnessGoal === 'maintain' && 'Targeting metabolic equilibrium to trade fat for muscle tissue.'}
            {fitnessGoal === 'general' && 'Targeting clean nutrition, energy stability, and general wellness.'}
          </CardSubtitle>

          <YStack gap="$2.5">
            <YStack gap="$1.5">
              <Text color="$accentPrimary" fontSize="$1" fontFamily="$mono" fontWeight="bold">OPTIMAL FOOD SOURCES</Text>
              <Text color="$textPrimary" fontSize="$2" fontFamily="$body" lineHeight={16}>
                {fitnessGoal === 'bulk' && 'Peanut butter oats, chicken breast with rice, paneer curry with chapatis, protein shakes.'}
                {fitnessGoal === 'cut' && 'Egg white scramble, boiled chicken salad, protein shakes in water, low-fat paneer/tofu stir-fry.'}
                {fitnessGoal === 'maintain' && 'Oatmeal with fruit, fish/chicken with mixed vegetables, multi-grain wraps, curd and honey.'}
                {fitnessGoal === 'general' && 'Boiled eggs, brown rice with dal and mixed veg, fresh fruits with almonds, grilled paneer.'}
              </Text>
            </YStack>
            
            <YStack gap="$1.5" mt="$1">
              <Text color="$textSecondary" fontSize="$1" fontFamily="$heading">STRATEGY CHECKLIST</Text>
              {(() => {
                const tips = fitnessGoal === 'bulk' ? [
                  'Prioritize calorie-dense sources (nuts, peanut butter, whole grains).',
                  'Target 2.0g of protein per kg of bodyweight daily.',
                  'Maintain a carbohydrate-rich intake to fuel intense workout sessions.',
                ] : fitnessGoal === 'cut' ? [
                  'Focus on high-volume, low-calorie foods (leafy greens, fibrous vegetables).',
                  'Keep protein high (2.2g per kg) to prevent muscle catabolism.',
                  'Drink 3-4 liters of water to regulate satiety signals.',
                ] : fitnessGoal === 'maintain' ? [
                  'Maintain exact calorie balance matching your calculated TDEE.',
                  'Distribute protein intake evenly across 4-5 meals.',
                  'Adjust carbs up or down based on training volume intensity.',
                ] : [
                  'Consume a diverse range of whole foods (fruits, vegetables, lean proteins).',
                  'Limit refined sugars and processed artificial food items.',
                  'Listen to hunger cues and balance portion sizes naturally.',
                ];
                return tips.map((tip, idx) => (
                  <XStack key={idx} gap="$2" ai="flex-start">
                    <Text color="$accentPrimary" fontSize="$1" fontFamily="$mono">•</Text>
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body" flex={1} lineHeight={14}>
                      {tip}
                    </Text>
                  </XStack>
                ));
              })()}
            </YStack>
          </YStack>
        </Card>

        {/* Meal Logs Chronological Feed */}
        <Text color="$textSecondary" fontSize="$1" fontFamily="$body" mb="$2">DAILY DIRECTIVE FEED LOGS</Text>

        <YStack gap="$2.5">
          {logs.map((log) => (
            <Card key={log.id} p="$3" br="$2" bg="$bgSurface" borderWidth={1} borderColor="$borderHairline">
              <XStack jc="space-between" ai="center">
                <YStack flex={3} gap="$1">
                  <XStack ai="center" gap="$1.5">
                    {log.source === 'ai_parsed' ? (
                      <Sparkles size={10} color={theme.accentPrimary.get() as string} />
                    ) : (
                      <Check size={10} color={theme.textSecondary.get() as string} />
                    )}
                    <Text color="$textPrimary" fontFamily="$body" fontSize="$2" fontWeight="bold">
                      {log.description.toUpperCase()}
                    </Text>
                  </XStack>
                  <Text color="$textSecondary" fontFamily="$mono" fontSize="$1">
                    {log.calories} KCAL • P: {log.protein_g}g | C: {log.carbs_g}g | F: {log.fats_g}g
                  </Text>
                </YStack>

                <XStack flex={1} jc="flex-end">
                  <TouchableOpacity onPress={() => deleteLog(log.id)}>
                    <View bg="$bgSurfaceRaised" p="$2" br="$1" borderWidth={1} borderColor="$borderHairline">
                      <Trash2 size={14} color={theme.stateError.get() as string} />
                    </View>
                  </TouchableOpacity>
                </XStack>
              </XStack>
            </Card>
          ))}

          {logs.length === 0 && !loadingLogs && (
            <Card p="$4" borderStyle="dashed" ai="center" jc="center" py="$5">
              <Text color="$textDisabled" fontFamily="$mono" fontSize="$1">
                NO MEALS ENROLLED FOR ACTIVE MATRIX
              </Text>
            </Card>
          )}
        </YStack>

      </ScrollView>
    </View>
  );
};
