import React, { useEffect, useLayoutEffect } from 'react'
import { useState } from 'react';
import { View, Image, Text, TextInput, StyleSheet, Dimensions, Modal, TouchableOpacity, TouchableWithoutFeedback, Alert, BackHandler, StatusBar } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import OptionIcon from 'react-native-vector-icons/SimpleLineIcons'
import ShareIcon from 'react-native-vector-icons/MaterialIcons';
import CheckIcon from 'react-native-vector-icons/AntDesign'
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DynamicThemeConstants } from '../../constant/ThemeConstant';
import { note } from '../../constant/APIs';
import { axiosInstance1 } from '../../constant/Auth';
import PlayIcon from 'react-native-vector-icons/FontAwesome'
import Loader from '../../components/Loader';
import { useIsFocused } from '@react-navigation/core';
import * as API from '../../constant/APIs'
import * as API_CONSTANT from '../../constant/ApiConstant';
import Share from 'react-native-share';
import { useDispatch, useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/core';
import { SET_ALERT } from '../../store/actions/types';

export default function SingleNote({ navigation, route }) {
  const dispatch = useDispatch();
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  const { token, isAuthenticated } = useSelector(state => state.authReducer);


  const { item } = route.params;
  const [newTitle, setNewTitle] = useState(item.title);
  const [newNoteDescription, setNewNoteDescription] = useState(
    item.description
  );
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bgColor, setBgColor] = useState('');
  const [ebookBgColor,setEbookBgColor] =useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const { orgId } = useSelector(state => state.activeOrgReducer);

  const isFocused = useIsFocused();
  //setting header options--------------
  useFocusEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <OptionIcon
          name="options-vertical"
          size={20}
          color={'#fff'}
          onPress={() => {
            setOptionsVisible(true);
          }}
        />
      ),
    });
  });

  //setting the video title--------------------------------
  useEffect(() => {
    if (item?.mediaItemId || item?.ebookItemId) {
      (async () => {
        try {
          setLoading(true);
          const res = await axiosInstance1.get(
            `${API.mediaItemId}/${item.mediaItemId}?organizationId=${orgId}`
          );
          const data = res.data.data;
          console.log('media item api in notes',data);
          setVideoTitle(data.title);
          setBgColor(data.bannerArtwork.document.imageColur);
          setEbookBgColor(data.ebookArtwork.document.imageColur);
          setLoading(false);
        } catch (err) {
          console.log('erro while getting media item data', err);
          setLoading(false);
        }
      })();
    }
  }, [isFocused]);

  //update note from api---------------
  const updateNoteInApi = () => {
    setLoading(true);
    let data = JSON.stringify({
      title: newTitle,
      description: newNoteDescription,
    });

    let axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Authorization: 'Bearer ' + `${token}`,
      },
    };
    axiosInstance1
      .put(`${note}/${item.id}`, data, axiosConfig)
      .then((res) => {
        // console.log('note updated in API')
        navigation.navigate('NotesHome');
        setLoading(false);
      })
      .catch((err) => {
        console.log('error: ', err);
        setLoading(false);
      });
  };

  // updateNoteInAsync ------------------
  const updateNoteAsync = (id) => {
    AsyncStorage.getItem('notes').then(async (allNotes) => {
      let Data = JSON.parse(allNotes);

      const newData = Data.map((item) => {
        if (item.id == id) {
          return {
            ...item,
            title: newTitle,
            description: newNoteDescription,
            createdDate: new Date(),
          };
        } else return item;
      });

      await AsyncStorage.setItem('notes', JSON.stringify(newData))
        .then(() => {
          // console.log("Notes saved in Async storage after update--")
          navigation.navigate('NotesHome');
        })
        .catch((err) => console.log(err));
    });
  };

  //delete note from Async store
  const deleteFromAsync = (id) => {
    AsyncStorage.getItem('notes').then(async (allNotes) => {
      let Data = JSON.parse(allNotes);

      const newData = Data.filter((item) => item.id !== id);

      await AsyncStorage.setItem('notes', JSON.stringify(newData))
        .then(() => console.log('Notes deleted from Async storage'))
        .catch((err) => console.log(err));

      navigation.goBack();
    });

  };

  //delete notes from API-----
  const deleteFromApi = () => {
    // to post the note to api----------------------
    setLoading(true);
    let axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Authorization: 'Bearer ' + `${token}`,
      },
    };
    axiosInstance1
      .delete(`${note}?ids=${item.id}`, axiosConfig)
      .then((res) => {
        // console.log('notes delted:', res.data.data)
        navigation.navigate('NotesHome');
        setLoading(false);
      })
      .catch((err) => {
        // console.log('error: ', err)
        setLoading(false);
      });
  };

  const shareNotes = () => {
    //called on press of share button---------------------------------
    const shareOptions = {
      //   message: 'Share your notes',
      message: `${note}/${item.id}`,
    };

    try {
      const ShareResponse = Share.open(shareOptions);
      // console.log('share response is  :>> ', ShareResponse);
    } catch (error) {
      // console.log('Error =====>', error);
    }
  };

  //This is pop up dialog box that will show up after you  use delete button to delete individual delete-----------

  const showConfirmDialog = () => {
    dispatch({
      type: SET_ALERT, payload: {
        setShowAlert: true,
        data: {
          message: "Are you sure you want to remove this note?",
          showCancelButton: true,
          onCancelPressed: () => {
            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
          },
          showConfirmButton: true,
          confirmText: 'Yes',
          onConfirmPressed: () => {
            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            if (isAuthenticated) {
              deleteFromApi();
            } else {
              deleteFromAsync(item.id);
            }

          }
        }

      }
    }
    )
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor:
          theme == 'DARK'
            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
      }}
    >
      <StatusBar
        animated={true}
        backgroundColor={brandColor} />
      <Loader loading={loading} />
      <View style={{ flex: 1 / 2, minHeight: "85%" }}>

        {item.type=='MEDIA_ITEM' || item.type=='EBOOK'? (
          <TouchableWithoutFeedback
            onPress={() => {
              if(item.type=='MEDIA_ITEM'){
                navigation.navigate('MediaItem', {
                  mediaItemId: item.mediaItemId,
                  color: bgColor,
                });
              }else{
                navigation.navigate('EbookItem',{
                  ebookItemId : item.mediaItemId || item.ebookItemId,
                  imageBgColor:ebookBgColor || item.imageBgColor
                  
                })
              }
            
            }}
          >
            <View style={Styles.media}>
              <View style={Styles.imageContainer}>
                <Image
                  source={{ uri: item.image || item.bookCover }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 4,
                  }}
                />
                {item.type=='MEDIA_ITEM' &&
                  <View style={Styles.iconContainer}>
                  <PlayIcon name="play" size={13} color="#fff" />
                </View>
                }
              </View>
              <Text
                numberOfLines={3}
                style={{
                  flex: 1,
                  fontSize: 20,
                  paddingHorizontal: 10,
                  color: '#000000',
                }}
              >
                {videoTitle || item.ebookTitle}
              </Text>
            </View>
          </TouchableWithoutFeedback>
        ) : null}

        <KeyboardAwareScrollView enableOnAndroid={true}>
          <TextInput
            defaultValue={item.title}
            placeholder={'title'}
            placeholderTextColor={
              theme == 'DARK'
                ? DynamicThemeConstants.DARK.TEXT_COLOR_SECONDARY
                : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY
            }
            style={{
              ...Styles.title,
              color:
                theme == 'DARK'
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
            }}
            autoFocus={false}
            onChangeText={(val) => {
              setNewTitle(val);
            }}
          />
          <TextInput
            defaultValue={item.description}
            placeholder={'note'}
            placeholderTextColor={
              theme == 'DARK'
                ? DynamicThemeConstants.DARK.TEXT_COLOR_SECONDARY
                : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY
            }
            multiline={true}
            style={{
              ...Styles.note,
              color:
                theme == 'DARK'
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
            }}
            autoFocus={false}
            onChangeText={(val) => {
              setNewNoteDescription(val);
            }}
          />
        </KeyboardAwareScrollView>
        <Modal animationType="fade" transparent={true} visible={optionsVisible}>
          <TouchableWithoutFeedback
            onPress={() => {
              setOptionsVisible(false);
            }}
          >
            <View
              style={{
                flex: 1,
              }}
              onPress={() => {
                setOptionsVisible(false);
              }}
            >
              <SafeAreaView>
                <View style={Styles.options}>
                  <TouchableOpacity
                    style={Styles.optionContainer}
                    onPress={shareNotes}
                  >
                    <Text style={Styles.text}>Share</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={Styles.optionContainer}
                    onPress={() => {
                      showConfirmDialog();
                    }}
                  >
                    <Text style={Styles.text}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
      <View style={{ flex: 1, marginTop: 5, justifyContent: "flex-end", alignItems: "flex-end" }}>
        <CheckIcon
          style={{
            position: 'absolute',
            right: 20,
            bottom: 20,
          }}
          name="checkcircle"
          size={40}
          color={
            theme == 'DARK' ? DynamicThemeConstants.DARK.ICON_COLOR : brandColor
          }
          onPress={() => {
            if (!isAuthenticated) {
              updateNoteAsync(item.id);
            } else {
              updateNoteInApi();
            }
          }}
        />
      </View>
    </View>
  );
}

const Styles = StyleSheet.create({
  title: {
    marginHorizontal: 20,
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 0
  },
  note: {
    marginHorizontal: 20,
    fontSize: 16,
    padding: 0,
    lineHeight: 28
  },
  options: {
    // borderWidth: 1,
    backgroundColor: '#fff',
    alignSelf: 'flex-end',
    width: "50%",
    height: 100,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
    borderRadius: 3

  },
  optionContainer: {
    height: '50%',
  },
  text: {
    fontSize: 16,
    flex: 1,
    // borderWidth: 1,
    padding: 15

  },
  media: {
    // borderWidth: 1,
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
    borderRadius: 5
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
