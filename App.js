import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';

// Context provider für global state, users, login status
import { AppProvider } from './src/context/AppContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/calendarScreen';
import TaskScreen from './src/screens/taskScreen';
import FriendsScreen from './src/screens/FriendsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

// Navigation stack and tab instances
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  // Local state: currently logged-in username (used for props, not AppContext)
  const [username, setUsername] = useState(null);

  // Clear username on logout
  const logout = () => setUsername(null);

  // Tab navigator shown after login
  const MainTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // Hide top headers

        // Define tab icons based on route name
        tabBarIcon: ({ focused }) => {
          let icon;

          if (route.name === 'Home') {
            icon = require('./assets/icons/home.png');
          } else if (route.name === 'Deeds') {
            icon = require('./assets/icons/deed.png');
          } else if (route.name === 'Calendar') {
            icon = require('./assets/icons/calendar.png');
          } else if (route.name === 'Friends') {
            icon = require('./assets/icons/friends.png');
          } else if (route.name === 'Profile') {
            icon = require('./assets/icons/profile.png');
          }

          return (
            <Image
              source={icon}
              style={{
                width: 24,
                height: 24,
                resizeMode: 'contain',
              }}
            />
          );
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#b6e3cc',
          height: 90,
          paddingBottom: 10,
          paddingTop: 10,
        },
      })}
    >
      {/* Tabs: each screen in bottom nav */}
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Deeds" component={TaskScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Friends">
        {(props) => (
          <FriendsScreen {...props} username={username} logout={logout} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} username={username} />}
      </Tab.Screen>
    </Tab.Navigator>
  );

  return (
    //global context provider
    <AppProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/*screen nav Login */}
          <Stack.Screen name="Login" component={LoginScreen} />

          {/* Main nach login */}
          <Stack.Screen name="Main" component={MainTabs} />
        </Stack.Navigator>
      </NavigationContainer>
    </AppProvider>
  );
}
