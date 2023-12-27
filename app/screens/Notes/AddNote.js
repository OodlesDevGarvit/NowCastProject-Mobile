import React, { useEffect, useState } from 'react'
import { View, Image, Text, TextInput, StyleSheet, Button, TouchableOpacity, Linking, BackHandler, Alert, StatusBar } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CheckIcon from 'react-native-vector-icons/AntDesign'
import uuid from 'react-native-uuid'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DynamicThemeConstants } from '../../constant/ThemeConstant';
import { createNote } from '../../constant/APIs';
import { axiosInstance1 } from '../../constant/Auth';
import { ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import PlayIcon from 'react-native-vector-icons/FontAwesome'
import Loader from '../../components/Loader';
import * as API from '../../constant/APIs';
import * as API_CONSTANT from '../../constant/ApiConstant'
import { useDispatch, useSelector } from 'react-redux';
import { SET_ALERT } from '../../store/actions/types'


export default function AddNote({ navigation, route }) {
    const dispatch = useDispatch()
    const { brandColor, mobileTheme: theme } = useSelector(
        (state) => state.brandingReducer.brandingData
    );
    const { token, isAuthenticated } = useSelector(state => state.authReducer);
    const { orgId } = useSelector(state => state.activeOrgReducer);
    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');

    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false)
    let { MediaBanner, videoTitle, mediaItemId, ebookItemId, ebookTitle, bookCover,imageBgColor} = route.params;
    const setrender = route?.params?.setrender;


    // to post the note to api----------------------
    const addNotes = () => {
        let type = mediaItemId ? 'MEDIA_ITEM' : (ebookItemId ? 'EBOOK' : null)
        if (title || description) {
            setLoading(true)
            let data = JSON.stringify({
                title,
                description: description,
                mediaItemId: mediaItemId || ebookItemId,
                type: type
            })

            let axiosConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    "Access-Control-Allow-Origin": "*",
                    'Authorization': 'Bearer ' + `${token}`,
                }
            };
            axiosInstance1.post(`${createNote}`, data, axiosConfig)
                .then((res) => {
                    console.log('notes added in post api create notes:', res)
                    navigation.navigate('NotesHome',{
                    })
                    setLoading(false)

                })
                .catch(err => {
                    // console.log('error: ', err)
                    setLoading(false)
                })
        }

    }

    //getting square art image id---------------

    useEffect(() => {
        if (mediaItemId) {
            axiosInstance1.get(`${API.mediaItemId}/${mediaItemId}?organizationId=${orgId}`)
                .then(res => {
                    // console.log('res is ------------ :', res.data.data.squareArtwork.document.id)
                    let squareArtworkId = res.data.data.squareArtwork.document.id;
                    if (squareArtworkId) {
                        let imageSq = `${API.IMAGE_LOAD_URL}/${squareArtworkId}?${API_CONSTANT.SQUARE_IMAGE_HEIGHT_WIDTH}`
                        setImage(imageSq)
                    }
                })
                .catch(err => console.log('error :', err))
        }
    }, [])

    //to add note in Async store----------------------
    const addNoteInAsync = () => {
        let type = mediaItemId ? 'MEDIA_ITEM' : (ebookItemId ? 'EBOOK' : null)
        console.log('added called')
        AsyncStorage.getItem('notes').then(async (fetchedNotes) => {
            let data = JSON.parse(fetchedNotes)
            // console.log('data is showing on add notes-----', data)

            if (title || description) {
                const newNote = {
                    id: uuid.v4(),
                    title: title,
                    description: description,
                    createdDate: new Date(),
                    image: image,
                    isSelected: false,
                    videoTitle: type == 'MEDIA_ITEM' ? videoTitle : ebookTitle,
                    mediaItemId: mediaItemId,
                    ebookItemId: ebookItemId,
                    ebookTitle: ebookTitle,
                    bookCover: bookCover,
                    imageBgColor:imageBgColor,
                    type: type

                }

                // console.log('new note is ----------------------------', newNote)
                let updatedNotes = [];
                if (data) {
                    updatedNotes = [newNote, ...data]
                }
                else {
                    updatedNotes = [newNote]
                }
                AsyncStorage.setItem('notes', (JSON.stringify(updatedNotes)))
                    .then(() => {
                        // console.log('note is added in the async store')
                        navigation.navigate('NotesHome')
                    })
                    .catch(err => console.log(err))
            }
        })
    }

    //This is pop up dialog box that will show up after you  use delete button to delete individual delete-----------

    const showConfirmDialog = () => {
        dispatch({
            type: SET_ALERT, payload: {
              setShowAlert: true,
              data: {
                message: 'Note is added successfully',
                showConfirmButton: true,
                confirmText: 'Ok',
                onConfirmPressed: () => {
                  dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                  if (isAuthenticated) {
                    addNotes()
                    navigation.goBack()
                } else {
                    addNoteInAsync();
                    navigation.goBack()
                }
    
                }
              }
    
            }
          }
          )
     
    };


    return (
        <View style={
            {
                flex: 1,
                backgroundColor: (theme === "DARK" ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE)
            }}
        >
            <StatusBar
                // animated={true}
                translucent={false}
                backgroundColor={brandColor} />
            <Loader loading={loading} />
            <View style={{ flex: 1 / 2, minHeight: "86%" }}>
                {
                    (mediaItemId) ?
                        <TouchableWithoutFeedback
                            onPress={() => {
                                navigation.goBack();
                            }}>
                            <View style={Styles.media}>
                                <View style={Styles.imageContainer}>
                                    <Image
                                        source={{ uri: MediaBanner }}
                                        style={
                                            {
                                                width: 50,
                                                height: 50,
                                                borderRadius: 4
                                            }
                                        } />
                                    <View style={Styles.iconContainer}>
                                        <PlayIcon
                                            name="play"
                                            size={13}
                                            color="#fff"
                                        />

                                    </View>

                                </View>
                                <Text numberOfLines={3} style={
                                    {
                                        flex: 1,
                                        fontSize: 20,
                                        paddingHorizontal: 10,
                                        color: "#000000"
                                    }
                                }>
                                    {videoTitle}
                                </Text>
                            </View>
                        </TouchableWithoutFeedback> : null
                }
                {
                    (ebookItemId) ?
                        <TouchableWithoutFeedback
                            onPress={() => {
                                navigation.goBack();
                            }}>
                            <View style={Styles.media}>
                                <View style={Styles.imageContainer}>
                                    <Image
                                        source={{ uri: bookCover }}
                                        style={
                                            {
                                                width: 50,
                                                height: 50,
                                                borderRadius: 4
                                            }
                                        } />

                                </View>
                                <Text numberOfLines={3} style={
                                    {
                                        flex: 1,
                                        fontSize: 20,
                                        paddingHorizontal: 10,
                                        color: "#000000"
                                    }
                                }>
                                    {ebookTitle}
                                </Text>
                            </View>
                        </TouchableWithoutFeedback> : null
                }
                <KeyboardAwareScrollView enableOnAndroid={true}>
                    <TextInput
                        multiline={false}
                        value={title}
                        placeholder={'Title'}
                        placeholderTextColor={(theme == "DARK") ? DynamicThemeConstants.DARK.TEXT_COLOR_SECONDARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY}
                        onChangeText={(val) => {
                            setTitle(val)
                        }}
                        style={
                            {
                                ...Styles.title,
                                color: (theme === 'DARK') ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                            }
                        }
                    />
                    <ScrollView>
                        <TextInput
                            multiline={true}
                            // numberOfLine={30}
                            value={description}
                            placeholder="Note.."
                            placeholderTextColor={(theme == "DARK") ? DynamicThemeConstants.DARK.TEXT_COLOR_SECONDARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY}
                            style={
                                {
                                    ...Styles.note,
                                    color: (theme === 'DARK') ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY

                                }
                            }
                            onChangeText={(val) => {
                                setDescription(val)
                            }} />
                    </ScrollView>
                </KeyboardAwareScrollView>
            </View>
            <View style={{ flex: 1, marginTop: 5, justifyContent: "flex-end", alignItems: "flex-end" }}>
                {
                    <CheckIcon
                        style={{
                            position: "absolute",
                            right: 20,
                            bottom: 20,

                        }}
                        name="checkcircle"
                        size={40}
                        color={(theme == 'DARK') ? DynamicThemeConstants.DARK.ICON_COLOR : brandColor}
                        onPress={() => {
                            if (setrender) {
                                setrender(true)
                            };
                            if(title == "" && description == ''){
                                dispatch({type:SET_ALERT,payload:{
                                    setShowAlert:true,
                                    data:{
                                   message:'Notes is empty',
                                   showCancelButton:true,
                                   onCancelPressed:()=>{
                                    dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
                                   },
                                  }
                                  }
                                  })
                            }else{
                                if (!isAuthenticated) {
                                    if (mediaItemId) {
                                        showConfirmDialog()
                                    }
                                    else if (ebookItemId) {
                                        showConfirmDialog()
                                    }
                                    else {
                                        addNoteInAsync()
                                        setTitle('')
                                        setDescription('')
                                    }
    
    
                                } else {
                                    if (mediaItemId) {
                                        showConfirmDialog()
                                    }
                                    else if (ebookItemId) {
                                        showConfirmDialog()
                                    }
                                    else {
                                        addNotes()
                                        setTitle('')
                                        setDescription('')
                                    }
    
                                }
                            }
                          
                        }

                        } />


                }
            </View>
        </View>

    )
}



const Styles = StyleSheet.create({

    title: {
        marginHorizontal: 20,
        marginTop: 15,
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 0,
    },
    note: {
        marginHorizontal: 20,
        fontSize: 16,
        padding: 0,
    },
    media: {
        marginHorizontal: 20,
        marginVertical: 20,
        height: 80,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 1 },
        shadowRadius: 4,
        shadowOpacity: 0.4,
        elevation: 6,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    imageContainer: {
        // borderWidth: 1,
        borderColor: 'red',
        marginRight: 15,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    iconContainer: {
        position: 'absolute',
        backgroundColor: "rgba(0,0,0,0.7)",
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        borderRadius: 40
    }
})