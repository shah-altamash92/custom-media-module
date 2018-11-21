/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

'use strict';
import React, { Component } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text, NativeModules, Platform, StatusBar,TouchableWithoutFeedbackComponent , Dimensions} from 'react-native'
import Sound from 'react-native-sound';
import RNFS from "react-native-fs";
import Video from 'react-native-video';
import SafeAreaView from "react-native-safe-area-view";
import RNDsPhotoEditor from 'react-native-ds-photo-editor';

export default class Preview extends Component {

  static navigationOptions = {
    header: null,
  };
  file = '';
  mediaType = '';
  track;
  EditedFile;
  state = {
    paused: true
  }
  _showDoneButton = true;

  constructor(props) {
    super(props)
    this._playAudio = this._playAudio.bind(this);
    this._cancelPressed = this._cancelPressed.bind(this);
    this._donePressed = this._donePressed.bind(this);
    this._editImage = this._editImage.bind(this);

    const { navigation } = this.props;
    this.file = navigation.getParam('file', '');
    this._showDoneButton = navigation.getParam('showDoneButton', true);
    console.log(this.file);
    this.EditedFile = this.file



  }

  componentDidMount() {
    // SoundPlayer.onFinishedPlaying((success) => { // success is true when the sound is played

    //   this.setState({ paused: true });

    //           })
    this.getExistingFiles()
  }
  // unsubscribe when unmount
  componentWillUnmount() {
    // SoundPlayer.unmount()


  }

  getExistingFiles = () => {
    console.log(RNFS.CachesDirectoryPath);
    console.log(RNFS.DocumentDirectoryPath);

    RNFS.readDir(RNFS.CachesDirectoryPath + '/Camera/')
      .then((result) => {
        console.log('GOT RESULT', result);
        return Promise.all([RNFS.stat(result[0].path), result[0].path]);
      })
      .catch((err) => {
        console.log(err.message, err.code);
      });

    RNFS.readDir(RNFS.DocumentDirectoryPath)
      .then((result) => {
        console.log('GOT RESULT', result);
        return Promise.all([RNFS.stat(result[0].path), result[0].path]);
      })
      .catch((err) => {
        console.log(err.message, err.code);
      });

  }

  _editImage = () => {

    if  (Platform.OS === 'ios')
    { 
      NativeModules.RNDsPhotoEditor.init("212ef55e52688810a0f962c31b9888794c121f8a")
     console.log("filePath")
     NativeModules.RNDsPhotoEditor.openEditor(this.EditedFile.uri).then(uri => {

      this.EditedFile.uri = "file://" +uri;
      this.setState({})

      console.log(uri)
    }).catch(error => {
      console.log(error)
    });
  }
  else
  {
    RNDsPhotoEditor.init("212ef55e52688810a0f962c31b9888794c121f8a")
    console.log("filePath")
    RNDsPhotoEditor.openEditor(this.EditedFile.uri).then(uri => {

     this.EditedFile.uri = "file://" +uri;
     this.setState({})

     console.log(uri)
   }).catch(error => {
     console.log(error)
   });
  }
 

  }
  //<SafeAreaView style={{flex: 1, backgroundColor: '#0171B9', paddingTop: (Platform.OS === "ios" ? 20 : 0)}} forceInset={{ bottom: 'never' }}>
  render() {
    return (
      <SafeAreaView style={{ flex: 1, flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#0171B9', paddingTop: (Platform.OS === "ios" ? 20 : 0) }} forceInset={{ bottom: 'never' }}>
        <StatusBar
          backgroundColor='#0171B9'
          barStyle="light-content" />
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.leftButton} onPress={this._cancelPressed}>
            <Image source={require('./assets/icons/ic_cancel.png')} resizeMode='contain' style={styles.closeButtonStyle} />
          </TouchableOpacity>
          {
            this.file.type === 'image' ?
              <TouchableOpacity style={styles.rightButton} onPress={this._editImage}>
                <Image style={{ height: 25, width: 25 }} source={require('./assets/icons/edit_image.png')} />
              </TouchableOpacity> : null
          }
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
            <TouchableOpacity style={styles.rightButton} onPress={this._donePressed} >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
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
        view = <Image style={[styles.audioPreview]}
          source={require('./assets/images/audio_wallpaper_phone.png')}  />;
        break;
      case 'image':
        view = <Image style={[styles.screenCover, { flex: 1 }]} source={{ uri: this.EditedFile.uri }} />;
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

   
    Sound.setCategory('Playback');

    this.track = new Sound(this.file.uri, '', (e) => {
      if (e) {
        console.log('error loading track:', e)
        console.log(this.file.uri)
      } else {


        console.log('PlayLoad:')
        console.log(this.file.uri)
        //   track.play()
        // Get properties of the player instance

        this.track.play((success) => {
          console.log('Play')
          if (success) {
            console.log('successfully finished playing');
            this.setState({ paused: true });
          } else {
            console.log('playback failed due to audio decoding errors');
            // reset the player to its uninitialized state (android only)
            // this is the only option to recover after an error occured and use the player again
            this.track.reset();
          }
        });
      }
    })

  }

  _pauseVideo = () => {
    this.setState({ paused: true });
    if (this.file.type === 'audio') {
      try {
        this.track.stop();
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
    this.props.navigation.state.params.onCrossedPressed(this.file);
    this.props.navigation.pop();
  }

  _donePressed = () => {
    this.props.navigation.state.params.onDonePressed(this.EditedFile);
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
  },
  audioPreview: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    marginBottom: 90,

}

});


