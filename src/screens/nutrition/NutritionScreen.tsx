import { View, Text, ScrollView, XStack, YStack } from 'tamagui';
import { Card, CardTitle, CardSubtitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const NutritionScreen = () => {
  return (
    <ScrollView flex={1} bg="$background" contentContainerStyle={{ padding: 16 }}>
      <Text color="$color" fontSize="$5" fontFamily="$heading" mb="$4" mt="$6">Nutrition</Text>
      
      <Card mb="$4" ai="center" jc="center" py="$6">
        <View 
          w={150} h={150} 
          br={999} 
          borderWidth={10} 
          borderColor="$accentPrimary" 
          ai="center" jc="center"
          shadowColor="$accentGlow"
          shadowRadius={24}
          shadowOpacity={1}
        >
          <Text color="$textPrimary" fontFamily="$heading" fontSize="$5">1,850</Text>
          <Text color="$textSecondary" fontFamily="$body" fontSize="$1">/ 2500 KCAL</Text>
        </View>
        
        <XStack mt="$6" gap="$6">
          <YStack ai="center">
            <Text color="$textPrimary" fontFamily="$mono">120g</Text>
            <Text color="$textSecondary" fontSize="$1">PRO</Text>
          </YStack>
          <YStack ai="center">
            <Text color="$textPrimary" fontFamily="$mono">200g</Text>
            <Text color="$textSecondary" fontSize="$1">CARB</Text>
          </YStack>
          <YStack ai="center">
            <Text color="$textPrimary" fontFamily="$mono">65g</Text>
            <Text color="$textSecondary" fontSize="$1">FAT</Text>
          </YStack>
        </XStack>
      </Card>

      <Card mb="$4">
        <CardTitle mb="$2">Log Food (AI)</CardTitle>
        <CardSubtitle mb="$3">Natural language parser</CardSubtitle>
        <View 
          bg="$bgSurfaceRaised" br="$2" p="$3" mb="$3"
          borderWidth={1} borderColor="$borderHairline"
        >
          <Text color="$textSecondary">e.g., "2 eggs and a slice of toast"</Text>
        </View>
        <Button title="Parse Macros" />
      </Card>
    </ScrollView>
  );
};
