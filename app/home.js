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
  View, FlatList
} from 'react-native';
export default class Home extends Component {

  state = {
    mediaList: []
  }

  constructor(){
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
  
  _renderItem = ({ item }) => (<Text>{item.type} = {item.uri}</Text>);
  render(){
    return (
      <View style={{flex: 1}}>
        <TouchableOpacity onPress={this._openMedia} style={{padding: 10}}>
          <Text>Get Media</Text>
        </TouchableOpacity>

        <FlatList data={this.state.mediaList}
          keyExtractor={(item, index) =>'_' + index}
          renderItem={this._renderItem} />
      </View>
    );
  }
}
