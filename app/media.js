'use strict';
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View, Platform, Image, Dimensions, StatusBar
} from 'react-native';
import PropTypes from 'prop-types';
import { RNCamera } from 'react-native-camera';
import AudioRecord from 'react-native-audio-record';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import Video from 'react-native-video';
//import ImagePicker from 'react-native-image-picker';
import ImagePicker from 'react-native-image-crop-picker';
import SafeAreaView from "react-native-safe-area-view";
import RNThumbnail from 'react-native-thumbnail';
import Permissions from 'react-native-permissions'

export default class Media extends Component {

    static navigationOptions = {
        header: null,
    };
    videoCapturing = false;
    audioCapturing = false;
    audioUri = '';
    _mediaFiles = [];
    thumbnailUri = '';

    _interval = null;

    /**
     * Custom props for this component
     */
    static propTypes = {
        videoDuration: PropTypes.number,
        audioDuration: PropTypes.number
    }


    /**
     * Default props values
     */
    static defaultProps = {
        videoDuration: 300,
        audioDuration: 600
    }

    constructor(props) {
        super(props);
        this.captureMedia = this.captureMedia.bind(this);
        this.cameraMode = this.cameraMode.bind(this);
        this.upButtonChangeMode = this.upButtonChangeMode.bind(this);
        this.downButtonChangeMode = this.downButtonChangeMode.bind(this);
        this.goToCapturedMedia = this.goToCapturedMedia.bind(this);
        this.pickMediaFromGallery = this.pickMediaFromGallery.bind(this);
        this.permissionPopup=this.permissionPopup.bind(this);
        this._checkOS=this._checkOS.bind(this);
    }

    state =
        {
            cameraType: RNCamera.Constants.Type.back,
            flashMode: RNCamera.Constants.FlashMode.off,
            imageUriFromCamera: '',
            isMode: 'image',
            showMenu: false,
            mediaType: '',
            timeRemaining: 0,
            progress: 0,
            progressWithOnComplete: 0,
            progressCustomized: 0,
        }

componentDidMount ()
{
this._checkOS()
}
        permissionPopup = () => {
            Permissions.request('photo').then(response => {
              // Returns once the user has chosen to 'allow' or to 'not allow' access
              // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
             if(response==='authorized')
             {
        console.log ("Authorized")
             }
             else
             {
                 this.props.navigation.pop();
             }
            })
          }
         
          _checkOS = () => {
            if(Platform.OS==='android')
            {
        const value=  this.permissionPopup();
        console.log(value);
        
          //this._editImage();
            }
          
         
          }

