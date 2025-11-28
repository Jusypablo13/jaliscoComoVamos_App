import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';

// Define the shape of the parameter object for each screen.
// A screen that takes no parameters should have 'undefined'.
export type RootStackParamList = {
    Home: undefined; // The 'Home' screen takes no parameters
    QuestionDetail: { 
        questionId: number; // Numeric ID of the question
        column: string; // Column name in the encuesta table (e.g., "Q_31")
        questionText?: string; // Optional question text for display
        isYesOrNo?: boolean | null; // Whether this is a yes/no question
        isClosedCategory?: boolean | null; // Whether this is a closed category question
        escalaMax?: number | null; // Maximum scale value for numeric questions
    };
};

// Functional components can use these types to type their props:
export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Use this to type the props when defining the screens in your navigator.
export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

// 3. Define the main navigation prop type (for useNavigation hook)
// You can use this type to call 'navigate' or 'goBack' from any component.
export type MainNavigationProp = HomeScreenProps['navigation'];

// 4. Create a typed useNavigation hook
export const useMainNavigation = () => useNavigation<MainNavigationProp>();

// 5. Create a typed useRoute hook for a specific screen
export const useMainRoute = <T extends keyof RootStackParamList>() => useRoute<RouteProp<RootStackParamList, T>>();