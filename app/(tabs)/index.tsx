import { StyleSheet, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useMemo, useReducer, useCallback } from 'react';
import Onboarding from '@/screens/Onboarding';
import Profile from '@/screens/Profile';
import SplashScreen from '@/screens/SplashScreen';
import Home from '@/screens/Home';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '@/contexts/AuthContext';

type AuthState = {
  isLoading: boolean;
  isOnboardingCompleted: boolean;
};

type AuthAction = {
  type: 'onboard';
  isOnboardingCompleted: boolean;
};

const Stack = createNativeStackNavigator();

const App: React.FC = () => {
  const [state, dispatch] = useReducer(
    (prevState: AuthState, action: AuthAction): AuthState => {
      switch (action.type) {
        case 'onboard':
          return {
            ...prevState,
            isLoading: false,
            isOnboardingCompleted: action.isOnboardingCompleted,
          };
        default:
          return prevState;
      }
    },
    {
      isLoading: true,
      isOnboardingCompleted: false,
    }
  );

  useEffect(() => {
    (async () => {
      let profileData: string | null = null;
      try {
        profileData = await AsyncStorage.getItem('profile');
      } catch (e) {
        console.error(e);
      } finally {
        if (profileData !== null) {
          dispatch({ type: 'onboard', isOnboardingCompleted: true });
        } else {
          dispatch({ type: 'onboard', isOnboardingCompleted: false });
        }
      }
    })();
  }, []);

  const authContext = useMemo(
    () => ({
      onboard: async (data: any) => {
        try {
          const jsonValue = JSON.stringify(data);
          await AsyncStorage.setItem('profile', jsonValue);
        } catch (e) {
          console.error(e);
        }

        dispatch({ type: 'onboard', isOnboardingCompleted: true });
      },
      update: async (data: any) => {
        try {
          const jsonValue = JSON.stringify(data);
          await AsyncStorage.setItem('profile', jsonValue);
        } catch (e) {
          console.error(e);
        }

        Alert.alert('Success', 'Successfully saved changes!');
      },
      logout: async () => {
        try {
          await AsyncStorage.clear();
        } catch (e) {
          console.error(e);
        }

        dispatch({ type: 'onboard', isOnboardingCompleted: false });
      },
    }),
    []
  );

  if (state.isLoading) {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={authContext}>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator>
          {state.isOnboardingCompleted ? (
            <>
              <Stack.Screen
                name="Home"
                component={Home}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="Profile" component={Profile} />
            </>
          ) : (
            <Stack.Screen
              name="Onboarding"
              component={Onboarding}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
