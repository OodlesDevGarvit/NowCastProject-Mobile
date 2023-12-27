import React, { useEffect, useState } from "react";
import { Text, View, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from "react-native";
import RNFetchBlob from "rn-fetch-blob";
import { scale } from "react-native-size-matters";
import { useSelector } from "react-redux";
import { StatusBar } from "native-base";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import ThemeConstant, { DynamicThemeConstants } from "../../constant/ThemeConstant";
import FastImage from "react-native-fast-image";
import RNEncryptionModule from "@dhairyasharma/react-native-encryption";
import Loader from '../../components/Loader';
import Icon from 'react-native-vector-icons/FontAwesome'

const Downloads = ({ navigation }) => {

  const storeDownloads = useSelector((state) => state.brandingReducer.downloads)
  const { brandColor, mobileTheme: theme } = useSelector(state => state.brandingReducer.brandingData);
  const { userId } = useSelector(state => state.authReducer);

  const decryptFile = async (item) => {
    console.log('decrpty is called');
    setLoading(true)
    await RNEncryptionModule.decryptFile(
      RNFetchBlob.fs.dirs.DownloadDir + `/.NowCastDownloads/` + item.item.fileName, //path of encrpted files that needs to decrpted
      RNFetchBlob.fs.dirs.DownloadDir + `/.Decrypted/decrypt` + item.item.fileName, //decrypted path to be stored
      "password",
      item.item.iv, //iv
      item.item.baseId // baseid
    ).then(async (res) => {
      console.log('inside .then on press');
      console.log(res)
      setLoading(false)
      if (res.status == "success") {
        // let downloadedVideoPath = `file:///Downloads/Decrypted/${item.item.fileName}`
        setLoading(false);
        navigation.navigate('VideoPlayer', {
          downloadedVideoPath: `${RNFetchBlob.fs.dirs.DownloadDir}/.Decrypted/decrypt${item.item.fileName}`,
          fromDownloads: true,
          videoName: item.item.fileName
        })
        console.log("success", res)
      } else {
        setLoading(false)
        console.log("error", res);
      }
    }).catch((err) => {
      setLoading(false)
      console.log(err);
    });
  }

  const [vedioAvailable, setVedioAvailable] = useState([])
  const [loading, setLoading] = useState(false);

  const makeArray = (v) => {
    let final = []
    v.forEach((val) => {
      const allFiles = storeDownloads.find(value => value.fileName === val)
      console.log('al fiels ', allFiles);
      final.push({
        baseId: allFiles.baseId,
        createdAt: allFiles.createdAt,
        fileName: allFiles.fileName,
        id: allFiles.id,
        imagePath: allFiles.imagePath,
        iv: allFiles.iv,
        userid: allFiles.userid,
        mediaItemId: allFiles.mediaItemId

      })
    })

    setVedioAvailable(final)
  }
  const filteredArray = vedioAvailable.filter(item => item.userid === userId);

  useEffect(() => {
    RNFetchBlob.fs.ls(RNFetchBlob.fs.dirs.DownloadDir + `/.NowCastDownloads/`)
      .then((files) => {
        makeArray(files)
      }).catch((err) => {
        console.log("Encrptiion Errroe", err)
      })
  }, [])


  const renderItem = (item) => {
    return (
      <TouchableOpacity
        onPress={() => {
          decryptFile(item)
          // await RNEncryptionModule.decryptFile(
          //   RNFetchBlob.fs.dirs.DownloadDir + `/.NowCastDownloads/` + item.item.fileName, //path of encrpted files that needs to decrpted
          //   RNFetchBlob.fs.dirs.DownloadDir + `/.Decrypted/decrypt` + item.item.fileName, //decrypted path to be stored
          //   "password",
          //   item.item.iv, //iv
          //   item.item.baseId // baseid
          // ).then(async (res) => {
          //   console.log('inside .then on press');
          //   console.log(res)
          //   if (res.status == "success") {
          //     // let downloadedVideoPath = `file:///Downloads/Decrypted/${item.item.fileName}`
          //     setLoading(false);
          //     navigation.navigate('VideoPlayer', {
          //       downloadedVideoPath: `${RNFetchBlob.fs.dirs.DownloadDir}/.Decrypted/decrypt${item.item.fileName}`,
          //       fromDownloads: true,
          //       videoName: item.item.fileName
          //     })
          //     console.log("success", res)
          //   } else {
          //     setLoading(false)
          //     console.log("error", res);
          //   }
          // }).catch((err) => {
          //   setLoading(false)
          //   console.log(err);
          // });
        }

        }
        activeOpacity={1}
      >
        <View
          style={{
            ...Styles.card,
            borderBottomWidth: theme == 'DARK' ? 0.7 : 1.4,
            borderBottomColor:
              theme == 'DARK' ? ThemeConstant.BORDER_COLOR_BETA : '#f7f8fa',
          }}
        >
          <ImageComp item={item} />

          <View style={{ ...Styles.details }}>
            <Text
              style={{
                ...Styles.title,
                color:
                  theme == 'DARK'
                    ? '#fff'
                    : '#000'
              }}
            >
              {item.item.fileName}
            </Text>
          </View>
        </View>

      </TouchableOpacity>
    )
    // );
  }

  function NoDownloads() {
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
            name="download"
            size={140}
            color="gray"
            style={{
              marginVertical: 20,
            }}
          />
          <Text
            style={{
              fontSize: 18,
              color: "gray",
              marginBottom: 10,
            }}
          >
            No Downloads
          </Text>

        </View>
      </View>

    )
  }

  const ImageComp = ({ item }) => {

    return (
      <View
        style={{
          borderRadius: scale(14),
          backgroundColor: ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR,
          aspectRatio: 1 / 1,
        }}
      >
        <FastImage
          style={{
            ...Styles.image,
            borderRadius: scale(10),
            aspectRatio: 1 / 1,
            backgroundColor: ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR
          }}
          source={{
            uri: item.item.imagePath
          }}
          // onLoad={() => setShowColor(false)}
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <Loader loading={loading} />
      <StatusBar
        backgroundColor={brandColor}
        hidden={false}
        translucent={false}
      />
      {
        filteredArray.length == 0
          ?
          <View>
            {NoDownloads()}
          </View>
          :
          <FlatList
            data={filteredArray}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
          />
      }
    </View>
  )
}

export default Downloads;

const Styles = StyleSheet.create({
  card: {
    height: 90,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 5,
  },
  image: {
    height: '100%',
    width: '100%',
  },
  monthText: {
    fontSize: 20,
    alignSelf: 'center',
    fontFamily: ThemeConstant.FONT_FAMILY,
    color: 'black',
    fontWeight: 'bold',
  },
  title: {
    padding: 10,
    fontWeight: 'bold',
    fontSize: ThemeConstant.TEXT_SIZE_LARGE,
    color: 'rgba(0,0,0,0.75)',
    fontFamily: ThemeConstant.FONT_FAMILY,
    textTransform: 'capitalize',
  },
  details: {
    flex: 1,
    marginLeft: 15,
  },
  date: {
    borderWidth: 1,
    height: 70,
    width: 70,
    borderRadius: 10,
    justifyContent: 'center',
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#D3D3D3',
  },
  shadow: {
    flex: 1,
  },
});






