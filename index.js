// /** @format */

// import {AppRegistry} from 'react-native';
// import App from './App';
// import {name as appName} from './app.json';

// AppRegistry.registerComponent(appName, () => App);


import React from "react";
import { View, Text } from "react-native";


export default class Index extends React.Component{

    render(){
        return (
            <View style={{flex: 1}}>
                <Text>Hello</Text>
            </View>
        );
    }
}
