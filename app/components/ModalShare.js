import React, { useEffect } from 'react'
import { useState } from 'react'
import { Pressable, View, Text, FlatList, Image, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Alert } from 'react-native'
import OptionIcon from 'react-native-vector-icons/SimpleLineIcons'
import ShareIcon from 'react-native-vector-icons/AntDesign'
import DeleteIcon from 'react-native-vector-icons/Ionicons'
import { SET_ALERT } from '../store/actions/types'
import { useDispatch } from 'react-redux'
const ModalShare = (iconName, textTitle, firstAction, secondAction, isOpen) => {
    const dispatch =useDispatch()
    const [optionVisible, setOptionVisibility] = useState(false)

    const onHandleModal  = () =>{
        setOptionVisibility(isOpen)
    }

    return (

        <>
            {/* <OptionIcon
                style={{ alignSelf: 'center', color: 'gray', marginRight: 20 }}
                name="options" size={20}
                onPress={() => {
                    setOptionVisibility(true)
                }}
            />
         */}
            <View style={styles.mainContainer}>
                <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={() => setOptionVisibility(!isOpen)}
                >
                    <Modal
                        animationType='fade'                                  // this is the options pop to share or delete the downloads
                        transparent={true}
                        visible={!isOpen}>
                        <TouchableWithoutFeedback
                            onPress={onHandleModal}>
                            <View
                                style={{ backgroundColor: "rgba(0,0,0,0.3)", flex: 1 }}

                            >
                                <View style={styles.options}>

                                    <TouchableOpacity
                                        style={styles.buttonStyles}
                                        onPress={() => {
                                            dispatch({type:SET_ALERT,payload:{
                                                setShowAlert:true,
                                                data:{
                                               message:'Switch to audio',
                                               showCancelButton:true,
                                               onCancelPressed:()=>{
                                                dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
                                               },
                                              }
                                              }}
                                              )

                                                setOptionVisibility(false)
                                            // deleteItem(item.id);


                                        }}>
                                        <Text> <DeleteIcon name={iconName} size={25} />      {textTitle}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.buttonStyles}
                                        onPress={() => {
                                            setOptionVisibility(false)
                                        }}>
                                        <Text> <ShareIcon name='sharealt' size={25} />      share</Text>
                                    </TouchableOpacity>

                                </View>

                            </View>

                        </TouchableWithoutFeedback>


                    </Modal>
                </Pressable>
            </View>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        borderBottomColor: "gray",
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 90,

    },
    buttonStyles:{ height: '50%', justifyContent: 'center' },
    mainContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 465,
    },
    start: {
        flexDirection: 'row',
        maxWidth: "90%",
        width: "70 %"
    },

    image: {
        width: 50,
        height: 50,
        alignSelf: 'center',
        marginLeft: 20
    },
    textContainer: {
        marginLeft: 30,
        alignSelf: 'center',
    },
    options: {
        backgroundColor: '#fff',
        height: 100,
        paddingHorizontal: 10,
        marginBottom: 15,
        justifyContent: 'space-around',
        position: 'absolute',
        bottom: 0,
        width: '100%'

    },
    model: {
        borderWidth: 1,
        borderColor: 'red',
        flex: 1
    },
    button: {
        borderRadius: 20,
        padding: 30,
        width: 500,
        height: 100,
        elevation: 2
    },
})




export default ModalShare;