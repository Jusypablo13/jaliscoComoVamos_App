import React from 'react'
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { supabase } from '../lib/supabase'
import { brandColors, typography } from '../styles/theme'
async function onSignOutButtonPress() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error)
    Alert.alert('Error al cerrar sesión', error.message)
    return
  }
  Alert.alert('Sesión finalizada')
}
export default function SignOutButton() {
  return (
    <TouchableOpacity style={styles.button} onPress={onSignOutButtonPress}>
      <Text style={styles.label}>Cerrar sesión</Text>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: brandColors.accent,
  },
  label: {
    fontFamily: typography.heading,
    fontSize: 14,
    color: brandColors.surface,
  },
})