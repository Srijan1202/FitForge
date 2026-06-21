import { styled, YStack, Text } from 'tamagui';

export const Card = styled(YStack, {
  name: 'Card',
  backgroundColor: '$bgSurface',
  borderRadius: '$3', // 12px soft radius
  padding: '$4', // 16px internal padding
  borderWidth: 1,
  borderColor: '$borderHairline',
  
  variants: {
    raised: {
      true: {
        backgroundColor: '$bgSurfaceRaised',
      },
    },
    live: {
      true: {
        borderColor: '$accentPrimary',
        // We'll handle the glow shadow via React Native shadow props depending on theme
        // Or via tamagui shadow tokens
        shadowColor: '$accentGlow',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 24,
        scale: 1.02,
      },
    },
  } as const,
});

export const CardTitle = styled(Text, {
  name: 'CardTitle',
  color: '$textPrimary',
  fontFamily: '$heading',
  fontSize: '$3',
  fontWeight: '600',
});

export const CardSubtitle = styled(Text, {
  name: 'CardSubtitle',
  color: '$textSecondary',
  fontFamily: '$body',
  fontSize: '$2',
});
