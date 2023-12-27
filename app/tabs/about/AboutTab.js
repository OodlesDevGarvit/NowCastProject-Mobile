import styles from './Style'
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Image, FlatList, Text, RefreshControl } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler';
import { OpenUrl } from '../../services/TabDesignsService';
import { axiosInstance1 } from '../../constant/Auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../components/Loader';
import { SafeAreaView } from 'react-native-safe-area-context';
import ImageSlider from 'react-native-image-slider';
import * as API from '../../constant/APIs'
import * as API_CONSTANT from '../../constant/ApiConstant'

const AboutTab = () => {

  const [images, setImages] = useState([]);
  const [buttons, setButtons] = useState([]);
  const [descriptionText, setDescriptionText] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  const { orgId } = useSelector(state => state.activeOrgReducer);


  //getting Tab Id from Async Store--------------------
  const gettingTabId = () => {
    AsyncStorage.getItem('@activeTabInfo').then(async value => {
      let allTabData = JSON.parse(value)
      // console.log('all tab data us :', allTabData)
      allTabData.forEach(item => {
        if (item.tabType == 'ABOUT') {
          getTabData(item.id)
        }
      })
    })
  }

  //getting tabdata  from tabID--------------------------
  const getTabData = (id) => {

    axiosInstance1.get(`${API.tabById}/${id}?organizationId=${orgId}`)
      .then(res => {

        // to set all the buttons 
        let allImages = [];
        let allButtons = [];
        // console.log('resource is-------', res.data.data[0].aboutDTO)
        let data = res.data.data[0].aboutDTO;
        //setting description-----
        setDescriptionText(data.description)

        //settings buttons----------

        if (data.link !== "" && data.link !== null) {
          allButtons.push({
            name: 'Give',
            url: data.link
          })
        }
        if (data.fbUrl != '' && data.fbUrl != null) {
          allButtons.push({
            name: 'Facebook',
            url: data.fbUrl
          })
        }
        if (data.twitterUrl != '' && data.twitterUrl != null) {
          allButtons.push({
            name: 'Twitter',
            url: data.twitterUrl
          })
        }
        if (data.storeUrl != '' && data.storeUrl != null) {
          allButtons.push({
            name: 'Store',
            url: data.storeUrl
          })
        }
        if (data.updatesUrl != '' && data.updatesUrl != null) {
          allButtons.push({
            name: "Announcements",
            url: data.updatesUrl
          })
        }
        if (data.websiteUrl != '' && data.websiteUrl != null) {
          allButtons.push({
            name: "Website",
            url: data.websiteUrl
          })
        }

        // console.log('buttons are :', buttons)
        setButtons(allButtons)

        //setting images------------
        data.bannerImage.forEach(item => {

          let imageUrl = `${API.IMAGE_LOAD_URL}/${item.id}?${API_CONSTANT.BANNER_IMAGE_HEIGHT_WIDTH}`
          allImages.push(imageUrl)

        })
        // console.log('images all are :', allImages)
        setImages(allImages)
        setRefreshing(false)
        setLoading(false)
      })
      .catch(err => {
        // console.log(err)
        setRefreshing(false)
        setLoading(false)
      })

  }

  //getting Tab id  and getting tab data  (tabId) -------
  useEffect(() => {
    gettingTabId()
  }, [])

  //called when user Pulls down screen to refresh-------
  const onRefresh = () => {
    setRefreshing(true)
    gettingTabId()
  }

  //ImageSliderComponent Of the Screen
  const SliderComponent = () => {
    return (
      <View style={styles.slider}>
        <ImageSlider
          autoPlayWithInterval={3000}
          images={images}
          customButtons={(position, move) => (
            <View >
            </View>
          )}
          customSlide={({ index, item, style, width }) => (
            <View key={index} style={[style, styles.customSlide]}>
              <Image source={{ uri: item }} style={styles.imgStyle} />

            </View>

          )}
        />
      </View>
    )
  }

  //renderItem component----------------
  const RenderItem = ({ item, index }) => {
    return (<View
      key={index}
      style={
      {
        ...styles.buttonItem,

          marginRight: index % 2 === 0 ? '2%' : 0,
          marginLeft: index % 2 === 0 ? '2%' : 0,
      }
    }>
      <TouchableOpacity
        activeOpacity={0.6}
        style={styles.btnTextContainer}
        onPress={() => {
          OpenUrl(item.url)
        }}>
        <Text style={styles.btnText}>{item.name}</Text>
      </TouchableOpacity>
    </View>
    )
  }

  // buttons component of the Screen-----
  const ButtonsComponent = () => {
    return (
      <View style={styles.button}>
        {
          buttons.map((item, index) =>

            <RenderItem item={item} index={index} key={index} />
          )
        }

      </View>
    )
  }

  //textComponent of the Screen----------
  const TextComponent = () => {
    return (
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText}>
          {descriptionText}
        </Text>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Loader loading={loading} />
        {
          images.length > 0 ?
            <SliderComponent />
            :
            null
        }
        <ButtonsComponent />
        <TextComponent />
    </ScrollView>
  )
}


export default AboutTab;


