/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

'use strict';
import React, { Component } from 'react';
import { Dimensions, StyleSheet, View, Image, TouchableOpacity, Text, TouchableWithoutFeedbackComponent } from 'react-native'
import SoundPlayer from 'react-native-sound-player';
import RNFS from "react-native-fs";
import Video from 'react-native-video';



export default class Preview extends Component {

  static navigationOptions = {
    header: null,
  };
  file = '';
  mediaType = '';

  state = {
    paused: true
  }

  constructor(props) {
    super(props)
    this._playAudio = this._playAudio.bind(this);
    this._cancelPressed = this._cancelPressed.bind(this);


    const { navigation } = this.props;
    this.file = navigation.getParam('file', '');
    // console.log(this.file);
    // this.mediaType = navigation.getParam('type', '');


    // this.myurl = "file:///data/user/0/com.customloadermodule/cache/Camera/2e41d233-47a5-49ee-a349-dcae457fdec0.jpg";
    // this.mediaType = "image";

    // this.myurl = "file:///data/user/0/com.customloadermodule/cache/Camera/99c4a452-ba2d-4fd5-9f74-9b3fa333b91d.mp4";
    // this.mediaType = "video";

    // console.log(this.mediaType);
    // console.log(this.myurl);

    // this.file = {uri: "/data/user/0/com.customloadermodule/files/1542103687398.mp3", type: "audio"};
  }

  render() {
    return (
      <View style={{ flex: 1, flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#000000' }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.leftButton} onPress={this._cancelPressed}>
            <Image source={require('./assets/icons/ic_cancel.png')} resizeMode='contain' style={styles.closeButtonStyle} />
          </TouchableOpacity>
        </View>
        <View style={styles.container}>
          {
            this.returnPageView()
          }
          {
            this.file.type != 'image' && this.state.paused ?
              <TouchableOpacity style={styles.screenCover} onPress={this._playMedia}>
                <Image source={require('./assets/icons/preview_play.png')} style={styles.playButton} />
                {this.file.type === 'audio' ? <Text style={{ color: 'white', fontSize: 16, fontWeight: "bold" }}>{String(this.file.duration) + ' seconds'} </Text> : null}
              </TouchableOpacity> :
              <TouchableOpacity style={styles.screenCover} onPress={this._pauseVideo}></TouchableOpacity>
          }
        </View>
        <View style={{ alignSelf: 'flex-end', flexDirection: 'row', height: 40 }}>
          <View style={styles.footerBar}>
            <TouchableOpacity style={styles.leftButton} onPress={this._deleteMedia}>
              <Image source={require('./assets/icons/trash.png')} style={{ height: 20, width: 20 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.rightButton}>
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    );
  }

  returnPageView = () => {
    var view;
    switch (this.file.type) {
      case 'video':
        view = <Video source={{ uri: this.file.uri }} resizeMode='contain' style={styles.backgroundVideo}
          paused={this.state.paused} onEnd={this._onVideoComplete} repeat={true} />
        break;
      case 'audio':
        view = <Image style={[styles.screenCover, { width: '100%' }]}
          source={require('./assets/images/audio_wallpaper_phone.png')} resizeMode='stretch' />;
        break;
      case 'image':
        view = <Image style={[styles.screenCover, { flex: 1 }]} source={{ uri: this.file.uri }} />;
        break;
    }
    return view;
  }

  _playMedia = () => {
    this.setState({ paused: false });

    if (this.file.type === 'audio')
      this._playAudio();
  }

  _playAudio = () => {
    try {
      SoundPlayer.playUrl(this.file.uri);

      SoundPlayer.onFinishedPlaying((success) => { // success is true when the sound is played
        this.setState({ paused: true });
      })
    } catch (e) {
      alert('Cannot play the file')
    }
  }

  _pauseVideo = () => {
    this.setState({ paused: true });
    if (this.file.type === 'audio') {
      try {
        SoundPlayer.stop();
      } catch (e) {
        alert('Cannot play the file')
      }
    }
  }

  _onVideoComplete = () => {
    this.setState({
      paused: true
    });
  }

  _deleteMedia = () => {
    const filePath = this.file.uri.split('///').pop();

    RNFS.exists(filePath)
      .then((res) => {
        if (res) {
          RNFS.unlink(filePath)
            .then(() => {
              console.log('FILE DELETED');

              // RNFS.exists(filePath).then((res) => { console.log('file status ' + res) });

              this.props.navigation.state.params.onFileDelete();
              this.props.navigation.pop();
            });
        }
      })
  }

  _cancelPressed = () => {
    this.props.navigation.pop();
  }
}

// Later on in your styles..
var styles = StyleSheet.create({
  headerContainer: {
    // padding: 20,
    backgroundColor: '#0171B9',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 0
  },
  footerBar: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'black'
  },
  leftButton: {
    // flex:1,
    padding: 10,
    alignSelf: 'flex-start',
    alignItems: 'flex-start'
  },
  rightButton: {
    // flex:1,
    padding: 10,
    alignSelf: 'flex-end',
    alignItems: 'flex-end'
  },
  closeButtonStyle: {
    width: 22,
    height: 22
  },
  container: {
    backgroundColor: 'black',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    flex: 1,
    height: '100%',
    width: '100%',
    bottom: 0,
    right: 0,
  },
  playButton: {
    height: 60,
    width: 60,
  },
  screenCover: {
    position: 'absolute',
    // backgroundColor:'red',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center'
  }

});


