import React, { useState, useEffect, useLayoutEffect } from 'react'
import { View, Text, FlatList, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, SafeAreaView, Image, StatusBar, Alert } from 'react-native'
import AddIcon from 'react-native-vector-icons/Ionicons';
import Loader from '../../components/Loader'
import DeleteIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import Icon from 'react-native-vector-icons/Feather'
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import ThemeConstant, { DynamicThemeConstants } from '../../constant/ThemeConstant';
import { axiosInstance1 } from '../../constant/Auth';
import { getAllNotesList, note } from '../../constant/APIs';
import * as API_CONSTANT from '../../constant/ApiConstant'
import * as API from '../../constant/APIs';
import { format } from 'date-fns'
import moment from "moment";
import { useDispatch, useSelector } from 'react-redux';
import { SET_ALERT } from '../../store/actions/types';

export default function NotesHome({ navigation, route }) {
  const dispatch = useDispatch()
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  const { token, isAuthenticated } = useSelector(state => state.authReducer);
  const bookCover = route.params;
  console.log('bookcover is ', bookCover);
  const [Data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [render, setrender] = useState(true);
  const isFocused = useIsFocused();




  //to get the notes from api or from Async store-----
  useFocusEffect(
    React.useCallback(() => {
      if (!isAuthenticated) {
        getNotesWithoutLogin();
      } else {
        getNotesFromApi();
      }
    }, [])
  )


  //get notes from api----------------------
  const getNotesFromApi = () => {
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + `${token}`,
      },
    };

    axiosInstance1
      .get(`${getAllNotesList}`, axiosConfig)
      .then((res) => {
        let notes = res.data.data;
        console.log('notes from api', res);
        const newNotes = notes.map((item) => {
          if (item.mediaItemId) {
            let image = `${API.IMAGE_LOAD_URL}/${item.squareArtworkId}?${API_CONSTANT.SQUARE_IMAGE_HEIGHT_WIDTH}`;
            return {
              ...item,
              image: image,
              isSelected: false
            };
          } else {
            return {
              ...item,
              isSelected: false
            };
          }
        });
        if (newNotes && newNotes.length > 0) {
          setData(newNotes);
          setrender(true)
        }
        else {
          setrender(false)
        }
        setData(newNotes);
        setLoading(false)
      })
      .catch((err) => {
        dispatch({
          type: SET_ALERT, payload: {
            setShowAlert: true,
            data: {
              message: 'Could not fetch notes!',
              showCancelButton: true,
              onCancelPressed: () => {
                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
              },
            }
          }
        })
        setLoading(false)
      });
  };

  //getting notes from async storage------------------
  const getNotesWithoutLogin = () => {
    AsyncStorage.getItem('notes').then(async (fetchedNotesString) => {
      let fetchedNotes = JSON.parse(fetchedNotesString);
      console.log('fetched note in asysns store is', fetchedNotes);
      if (fetchedNotes !== null && fetchedNotes.length > 0) {
        setData(fetchedNotes);
        setrender(true)
        setLoading(false)
      }
      else {
        setrender(false)
        setLoading(false)

      }
    });
  };

  //rendering diffrent screen depending on weather we have any note or not--------------------------------------------

  return render ? (
    <NotesAvailable
      Data={Data}
      setData={setData}
      navigation={navigation}
      theme={theme}
      brandColor={brandColor}
      loading={loading}
      setrender={setrender}
      isAuthenticated={isAuthenticated}
      token={token}
      setLoading={setLoading}
      getNotesFromApi={getNotesFromApi}
    // bookCover={bookCover}
    />
  ) : (
    <NoNotes
      Data={Data}
      setData={setData}
      navigation={navigation}
      theme={theme}
      brandColor={brandColor}
      setrender={setrender}
      isAuthenticated={isAuthenticated}
      token={token}
      setLoading={setLoading}
    />
  );
}

//When notes are availbale means when there is even a single note this screen will render as noresHome------

