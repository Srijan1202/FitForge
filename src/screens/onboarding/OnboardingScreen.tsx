import React, { useState, useEffect } from 'react';
import { View, Text, Input, XStack, YStack, styled, ScrollView } from 'tamagui';
import { Button } from '../../components/ui/Button';
import { useUserStore, FitnessGoal } from '../../store/useUserStore';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';

const HUDInput = styled(Input, {
  backgroundColor: '$bgSurface',
  borderColor: '$borderHairline',
  borderWidth: 1,
  borderRadius: '$2',
  color: '$textPrimary',
  fontFamily: '$mono',
  fontSize: '$2',
  paddingHorizontal: '$4',
  height: 50,
  
  focusStyle: {
    borderColor: '$accentPrimary',
    borderWidth: 1,
  },
});

const GoalCard = styled(YStack, {
  backgroundColor: '$bgSurface',
  borderColor: '$borderHairline',
  borderWidth: 1,
  borderRadius: '$3',
  padding: '$4',
  flex: 1,
  minWidth: '45%',
  gap: '$1',
  pressStyle: {
    scale: 0.98,
    opacity: 0.9,
  },
  
  variants: {
    selected: {
      true: {
        borderColor: '$accentPrimary',
        backgroundColor: '$bgSurfaceRaised',
        shadowColor: '$accentGlow',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 15,
      },
    },
  } as const,
});

