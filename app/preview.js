/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

'use strict';
import React, { Component } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Text, PermissionsAndroid, Platform, StatusBar, TouchableWithoutFeedbackComponent, Dimensions } from 'react-native'
import Sound from 'react-native-sound';
import RNFS from "react-native-fs";
import Video from 'react-native-video';
import SafeAreaView from "react-native-safe-area-view";
import RNDsPhotoEditor from 'react-native-ds-photo-editor';
import { IOS_EDITOR_KEY, ANDROID_EDITOR_KEY } from 'custom-media-module/app/constants';
import MediaHandler from "./MediaHandler";
import AlertDialog from './AlertDialog';

export default class Preview extends Component {

	static navigationOptions = {
		header: null,
	};
	file = '';
	mediaType = '';
	track;
	EditedFile;
	state = {
		paused: true,
		isDelete: false
	}
	_showDoneButton = true;
	isPreviewFromStudent = false;
	openEditor = false

	constructor(props) {
		super(props)
		this._playAudio = this._playAudio.bind(this);
		this._cancelPressed = this._cancelPressed.bind(this);
		this._donePressed = this._donePressed.bind(this);
		this._editImage = this._editImage.bind(this);
		this._dialogCallback = this._dialogCallback.bind(this);

		const { navigation } = this.props;
		this.file = navigation.getParam('file', '');
		this._showDoneButton = navigation.getParam('showDoneButton', true);
		// console.log(this.file);
		this.EditedFile = JSON.parse(JSON.stringify(this.file));

		 console.log("PreviewMode" + navigation.getParam('previewType'))

		this.isPreviewFromStudent = navigation.getParam('previewType', false)
		this.openEditor = navigation.getParam('openEditor', false)
		if (this.openEditor == true && this.file.type == 'image') {

			console.log("imageEditor")
			this._editImage()
		}
	

	}

	// componentDidMount() {
	// 	MediaHandler.getExistingFiles();
	// }




	// getExistingFiles = () => {
	// 	console.log(RNFS.CachesDirectoryPath);
	// 	console.log(RNFS.DocumentDirectoryPath);

	// 	RNFS.readDir(RNFS.CachesDirectoryPath + '/Camera/')
	// 		.then((result) => {
	// 			console.log('GOT RESULT', result);
	// 			return Promise.all([RNFS.stat(result[0].path), result[0].path]);
	// 		})
	// 		.catch((err) => {
	// 			console.log(err.message, err.code);
	// 		});

	// 	RNFS.readDir(RNFS.DocumentDirectoryPath)
	// 		.then((result) => {
	// 			console.log('GOT RESULT', result);
	// 			return Promise.all([RNFS.stat(result[0].path), result[0].path]);
	// 		})
	// 		.catch((err) => {
	// 			console.log(err.message, err.code);
	// 		});

	// }

	_editImage = () => {

		if (Platform.OS === 'ios') {
			RNDsPhotoEditor.init(IOS_EDITOR_KEY)
			// console.log("filePath")
			RNDsPhotoEditor.openEditor(this.EditedFile.uri).then(uri => {

				var time = Date.now();

				var newFilePath = RNFS.CachesDirectoryPath + '/Camera/' + time + '.png'
				RNFS.moveFile(uri, newFilePath).then((result) => {
					// console.log('MOVE FILE  RESULT', result);
					// console.log(newFilePath);
					// console.log(uri)
					// return Promise.all([RNFS.stat(result[0].path), result[0].path]);
				}).catch((err) => {
					console.log(err.message, err.code);
				});

				this.EditedFile.uri = "file://" + newFilePath;
				this.setState({})

				if (this.openEditor == true && this.file.type == 'image') {
					this._donePressed()
				}


			}).catch(error => {
				console.log(error)
			});
		}
		else {
			RNDsPhotoEditor.init(ANDROID_EDITOR_KEY)
			// console.log("filePath")
			RNDsPhotoEditor.openEditor(this.EditedFile.uri).then(uri => {
				this.EditedFile.uri = "file://" + uri;
				this.setState({})


				if (props.openEditor == true && this.file.type == 'image') {
					this._donePressed()
				}
				// console.log(uri)
			}).catch(error => {
				console.log(error)
			});
		}
	}

	_dialogCallback = (response) => {
		if (response) {
			const filePath = this.file.uri.split('///').pop();

			RNFS.exists(filePath)
				.then((res) => {
					if (res) {
						RNFS.unlink(filePath)
							.then(() => {
								console.log('FILE DELETED');

								// RNFS.exists(filePath).then((res) => { console.log('file status ' + res) });
								this.setState({
									isDelete: false
								});
								this.props.navigation.state.params.onFileDelete();
								this.props.navigation.pop();
							});
					}
				})
		}
		else {
			this.setState({
				isDelete: false
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
						{this.isPreviewFromStudent === false ? <TouchableOpacity style={styles.leftButton} onPress={this._deleteMedia}>
							<Image source={require('./assets/icons/trash.png')} style={{ height: 20, width: 20 }} />
						</TouchableOpacity> : null}
						{ ((this.isPreviewFromStudent === false ) || (this.isPreviewFromStudent === true && this.file.type == 'image')) ? <TouchableOpacity style={styles.rightButton} onPress={this._donePressed} >
							<Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>Done</Text>
						</TouchableOpacity> : 
						null
				}


					</View>

					<AlertDialog
						show={this.state.isDelete}
						title={'FrogProgress'}
						message="Are you sure you want to delete this item?"
						negativeButtonText="Cancel" positiveButtonText="Delete"
						onButtonClicked={this._dialogCallback} />


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
					source={require('./assets/images/audio_wallpaper_phone.png')} />;
				break;
			case 'image':
				view = <Image resizeMode='contain' style={[styles.screenCover, { flex: 1 }]} source={{ uri: this.EditedFile.uri }} />;
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

		this.setState({
			isDelete: true
		});

	}

	_cancelPressed = () => {

		this.props.navigation.state.params.onCrossedPressed(this.file);
		this.props.navigation.pop();

	}

	_donePressed = () => {
		console.log('done pressed');
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
		alignItems: 'flex-start',
	},
	rightButton: {
		// flex:1,
		padding: 10,
		position: 'absolute',
		right: 10,
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
		top: 5,
		left: 5,
		right: 5,
		bottom: 5,
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


