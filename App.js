import { createStackNavigator} from 'react-navigation';
import Home from './app/home'
import Media from './app/media'
import Preview from './app/preview'
const App = createStackNavigator({
  Home: { screen: Home },
  Media: { screen: Media },
  Preview: { screen: Preview },
}, {
  initialRouteName: 'Home',
});
export default App;