function NotesAvailable(props) {
  const { Data, setData, navigation, name, theme, brandColor, color, loading, setrender, isAuthenticated, token, setLoading, getNotesFromApi } = props;
  const isFocused = useIsFocused();
  const dispatch = useDispatch()


  let [selected, setSelected] = useState(false);
  //This is pop up dialog box that will show up after you  use delete button to delete individual delete-----------
  const showConfirmDialog = (Data) => {

    console.log('new Updated data >>>', Data)
    dispatch({
      type: SET_ALERT, payload: {
        setShowAlert: true,
        data: {
          message: "Are you sure you want to remove selected notes?",
          showCancelButton: true,
          onCancelPressed: () => {
            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
          },
          showConfirmButton: true,
          confirmText: 'Yes',
          onConfirmPressed: () => {
            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            if (!isAuthenticated) {
              removeSelectedItemFromAsync(Data)
            } else {
              removeSelectedFromApi(Data)
            }

          }
        }

      }
    }
    )
  };

  useEffect(() => {
    setSelected(false);
  }, [isFocused]);

  useEffect(() => {
    if (selected) {
      navigation.setOptions({
        headerRight: () => (
          <DeleteIcon
            name="delete"
            size={25}
            color={'#fff'}
            onPress={() => {
              showConfirmDialog(Data)
            }}
          />
        ),
      });
    } else {
      navigation.setOptions({
        headerRight: () => {
          {
            null;
          }
        },
      });
    }
  })

  //to format the date
  const getDate = (date) => {
    let time, timeNew;
    let dateTime = moment
      .utc(`${date}`)
      .local()
      .format();
    [date, timeNew] = dateTime.split("T");
    time = timeNew.slice(0, 8);
    if (new Date(date).getDate() === new Date().getDate()) {
      let timeStr = time.slice(0, 5);
      let timeToshow = tConvert(timeStr);
      return timeToshow;
    } else if (new Date(date).getDate() + 1 === new Date().getDate()) {
      return "yesterday";
    }
    return format(new Date(date), "do MMM");
  };

  //converting the time format--------------------------
  function tConvert(time) {
    // Check correct time format and split into components
    time = time
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) {
      // If time format correct
      time = time.slice(1); // Remove full string match value
      time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join(''); // return adjusted time or original string
  }

  //to select the value that are long pressed
  function onPressItem(id, type) {
    let newArray = Data.map((val, i) => {
      if (val.id === id) {
        return { ...val, isSelected: type };
      } else {
        return val;
      }
    });
    setData(newArray);
    if (newArray.filter((item) => item.isSelected === true).length > 0) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  }

  //to remove all the selected values--------------------------

  async function removeSelectedItemFromAsync(Data) {
    let newArray = Data.filter((val, i) => {
      if (val.isSelected == false) {
        return val;
      }
    });
    setData(newArray);
    setSelected(false);
    if (newArray.length <= 0) {
      setrender(false)
    }
    await AsyncStorage.setItem('notes', JSON.stringify(newArray))
      .then(() => console.log('selected Notes removed from Async storage'))
      .catch((err) => console.log(err));
  }

  async function removeSelectedFromApi(Data) {

    setLoading(true)
    // to post the note to api----------------------
    let str = ``;
    Data.map((item, index) => {
      if (item.isSelected == true) {
        str += item.id + ',';
      }
    })
    let idsStr = str.slice(0, -1);

    let axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        Authorization: 'Bearer ' + `${token}`,
      },
    };
    axiosInstance1
      .delete(`${note}?ids=${idsStr}`, axiosConfig)
      .then((res) => {
        setSelected(false)
        getNotesFromApi();
      })
      .catch((err) => {
        console.log('error: ', err)
        setSelected(false)
        getNotesFromApi()
      });
  };

  return (
    <View
      style={{
        height: '100%',
        backgroundColor:
          theme === 'DARK'
            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BODY
            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_NOTE,
      }}
    >
      <StatusBar
        animated={true}
        backgroundColor={brandColor} />
      <Loader loading={loading} />
      <View>
        <FlatList
          data={Data}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.8}
              onLongPress={() => {
                onPressItem(item.id, !item.isSelected);
              }}
              onPress={() => {
                if (item.isSelected) {
                  onPressItem(item.id, false);
                } else {
                  navigation.navigate('SingleNote', { item, theme, color });
                }
              }}
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                height: 120,
                backgroundColor: item.isSelected
                  ? '#D3D3D3'
                  : theme === 'DARK'
                    ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BODY
                    : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_NOTE,
                flexDirection: 'row',
              }}
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 18,
                    color:
                      theme === 'DARK'
                        ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                        : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                    marginBottom: 5,
                  }}
                >
                  {item.title}
                </Text>
                {item.description ? (
                  <Text
                    numberOfLines={2}
                    style={{
                      fontSize: 13,
                      color:
                        theme === 'DARK'
                          ? DynamicThemeConstants.DARK.TEXT_COLOR_SECONDARY
                          : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
                      maxHeight: 70,
                      lineHeight: 18,
                    }}
                  >
                    {item.description}
                  </Text>
                ) : null}
                <Text
                  style={{
                    fontSize: 13,
                    color:
                      theme === 'DARK'
                        ? DynamicThemeConstants.DARK.TEXT_COLOR_SECONDARY
                        : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY,
                    marginTop: 10,
                  }}
                >
                  {getDate(item.createdDate)}
                  {/* {item.createdDate} */}
                </Text>
              </View>
              {item.mediaItemId ? (
                <View>
                  <Image
                    source={{ uri: item.image }}
                    style={{
                      width: item.type == "MEDIA_ITEM" ? 100 : 60,
                      height: item.type == "MEDIA_ITEM" ? 80 : null,
                      aspectRatio: item.type == "MEDIA_ITEM" ? null : 396 / 612,
                      marginLeft: 10,
                    }}
                  />
                </View>
              ) : null}
              {item.ebookItemId ? (
                <View>
                  <Image
                    source={{ uri: item.bookCover }}
                    style={{
                      width: 60,
                      aspectRatio: 396 / 612,
                      marginLeft: 10,
                    }}
                  />
                </View>
              ) : null}
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
        />
      </View>

      <Text>{name}</Text>

      <AddIcon
        style={{ position: 'absolute', bottom: 20, right: 20 }}
        name="md-add-circle-sharp"
        size={50}
        color={
          theme === 'DARK' ? DynamicThemeConstants.DARK.ICON_COLOR : brandColor
        }
        onPress={() => {
          navigation.navigate('AddNote', { theme, setrender });
        }}
      />
    </View>
  );
}

