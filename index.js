// C:\ProjectBeta\index.js
import { AppRegistry } from 'react-native';
import App from './App';                 // App.tsx ở gốc -> ./App
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
