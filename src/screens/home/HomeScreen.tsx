import { View, Text, ScrollView } from 'tamagui';
import { Card, CardTitle, CardSubtitle } from '../../components/ui/Card';

export const HomeScreen = () => {
  return (
    <ScrollView flex={1} bg="$background" contentContainerStyle={{ padding: 16 }}>
      <Text color="$color" fontSize="$5" fontFamily="$heading" mb="$4" mt="$6">Today's Workout</Text>
      
      <Text color="$textSecondary" fontSize="$2" fontFamily="$body" mb="$2">PUSH DAY A</Text>
      
      <Card mb="$3">
        <CardTitle>Barbell Bench Press</CardTitle>
        <CardSubtitle>Chest • Barbell</CardSubtitle>
        <Text fontFamily="$mono" color="$accentPrimary" mt="$2">PR: 225x5</Text>
      </Card>
      
      <Card mb="$3">
        <CardTitle>Incline Dumbbell Press</CardTitle>
        <CardSubtitle>Upper Chest • Dumbbell</CardSubtitle>
        <Text fontFamily="$mono" color="$textSecondary" mt="$2">PR: 80x8</Text>
      </Card>
      
      <Card mb="$3">
        <CardTitle>Overhead Press</CardTitle>
        <CardSubtitle>Shoulders • Barbell</CardSubtitle>
        <Text fontFamily="$mono" color="$textSecondary" mt="$2">PR: 135x5</Text>
      </Card>
    </ScrollView>
  );
};
