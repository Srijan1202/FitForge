import { styled, YStack, Text, GetProps } from 'tamagui';

export const ButtonFrame = styled(YStack, {
  name: 'Button',
  backgroundColor: '$bgSurfaceRaised',
  borderRadius: '$2',
  paddingVertical: '$3',
  paddingHorizontal: '$4',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  borderWidth: 1,
  borderColor: '$borderHairline',
  
  pressStyle: {
    opacity: 0.8,
    scale: 0.98,
  },

  variants: {
    variant: {
      primary: {
        backgroundColor: '$accentPrimary',
        borderColor: '$accentPrimary',
      },
      secondary: {
        backgroundColor: '$bgSurface',
        borderColor: '$accentDim',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
  },
});

export const ButtonText = styled(Text, {
  name: 'ButtonText',
  color: '$textPrimary',
  fontFamily: '$heading',
  fontSize: '$2',
  fontWeight: '600',

  variants: {
    variant: {
      primary: {
        color: '#0A0E0C', // Dark text on the glowing phosphor green button for contrast
      },
      secondary: {
        color: '$textPrimary',
      },
      ghost: {
        color: '$textSecondary',
      },
    },
  } as const,

  defaultVariants: {
    variant: 'primary',
  },
});

type ButtonProps = GetProps<typeof ButtonFrame> & {
  title: string;
};

export const Button = ({ title, variant = 'primary', ...props }: ButtonProps) => {
  return (
    <ButtonFrame variant={variant} {...props}>
      <ButtonText variant={variant}>{title}</ButtonText>
    </ButtonFrame>
  );
};
