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
    StyleSheet,
    Text,
    TouchableOpacity,
    View, Platform, Image
} from 'react-native';
import PropTypes from 'prop-types';
import { RNCamera } from 'react-native-camera';
import AudioRecord from 'react-native-audio-record';
// import Video from 'react-native-video';
// const instructions = Platform.select({
//     ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
//     android:
//         'Double tap R on your keyboard to reload,\n' +
//         'Shake or press menu button for dev menu',
// });

export default class Media extends Component {

    static navigationOptions = {
        header: null,
    };
    videoCapturing = false;
    audioCapturing = false;
    audioUri = '';
    _mediaFiles = [];

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
        videoDuration: 30,
        audioDuration: 20
    }

    constructor(props) {
        super(props);
        this.captureMedia = this.captureMedia.bind(this);
        this.cameraMode = this.cameraMode.bind(this);
        this.upButtonChangeMode = this.upButtonChangeMode.bind(this);
        this.downButtonChangeMode = this.downButtonChangeMode.bind(this);
        this.goToCapturedMedia = this.goToCapturedMedia.bind(this);
    }

    state = {
        cameraType: RNCamera.Constants.Type.back,
        flashMode: RNCamera.Constants.FlashMode.off,
        isMode: 'image',
        showMenu: false,
        timeRemaining: 0,
    }
    render() {
        return (
            <View style={styles.container}>
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
                        <TouchableOpacity style={{ padding: 10 }}>
                            <Image style={{ height: 20, width: 20 }}
                                source={require('./assets/icons/gallery.png')}
                            ></Image>
                        </TouchableOpacity>
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



                <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, padding: 10, backgroundColor: 'black' }}>
                    <TouchableOpacity onPress={() => this.goToCapturedMedia()} style={{ position: 'absolute', marginLeft: 40, height: 40, width: 40, borderRadius: 5 }}>
                        { this._mediaPreview() }
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

                    </TouchableOpacity>



                    {/* Toggle mode button */}
                    <TouchableOpacity onPress={this.showAndHideMenu.bind(this)} style={styles.optionsMenu} >
                        <Image source={this.state.isMode === 'image' ? require('./assets/icons/camera.png') : (this.state.isMode === 'video' ? require('./assets/icons/video.png') : require('./assets/icons/audio.png'))}
                            style={{ height: 25, width: 25, }} >
                        </Image>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }



    captureMedia = async function () {
        if (this.camera) {
            if (this.state.isMode === 'image') {
                const options = { quality: 0.5, base64: true, fixOrientation: true };
                const data = await this.camera.takePictureAsync(options);
                data.type = "image";
                this._mediaFiles.push(data);
                this.setState({});
            }
            else if (this.state.isMode === 'video') {
                // console.log('video')

                const options = { base64: true, quality: RNCamera.Constants.VideoQuality['480p'], fixOrientation: true };

                this.videoCapturing = !this.videoCapturing;
                if (this.videoCapturing) {
                    console.log("Start Recording")
                    this.startRecordingTimer();
                    const data = await this.camera.recordAsync(options)
                    data.type = "video";
                    this._mediaFiles.push(data);
                    
                    this.setState({});
                }
                else {
                    console.log("stop Recording")
                    this.stopRecordingTimer();
                    this.camera.stopRecording();
                }
            }
        }
        else if (this.state.isMode === 'audio') {
            var milliseconds = (new Date).getTime();
            const options = {
                sampleRate: 16000,  // default 44100
                channels: 1,        // 1 or 2, default 1
                bitsPerSample: 16,  // 8 or 16, default 16
                wavFile: milliseconds + '.mp3' // default 'audio.wav'
            };

            AudioRecord.init(options);
            this.audioCapturing = !this.audioCapturing;
            // console.log(this.videoCapturing);
            if (this.audioCapturing) {
                this.startRecordingTimer();
                AudioRecord.start();
            }
            else {
                await AudioRecord.stop();
                const audioFile = await AudioRecord.stop();
                this._mediaFiles.push({uri: audioFile, type: 'audio', duration: this.props.audioDuration - this.state.timeRemaining});
                this.stopRecordingTimer();
                this.audioUri = audioFile;
            }
        }
    };

    startRecordingTimer = () => {
        this._interval = setInterval(() => {
            this.setState({ timeRemaining: this.state.timeRemaining - 1 }, () => {
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
            this.props.navigation.navigate('Preview', { file: this._mediaFiles[this._mediaFiles.length-1], 
                onFileDelete: () => {
                    this._mediaFiles.pop();
                    // console.log(this._mediaFiles);
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
                timeRemaining: this.props.videoDuration
            })
        }
        else if (this.state.isMode === 'video') {
            this.setState({
                showMenu: false,
                isMode: 'audio',
                timeRemaining: this.props.audioDuration
            })
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
                timeRemaining: this.props.videoDuration
            })
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

        var lastMedia = (this._mediaFiles && this._mediaFiles.length > 0 ? this._mediaFiles[this._mediaFiles.length-1] : null);

        
        console.log(this._mediaFiles.length+' / '+lastMedia);
        if(lastMedia){
            console.log(lastMedia);
            if(lastMedia.type === 'audio'){
                view = <Image source={ require('./assets/images/audio_wallpaper_phone.png') } style={{ position: 'absolute', height: 40, width: 40, borderRadius: 5 }} />
            }
            else{ // if(lastMedia.type === 'image'){
                view = <Image source={{ uri: lastMedia.uri }} 
                    style={{ position: 'absolute', height: 40, width: 40, borderRadius: 5, borderWidth:2, borderColor: '#dcdcdc', backgroundColor:'black' }} />
            }
            // else if(lastMedia.type === 'video'){
            //     view = <Video source={{ uri: lastMedia.uri }} resizeMode='contain' paused={false} shouldPlay={false}
            //         style={{ position: 'absolute', height: 40, width: 40, borderRadius: 5, borderWidth:2, borderColor: '#dcdcdc' }}/>
            //     // <Video style={{ position: 'absolute', height: 40, width: 40, borderRadius: 5 }} resizeMode='contain' paused={true}
            //     // source={{ uri: lastMedia.uri }} shouldPlay={false} />
            // }
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
        backgroundColor: 'black'
    },

    preview: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        marginTop: 40,
        top: 0,
        marginBottom: 90,
        bottom: 90

    },
    capture: {
        alignSelf: 'center',
    },
    optionsMenu: {
        marginRight: 70,
        right: 0,
        position: 'absolute',
    },
    headerContainer: {
        // padding: 20,
        backgroundColor: '#0171B9',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        padding: 0
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
        marginRight: 65,
        marginBottom: 100,
        bottom: 0,
        borderRadius: 10,
    },
    imageContainerOfMenu: {
        width: 30,
        height: 80,
        position: 'absolute',
        borderRadius: 10,
    }
    ,
    touchUpOfMenu: {
        width: 30,
        height: 40,
        position: 'absolute',
        marginBottom: 40,
        bottom: 0,
        borderRadius: 10,
    },

    touchDownOfMenu: {
        width: 30,
        height: 40,
        bottom: 0,
        position: 'absolute',
        borderRadius: 10,
    },

});
