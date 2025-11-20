import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeScreen } from './home-screen'
import { ProfileScreen } from './profile-screen'
import { brandColors } from '../styles/theme'
import { Ionicons } from '@expo/vector-icons'

const Tab = createBottomTabNavigator()

export function AppNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: brandColors.primary,
                tabBarInactiveTintColor: brandColors.muted,
                tabBarStyle: {
                    backgroundColor: brandColors.surface,
                    borderTopColor: '#E0E4EA',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap

                    if (route.name === 'Inicio') {
                        iconName = focused ? 'home' : 'home-outline'
                    } else if (route.name === 'Perfil') {
                        iconName = focused ? 'person' : 'person-outline'
                    } else {
                        iconName = 'help-circle'
                    }

                    return <Ionicons name={iconName} size={size} color={color} />
                },
            })}
        >
            <Tab.Screen name="Inicio" component={HomeScreen} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
    )
}
