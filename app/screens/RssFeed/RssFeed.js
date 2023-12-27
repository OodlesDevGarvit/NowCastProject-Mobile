import React, { useLayoutEffect, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  RefreshControl
} from 'react-native'
import { axiosInstance1 } from '../../constant/Auth'
import { DynamicThemeConstants } from '../../constant/ThemeConstant';
import * as API from '../../constant/APIs'
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../components/Loader';

// import HTML from "react-native-render-html";

const RssFeed = ({ navigation, route }) => {
  //   ---this will go as prop in the component--------------
  const { brandColor, mobileTheme: theme } = useSelector(
    (state) => state.brandingReducer.brandingData
  );
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const { token, isAuthenticated } = useSelector(state => state.authReducer);
  const [loading, setLoading] = useState(true);

  var parseString = require('react-native-xml2js').parseString; // to parse extractd xml to json----
  var parser = require('node-html-parser'); // to parse extracted  html

  const [refreshing, setRefreshing] = useState(false);
  const [displayType, setDisplayType] = useState('READER'); //this will decide what screen will be rendered consitionally--------------------
  // const [url, setUrl] = useState('https://sterlingharris.org/feed/')
  const [data, setData] = useState([]);

  //rss is that is sent from notification---
  const rssId = route.params.id;

  //setting title ----

  const setTitle = (title) => {
    navigation.setOptions({
      title: title,
    });
  };

  //check index for top one to add margin to top card--------------------------
  const checkIndex = (n) => {
    return n == 0;
  };

  //check index to display image for left and right image---------
  const checkIndexforAlternate = (n) => {
    return n % 2 == 0;
  };

  //to get blog data from id  -------------------
  useLayoutEffect(() => {

    if (!isAuthenticated) {
      axiosInstance1
        .get(
          `${API.rssFeedId}/${rssId}?organizationId=${orgId}`
        )
        .then((res) => {
          // console.log('res of rss feed non auth is:', res)
          setTitle(res.data.data.title);
          setDisplayType(res.data.data.layout);
          fetchResource(res.data.data.url);
        })
        .catch((err) => console.log('not logged in err ', err));
    } else {
      let axiosConfig = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + `${token}`,
        },
      };
      axiosInstance1
        .get(`${API.rssFeed}/${rssId}`, axiosConfig)
        .then((res) => {
          // console.log('res of rss feed Logged in is:', res)
          setTitle(res.data.data.title);
          setDisplayType(res.data.data.layout);
          fetchResource(res.data.data.url);
        })
        .catch((err) => {
          // console.log('logged in err--', err)
        });
    }

  }, []);

  //to get all the data from the feed url
  const fetchResource = (url) => {
    if (url) {
      console.log('url is -------------:', url);
      fetch(url)
        .then((response) => response.text())
        .then((data) => {
          parseString(data, (error, result) => {
            let dataToRender = [];

            //These are the items fetched from the
            let items = result.rss.channel[0].item;
            // console.log('items are------------------------------------------------------', result.rss.channel[0].item[0])

            items.forEach((item) => {
              let objectToPush = {};
              let title = '';
              let author = '';
              let imageURL = '';
              let description = '';
              let date = '';
              let url = '';
              let detailedDescription = '';

              //for title------------------------
              if (title !== null) {
                if (item.hasOwnProperty('title')) {
                  title = `${item.title}`;
                } else if (
                  item.hasOwnProperty('itunes:title')
                ) {
                  title = `${item['itunes:title']}`;
                }
                // console.log("Title is:", title)
              }

              //for description--------------------
              if (description !== null) {
                if (
                  item.hasOwnProperty('description')
                ) {
                  let html = `${item.description}`;

                  let innerText = parser.parse(html)
                    .innerText;

                  description = innerText;
                } else if (
                  item.hasOwnProperty(
                    'itunes:description'
                  )
                ) {
                  description = `${item['itunes:description']}`;
                }
              }

              // for author------------------------
              if (author !== null) {
                if (
                  item.hasOwnProperty(['dc:creator'][0])
                ) {
                  author = `${item['dc:creator'][0]}`;
                } else if (
                  item.hasOwnProperty('itunes:author')
                ) {
                  author = `${item['itunes:author']}`;
                } else if (
                  item.hasOwnProperty('author')
                ) {
                  author = `${item.author}`;
                }

                // console.log('authors are:', author)
              }

              //for published date---------------------
              if (date !== null) {
                if (item.hasOwnProperty('pubDate')) {
                  date = `${item.pubDate}`;
                } else if (
                  item.hasOwnProperty('itunes:pubDate')
                ) {
                  date = `${item['itunes:pubDate']}`;
                }
              }

              //for images -------------------------
              if (imageURL !== null) {
                if (item.hasOwnProperty('thumbnail')) {
                  imageURL = `${item.thumbnail}`;
                } else if (
                  item.hasOwnProperty('imageURL')
                ) {
                  imageURL = `${item.imageURL}`;
                } else if (
                  item.hasOwnProperty(
                    'itunes:thumbnail'
                  )
                ) {
                  imageURL = `${item['itunes:thumbnail']}`;
                }
              }

              // for url---------------------
              if (url !== null) {
                if (item.hasOwnProperty('url')) {
                  url = `${item.url}`;
                } else if (
                  item.hasOwnProperty('link')
                ) {
                  url = `${item.link}`;
                } else if (
                  item.hasOwnProperty('itunes:link')
                ) {
                  url = `${item['itunes:link']}`;
                }
              }

              //to get all the encoded content--------
              if (detailedDescription !== null) {
                if (
                  item.hasOwnProperty('content:encoded')
                ) {
                  let html = `${item['content:encoded']}`;

                  // console.log("html is:------------------------", html)

                  if (html.includes('img')) {
                    let img = parser
                      .parse(html)
                      .querySelector('img')
                      .getAttribute('src');
                    imageURL = img;
                  }

                  //detailedDescription------
                  let innerText = parser.parse(html)
                    .innerHTML;

                  // console.log('inner html is --------------------------------------------------------------:', innerText)

                  detailedDescription = innerText;
                } else if (
                  item.hasOwnProperty('description')
                ) {
                  let html = `${item.description}`;

                  let innerHtml = parser.parse(html)
                    .innerHTML;
                  if (description === '') {
                    description = innerHtml;
                  }
                }
              }

              objectToPush = {
                title: title,
                description: description,
                author: author,
                date: date,
                imageURL: imageURL,
                url: url,
                detailedDescription: detailedDescription,
              };

              // console.log('detailed description is :', detailedDescription)
              dataToRender.push(objectToPush);
            });

            // console.log('data to render---------------:', dataToRender)
            setData(dataToRender);
            setLoading(false);
          });
        })
        .catch((error) => {
          console.log('error while fetching url');
          alert('Problem occured in loading url.');
        });
    } else {
      alert("Can't load empty URL");
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);

    if (!isAuthenticated) {
      axiosInstance1
        .get(
          `${API.rssFeedId}/${rssId}?organizationId=${orgId}`
        )
        .then((res) => {
          // console.log('res of rss feed non auth is:', res)
          setDisplayType(res.data.data.layout);
          fetchResource(res.data.data.url);
          setRefreshing(false);
        })
        .catch((err) => {
          // console.log('not logged in err ', err)
          setRefreshing(false);
        });
    } else {
      let axiosConfig = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + `${token}`,
        },
      };
      axiosInstance1
        .get(`${API.rssFeed}/${rssId}`, axiosConfig)
        .then((res) => {
          // console.log('res of rss feed Logged in is:', res)
          setDisplayType(res.data.data.layout);
          fetchResource(res.data.data.url);
          setRefreshing(false);
        })
        .catch((err) => {
          // console.log('logged in err--', err)
          setRefreshing(false);
        });
    }

  };

  if (displayType === 'ROWS') {
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
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={data}
          renderItem={({ item }) => {
            return (
              <View>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    navigation.navigate('BlogDetail', item);
                  }}
                >
                  <View style={styles.itemList}>
                    {item.imageURL !== '' ? (
                      <View
                        style={{
                          ...styles.imageList,
                          marginLeft: 15,
                        }}
                      >
                        <Image
                          style={styles.imageList}
                          source={{ uri: item.imageURL }}
                        />
                      </View>
                    ) : null}
                    <View style={styles.detailsList}>
                      <Text
                        style={{
                          ...styles.titleList,
                          color:
                            theme == 'DARK'
                              ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                              : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                        }}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      {/* <Text style={
                        {
                          ...styles.descriptionList
                          , color: (theme == "DARK") ? DynamicThemeConstants.DARK.TEXT_COLOR_SECONDARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY
                        }} numberOfLines={1} >{item.description}</Text> */}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          }}
          keyExtractor={(item) => item.title}
        />
      </View>
    );
  } else {
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
        <FlatList
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          data={data}
          renderItem={({ item, index }) => {
            if (checkIndexforAlternate(index)) {
              return (
                <View>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      navigation.navigate('BlogDetail', item);
                    }}
                  >
                    <View
                      style={{
                        ...styles.itemCard,
                        marginTop: checkIndex(index) ? 20 : 0,
                        backgroundColor:
                          theme == 'DARK'
                            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_NOTE
                            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_NOTE,
                      }}
                    >
                      <View
                        style={[
                          styles.textCard,
                          {
                            width: item.imageURL !== '' ? '70%' : '100%',
                            backgroundColor:
                              theme == 'DARK'
                                ? DynamicThemeConstants.DARK
                                  .BACKGROUND_COLOR_NOTE
                                : DynamicThemeConstants.LIGHT
                                  .BACKGROUND_COLOR_NOTE,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            ...styles.titleCard,
                            color:
                              theme == 'DARK'
                                ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                                : DynamicThemeConstants.LIGHT
                                  .TEXT_COLOR_PRIMARY,
                          }}
                          numberOfLines={2}
                        >
                          {item.title}
                          {/* this */}
                        </Text>
                        <Text
                          style={{
                            ...styles.dateCard,
                            color:
                              theme == 'DARK'
                                ? DynamicThemeConstants.DARK
                                  .TEXT_COLOR_SECONDARY
                                : DynamicThemeConstants.LIGHT
                                  .TEXT_COLOR_SECONDARY,
                          }}
                        >
                          {item.date}
                        </Text>
                        <Text
                          numberOfLines={3}
                          style={{
                            ...styles.descriptionCard,
                            color:
                              theme == 'DARK'
                                ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                                : DynamicThemeConstants.LIGHT
                                  .TEXT_COLOR_PRIMARY,
                          }}
                        >
                          {`${item.description}`.trim()}
                        </Text>
                      </View>

                      {item.imageURL !== '' ? (
                        <View
                          style={{
                            ...styles.imageCard,
                            paddingLeft: 5,
                            paddingVertical: 5,
                            borderRadius: 5,
                          }}
                        >
                          <Image
                            style={styles.img}
                            source={{ uri: item.imageURL }}
                          />
                        </View>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            } else {
              return (
                <View>
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      navigation.navigate('BlogDetail', item);
                    }}
                  >
                    <View
                      style={{
                        ...styles.itemCard,
                        marginTop: checkIndex(index) ? 20 : 0,
                        backgroundColor:
                          theme == 'DARK'
                            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_NOTE
                            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_NOTE,
                      }}
                    >
                      {item.imageURL !== '' ? (
                        <View
                          style={{
                            ...styles.imageCard,
                            paddingRight: 5,
                            paddingVertical: 5,
                            borderRadius: 5,
                          }}
                        >
                          <Image
                            style={styles.img}
                            source={{ uri: item.imageURL }}
                          />
                        </View>
                      ) : null}

                      <View
                        style={[
                          styles.textCard,
                          {
                            width: item.imageURL !== '' ? '70%' : '100%',
                            backgroundColor:
                              theme == 'DARK'
                                ? DynamicThemeConstants.DARK
                                  .BACKGROUND_COLOR_NOTE
                                : DynamicThemeConstants.LIGHT
                                  .BACKGROUND_COLOR_NOTE,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            ...styles.titleCard,
                            color:
                              theme == 'DARK'
                                ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                                : DynamicThemeConstants.LIGHT
                                  .TEXT_COLOR_PRIMARY,
                          }}
                          numberOfLines={2}
                        >
                          {item.title}
                          {/* this */}
                        </Text>
                        <Text
                          style={{
                            ...styles.dateCard,
                            color:
                              theme == 'DARK'
                                ? DynamicThemeConstants.DARK
                                  .TEXT_COLOR_SECONDARY
                                : DynamicThemeConstants.LIGHT
                                  .TEXT_COLOR_SECONDARY,
                          }}
                        >
                          {item.date}
                        </Text>
                        <Text
                          numberOfLines={3}
                          style={{
                            ...styles.descriptionCard,
                            color:
                              theme == 'DARK'
                                ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                                : DynamicThemeConstants.LIGHT
                                  .TEXT_COLOR_PRIMARY,
                          }}
                        >
                          {`${item.description}`.trim()}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }
          }}
          keyExtractor={(item) => item.title}
        />
      </View>
    );
  }
};

