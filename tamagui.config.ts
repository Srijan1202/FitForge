import { createTamagui, createFont } from 'tamagui';
import { tokens } from './src/theme/tokens';
import { darkTheme } from './src/theme/dark';
import { lightTheme } from './src/theme/light';

const spaceGroteskFont = createFont({
  family: 'Space Grotesk, sans-serif',
  size: {
    1: 13,
    2: 15,
    3: 18,
    4: 24,
    5: 32,
    true: 15,
  },
  lineHeight: {
    1: 13 * 1.3,
    2: 15 * 1.3,
    3: 18 * 1.3,
    4: 24 * 1.3,
    5: 32 * 1.3,
  },
  weight: {
    4: '600', // SemiBold
    true: '700', // Bold
  },
  letterSpacing: {
    4: 0,
  },
});

const interFont = createFont({
  family: 'Inter, sans-serif',
  size: {
    1: 13, // caption
    2: 15, // body
    3: 18, // h2
    4: 24, // h1
    5: 32, // display
    true: 15,
  },
  lineHeight: {
    1: 13 * 1.5,
    2: 15 * 1.5,
    3: 18 * 1.5,
    4: 24 * 1.5,
    5: 32 * 1.5,
  },
  weight: {
    4: '400', // Regular
    5: '500', // Medium
    true: '400',
  },
  letterSpacing: {
    4: 0,
  },
});

const jetbrainsMonoFont = createFont({
  family: 'JetBrains Mono, monospace',
  size: {
    1: 13,
    2: 15,
    3: 18,
    4: 24,
    5: 32,
    true: 15,
  },
  lineHeight: {
    1: 13 * 1.5,
    2: 15 * 1.5,
    3: 18 * 1.5,
    4: 24 * 1.5,
    5: 32 * 1.5,
  },
  weight: {
    4: '400',
    true: '400',
  },
  letterSpacing: {
    4: 0,
  },
});

export const tamaguiConfig = createTamagui({
  tokens,
  fonts: {
    heading: spaceGroteskFont,
    body: interFont,
    mono: jetbrainsMonoFont,
  },
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  shorthands: {
    px: 'paddingHorizontal',
    py: 'paddingVertical',
    mx: 'marginHorizontal',
    my: 'marginVertical',
    p: 'padding',
    m: 'margin',
    bg: 'backgroundColor',
    br: 'borderRadius',
    mt: 'marginTop',
    mb: 'marginBottom',
    ml: 'marginLeft',
    mr: 'marginRight',
    pt: 'paddingTop',
    pb: 'paddingBottom',
    pl: 'paddingLeft',
    pr: 'paddingRight',
    w: 'width',
    h: 'height',
    maxW: 'maxWidth',
    minW: 'minWidth',
    maxH: 'maxHeight',
    minH: 'minHeight',
    f: 'flex',
    jc: 'justifyContent',
    ai: 'alignItems',
    als: 'alignSelf',
    zi: 'zIndex',
  } as const,
});

export type AppConfig = typeof tamaguiConfig;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends AppConfig {}
}

declare module '@tamagui/web' {
  interface TamaguiCustomConfig extends AppConfig {}
}

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default tamaguiConfig;
