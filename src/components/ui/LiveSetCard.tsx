import { styled, XStack, YStack, Text, Input, GetProps } from 'tamagui';

export const LiveSetCardFrame = styled(YStack, {
  name: 'LiveSetCard',
  backgroundColor: '$bgSurface',
  borderRadius: '$3',
  padding: '$4',
  borderWidth: 1,
  borderColor: '$borderHairline',
  
  variants: {
    isActive: {
      true: {
        borderColor: '$accentPrimary',
        shadowColor: '$accentGlow',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 24,
        scale: 1.02,
      },
    },
  } as const,
});

export const SetInput = styled(Input, {
  name: 'SetInput',
  backgroundColor: 'transparent',
  color: '$textPrimary',
  fontFamily: '$mono',
  fontSize: '$4',
  borderWidth: 0,
  borderBottomWidth: 2,
  borderBottomColor: '$borderHairline',
  textAlign: 'center',
  padding: 0,
  width: 60,
  
  focusStyle: {
    borderBottomColor: '$accentPrimary',
  },
});

type LiveSetCardProps = GetProps<typeof LiveSetCardFrame> & {
  setNumber: number;
  totalSets: number;
  weight?: string;
  reps?: string;
  onChangeWeight?: (val: string) => void;
  onChangeReps?: (val: string) => void;
};

export const LiveSetCard = ({
  setNumber,
  totalSets,
  isActive,
  weight,
  reps,
  onChangeWeight,
  onChangeReps,
  ...props
}: LiveSetCardProps) => {
  return (
    <LiveSetCardFrame isActive={isActive} {...props}>
      <XStack jc="space-between" ai="center" mb="$3">
        <Text fontFamily="$mono" color={isActive ? '$accentPrimary' : '$textSecondary'} fontSize="$2">
          SET {setNumber.toString().padStart(2, '0')} / {totalSets.toString().padStart(2, '0')}
        </Text>
        <Text fontFamily="$body" color="$textSecondary" fontSize="$2">
          Previous: 135x10
        </Text>
      </XStack>
      
      <XStack jc="space-around" ai="center">
        <YStack ai="center" gap="$2">
          <Text fontFamily="$body" color="$textSecondary" fontSize="$1">LBS</Text>
          <SetInput 
            value={weight} 
            onChangeText={onChangeWeight} 
            placeholder="-" 
            keyboardType="numeric"
            disabled={!isActive}
          />
        </YStack>
        
        <Text fontFamily="$heading" color="$textDisabled" fontSize="$4">×</Text>
        
        <YStack ai="center" gap="$2">
          <Text fontFamily="$body" color="$textSecondary" fontSize="$1">REPS</Text>
          <SetInput 
            value={reps} 
            onChangeText={onChangeReps} 
            placeholder="-" 
            keyboardType="numeric"
            disabled={!isActive}
          />
        </YStack>
      </XStack>
    </LiveSetCardFrame>
  );
};
