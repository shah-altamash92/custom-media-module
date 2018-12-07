
'use strict';
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View, Platform, Image, Dimensions, StatusBar, ActivityIndicator, Animated
} from 'react-native';
import PropTypes from 'prop-types';
import { RNCamera } from 'react-native-camera';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import ImagePicker from 'react-native-image-crop-picker';
import SafeAreaView from "react-native-safe-area-view";
import RNThumbnail from 'react-native-thumbnail';
import Permissions from 'react-native-permissions';
import SoundRecorder from 'react-native-sound-recorder';
import BlinkView from './BlinkView';
import AlertDialog from './AlertDialog';
import { MAX_MEDIA_UPLOAD } from '../../../app/constants/constants';

export default class Media extends Component {

    static navigationOptions = {
        header: null,
    };
    videoCapturing = false;
    audioCapturing = false;

    audioUri = '';
    _mediaFiles = [];
    thumbnailUri = '';
    _bottomHeight = 0;
    attachedMediaCounter = 0;
    _interval = null;
    _alertMessage = "";
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
        this._pickMediaFromGallery = this._pickMediaFromGallery.bind(this);
        this.permissionPopup = this.permissionPopup.bind(this);
        this._checkOS = this._checkOS.bind(this);
        const { navigation } = this.props;
        this.attachedMediaCounter = navigation.getParam('mediaCounter', 0);
        this._dialogCallback = this._dialogCallback.bind(this);
        this.slideBottomToTop = this.slideBottomToTop.bind(this);
        this.slideTopToBottom = this.slideTopToBottom.bind(this);
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
            animating: false,
            isBlinking: false,
            bottomHeight: 0,
            permissionState: false,
            mediaLimitError: false,
            y: new Animated.Value(100),

        }

    componentWillUnmount() {

        if (this.state.videoCapturing) {
            this.camera.stopRecording();
        }
        if (this.state.audioCapturing) {
            SoundRecorder.stop();
        }
    }

    componentDidMount() {
        // console.log("component did Mount")
        setTimeout(() => {
            this._checkOS();
        }, 300);
    }
    permissionPopup = () => {
        Permissions.request('photo', 'camera', 'Microphone').then(response => {
            // Returns once the user has chosen to 'allow' or to 'not allow' access
            // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
            if (response === 'authorized') {
                this.setState({
                    permissionState: true
                })
                console.log("Authorized")
            }
            else {
                this.props.navigation.pop();
            }
        })
    }

    _checkOS = () => {
        if (Platform.OS === 'android') {
            const value = this.permissionPopup();
            // console.log(value);
            //this._editImage();
        }
        else {
            this.setState({
                permissionState: true
            })
        }
    }
    _dialogCallback = () => {

        this.setState({
            mediaLimitError: false
        });

    }

    increase = (key, value) => {
        this.setState({
            [key]: + value,
        });

        // console.log(value)
    }

    render() {
        const barWidth = Dimensions.get('screen').width;
        const progressCustomStyles = {
            backgroundColor: 'red',
            borderRadius: 0,
            height: 3,
            borderWidth: 0,
            padding: 0,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 99999999999
        };

        return (
            <SafeAreaView style={styles.container} forceInset={{ bottom: 'never' }}>
                <StatusBar
                    backgroundColor='#0171B9'
                    barStyle="light-content" />
                <View style={styles.headerContainer} >
                    {
                        this.videoCapturing || this.audioCapturing ?
                            <TouchableOpacity style={styles.leftButton} >
                                <Text style={{ fontSize: 16 }}> </Text>
                            </TouchableOpacity>
                            :
                            <TouchableOpacity style={styles.leftButton} onPress={this._doneClick}>
                                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Done</Text>
                            </TouchableOpacity>
                    }
                    {
                        this.state.isMode === 'video' || this.state.isMode === 'audio' ?

                            <View style={[styles.centerContainer]} >
                                <View style={[styles.timerContainer, { height: this.state.headerBarHeight }]}>


                                    {
                                        this.state.isBlinking ?
                                            <BlinkView blinking={true} delay={500}>
                                                <View style={styles.timerDot}></View>
                                            </BlinkView>
                                            :
                                            null
                                    }

                                    <Text style={styles.timer}>
                                        {this.state.timeRemaining} Secs
                    </Text>
                                </View>
                            </View> : null
                    }
                    {
                        this.videoCapturing || this.audioCapturing ? null :
                            <View style={styles.rightButtonHolder}>
                                {
                                    this.state.isMode === 'audio' ? null : (this.videoCapturing ? null :
                                        <TouchableOpacity onPress={() => this.cameraMode()} style={{ padding: 10 }}>
                                            <Image style={{ height: 20, width: 20 }}
                                                source={require('./assets/icons/camera_switch.png')}
                                            ></Image>
                                        </TouchableOpacity>)
                                }
                                
                                    
                                        <TouchableOpacity onPress={this._pickMediaFromGallery} style={{ padding: 10 }}>
                                            <Image style={{ height: 20, width: 20 }}
                                                source={require('./assets/icons/gallery.png')}
                                            ></Image>
                                        </TouchableOpacity>
                                
                            </View>
                    }
                </View>

                {

                    <View style={styles.preview}>

                        {
                            this.state.permissionState === true ? (this.state.isMode === 'audio' ?
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
                                        //       console.log(barcodes)
                                    }} />) : null
                        }

                    </View>

                }


                <View style={{ flex: 1, zIndex: 99, position: 'absolute', bottom: this._bottomHeight }} >
                    {
                        // this.state.isMode === 'image' ? null :
                        <ProgressBarAnimated
                            {...progressCustomStyles}
                            width={barWidth}
                            maxValue={100}
                            value={this.state.progressCustomized}
                        />
                    }
                </View>

                {
                    this.state.showMenu === true ? <Animated.View style={[styles.menuContainer, {
                        transform: [
                            {
                                translateY: this.state.y
                            }
                        ]
                    }]}>
                        <Image style={styles.imageContainerOfMenu}
                            source={(this.state.isMode === 'image' ? require('./assets/icons/camera_switch_option.png') : (this.state.isMode === 'video' ? require('./assets/icons/video_switch_option.png') : require('./assets/icons/audio_switch_option.png')))}
                        ></Image>
                        <TouchableOpacity style={styles.touchUpOfMenu} onPress={() => this.upButtonChangeMode()}></TouchableOpacity>
                        <TouchableOpacity style={styles.touchDownOfMenu} onPress={() => this.downButtonChangeMode()}></TouchableOpacity>
                    </Animated.View>
                        : null
                }


                <View style={{ position: 'absolute', width: '100%', justifyContent: 'center', bottom: 0, padding: 10, backgroundColor: 'black' }}
                    onLayout={(event) => {
                        var { x, y, width, height } = event.nativeEvent.layout;
                        this.setState({
                            bottomHeight: height
                        })
                        this._bottomHeight = height;
                        // console.log('showing options');
                        // this.setState({
                        //     actionBarHeight: height
                        // })
                    }}>
                    {

                        this.videoCapturing || this.audioCapturing ? null :
                            (
                                this.state.animating === true ?
                                    <ActivityIndicator
                                        animating={this.state.animating}
                                        color='#bc2b78'
                                        size="large"
                                        style={styles.activityIndicator} />
                                    :
                                    <TouchableOpacity onPress={() => this.goToCapturedMedia()} style={{ position: 'absolute', marginLeft: 40, height: 40, width: 40, borderRadius: 5 }}>
                                        {this._mediaPreview()}
                                    </TouchableOpacity>
                            )
                    }

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
                    {
                        this.videoCapturing || this.audioCapturing ? null :
                        <TouchableOpacity onPress={this.showAndHideMenu.bind(this)} style={styles.optionsMenu}  >
                            <Image source={this.state.isMode === 'image' ? require('./assets/icons/camera.png') : (this.state.isMode === 'video' ? require('./assets/icons/video.png') : require('./assets/icons/audio.png'))}
                                style={{ height: 20, width: 20, }} >
                            </Image>
                        </TouchableOpacity> 
                    }

                    <AlertDialog
                        show={this.state.mediaLimitError}
                        title={'FrogProgress'}
                        message={this._alertMessage}
                        negativeButtonText='' positiveButtonText="OK"
                        onButtonClicked={this._dialogCallback} />

                </View>



            </SafeAreaView>
        );
    }


    _pickMediaFromGallery = () => {
        if (this.attachedMediaCounter + this._mediaFiles.length < MAX_MEDIA_UPLOAD) {
            ImagePicker.openPicker({
                multiple: true,
                maxFiles: (MAX_MEDIA_UPLOAD - (this.attachedMediaCounter + this._mediaFiles.length)),
                forceJpg: false,
                cropping: false
            }).then(images => {

                console.log(images);
                // console.log(images.length);

                if (images.length > (MAX_MEDIA_UPLOAD - (this.attachedMediaCounter + this._mediaFiles.length))) {
                    this._alertMessage = "Only 10 files can be uploaded at a time. You have included more than permitted limit. You can select "+(MAX_MEDIA_UPLOAD - (this.attachedMediaCounter + this._mediaFiles.length))+" more files.";
                    this.setState({
                        mediaLimitError: true
                    });
                }
                else {
                    images.forEach((item) => {

                    if (item.mime.includes('image')) {

                        //   console.log(item.mime)
                        var data = item
                        data.type = "image";
                        data.uri = "file://" + item.path;
                        data.comment = null;
                        //    console.log(data)
                        this._mediaFiles.push(data);

                    }
                    else if (item.mime.includes('video')) {

                        var data = item
                        data.type = "video";
                        data.uri = item.path;
                        data.comment = null;

                        if (Platform.OS === 'android') {
                        data.thumbnail = data.uri // thumbnail path
                            this._mediaFiles.push(data);

                            this.setState({});
                        }

                        if (Platform.OS === 'ios') {
                            RNThumbnail.get(item.path).then((result) => {
                                // thumbnail path
                                this.thumbnailUri = result.path
                                data.thumbnail = this.thumbnailUri
                                this._mediaFiles.push(data);
                                this.setState({});
                            }

                            )
                        }

                        }
                    })
                }
                this.setState({});
            });
        }
        else {

            //  console.log ("Limit Exceeds")
            this._alertMessage = "You already have multiple pieces of evidence ready for upload. Please submit them before adding more";
            this.setState({
                mediaLimitError: true
            });
        }



    }

    captureMedia = async function () {

        if (this.attachedMediaCounter + this._mediaFiles.length < MAX_MEDIA_UPLOAD) {
            if (this.camera) {
                if (this.state.isMode === 'image') {
                    const options = { quality: 0.5, fixOrientation: true, pictureSize: "640x480", forceUpOrientation: true };
                    this.setState({
                        animating: true
                    })
                    const data = await this.camera.takePictureAsync(options);
                    data.type = "image";
                    data.comment = null;
                    this._mediaFiles.push(data);

                    this.setState({
                        animating: false

                    })
                }
                else if (this.state.isMode === 'video') {
                    // console.log('video')

                    const options = { quality: RNCamera.Constants.VideoQuality['480p'], fixOrientation: true };

                    this.videoCapturing = !this.videoCapturing;
                    if (this.videoCapturing) {
                        console.log("Start Recording")
                        this.startRecordingTimer();
                        const data = await this.camera.recordAsync(options)
                        data.type = "video";
                        data.comment = null;

                        if (Platform.OS === 'android') {
                        data.thumbnail = data.uri // thumbnail path
                            this._mediaFiles.push(data);

                            this.setState({
                                animating: false
                            })
                            this.increase('progressCustomized', (0))
                        }


                        if (Platform.OS === 'ios') {
                            RNThumbnail.get(data.uri).then((result) => {
                                //             console.log(result.path);
                                data.thumbnail = result.path // thumbnail path
                                this._mediaFiles.push(data);

                                this.setState({
                                    animating: false
                                })
                                this.increase('progressCustomized', (0))

                            })
                        }

                    }
                    else {
                        console.log("stop Recording")
                        this.stopRecordingTimer();
                        this.camera.stopRecording();
                        this.setState({
                            animating: true
                        })
                        this.increase('progressCustomized', (0))
                    }
                }
            }
            else if (this.state.isMode === 'audio') {
                var _this = this;
                var milliseconds = (new Date).getTime();
                this.audioCapturing = !this.audioCapturing;
                // console.log(this.videoCapturing);
                if (this.audioCapturing) {
                    this.startRecordingTimer();

                    SoundRecorder.start(SoundRecorder.PATH_CACHE + '/' + milliseconds + '.mp4', {
                        format: SoundRecorder.FORMAT_MPEG_4,
                        encoder: SoundRecorder.ENCODER_AAC
                    }).then(function () {
                                       console.log('started recording');
                        }).catch((err) => {
                            console.log('Error in recording audio :');
                            console.log(err);
                            console.log("===================");
                        });
                }
                else {

                    SoundRecorder.stop()
                        .then(function (result) {
                            //             console.log('stopped recording, audio file saved at: ' + result.path);
                            _this._mediaFiles.push({ uri: result.path, type: 'audio', duration: _this.props.audioDuration - _this.state.timeRemaining, comment: null });
                            _this.stopRecordingTimer();
                            _this.audioUri = result.path;

                        }).catch((err) => {
                            console.log('Error in stopping audio :');
                            console.log(err);
                            console.log("===================");
                        });
                }
            }
        }
        else {
            this._alertMessage = "You already have multiple pieces of evidence ready for upload. Please submit them before adding more";
            this.setState({
                mediaLimitError: true
            });
        }
    };

    startRecordingTimer = () => {

        // this.setState (
        //     {
        //         isBlinking:true
        //     }
        // );

        this.setState({ isBlinking: true });
        //  console.log("isBlinking" + this.state.isBlinking)


        this._interval = setInterval(() => {
            this.setState({ timeRemaining: this.state.timeRemaining - 1 }, () => {

                var remainingTime

                if (this.state.isMode === 'video') {
                    remainingTime = ((this.props.videoDuration - this.state.timeRemaining) / this.props.videoDuration) * 100

                }
                else if (this.state.isMode === 'audio') {
                    remainingTime = ((this.props.audioDuration - this.state.timeRemaining) / this.props.audioDuration) * 100
                }
                //        console.log(remainingTime)
                this.increase('progressCustomized', (remainingTime))

                //      console.log(remainingTime)

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
        this.setState(
            {
                isBlinking: false
            }
        );
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
            if(this._mediaFiles.length>0){
                this.props.navigation.navigate('Preview', {
                    file: this._mediaFiles[this._mediaFiles.length - 1],
                    onFileDelete: () => {
                        this._mediaFiles.pop();
                        // console.log(this._mediaFiles);
                        this.setState({});
                    },
                    onCrossedPressed: (previewFile) => {
    
                        console.log("Cross Button Pressed")
                    },
                    onDonePressed: (previewFile) => {
                        this._mediaFiles.pop()
                        this._mediaFiles.push(previewFile)
                        //       console.log("Done Button Pressed")
                        this.setState({});
    
                        // console.log(this._mediaFiles);
                        this.props.navigation.state.params.onComplete(this._mediaFiles);
                        this.props.navigation.pop();
                    }, 'previewType': false
                });
            }
           
        }
    }

    showAndHideMenu = () => {
        if (!this.videoCapturing && !this.audioCapturing) {
            // this.setState({
            //     showMenu: !this.state.showMenu,
            // });
            this.state.showMenu === true ? this.slideTopToBottom() : this.slideBottomToTop()

        }
    }

    slideBottomToTop = () => {


        Animated.timing(this.state.y, {
            toValue: 0,
            duration: 450
        }).start(() => this.setState({
            y: new Animated.Value(0)
        }))

        // Animated.spring(this.state.y, {
        //   toValue: 0,
        // }).start();
        this.setState({
            showMenu: true,

        });
    };
    slideTopToBottom = () => {

        Animated.timing(this.state.y, {
            toValue: 100,
            duration: 450
        }).start(() => this.setState({
            y: new Animated.Value(100),
            showMenu: false,
        }));




    };


    upButtonChangeMode = () => {
        if (this.state.isMode === 'image') {
            this.setState({
               
                isMode: 'video',
                timeRemaining: this.props.videoDuration,
                cameraType: RNCamera.Constants.Type.back
            })
            this.increase('progressCustomized', (0))
        }
        else if (this.state.isMode === 'video') {
            this.setState({
               
                isMode: 'audio',
                timeRemaining: this.props.audioDuration,

            })
            this.increase('progressCustomized', (0))
        }
        else {
            this.setState({
             
                isMode: 'image'
            })
        }
       


        Animated.timing(this.state.y, {
            toValue: 100,
            duration: 450,
            useNativeDriver:true
        }).start(() => this.setState({
            y: new Animated.Value(100),
            showMenu: false,
        }));
    }

    downButtonChangeMode = () => {
        if (this.state.isMode === 'image') {
            this.setState({
               
                isMode: 'audio',
                timeRemaining: this.props.audioDuration
            })
            this.increase('progressCustomized', (0))
        }
        else if (this.state.isMode === 'video') {
            this.setState({
             
                isMode: 'image'
            })
        }
        else {
            this.setState({
              
                isMode: 'video',
                timeRemaining: this.props.videoDuration,
                cameraType: RNCamera.Constants.Type.back
            })
            this.increase('progressCustomized', (0))
        }
        Animated.timing(this.state.y, {
            toValue: 100,
            duration: 450,
            useNativeDriver:true
        }).start(() => this.setState({
            y: new Animated.Value(100),
            showMenu: false,
        }));
    }

    cameraMode = () => {
        if (this.camera) {
            var state = this.state;
            state.cameraType = state.cameraType === RNCamera.Constants.Type.back
                ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back;

                console.log ( state.cameraType)
            this.setState(state);
        }
    };

    _mediaPreview = () => {
        var view = null;

        var lastMedia = (this._mediaFiles && this._mediaFiles.length > 0 ? this._mediaFiles[this._mediaFiles.length - 1] : null);

        // console.log(lastMedia)
        // console.log(this._mediaFiles.length + ' / ' + lastMedia);
        if (lastMedia) {
            // console.log(lastMedia);
            if (lastMedia.type === 'audio') {
                view = <Image source={require('./assets/images/audio_wallpaper_phone.png')} style={{ position: 'absolute', height: 40, width: 40, borderRadius: 5, borderColor: '#dcdcdc', borderWidth: 2 }} />
            }
            else if (lastMedia.type === 'image') {
                //      console.log(lastMedia.thumbnail)
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
        // console.log(this._mediaFiles);
        this.props.navigation.state.params.onComplete(this._mediaFiles);
        this.props.navigation.pop();
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#0171B9',
        paddingTop: (Platform.OS === "ios" ? 20 : 0)
    },

    preview: {
        //  position: 'absolute',
        width: '100%',
        height: '100%',
        // marginTop: 54,
        // top: 0,
        marginBottom: 90,
        backgroundColor: 'black',
        alignItems: 'stretch'
    },
    capture: {
        alignSelf: 'center',
    },
    optionsMenu: {
        marginRight: 40,
        right: 0,
        position: 'absolute',
        height: 40,
        width: 40,
        //   backgroundColor:'#807F7F',
        backgroundColor: '#303030',
        borderRadius: 25,
        alignItems: 'center',
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
    centerContainer: {
        position: 'absolute',
        alignSelf: 'center',
        left: 0,
        right: 0,
        bottom: 8,
        justifyContent: 'center',
        alignItems: 'center'
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
        width: 40,
        height: 80,
        position: 'absolute',
        right: 0,
        zIndex: 999999,
        marginRight: 40,
        marginBottom: 60,
        bottom: 40,
        borderRadius: 10,
    },
    imageContainerOfMenu: {
        width: 40,
        height: 80,
    }
    ,
    touchUpOfMenu: {
        width: 40,
        height: 40,
        position: 'absolute',
        marginBottom: 40,
        bottom: 0,
        borderRadius: 0,
    },

    touchDownOfMenu: {
        width: 40,
        height: 40,
        bottom: 0,
        position: 'absolute',
        borderRadius: 0,
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 80,
        zIndex: 999,
        position: 'absolute',
        marginLeft: 40,
    }

});