// when there are no notes or DATA.lenght == 0 then this screen will be rendered as nmotes home

function NoNotes(props) {

  const { navigation, theme, brandColor, setrender } = props

  useEffect(() => {
    navigation.setOptions({
      headerRight: null,
    });
  });

  return (
    <View>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          backgroundColor:
            theme == 'DARK'
              ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BODY
              : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_BODY,
        }}
      >
        <StatusBar
          animated={true}
          backgroundColor={brandColor}
        />
        <Icon
          name="file-text"
          size={140}
          color="gray"
          style={{
            marginVertical: 20,
          }}
        />
        <Text
          style={{
            fontSize: 18,
            color: 'rgba(0,0,0,0.8)',
            marginBottom: 10,
          }}
        >
          No Notes
        </Text>

        <Text
          style={{
            color: 'gray',
            fontSize: 16,
          }}
        >
          Take a Note to get Started
        </Text>
      </View>

      <AddIcon
        style={{ position: 'absolute', bottom: 20, right: 20 }}
        name="md-add-circle-sharp"
        size={50}
        color={
          theme == 'DARK' ? DynamicThemeConstants.DARK.ICON_COLOR : brandColor
        }
        onPress={() => {
          navigation.navigate('AddNote', { theme, setrender });
        }}
      />
    </View>
  );
}