    increase = (key, value) => {
        this.setState({
            [key]: + value,
        });

        console.log(value)
    }
    render() {
        const barWidth = Dimensions.get('screen').width;
        const progressCustomStyles = {
            backgroundColor: '#D31145',
            borderRadius: 0,
            height: 3,
            borderWidth: 0,
            padding: 0
        };

        return (
            <SafeAreaView style={styles.container} forceInset={{ bottom: 'never' }}>
                <StatusBar
                    backgroundColor='#0171B9'
                    barStyle="light-content" />
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.leftButton} onPress={this._doneClick}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Done</Text>
                    </TouchableOpacity>
                    {
                        this.state.isMode === 'video' || this.state.isMode === 'audio' ?
                            <View style={styles.timerContainer}>
                                <View style={styles.timerDot}></View>
                                <Text style={styles.timer}>
                                    {this.state.timeRemaining} Secs
                    </Text>
                            </View> : null
                    }
                    <View style={styles.rightButtonHolder}>
                        {
                            this.state.isMode === 'image' ?
                                <TouchableOpacity onPress={() => this.cameraMode()} style={{ padding: 10 }}>
                                    <Image style={{ height: 20, width: 20 }}
                                        source={require('./assets/icons/camera_switch.png')}
                                    ></Image>
                                </TouchableOpacity> : null
                        }
                        {
                            this.state.isMode === 'audio' ? null :
                                <TouchableOpacity onPress={this.pickMediaFromGallery} style={{ padding: 10 }}>
                                    <Image style={{ height: 20, width: 20 }}
                                        source={require('./assets/icons/gallery.png')}
                                    ></Image>
                                </TouchableOpacity>
                        }
                    </View>
                </View>

                {
                    this.state.isMode === 'audio' ?
                        <Image style={styles.preview} source={require('./assets/images/audio_wallpaper_phone.png')}></Image> :
                        <RNCamera
                            ref={camera => { this.camera = camera; }}
                            style={styles.preview}
                            type={this.state.cameraType}
                            captureAudio={true}
                            flashMode={this.state.flashMode}
                            playSoundOnCapture={true}
                            permissionDialogTitle={'Camera permission required'}
                            permissionDialogMessage={'We need camera permission to capture evidence'}
                            onGoogleVisionBarcodesDetected={({ barcodes }) => {
                                console.log(barcodes)
                            }} />
                }
                { /* Toggle mode popup */
                    this.state.showMenu === true ? <View style={styles.menuContainer}>
                        <Image style={styles.imageContainerOfMenu}
                            source={(this.state.isMode === 'image' ? require('./assets/icons/camera_switch_option.png') : (this.state.isMode === 'video' ? require('./assets/icons/video_switch_option.png') : require('./assets/icons/audio_switch_option.png')))}
                        ></Image>
                        <TouchableOpacity style={styles.touchUpOfMenu} onPress={() => this.upButtonChangeMode()}></TouchableOpacity>
                        <TouchableOpacity style={styles.touchDownOfMenu} onPress={() => this.downButtonChangeMode()}></TouchableOpacity>
                    </View>
                        : null
                }
                {
                    this.state.isMode === 'image' ? null :
                        <ProgressBarAnimated
                            {...progressCustomStyles}
                            width={barWidth}
                            maxValue={100}
                            value={this.state.progressCustomized}
                        />}
                <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, padding: 10, backgroundColor: 'black' }}>

                    <TouchableOpacity onPress={() => this.goToCapturedMedia()} style={{ position: 'absolute', marginLeft: 40, height: 40, width: 40, borderRadius: 5 }}>
                        {this._mediaPreview()}
                    </TouchableOpacity>


                    <TouchableOpacity
                        onPress={() => this.captureMedia()}
                        style={styles.capture}>
                        <Image style={{ height: 70, width: 70 }}
                            source={
                                this.state.isMode === 'image' ? require('./assets/icons/camera_snap.png') :
                                    (
                                        this.state.isMode === 'video' && !this.videoCapturing ? require('./assets/icons/video_snap.png') :
                                            (this.state.isMode === 'video' && this.videoCapturing ? require('./assets/icons/video_pause.png') :
                                                this.state.isMode === 'audio' && !this.audioCapturing ? require('./assets/icons/video_snap.png') :
                                                    require('./assets/icons/video_pause.png')
                                            ))

                            }
                        ></Image>

                    </TouchableOpacity >
                    {/* Toggle mode button */}
                    <TouchableOpacity onPress={this.showAndHideMenu.bind(this)} style={styles.optionsMenu}  >
                        <Image source={this.state.isMode === 'image' ? require('./assets/icons/camera.png') : (this.state.isMode === 'video' ? require('./assets/icons/video.png') : require('./assets/icons/audio.png'))}
                            style={{ height: 25, width: 25, }} >
                        </Image>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        );
    }


    pickMediaFromGallery = () => {

        ImagePicker.openPicker({
            multiple: true,
            maxFiles: 2,
            forceJpg: false,
            cropping: false,
          compressImageQuality:0.7
        }).then(images => {

            console.log(images);

            images.forEach((item) => {

                if (item.mime.includes('image')) {

console.log (item.mime)
                    var data = item
                    data.type = "image";
                    data.uri = "file://" + item.path;
                    data.comment = null;
                    console.log(data)
                    this._mediaFiles.push(data);

                }
                else if (item.mime.includes('video')) {

                    var data = item
                    data.type = "video";
                    data.uri = item.path;
                    data.comment = null;
                    RNThumbnail.get(item.path).then((result) => {
                        // thumbnail path
                        this.thumbnailUri = result.path
                        data.thumbnail = this.thumbnailUri
                        this._mediaFiles.push(data);
                        this.setState({});
                    })


                }
            })
            this.setState({});
        });

    }

    captureMedia = async function () {
        if (this.camera) {
            if (this.state.isMode === 'image') {
                const options = { quality: 0.5 , fixOrientation: true };
                const data = await this.camera.takePictureAsync(options);
                data.type = "image";
                data.comment = null;
                this._mediaFiles.push(data);
                this.setState({});
            }
            else if (this.state.isMode === 'video') {
                // console.log('video')

                const options = {  quality: RNCamera.Constants.VideoQuality['480p'], fixOrientation: true };

                this.videoCapturing = !this.videoCapturing;
                if (this.videoCapturing) {
                    console.log("Start Recording")
                    this.startRecordingTimer();
                    const data = await this.camera.recordAsync(options)
                    data.type = "video";
                    data.comment = null;
                    RNThumbnail.get(data.uri).then((result) => {
                        console.log(result.path);
                        data.thumbnail =  result.path // thumbnail path
                        this._mediaFiles.push(data);
                        
                        this.setState({});
                        this.increase('progressCustomized', (0))
                    })
                   
                }
                else {
                    console.log("stop Recording")
                    this.stopRecordingTimer();
                    this.camera.stopRecording();
                    this.increase('progressCustomized', (0))
                }
            }
        }
        else if (this.state.isMode === 'audio') {
            var milliseconds = (new Date).getTime();
            this.audioCapturing = !this.audioCapturing;
            // console.log(this.videoCapturing);
            if (this.audioCapturing) {
                this.startRecordingTimer();
                const options = {
                    sampleRate: 16000,  // default 44100
                    channels: 1,        // 1 or 2, default 1
                    bitsPerSample: 16,  // 8 or 16, default 16
                    wavFile: milliseconds + ".wav" // default 'audio.wav'
                };
                AudioRecord.init(options);
                AudioRecord.start();
                console.log("this.audioFile.options.start")
                console.log("StartFileName" + this.audioFile.options.wavFile)
            }
            else {
                await AudioRecord.stop();
                const audioFile = await AudioRecord.stop();
                this._mediaFiles.push({ uri: audioFile, type: 'audio', duration: this.props.audioDuration - this.state.timeRemaining, comment: null });
                this.stopRecordingTimer();
                this.audioUri = audioFile;
                // alert(this.audioUri);
                console.log("this.audioFile.options.wavFile")
                console.log(this.audioFile.options.wavFile)
               
                // this.setState({});
            }
        }
    };

    startRecordingTimer = () => {
        this._interval = setInterval(() => {
            this.setState({ timeRemaining: this.state.timeRemaining - 1 }, () => {

                var remainingTime

                if (this.state.isMode === 'video') {
                    remainingTime = ((this.props.videoDuration - this.state.timeRemaining) / this.props.videoDuration) * 100

                }
                else if (this.state.isMode === 'audio') {
                    remainingTime = ((this.props.audioDuration - this.state.timeRemaining) / this.props.audioDuration) * 100
                }
                console.log(remainingTime)
                this.increase('progressCustomized', (remainingTime))

                console.log(remainingTime)

                if (this.state.timeRemaining == 0) {
                    this.captureMedia();
                }
            });
        }, 1000);
    }

    stopRecordingTimer = () => {
        this.setState({
            timeRemaining: (this.state.isMode === 'video' ? this.props.videoDuration : (this.state.isMode === 'audio' ? this.props.audioDuration : 0))
        });
        clearInterval(this._interval);
        this.increase('progressCustomized', (0))
    }

    flash = () => {
        if (this.camera) {
            var state = this.state;
            state.flashMode = state.flashMode === RNCamera.Constants.FlashMode.on
                ? RNCamera.Constants.FlashMode.off : RNCamera.Constants.FlashMode.on;
            this.setState(state);
        }
    };

    goToCapturedMedia = () => {
        if (!this.videoCapturing && !this.audioCapturing) {
            this.props.navigation.navigate('Preview', {
                file: this._mediaFiles[this._mediaFiles.length - 1],
                onFileDelete: () => {
                    this._mediaFiles.pop();
                    // console.log(this._mediaFiles);
                    this.setState({});
                },
                onCrossedPressed: (previewFile) => {
              
                    console.log ("Cross Button Pressed")  
                },
                onDonePressed: (previewFile) => {
                    this._mediaFiles.pop ()
                    this._mediaFiles.push (previewFile)
                   console.log ("Done Button Pressed")
                    this.setState({});
                }
            });
        }
    }

    showAndHideMenu = () => {
        if (!this.videoCapturing && !this.audioCapturing) {
            this.setState({
                showMenu: !this.state.showMenu,
            });
        }
    }

    upButtonChangeMode = () => {
        if (this.state.isMode === 'image') {
            this.setState({
                showMenu: false,
                isMode: 'video',
                timeRemaining: this.props.videoDuration,
                cameraType: RNCamera.Constants.Type.back
            })
            this.increase('progressCustomized', (0))
        }
        else if (this.state.isMode === 'video') {
            this.setState({
                showMenu: false,
                isMode: 'audio',
                timeRemaining: this.props.audioDuration,
                
            })
            this.increase('progressCustomized', (0))
        }
        else {
            this.setState({
                showMenu: false,
                isMode: 'image'
            })
        }
    }

    downButtonChangeMode = () => {
        if (this.state.isMode === 'image') {
            this.setState({
                showMenu: false,
                isMode: 'audio',
                timeRemaining: this.props.audioDuration
            })
            this.increase('progressCustomized', (0))
        }
        else if (this.state.isMode === 'video') {
            this.setState({
                showMenu: false,
                isMode: 'image'
            })
        }
        else {
            this.setState({
                showMenu: false,
                isMode: 'video',
                timeRemaining: this.props.videoDuration,
                cameraType: RNCamera.Constants.Type.back
            })
            this.increase('progressCustomized', (0))
        }
    }

    cameraMode = () => {
        if (this.camera) {
            var state = this.state;
            state.cameraType = state.cameraType === RNCamera.Constants.Type.back
                ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back;
            this.setState(state);
        }
    };

    _mediaPreview = () => {
        var view = null;

        var lastMedia = (this._mediaFiles && this._mediaFiles.length > 0 ? this._mediaFiles[this._mediaFiles.length - 1] : null);

        console.log(lastMedia)
        console.log(this._mediaFiles.length + ' / ' + lastMedia);
        if (lastMedia) {
            console.log(lastMedia);
            if (lastMedia.type === 'audio') {
                view = <Image source={require('./assets/images/audio_wallpaper_phone.png')} style={{ position: 'absolute', height: 40, width: 40, borderRadius: 5,  borderColor: '#dcdcdc', borderWidth: 2 }} />
            }
            else if (lastMedia.type === 'image') {
                console.log(lastMedia.thumbnail)
                view = <Image source={{ uri: lastMedia.uri }}
                    style={{ position: 'absolute', height: 40, width: 40, borderRadius: 5, borderWidth: 2, borderColor: '#dcdcdc', backgroundColor: 'black' }} />
            }
            else { 

                view = <Image source={{ uri: lastMedia.thumbnail }}

                    style={{ position: 'absolute', height: 40, width: 40, borderRadius: 5, borderWidth: 2, borderColor: '#dcdcdc', backgroundColor: 'black' }} />
            }

        }

        return view;
    }

    _doneClick = () => {
        console.log(this._mediaFiles);
        this.props.navigation.state.params.onComplete(this._mediaFiles);
        this.props.navigation.pop();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
   //     paddingTop: (Platform.OS === "ios" ? 20 : 0)
    },

    preview: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        marginTop: 54,
        top: 0,
        marginBottom: 90,
        backgroundColor: 'black',
        alignItems:'stretch'
    },
    capture: {
        alignSelf: 'center',
    },
    optionsMenu: {
        marginRight: 40,
        right: 0,
        position: 'absolute',
        height : 50,
        width:50,
        backgroundColor:'#807F7F',
        borderRadius:25,
        alignItems:'center',
        justifyContent: 'center',
    },
    headerContainer: {
    //    paddingTop: (Platform.OS === "ios" ? 20 : 0),
        backgroundColor: '#0171B9',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        // height:100
    },

    leftButton: {
        // flex:1,
        padding: 10,
        alignSelf: 'flex-start',
        alignItems: 'flex-start'
    },
    timerContainer: {
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center'
    },
    timerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'red',
        alignSelf: 'center',
        marginRight: 5
    },
    timer: {
        alignSelf: 'center',
        textAlign: "center",
        color: 'white'
    },
    rightButtonHolder: {
        // flex: 1,
     //   position:'absolute',
        alignSelf: 'flex-end',
        justifyContent: 'center',
        alignItems: 'flex-end',
        flexDirection: 'row'
    },
    menuContainer: {
        width: 30,
        height: 80,
        position: 'absolute',
        right: 0,
        zIndex: 999999,
        marginRight: 60,
        marginBottom: 100,
        bottom: 40,
        borderRadius: 10,
    },
    imageContainerOfMenu: {
        width: 44,
        height: 89,
  
    }
    ,
    touchUpOfMenu: {
        width: 30,
        height: 40,
        position: 'absolute',
        marginBottom: 40,
        bottom: 0,
        borderRadius: 0,
    },

    touchDownOfMenu: {
        width: 30,
        height: 40,
        bottom: 0,
        position: 'absolute',
        borderRadius: 0,
    },

});
