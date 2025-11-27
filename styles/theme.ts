import { Platform } from 'react-native'
export const brandColors = {
  primary: '#163C74',
  accent: '#DA364D',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  text: '#211F30',
  muted: '#8795BA',
  highlight: '#D6DF65',
}
export const typography = {
  heading: Platform.select({
    ios: 'HelveticaNeue-Bold',
    android: 'Roboto',
    default: 'Roboto',
  }),
  regular: Platform.select({
    ios: 'Helvetica Neue',
    android: 'Roboto',
    default: 'Roboto',
  }),
  emphasis: Platform.select({
    ios: 'HelveticaNeue-Medium',
    android: 'Roboto',
    default: 'Roboto',
  }),
}

export const textStyles = {
  h1: {
    fontFamily: typography.heading,
    fontSize: 32,
    fontWeight: 'bold' as const,
    lineHeight: 40,
  },
  h2: {
    fontFamily: typography.heading,
    fontSize: 24,
    fontWeight: 'bold' as const,
    lineHeight: 32,
  },
  h3: {
    fontFamily: typography.heading,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontFamily: typography.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  caption: {
    fontFamily: typography.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  small: {
    fontFamily: typography.regular,
    fontSize: 12,
    lineHeight: 16,
  },
}