export default RssFeed;

const styles = StyleSheet.create({
  itemList: {
    borderBottomWidth: 1,
    borderBottomColor: '#d3d3d3',
    flexDirection: 'row',
    height: 100,
    alignItems: 'center',


  },
  imageList: {
    width: 100,
    height: 60,
    borderRadius: 3,

  },
  detailsList: {
    // borderWidth: 1,
    // borderColor: 'red',
    flex: 1,
    marginLeft: 15
  },
  titleList: {
    fontSize: 18,
    fontWeight: 'bold',
    // borderWidth: 1,
    // borderColor: '#fff'
  },
  descriptionList: {
    // borderWidth: 1,
    // borderColor: '#fff',
  },

  // for card type design-------------------------------------------------

  itemCard: {
    // borderWidth: 1,
    // borderColor: 'green',
    marginHorizontal: 20,
    marginBottom: 20,
    height: 190,
    flexDirection: 'row',
    borderRadius: 5,
    shadowColor: '#000',
    shadowRadius: 0.4,
    shadowOpacity: 0.5,
    shadowOffset: { width: 1, height: 1 },
    elevation: 9
  },

  textCard: {
    // borderWidth: 1,
    // borderColor: 'red',
  },

  titleCard: {
    fontSize: 28,
    marginTop: 5,
    marginHorizontal: 10,
    alignSelf: 'flex-start'
  },

  dateCard: {
    marginHorizontal: 10,
    marginBottom: 15,
  },

  descriptionCard: {
    marginHorizontal: 10,
    flex: 1,
    paddingBottom: 10,
    lineHeight: 23
  },

  imageCard: {
    flex: 1,

    // borderWidth: 1,
    // borderColor: 'red'
  },

  img: {
    width: '100%',
    height: '100%',
    borderRadius: 5
  }
})






















