/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

'use strict';
import React, { Component } from 'react';
import {
  Text,
  TouchableOpacity,
  View, FlatList, Platform, StatusBar
} from 'react-native';
import SafeAreaView from "react-native-safe-area-view";

export default class Home extends Component {

  state = {
    mediaList: []
  }

  constructor() {
    super();
    this._openMedia = this._openMedia.bind(this);
  }

  _openMedia = () => {
    this.props.navigation.navigate('Media', {
      onComplete: (list) => {
        console.log(list);
        this.setState({
          mediaList: list
        })
      }
    });

  }

  componentDidMount() {

  }

  _renderItem = ({ item }) => (<Text>{item.type} = {item.uri}</Text>);
  render() {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0171B9', paddingTop: (Platform.OS === "ios" ? 20 : 0) }} forceInset={{ bottom: 'never' }}>
        <StatusBar
          backgroundColor='#0171B9'
          barStyle="light-content" />
        <TouchableOpacity onPress={this._openMedia} style={{ padding: 10, alignItems: 'center' }}>
          <Text>Get Media</Text>
        </TouchableOpacity>

        <FlatList data={this.state.mediaList}
          keyExtractor={(item, index) => '_' + index}
          renderItem={this._renderItem} />
      </SafeAreaView>
    );
  }
}

