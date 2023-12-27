import { Linking, Alert } from 'react-native'
import { axiosInstance1 } from '../constant/Auth';
import format from 'date-fns/format';
import * as API_CONSTANT from '../constant/ApiConstant';
import * as API from '../constant/APIs';
import ThemeConstant from '../constant/ThemeConstant';
import { store } from '../store/store';
import { ITEM_TYPES, LINK_TYPES } from '../constant/StringConstant';

export function navigateItem(
  item,
  token,
  navigationAccept,
  id = null,
  fromNotification = false
) {

  let navigation = {
    navigate: (screen, params) => {
      if (fromNotification === false) {
        navigationAccept.navigate(screen, params);
      } else {
        navigationAccept(screen, params);
      }
    },
  };
  const type = item.type;
  switch (type) {
    case ITEM_TYPES.LINK:
      return navigation.navigate('LinkItem', {
        itemId: id ? id : item.id,
      })
      break;
    case ITEM_TYPES.LIST:
      return navigation.navigate('VideoOnDemand', {
        itemId: id ? id : item.id,
        pathUrl: item.newImage ? item.newImage : item.squareArtwork['newImage'],
        title: item.title,
        type: item.type,
      });
    case ITEM_TYPES.EBOOK_SERIES:
      return navigation.navigate('EbookDetail', {
        seriesId: id ? id : item.id,
        title: item.title,
      });
    case ITEM_TYPES.MEDIASERIES:
      if (item.contentType == "EBOOK_SERIES") {
        return navigation.navigate('EbookDetail', {
          seriesId: id ? id : item.id,
          title: item.title,
        })
      } else {
        return navigation.navigate('VideoSeries', {
          seriesId: id ? id : item.id,
          title: item.title,
          type: item.type,
        })
      };
    case ITEM_TYPES.ALBUM:
      return navigation.navigate('AlbumDetail', {
        seriesId: id ? id : item.id,
        title: item.title,
        type: item.type,
        color: item.squareArtworkImageColor
          ? item.squareArtworkImageColor
          : item.squareArtwork?.document?.imageColur
            ? item.squareArtwork?.document?.imageColur
            : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR,
      });
    case ITEM_TYPES.EBOOK:
      return navigation.navigate('EbookItem', {
        ebookItemId: id ? id : item.id,
      });
    case ITEM_TYPES.MEDIA_ITEM:
      if (item.contentType == 'EBOOK') {
        return navigation.navigate('EbookItem', {
          ebookItemId: id ? id : item.id,
          // imageBgColor : null
        })
      } else {
        return navigation.navigate('MediaItem', {
          mediaItemId: id ? id : item.id,
          color: item.wideArtworkImageColor
            ? item.wideArtworkImageColor
            : item.wideArtwork?.document?.imageColur
              ? item.wideArtwork?.document?.imageColur
              : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR,
        });
      };
    case ITEM_TYPES.RSSFEED:
      return navigation.navigate('RssFeedItem', {
        itemId: id ? id : item.id,
      });
    case ITEM_TYPES.CALENDAR:
      return navigation.navigate('Calendar', {
        calendarId: id ? id : item.id,
        title: item.title,
        color: item.bannerArtworkImageColor,
      });
    case ITEM_TYPES.EVENT:
      return navigation.navigate('EventDetail', {
        eventId: id ? id : item.id,
        title: item.title,
        color: item.bannerArtworkImageColor,
      });
    case ITEM_TYPES.MUSIC:
      let musicItemId = id ? id : item.id;
      let squareArtworkId = item?.squareArtworkId;
      let imageSq = `${API.IMAGE_LOAD_URL}/${squareArtworkId}?${API_CONSTANT.GRID_SQUARE}`;
      return navigation.navigate('AudioPlayer', {
        musicItemId: musicItemId,
        image: imageSq,
        imageBgColor: item?.squareArtworkImageColor
      });
    default:
      return null;

  }
}

export const imageColor = (item, screenType, itemImages) => {
  if (screenType == 'welcome') {
    if (itemImages === 'WIDE') {
      return item?.wideArtworkImageColor;
    } else {
      return item?.squareArtworkImageColor;
    }
  } else if (screenType == 'vod') {
    if (itemImages === 'WIDE' && item?.wideArtwork) {
      return item?.wideArtwork?.document.imageColur;
    } else if (itemImages == 'SQUARE' && item.squareArtwork) {
      return item?.squareArtwork?.document.imageColur;
    } else {
      return item?.bannerArtwork?.document.imageColur;
    }
  } else {
    return 'gray';
  }
};

//format date string-----
export const formatDate = (date) => {
  let formatedDate;
  if (date != null) {
    formatedDate = format(new Date(date), 'MMMM dd, yyyy');
  }
  return formatedDate;
};

//TO OPEN URLS 
export const OpenUrl = (url) => {

  Linking.canOpenURL(url)
    .then(supproted => {
      if (supproted) {
        Linking.openURL(url)
      }
      else {
        Alert.alert(
          "",
          "Can't open this URL",
          [
            // The "Yes" button
            {
              text: "Yes",
              onPress: () => {
                return true;
              },
              // style={ color: '#fff' }
            },
            // The "No" button
            // Does nothing but dismiss the dialog when tapped
            {
              text: "No",
              color: '#fff'
            },
          ]
        );
      }
    })
}


//to get link urls--
export const contactUsDataWithoutAuth = (itemId, navigation, item = null) => {
  const orgId = store.getState().activeOrgReducer.orgId;
  axiosInstance1
    .get(
      `${API.linkId}/${itemId}?organizationId=${orgId}`
    )
    .then((response) => {
      contactUsResponseData(response, navigation, item);
    })
    .catch((error) => {
      console.log('error', error);
    });
};

export const contactUsData = (itemId, navigation, token, item = null) => {
  let axiosConfig = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + `${token}`,
      'Access-Control-Allow-Origin': '*',
    },
  };
  axiosInstance1
    .get(`${API.link}/${itemId}`, axiosConfig)
    .then((response) => {
      contactUsResponseData(response, navigation, item);
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const contactUsResponseData = (response, navigation, item) => {
  if (response.status == 200) {
    const nameList = response.data.data;
    const type = nameList.type;

    switch (type) {
      case LINK_TYPES.APP_LINK:
      case LINK_TYPES.GIVING:
      case LINK_TYPES.VIDEO:
        return navigation.navigate('AppLink', {
          pathUr: nameList.url,
          title: nameList.title,
        });
      case LINK_TYPES.WEBSITE:
        return Linking.openURL(`${nameList.url}`);
      case LINK_TYPES.CONTACT:
        if (!isNaN(nameList.contact)) {
          return Linking.openURL(`tel:${nameList.contact}`);
        } else {
          return Linking.openURL(`mailto:${nameList.contact}`)
            .then(res => console.log(res))
            .catch(err => alert('Do not have app to open mail'))
        }
    }
  }
};


