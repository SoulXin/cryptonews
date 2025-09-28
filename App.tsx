/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';

import MarketList from './view/home/index';
import PairDetail from './view/detail/index';

// 👉 import AdMob
import mobileAds from 'react-native-google-mobile-ads';

enableScreens();
const Stack = createNativeStackNavigator();

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Inisialisasi AdMob saat app mulai
    mobileAds()
      .initialize()
      .then(() => {
        console.log('AdMob initialized ✅');
      });
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
};

const AppContent = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="MarketList">
          <Stack.Screen
            name="MarketList"
            component={MarketList}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PairDetail"
            component={PairDetail}
            options={{
              headerTransparent: false,
              headerTitle: '',
              headerShadowVisible: false,
              headerStyle: {
                backgroundColor: 'transparent',
              },
              headerTintColor: '#f3ba2f',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default App;
