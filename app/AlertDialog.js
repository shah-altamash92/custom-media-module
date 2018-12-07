import React from "react";
import { View, Modal, StyleSheet, Text, Platform, TouchableOpacity } from "react-native";

/**
 * Custom alert dialog
 * @param {Properties} props 
 */
const AlertDialog = (props) => {
    return props.show ?
     <View style={styles.MainContainer}>
        <Modal
            transparent={true}
            animationType={"fade"}
            onRequestClose={() => {} }>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.25)' }}>
                <View style={styles.Alert_Main_View}>
                    <Text style={styles.Alert_Title}>{props.title}</Text>
                    <Text style={styles.Alert_Message}>{props.message}</Text>
                    <View style={{ flexDirection: 'row', marginTop:20 }}>
                        {
                            props.negativeButtonText && props.negativeButtonText.length > 0 ?
                            <TouchableOpacity
                                style={styles.buttonStyleNegative}
                                onPress={() => { props.onButtonClicked(false); }}
                                activeOpacity={0.7}>
                                <Text style={styles.NegativeTextStyle}>{props.negativeButtonText}</Text>
    
                            </TouchableOpacity> : null
                        }
                        {
                            props.positiveButtonText && props.positiveButtonText.length > 0 ?
                            <TouchableOpacity
                            style={(props.negativeButtonText && props.negativeButtonText.length) > 0 ? styles.buttonStylePositive :styles.buttonStylePositive_Green }
                                onPress={() => { props.onButtonClicked(true); }}
                                activeOpacity={0.7}>
                                <Text style={styles.PositiveTextStyle}>{props.positiveButtonText}</Text>
                            </TouchableOpacity> : null
                        }
                    </View>
                </View>
            </View>
        </Modal>
    </View> : null;
}



const styles = StyleSheet.create({

    MainContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: (Platform.OS == 'ios') ? 20 : 0,
        position: 'absolute',
        top:0,
        bottom:0,
        left: 0,
        right: 0,
        zIndex: 999
    },

    Alert_Main_View: {
        padding: 10,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        width: 280,
        borderWidth: 1,
        borderColor: '#fff',
        opacity:0.95,
        borderRadius: 8,
    },


    Alert_Title: {
        fontFamily: 'Arial',
        marginTop: 10,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },

    Alert_Message: {
        fontFamily: 'Arial',
        marginTop: 10,
        fontSize: 15,
        color: 'black',
        textAlign: 'center',
    },

    buttonStyleNegative: {
        padding:10,
        marginRight:10,
        borderRadius:4,
        width:'45%',
        backgroundColor: '#bcbdbf',
        justifyContent: 'center',
        alignItems: 'center'
    },


    buttonStylePositive: {
        padding:10,
        marginLeft:10,
        borderRadius:4,
        width:'45%',
        backgroundColor: '#d31146',
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttonStylePositive_Green: {
        padding:10,
       // marginLeft:10,
        borderRadius:4,
        width:'100%',
        backgroundColor: '#52B748',
        justifyContent: 'center',
        alignItems: 'center'
    },

    PositiveTextStyle: {
        fontFamily: 'Arial',
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
    NegativeTextStyle: {
        fontFamily: 'Arial',
        color: '#000',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,

    }

});

export default AlertDialog;
