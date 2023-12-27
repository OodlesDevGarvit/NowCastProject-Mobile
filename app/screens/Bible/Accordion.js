import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Style from './Style'
import axios from 'axios';
import * as API_CONSTANT from '../../constant/ApiConstant';
import ThemeConstant from '../../constant/ThemeConstant';
import { useSelector, useDispatch } from 'react-redux';
import { BIBLE_TYPES } from '../../store/actions/types';


const Accordion = ({ item, index, setModalVisible, currentChapterId, setLoading, allChapters, flatListRef, getAllChapters }) => {

  const dispatch = useDispatch();
  const { currentBookId, selectedVersion } = useSelector(state => state.bibleReducer);
  const [expanded, setExpanded] = useState(item.id == currentBookId ? true : false);

  //all the chapterof the selected book
  const [chapters, setChapters] = useState(currentBookId == item.id ? allChapters : []);
  const { mobileTheme: theme } = useSelector((state) => state.brandingReducer.brandingData);

  const handleExpanded = () => {
    setExpanded(!expanded);
  };

  //getting chapters from the book id----
  const getChapters = (id) => {
    axios(`https://api.scripture.api.bible/v1/bibles/${item.bibleId}/books/${id}/chapters`, {
      headers: {
        'api-key': `${API_CONSTANT.BIBLE_API_KEY}`,
        // 'api-key': `${API_CONSTANT.bibleApiKey2}`
      },

    })
      .then(res => {
        // console.log('chapters are:', res.data.data)
        setChapters(res.data.data);
        setLoading(false)

      })
      .catch(err => {
        // console.log('error is:', err)
      })
  }

  return (
    <View style={{ minHeight: 65, backgroundColor: theme == 'DARK' ? '#000' : '#fff' }}>
      <TouchableOpacity
        onPress={() => {
          expanded == true ? setLoading(false) : setLoading(true)
          handleExpanded();
          getChapters(item.id)
        }}
      >
        <Text style={[Style.itemText, { color: theme == 'DARK' ? '#fff' : '#000' }]}>{item.name}</Text>
      </TouchableOpacity>
      {expanded && chapters.length > 0 && (

        <View style={Style.buttons} >
          {
            chapters.map((elem, indexch) => {
              return (
                elem.number !== 'intro' &&
                <TouchableOpacity activeOpacity={0.8}
                  key={indexch}
                  onPress={() => {
                    setLoading(true)
                    setTimeout(() => {
                      if (elem.number !== "intro") {
                        flatListRef.current.scrollToIndex({ index: parseInt(elem.number) - 1, animated: false })
                      }
                      if (currentBookId !== elem.bookId) {
                        getAllChapters(elem.bookId,elem.bibleId)
                      }
                    }, 0)

                    setTimeout(() => {
                      dispatch({ type: BIBLE_TYPES.SET_CURRENT_BOOKNAME, payload: item.name })
                      dispatch({ type: BIBLE_TYPES.SET_CURRENT_BOOKID, payload: item.id })
                      dispatch({ type: BIBLE_TYPES.SET_CURRENT_CHAPTER_ID, payload: elem.id })
                      dispatch({ type: BIBLE_TYPES.SET_ACTIVE_INDEX, payload: index })
                      setExpanded(false)
                      setModalVisible(false)
                      setLoading(false)
                    }, 1000)


                  }}
                >
                  <View style={Style.circle}>
                    <Text style={{
                      ...Style.itemInActive,
                      color: (elem.id == currentChapterId) ? theme == 'DARK' ? '#fff' : ThemeConstant.TEXT_COLOR : ThemeConstant.TEXT_COLOR_SUBTEXTS,
                      fontWeight: (elem.id == currentChapterId) ? 'bold' : '500',
                    }} > {elem.number}</Text>
                  </View>
                  </TouchableOpacity>
              )
            })
          }

        </View>
      )}
    </View>
  );
};

export default Accordion;
