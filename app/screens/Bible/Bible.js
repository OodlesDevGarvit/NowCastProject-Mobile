import React, { useEffect, useState, useRef } from 'react';
import { FlatList, StatusBar, Modal, ScrollView, View, Image, Text, TouchableOpacity, SafeAreaView, Dimensions, Animated, ActivityIndicator, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { moderateVerticalScale } from 'react-native-size-matters';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import Calendar from 'react-native-vector-icons/MaterialCommunityIcons';
import Style from './Style';
import Accordion from './Accordion';
import * as API_CONSTANT from "../../constant/ApiConstant";
import ThemeConstant from '../../constant/ThemeConstant';
import { BIBLE_TYPES } from '../../store/actions/types';
const { width } = Dimensions.get('window');

const BIBLE_VERSIONS = {
  "ASV": {
    id2: 1,
    abb: "ASV",
    desc: "American Standard Version"
  },
  "ESV": {
    id2: 2,
    abb: "ESV",
    desc: "English Standard Version"
  },
  "NIV": {
    id2: 3,
    abb: "NIV",
    desc: "New International Version"
  },
  "NLT": {
    id2: 4,
    abb: "NLT",
    desc: "New Living Translation"
  },
  "KJV": {
    id2: 5,
    abb: "KJV",
    desc: "King James Version"
  },
  "RVA": {
    id2: 6,
    abb: "RVA",
    desc: "Reina-Valera Antigua"
  },

}


const Bible = ({ route }) => {

  const dispatch = useDispatch();
  const { mobileTheme: theme } = useSelector((state) => state.brandingReducer.brandingData);
  const { selectedVersion, selectedVersionAbb, currentBookName, currentBookId, currentChapterId, activeBookIndex, activeIndex } = useSelector(state => state.bibleReducer);

  // to show different design when navigating to bible from different screens
  const fromHome = route.params?.fromHome;
  const isFocused = useIsFocused();

  // const scrollX = useRef(new Animated.Value(0)).current; //this is for the scroll position
  const flatListRef = useRef(null); //this is for the flatlist of the chapters
  const BooksRef = useRef(null); // for the flatlist showing books list

  const [modalVisible, setModalVisible] = useState(false);
  const [evmVisible, setEvmVisible] = useState(false);
  const [allTexts, setAllTexts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState([]);
  const [Books, setBooks] = useState([]);
  const [allChapters, setAllChapters] = useState([]);

  //setting bible version from the async store and setting the books list based on the bible version selected---
  useEffect(() => {
    (async () => {
      settingVersions();
      getInitialData();
    })()
  }, []);

  // useEffect(() => {
  //   scrollX.addListener(({ value }) => {
  //     let index = Math.round(value / width) + 1;

  //     console.log('index on scroll,', index, activeIndex)

  //     if (index == activeIndex + 1 || index == activeIndex - 1) {
  //       dispatch({ type: BIBLE_TYPES.SET_ACTIVE_INDEX_CH, payload: index });
  //     }


  //     if (Number.isInteger(index)) {
  //       // console.log('This is called at index', index)
  //       // let currentChapterId = `${currentBookId}.${index}`
  //       if (allTexts !== null && allTexts !== []) {
  //         let obj = allTexts.find(ele => ele.number == index);
  //         if (obj !== undefined) {
  //           dispatch({ type: BIBLE_TYPES.SET_CURRENT_CHAPTER_ID, payload: obj.chapterId })
  //         }
  //       }
  //     }
  //     return () => {
  //       scrollX.removeAllListeners()
  //     }
  //   })
  // }, [allTexts])

  //getting the initial data based on selected bible version--

  const getInitialData = async () => {
    await settingBooks(selectedVersion)
    await getAllChapters(currentBookId, selectedVersion)
  }



  // removing bracket from around verse number
  const removeBrackets = (text) => {
    text = text.replace(/[\]]/g, '').trim();
    text = text.replace(/¶/g, '').trim();
    // ¶
    text = text.split(/\[/);
    text = text.map((item, index) => item)
    // console.log('texts are ', text[1][0])
    return text;
  }

  /////////////////////////////////////////////////////////////////////////////////
  //api integration------------------------------------------------

  // to sort array of  objs
  function compareVersions(a, b) {
    return a.id2 - b.id2;
  }
  // step -1 setting  bible versions -----
  const settingVersions = () => {
    setLoading(true)
    const config = {
      headers: { 'api-key': `${API_CONSTANT.BIBLE_API_KEY}` }
    }
    axios(`${API_CONSTANT.bibleApi}`, config)
      .then((res) => {
        let allVersions = res.data.data;
        let newList = []

        allVersions.map(
          (version) => {

            switch (version.abbreviation) {
              case "ASV":
                newList.push({ ...BIBLE_VERSIONS.ASV, ...version })
                break;
              case "ESV":
                newList.push({ ...BIBLE_VERSIONS.ESV, ...version })
                break;
              case "NIV":
                newList.push({ ...BIBLE_VERSIONS.NIV, ...version })
                break;
              case "NLT":
                newList.push({ ...BIBLE_VERSIONS.NLT, ...version })
                break;
              case "engKJV":
                if (version.descriptionLocal == 'Protestant') {
                  newList.push({ ...BIBLE_VERSIONS.KJV, ...version })
                }
                break;
              case "RVR09":
                newList.push({ ...BIBLE_VERSIONS.RVA, ...version })
                break;
              // case :
              //   newList.push({ ...BIBLE_VERSIONS.ESV, ...version })
              //   break;


              default:
                break;
            }

            newList.sort();

            setVersion(newList)
          }


        );

        newList.sort(compareVersions);
        setVersion(newList);
        setLoading(false)
        // console.log('new LIst >>>', newList)
      })
      .catch((err) => {
        console.log('error while getting bible versions:', err);
      });
  };

  //setting books list based on the bible version selected---
  const settingBooks = (selectedVersion, versionChange = false) => {
    // console.log('selected version--', selectedVersion)
    axios(`${API_CONSTANT.bibleApi}/${selectedVersion}/books`, {
      headers: {
        // 'api-key': `${API_CONSTANT.bibleApiKey2}`,
        'api-key': `${API_CONSTANT.BIBLE_API_KEY}`,
      },
    })
      .then((res) => {
        // console.log('bible books', res.data.data)
        let data = res.data.data;
        // console.log('data>>>', data)
        setBooks(data);
        if (data.length > 0 && versionChange) {
          dispatch({ type: BIBLE_TYPES.SET_CURRENT_BOOKNAME, payload: data[0]?.name })
          dispatch({ type: BIBLE_TYPES.SET_CURRENT_BOOKID, payload: data[0]?.id })
          dispatch({ type: BIBLE_TYPES.SET_ACTIVE_INDEX, payload: 0 });
          dispatch({ type: BIBLE_TYPES.SET_ACTIVE_INDEX_CH, payload: 1 });
          getAllChapters(data[0]?.id, data[0]?.bibleId)
          setModalVisible(false)
        }
      })

      .catch((err) => {
        // console.log('error is:', err)
      });
  };

  // //getting the chapter list based on the book selected-------------------------------------------------
  const getAllChapters = (bookId, bibleId) => {
    // console.log('bookId!!!', bookId, bibleId)
    setLoading(true);
    AsyncStorage.getItem('bibleData').then((val) => {
      let data = JSON.parse(val);
      // console.log('getting bible data>>>>>>>>>>', data);
      if (data.length !== 0) {
        getAllChaptersDataFromAsync(bookId, bibleId, data);
      } else {
        getAllChaptersDataFromApi(bookId, bibleId, data);
      }
    });
  };

  const getAllChaptersDataFromApi = (bookId, bibleId, data) => {
    setLoading(true)
    // console.log('Boook is not in async store');

    axios
      .get(
        `https://api.scripture.api.bible/v1/bibles/${bibleId}/books/${bookId}/chapters`,
        {
          headers: {
            'api-key': `${API_CONSTANT.BIBLE_API_KEY}`,
          },
        }
      )
      .then((res) => {
        const chapters = res.data.data;
        setAllChapters(chapters);
        let obj = {
          bookId: bookId,
          bibleId: bibleId,
          chapters: [],
        };
        chapters.forEach((item, index) => {
          setLoading(true);
          axios(
            `https://api.scripture.api.bible/v1/bibles/${item.bibleId}/chapters/${item.id}?content-type=text&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`,
            {
              headers: {
                // 'api-key': `${API_CONSTANT.bibleApiKey2}`
                'api-key': `${API_CONSTANT.BIBLE_API_KEY}`,
              },
            }
          )
            .then((res) => {
              // console.log(res.data.data);
              obj.chapters.push({
                chapterId: item.id,
                text: res.data.data.content,
                number: res.data.data.number,
              });

              if (obj.chapters.length === chapters.length) {
                // to check all the apis are hit--

                // STEP 1: split the original array into two arrays, one for strings and one for numbers
                let str = [],
                  num = [];
                obj.chapters.forEach((e) =>
                  e.number == 'intro' ? str.push(e) : num.push(e)
                );

                // STEP 2: sort the two arrays
                str.sort();
                num.sort((a, b) => a.number - b.number); // because the numbers are actually strings we need to do a - b to implicitly convert them into numbers and sort them using the substraction result
                obj.chapters = [...str, ...num];
                setAllTexts(obj.chapters);
                data.push(obj);
                // console.log('object is:', obj)
                AsyncStorage.setItem('bibleData', JSON.stringify(data));
                setLoading(false);
              }
            })
            .catch((err) => {
              // console.log(err)
            });
        });
      })
      .catch((err) => {
        // console.log('error is:', err)
        setLoading(false);
      });
  };

  const getAllChaptersDataFromAsync = (bookId, bibleId, data) => {
    // console.log('there is data in async store', data, bookId, bibleId);

    const checkEle = (obj) => {
      return obj.bookId === bookId && obj.bibleId == bibleId;
    };

    let isAvailable = data.some(checkEle);
    // console.log('book is available>>', isAvailable)
    if (isAvailable) {
      data.forEach((item) => {
        if (item.bookId == bookId && item.bibleId == bibleId) {
          setAllTexts(item.chapters);
          setLoading(false);
        }
      });

      // axios
      //   .get(
      //     `https://api.scripture.api.bible/v1/bibles/${bibleId}/books/${bookId}/chapters`,
      //     {
      //       headers: {
      //         'api-key': `${API_CONSTANT.BIBLE_API_KEY}`,
      //       },
      //     }
      //   )
      //   .then((res) => setAllChapters(res.data.data))
      //   .catch((err) => {
      //     // console.log('error is:', err)
      //   });
    } else {
      getAllChaptersDataFromApi(bookId, bibleId, data);
    }
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  //functions to handle versionModal and booksModal visibility--
  const openModal = () => {
    if (!modalVisible) {
      setTimeout(() => {
        BooksRef.current.scrollToIndex({ index: activeBookIndex })
      }, 0)
    }
    setModalVisible(!modalVisible)
    setEvmVisible(false);

  };

  const openEVNModal = () => {
    setModalVisible(!modalVisible)
    setEvmVisible(true);
  }

  //setting item layout for the flatlists---

  const getItemLayout = useCallback((data, index) => {
    return {
      length: 65,
      offset: 65 * index,
      index
    }
  }, [])

  const getItemLayoutBook = useCallback((data, index) => {
    return {
      length: width,
      offset: width * index,
      index
    }
  }, [])


  const _onViewableItemsChanged = useCallback(({ viewableItems, changed }) => {
    // console.log("Visible items are", viewableItems);
    // console.log("Changed in this iteration", changed[0]);
    dispatch({ type: BIBLE_TYPES.SET_ACTIVE_INDEX_CH, payload: changed[0].index + 1 })
    dispatch({ type: BIBLE_TYPES.SET_CURRENT_CHAPTER_ID, payload: `${currentBookId}.${changed[0].index + 1}` })
  }, [])

  const _viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  }

  //---------------------------------------------------------------------------------------------
  const TextComponent = (text) => {
    let textArray, newArray;
    textArray = removeBrackets(text);
    newArray = textArray.map((item, index) => {
      // console.log('item is :\n', item)
      if (item == '') {
        return null;
      }
      return (
        <Text key={index} style={{ ...Style.textStyle, color: theme == 'DARK' ? '#fff' : '#000' }}>
          {index == 1 ? '' : ' '}
          <Text style={Style.number}>{item.match(/\d/g)}</Text>
          {index !== 1 ? '' : ' '}
          {item.slice(2).replace(/[^\w\S\n]{2,}/g, '')}
        </Text>
      );
    });
    // console.log('text array is :', newArray)
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={Style.mainContainer}>
          <Text style={Style.textStyle}>{newArray}</Text>
        </View>
      </ScrollView>
    );
  };


  //this is rendered in the versions modal ----
  const renderItemVersion = ({ item, index }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={() => {
          // setLoading(true)
          dispatch({ type: BIBLE_TYPES.SET_SELECTED_BIBLE, payload: item.id })
          dispatch({ type: BIBLE_TYPES.SET_SELECTED_ABB, payload: item.abb })
          settingBooks(item.id, true)
        }}>

        <Text
          style={{ ...Style.itemText, color: theme == 'DARK' ? '#fff' : selectedVersion == item.id ? ThemeConstant.TEXT_COLOR : ThemeConstant.TEXT_COLOR_SUBTEXTS }}>
          {item.abb + '\n'}
          <Text style={{ ...Style.tabText, color: theme == 'DARK' ? '#fff' : selectedVersion == item.id ? ThemeConstant.TEXT_COLOR : ThemeConstant.TEXT_COLOR_SUBTEXTS }}>{item.desc}</Text>
        </Text>
      </TouchableOpacity>
    )
  }

  const modalView = () => {
    return (
      <Modal
        animationType={'slide'}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity activeOpacity={1} onPress={openModal} style={{ backgroundColor: theme == 'DARK' ? '#000' : '#fff' }}>
          <Icon name='down' size={24} style={[Style.headerIcon, { color: theme == 'DARK' ? '#fff' : '#000' }]} />
        </TouchableOpacity>
        <ActivityIndicator
          animating={loading}
          color={"gray"}
          size="large"
          style={Style.activityIndicator}
        />
        {evmVisible ?
          <FlatList
            showsHorizontalScrollIndicator={false}
            data={version}
            style={{
              backgroundColor: theme == 'DARK' ? '#000' : '#fff'
            }}
            renderItem={renderItemVersion}
            keyExtractor={(item, index) => index.toString()}
          /> :
          <FlatList
            ref={BooksRef}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
            data={Books}
            style={{
              backgroundColor: theme == 'DARK' ? '#000' : '#fff'
            }}
            renderItem={({ item, index }) => (<Accordion item={item} index={index} setModalVisible={setModalVisible} currentChapterId={currentChapterId} setLoading={setLoading} setAllChapters={setAllChapters} allChapters={allChapters} flatListRef={flatListRef} activeIndex={activeIndex} getAllChapters={getAllChapters} />)}
            keyExtractor={(item, index) => index.toString()}
            getItemLayout={getItemLayout}
          />}
      </Modal>
    )
  }

  return (
    <SafeAreaView edges={['bottom']}
      style={[Style.container, { backgroundColor: theme == 'DARK' ? '#000' : "#fff" }]}>
      {
        isFocused && <StatusBar animated={true} backgroundColor={theme == 'DARK' ? '#000' : '#fff'} barStyle="default" />
      }
      <ActivityIndicator
        animating={loading}
        color={"gray"}
        size="large"
        style={Style.activityIndicator}
      />
      <Animated.FlatList
        ref={flatListRef}
        scrollEventThrottle={16}
        onViewableItemsChanged={_onViewableItemsChanged}
        viewabilityConfig={_viewabilityConfig}
        data={allTexts}
        keyExtractor={(item, index) => index.toString()}
        getItemLayout={getItemLayoutBook}
        renderItem={({ item, index }) => {

          if (item.number !== 'intro') {
            return (
              <Animated.View style={{ width: width, flex: 1, minHeight: '100%', backgroundColor: theme == 'DARK' ? '#000' : "#fff" }}>
                {TextComponent(item.text)}
              </Animated.View>
            )
          }
        }}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        // onScroll={Animated.event([
        //   { nativeEvent: { contentOffset: { x: scrollX } } }
        // ],
        //   { useNativeDriver: true }
        // )}
        style={{ flexGrow: 0 }}
      />

      {/* BOTTOM HEADER START */}
      <View style={
        {
          ...Style.bottomHeader,
          shadowColor: Platform.OS === 'ios' ? '#E5E5E5' : '#000',
          shadowOffset: {
            width: 0,
            height: 3,
          },
          shadowOpacity: theme == 'LIGHT' && 1,
          shadowRadius: theme == 'LIGHT' && 4,
          elevation: theme == 'LIGHT' ? 4 : null,
          bottom: fromHome ? moderateVerticalScale(40) : moderateVerticalScale(15)
        }} >

        <View style={Style.headingStyle}>

          <TouchableOpacity style={Style.subHeading} onPress={openModal}>
            <Text style={Style.tabText}>{currentBookName} {activeIndex}</Text>
            <Icon name='down' size={ThemeConstant.ICON_SIZE_TINNY} color={ThemeConstant.ICON_COLOR_SECONDARY} />
          </TouchableOpacity>

          {/* <TouchableOpacity style={Style.subHeading}>
            <Calendar name='calendar-month-outline' size={20} />
            <Text style={[Style.tabText, Style.marginLeftStyle]}>Plan</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={Style.subHeading} onPress={openEVNModal}>
            <Text style={Style.tabText}>{selectedVersionAbb}</Text>
            <Icon name='down' size={ThemeConstant.ICON_SIZE_TINNY} color={ThemeConstant.ICON_COLOR_SECONDARY} />
          </TouchableOpacity>

        </View>

      </View>
      {/*----- BOTTOM HEADER END */}

      {/* modal view to select bible type and book */}
      {modalView()}
    </SafeAreaView>
  );
};

export default Bible;
