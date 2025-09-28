/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
// import mobileAds from 'react-native-google-mobile-ads';

// // Inisialisasi ads
// mobileAds()
//   .initialize()
//   .then(adapterStatuses => {
//     console.log('AdMob initialized', adapterStatuses);
//   });

AppRegistry.registerComponent(appName, () => App);