export const OnboardingScreen = () => {
  const storeName = useUserStore((state) => state.name);
  const saveProfile = useUserStore((state) => state.saveProfile);
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  const [step, setStep] = useState(1);
  
  // Step 1: Biometrics
  const [name, setName] = useState(storeName || '');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  
  // Step 2: Goal
  const [goal, setGoal] = useState<FitnessGoal>('general');
  
  // Step 3: Macros
  const [calories, setCalories] = useState('2000');
  const [protein, setProtein] = useState('150');
  const [carbs, setCarbs] = useState('200');
  const [fats, setFats] = useState('65');

  const [error, setError] = useState<string | null>(null);

  // Recalculate macro defaults dynamically when step 1 inputs or step 2 goal changes
  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseInt(age, 10);
    
    if (!isNaN(w) && !isNaN(h) && !isNaN(a)) {
      // Neutral BMR average
      const bmr = 10 * w + 6.25 * h - 5 * a - 78;
      const tdee = Math.round(bmr * 1.375); // moderate activity

      let targetCalories = tdee;
      if (goal === 'bulk') targetCalories += 500;
      else if (goal === 'cut') targetCalories -= 500;
      targetCalories = Math.max(1200, targetCalories);

      // Protein: 2.0g per kg of bodyweight
      const targetProtein = Math.round(w * 2.0);
      const proteinKcal = targetProtein * 4;

      // Fat: 25% of total calories
      const targetFats = Math.round((targetCalories * 0.25) / 9);
      const fatsKcal = targetFats * 9;

      // Carbs: remaining calories
      const targetCarbs = Math.max(50, Math.round((targetCalories - proteinKcal - fatsKcal) / 4));

      // Sync calorie count exactly to matching macro sum
      const actualCalories = (targetProtein * 4) + (targetCarbs * 4) + (targetFats * 9);

      setCalories(actualCalories.toString());
      setProtein(targetProtein.toString());
      setCarbs(targetCarbs.toString());
      setFats(targetFats.toString());
    }
  }, [weight, height, age, goal]);

  // Handle validation for Step 1
  const handleStep1Next = () => {
    if (!name.trim()) {
      setError('Operator designation required.');
      return;
    }
    const a = parseInt(age, 10);
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (isNaN(a) || a <= 0 || a > 120) {
      setError('Invalid age metrics.');
      return;
    }
    if (isNaN(w) || w <= 0 || w > 500) {
      setError('Invalid weight metrics.');
      return;
    }
    if (isNaN(h) || h <= 0 || h > 300) {
      setError('Invalid height metrics.');
      return;
    }

    setError(null);
    setStep(2);
  };

  // Handle validation for Step 3
  const handleStep3Next = () => {
    const cal = parseInt(calories, 10);
    const pro = parseInt(protein, 10);
    const cb = parseInt(carbs, 10);
    const ft = parseInt(fats, 10);

    if (isNaN(cal) || cal < 800) {
      setError('Min 800 daily calories required.');
      return;
    }
    if (isNaN(pro) || pro < 20) {
      setError('Min 20g protein required.');
      return;
    }
    if (isNaN(cb) || cb < 20) {
      setError('Min 20g carbs required.');
      return;
    }
    if (isNaN(ft) || ft < 10) {
      setError('Min 10g fat required.');
      return;
    }

    setError(null);
    setStep(4);
  };

  // Complete onboarding and save to local state / SQLite / Supabase
  const handleCommit = async () => {
    try {
      await saveProfile({
        name,
        age: parseInt(age, 10),
        weight_kg: parseFloat(weight),
        height_cm: parseFloat(height),
        fitness_goal: goal,
        daily_calories: parseInt(calories, 10),
        daily_protein_g: parseInt(protein, 10),
        daily_carbs_g: parseInt(carbs, 10),
        daily_fats_g: parseInt(fats, 10),
      });
      completeOnboarding();
    } catch (err: any) {
      setError('Commit failure: ' + (err.message || err.toString()));
    }
  };

  return (
    <View flex={1} bg="$background">
      <ScrollView contentContainerStyle={{ padding: 24, paddingTop: 60, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        
        {/* Header HUD System */}
        <YStack ai="center" mb="$6">
          <Text 
            color="$accentPrimary" 
            fontSize="$5" 
            fontFamily="$heading" 
            textShadowColor="$accentGlow"
            textShadowRadius={8}
            textShadowOffset={{ width: 0, height: 0 }}
          >
            SYSTEM CALIBRATION
          </Text>
          <Text color="$textSecondary" fontSize="$1" fontFamily="$body" mt="$1">
            FITFORGE HUD INITIALIZATION • STEP {step} / 4
          </Text>
        </YStack>

        {/* Progress Bar HUD */}
        <XStack gap="$2" mb="$6" w="100%">
          {[1, 2, 3, 4].map((i) => (
            <View 
              key={i} 
              flex={1} 
              h={4} 
              bg={i <= step ? '$accentPrimary' : '$textDisabled'} 
              br="$1"
              shadowColor={i <= step ? '$accentGlow' : 'transparent'}
              shadowRadius={6}
              shadowOpacity={i <= step ? 1 : 0}
            />
          ))}
        </XStack>

        {/* Step Content */}
        <YStack gap="$4" flex={1}>
          
          {/* Step 1: Biometrics */}
          {step === 1 && (
            <YStack gap="$4">
              <Text color="$textSecondary" fontSize="$2" fontFamily="$body" mb="$2">
                Enter target metrics to calibrate physical status.
              </Text>
              
              <YStack gap="$1">
                <Text color="$textSecondary" fontSize="$1" fontFamily="$body">OPERATOR NAME</Text>
                <HUDInput 
                  placeholder="e.g. John Doe" 
                  value={name} 
                  onChangeText={setName} 
                />
              </YStack>

              <YStack gap="$1">
                <Text color="$textSecondary" fontSize="$1" fontFamily="$body">AGE (YEARS)</Text>
                <HUDInput 
                  placeholder="e.g. 28" 
                  value={age} 
                  onChangeText={setAge} 
                  keyboardType="numeric"
                />
              </YStack>

              <XStack gap="$3">
                <YStack flex={1} gap="$1">
                  <Text color="$textSecondary" fontSize="$1" fontFamily="$body">WEIGHT (KG)</Text>
                  <HUDInput 
                    placeholder="e.g. 80" 
                    value={weight} 
                    onChangeText={setWeight} 
                    keyboardType="numeric"
                  />
                </YStack>
                
                <YStack flex={1} gap="$1">
                  <Text color="$textSecondary" fontSize="$1" fontFamily="$body">HEIGHT (CM)</Text>
                  <HUDInput 
                    placeholder="e.g. 180" 
                    value={height} 
                    onChangeText={setHeight} 
                    keyboardType="numeric"
                  />
                </YStack>
              </XStack>
            </YStack>
          )}

          {/* Step 2: Goal Selector */}
          {step === 2 && (
            <YStack gap="$4">
              <Text color="$textSecondary" fontSize="$2" fontFamily="$body" mb="$2">
                Select core physical vector directive.
              </Text>

              <XStack flexWrap="wrap" gap="$3">
                <GoalCard selected={goal === 'bulk'} onPress={() => setGoal('bulk')}>
                  <Text fontFamily="$heading" fontSize="$3" color={goal === 'bulk' ? '$accentPrimary' : '$textPrimary'}>
                    BULK
                  </Text>
                  <Text fontFamily="$body" fontSize="$1" color="$textSecondary">
                    Caloric surplus targeting progressive hypertrophy.
                  </Text>
                </GoalCard>

                <GoalCard selected={goal === 'cut'} onPress={() => setGoal('cut')}>
                  <Text fontFamily="$heading" fontSize="$3" color={goal === 'cut' ? '$accentPrimary' : '$textPrimary'}>
                    CUT
                  </Text>
                  <Text fontFamily="$body" fontSize="$1" color="$textSecondary">
                    Deficit protocol targeting lipid reduction.
                  </Text>
                </GoalCard>

                <GoalCard selected={goal === 'maintain'} onPress={() => setGoal('maintain')}>
                  <Text fontFamily="$heading" fontSize="$3" color={goal === 'maintain' ? '$accentPrimary' : '$textPrimary'}>
                    RECOMP
                  </Text>
                  <Text fontFamily="$body" fontSize="$1" color="$textSecondary">
                    Caloric maintenance for structural shift.
                  </Text>
                </GoalCard>

                <GoalCard selected={goal === 'general'} onPress={() => setGoal('general')}>
                  <Text fontFamily="$heading" fontSize="$3" color={goal === 'general' ? '$accentPrimary' : '$textPrimary'}>
                    HUD MAINT
                  </Text>
                  <Text fontFamily="$body" fontSize="$1" color="$textSecondary">
                    Standard baseline physical conditioning metrics.
                  </Text>
                </GoalCard>
              </XStack>
            </YStack>
          )}

          {/* Step 3: Macro Calibration */}
          {step === 3 && (
            <YStack gap="$4">
              <Text color="$textSecondary" fontSize="$2" fontFamily="$body" mb="$2">
                Adjust baseline computed macronutrient vectors.
              </Text>

              <YStack gap="$3" bg="$bgSurface" p="$4" br="$3" borderWidth={1} borderColor="$borderHairline">
                <XStack jc="space-between" ai="center" pb="$2" borderBottomWidth={1} borderBottomColor="$borderHairline">
                  <Text color="$textSecondary" fontFamily="$body" fontSize="$1">TOTAL BASELINE ENERGY</Text>
                  <Text color="$accentPrimary" fontFamily="$mono" fontSize="$3">{calories} KCAL</Text>
                </XStack>

                <XStack gap="$3">
                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">PROTEIN (G)</Text>
                    <HUDInput 
                      value={protein} 
                      onChangeText={(val) => {
                        setProtein(val);
                        const p = parseInt(val, 10) || 0;
                        const c = parseInt(carbs, 10) || 0;
                        const f = parseInt(fats, 10) || 0;
                        setCalories(((p * 4) + (c * 4) + (f * 9)).toString());
                      }} 
                      keyboardType="numeric"
                    />
                  </YStack>

                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">CARBS (G)</Text>
                    <HUDInput 
                      value={carbs} 
                      onChangeText={(val) => {
                        setCarbs(val);
                        const p = parseInt(protein, 10) || 0;
                        const c = parseInt(val, 10) || 0;
                        const f = parseInt(fats, 10) || 0;
                        setCalories(((p * 4) + (c * 4) + (f * 9)).toString());
                      }} 
                      keyboardType="numeric"
                    />
                  </YStack>

                  <YStack flex={1} gap="$1">
                    <Text color="$textSecondary" fontSize="$1" fontFamily="$body">FAT (G)</Text>
                    <HUDInput 
                      value={fats} 
                      onChangeText={(val) => {
                        setFats(val);
                        const p = parseInt(protein, 10) || 0;
                        const c = parseInt(carbs, 10) || 0;
                        const f = parseInt(val, 10) || 0;
                        setCalories(((p * 4) + (c * 4) + (f * 9)).toString());
                      }} 
                      keyboardType="numeric"
                    />
                  </YStack>
                </XStack>
                
                <Text color="$textSecondary" fontSize="$1" fontFamily="$body" textAlign="center" mt="$1">
                  1g Protein = 4 kcal • 1g Carb = 4 kcal • 1g Fat = 9 kcal
                </Text>
              </YStack>
            </YStack>
          )}

          {/* Step 4: Verification Grid */}
          {step === 4 && (
            <YStack gap="$4">
              <Text color="$textSecondary" fontSize="$2" fontFamily="$body" mb="$2">
                Verify system operational calibration specs.
              </Text>

              <YStack gap="$3" bg="$bgSurface" p="$4" br="$3" borderWidth={1} borderColor="$borderHairline">
                <Text color="$accentPrimary" fontFamily="$heading" fontSize="$3" mb="$2">CALIBRATION SUMMARY</Text>
                
                <XStack jc="space-between" py="$2" borderBottomWidth={1} borderBottomColor="$borderHairline">
                  <Text color="$textSecondary" fontFamily="$body" fontSize="$2">OPERATOR</Text>
                  <Text color="$textPrimary" fontFamily="$mono" fontSize="$2">{name.toUpperCase()}</Text>
                </XStack>

                <XStack jc="space-between" py="$2" borderBottomWidth={1} borderBottomColor="$borderHairline">
                  <Text color="$textSecondary" fontFamily="$body" fontSize="$2">BIOMETRICS</Text>
                  <Text color="$textPrimary" fontFamily="$mono" fontSize="$2">{age} YRS • {height} CM • {weight} KG</Text>
                </XStack>

                <XStack jc="space-between" py="$2" borderBottomWidth={1} borderBottomColor="$borderHairline">
                  <Text color="$textSecondary" fontFamily="$body" fontSize="$2">DIRECTIVE GOAL</Text>
                  <Text color="$accentPrimary" fontFamily="$mono" fontSize="$2">{goal.toUpperCase()}</Text>
                </XStack>

                <XStack jc="space-between" py="$2" borderBottomWidth={1} borderBottomColor="$borderHairline">
                  <Text color="$textSecondary" fontFamily="$body" fontSize="$2">ENERGY ALLOCATION</Text>
                  <Text color="$textPrimary" fontFamily="$mono" fontSize="$2">{calories} KCAL</Text>
                </XStack>

                <XStack jc="space-between" py="$2">
                  <Text color="$textSecondary" fontFamily="$body" fontSize="$2">MACRONUTRIENTS</Text>
                  <Text color="$textPrimary" fontFamily="$mono" fontSize="$2">
                    P: {protein}g | C: {carbs}g | F: {fats}g
                  </Text>
                </XStack>
              </YStack>

              <View 
                bg="$bgSurfaceRaised" 
                borderColor="$accentDim" 
                borderWidth={1} 
                br="$2" 
                p="$3"
                ai="center"
              >
                <Text color="$accentPrimary" fontFamily="$mono" fontSize="$1" textAlign="center">
                  WARNING: METRICS COMMIT WILL SHIFT LIVE HUB BUDGET TARGETS.
                </Text>
              </View>
            </YStack>
          )}

        </YStack>

        {/* Error HUD Message */}
        {error && (
          <View 
            bg="$bgSurface" 
            borderColor="$stateError" 
            borderWidth={1} 
            br="$2" 
            p="$3"
            my="$4"
          >
            <Text color="$stateError" fontFamily="$mono" fontSize="$1">
              SYS ERROR: {error.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Nav Controls */}
        <XStack gap="$3" mt="$6">
          {step > 1 && (
            <Button 
              title="BACK" 
              variant="secondary"
              flex={1}
              onPress={() => {
                setError(null);
                setStep(step - 1);
              }}
            />
          )}
          
          {step === 1 && (
            <Button 
              title="NEXT PROTOCOL" 
              flex={1}
              onPress={handleStep1Next}
            />
          )}

          {step === 2 && (
            <Button 
              title="NEXT PROTOCOL" 
              flex={1}
              onPress={() => setStep(3)}
            />
          )}

          {step === 3 && (
            <Button 
              title="NEXT PROTOCOL" 
              flex={1}
              onPress={handleStep3Next}
            />
          )}

          {step === 4 && (
            <Button 
              title="INITIALIZE SYSTEM HUD" 
              flex={1}
              onPress={handleCommit}
            />
          )}
        </XStack>

      </ScrollView>
    </View>
  );
};
