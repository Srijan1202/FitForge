import { View, Text, ScrollView, XStack, YStack } from 'tamagui';
import { LiveSetCard } from '../../components/ui/LiveSetCard';
import { Button } from '../../components/ui/Button';

export const WorkoutScreen = () => {
  return (
    <View flex={1} bg="$background">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <Text color="$color" fontSize="$4" fontFamily="$heading" mt="$6" mb="$1">Barbell Bench Press</Text>
        <Text color="$textSecondary" fontSize="$2" fontFamily="$body" mb="$4">Chest • Target: 3x8-12</Text>

        <YStack gap="$3" mb="$6">
          <LiveSetCard setNumber={1} totalSets={3} isActive={false} weight="135" reps="12" />
          <LiveSetCard setNumber={2} totalSets={3} isActive={true} weight="145" reps="" />
          <LiveSetCard setNumber={3} totalSets={3} isActive={false} weight="" reps="" />
        </YStack>
        
        <XStack jc="space-between" ai="center">
          <Button title="Rest Timer: 01:30" variant="secondary" />
          <Button title="Complete Set" variant="primary" />
        </XStack>
      </ScrollView>
    </View>
  );
};
