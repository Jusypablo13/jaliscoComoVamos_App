import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'

type UserPreferencesContextType = {
    selectedCategories: string[]
    toggleCategory: (category: string) => void
    savePreferences: () => Promise<void>
    hasSelectedCategories: boolean
    isLoadingPreferences: boolean
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(
    null
)

const PREFS_STORAGE_KEY = 'user_selected_categories'

export function UserPreferencesProvider({ children }: { children: ReactNode }) {
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [hasSelectedCategories, setHasSelectedCategories] = useState(false)
    const [isLoadingPreferences, setIsLoadingPreferences] = useState(true)

    useEffect(() => {
        loadPreferences()
    }, [])

    const loadPreferences = async () => {
        setIsLoadingPreferences(true)
        try {
            const stored = await AsyncStorage.getItem(PREFS_STORAGE_KEY)
            if (stored) {
                const categories = JSON.parse(stored)
                setSelectedCategories(categories)
                setHasSelectedCategories(categories.length > 0)
            }
        } catch (error) {
            console.error('Failed to load preferences:', error)
        } finally {
            setIsLoadingPreferences(false)
        }
    }

    const toggleCategory = useCallback((category: string) => {
        setSelectedCategories((prev) => {
            if (prev.includes(category)) {
                return prev.filter((c) => c !== category)
            } else {
                return [...prev, category]
            }
        })
    }, [])

    const savePreferences = useCallback(async () => {
        try {
            await AsyncStorage.setItem(
                PREFS_STORAGE_KEY,
                JSON.stringify(selectedCategories)
            )
            setHasSelectedCategories(true)
        } catch (error) {
            console.error('Failed to save preferences:', error)
        }
    }, [selectedCategories])

    return (
        <UserPreferencesContext.Provider
            value={{
                selectedCategories,
                toggleCategory,
                savePreferences,
                hasSelectedCategories,
                isLoadingPreferences,
            }}
        >
            {children}
        </UserPreferencesContext.Provider>
    )
}

export function useUserPreferences() {
    const context = useContext(UserPreferencesContext)
    if (!context) {
        throw new Error(
            'useUserPreferences must be used within a UserPreferencesProvider'
        )
    }
    return context
}
