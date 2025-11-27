import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { HomeScreen } from './home-screen'
import { ProfileScreen } from './profile-screen'
import { QuestionDetailScreen } from './question-detail-screen'
import { brandColors } from '../styles/theme'
import { Ionicons } from '@expo/vector-icons'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './navigation/NavigationTypes'; 
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

// This is the specific type for the Details screen's props
type DetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'Details'>;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator()

// This is a placeholder component for the Details screen
// It will be replaced by the actual DetailsScreen component later
function EmptyView({ route }: DetailsScreenProps) {
    return (
        <View>
            <Text>
                {`Details Screen - User ID: ${route.params.userId}, Question ID: ${route.params.questionId}`}
            </Text>
        </View>
    );
}

function HomeScreenAndNavigator() {
    return (
        <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Details" component={EmptyView} />
            <Stack.Screen 
                name="QuestionDetail" 
                component={QuestionDetailScreen}
                options={{ title: 'Detalle de Pregunta' }}
            />
        </Stack.Navigator>
    );
}

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
            <Tab.Screen name="Inicio" component={HomeScreenAndNavigator} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
    )
}
