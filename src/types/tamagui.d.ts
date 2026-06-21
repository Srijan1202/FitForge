import tamaguiConfig from '../../tamagui.config';

type Conf = typeof tamaguiConfig;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends Conf {}
}

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf {}
}

declare module '@tamagui/web' {
  interface TamaguiCustomConfig extends Conf {}
}
