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