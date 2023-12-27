import React, { useEffect, useState } from "react";
import { Text, TextInput, View, Button, PermissionsAndroid, Alert, Platform, FlatList, TouchableOpacity } from "react-native";
import RNFetchBlob from "rn-fetch-blob";
import RNEncryptionModule from "@dhairyasharma/react-native-encryption";
import SQLite from 'react-native-sqlite-storage';

const App = () => {
  const [url, setUrl] = useState("")
  const [vedioAvailable, setVedioAvailable] = useState([])
  const [fileName, setFileName] = useState("")
  const onSubmit = () => {
    // console.log("ping")
    checkPermission()
  }

  useEffect(() => {
    SQLite.enablePromise(true);
  }, [])

  useEffect(() => {
    RNFetchBlob.fs.ls(RNFetchBlob.fs.dirs.DownloadDir + `/Encrypted/`)
      // files will an array contains filenames
      .then((files) => {
        // console.log(files)
        setVedioAvailable(files)
      }).catch((err) => {
        // console.log("Encrptiion Errroe", err)
      })
  }, [])

  const renderItem = (itemData) => {
    return (
      <TouchableOpacity onPress={()=>{
        // console.log(RNFetchBlob.fs.dirs.DownloadDir + `/Encrypted/` + itemData.item,RNFetchBlob.fs.dirs.DownloadDir + `/.Decrypted/decrypt` + itemData.item)
        RNEncryptionModule.decryptFile(
          RNFetchBlob.fs.dirs.DownloadDir + `/Encrypted/` + itemData.item, //path of encrpted files that needs to decrpted
          RNFetchBlob.fs.dirs.DownloadDir + `/.Decrypted/decrypt` + itemData.item, //decrypted path to be stored

          "password",
          "6d83d83ca13534f9d89843c6ee57e77r2", //iv
          "885830b6b7686710ad8cabd3bb4f8da2"   // baseid
        ).then((res) => {
          // console.log(res)
          if (res.status == "success") {
            // console.log("success", res)
          } else {
            // console.log("error", res);
          }
        }).catch((err) => {
          // console.log(err);
        });
      }}>
        <Text>{itemData.item}</Text>
      </TouchableOpacity>
    )
  }

  const checkPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Permission Required',
          message: 'Please allow access to gallery',
          buttonPositive: "OK"
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log(url)
        downloadFile("http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
      }
      else {
        Alert.alert("Permissions required", "Please allow ServiceoChat permissions to access your files and media", [
          {
            text: "Open Settings",
            style: { fontSize: 12 },
            onPress: async () => {
              {
                openSettings().catch(() => console.warn('cannot open settings'));
              }
            }
          },
          {
            text: CANCEL,
            style: { fontSize: 12 },
            onPress: () => {
              // console.log("daring on press")
            }
          }
        ],
          {
            cancelable: true
          }
        )
      }
    } catch (error) {
      // console.warn(error);
    }

  }

  const downloadFile = async (urlNeed) => {

    let ext = /[.]/.exec(urlNeed) ? /[^.]+$/.exec(urlNeed) : undefined;
    ext = '.' + ext[0];

    const fPath = RNFetchBlob.fs.dirs.DownloadDir + `/${fileName}` + ext;

    RNFetchBlob.config({
      fileCache: false,
      overwrite: true,
      trusty: true,
      addAndroidDownloads: {
        useDownloadManager: true,
        notification: true,
        path: fPath,
        mediaScannable: true
      }
    })
      .fetch('GET', urlNeed)
      .then(res => {

        //console.log(res.info, "singlas")
        RNEncryptionModule.encryptFile(
          res.data,
          RNFetchBlob.fs.dirs.DownloadDir + `/Encrypted` + `/Encrypted${fileName}` + ext,
          "password"
        ).then((res) => {
          //console.log("Encryption Success Response", res)
          if (res.status == "success") {
            RNFetchBlob.fs.unlink(fPath)
              .then(() => {
                console.log("Deleted ")
                RNFetchBlob.fs.ls(RNFetchBlob.fs.dirs.DownloadDir + `/Encrypted/`)
                  // files will an array contains filenames
                  .then((files) => {
                    //console.log(files)
                    setVedioAvailable(files)
                  })
              })
              .catch((err) => { console.log("Encrptiion Errroe", err) })
          } else {
            //console.log("error", res);
          }
        }).catch((err) => {
          alert("Not Enough Space found in Encryption")
          RNFetchBlob.fs.unlink(fPath)
            .then(() => {
              //console.log("Deleted Encrypted File")
            })
            .catch((err) => { console.log(err) })
          RNFetchBlob.fs.unlink(RNFetchBlob.fs.dirs.DownloadDir + `/Encrypted` + `/Encrypted${fileName}` + ext)
            .then(() => {
              //console.log("Deleted Encrypted File")
            })
            .catch((err) => { console.log(err) })
          //console.log(err);
        });
        //console.log(res, "Download rwsponse")
      })
      .catch((errorMessage, statusCode) => {
      });
  }

  return (
    <View>
      <TextInput
        style={{
          height: 40,
          margin: 12,
          borderWidth: 1,
          padding: 10,
        }}
        placeholder="Enter File Url"
        value={url}
        onChangeText={(text) => {
          setUrl(text)
        }} />
      <TextInput
        style={{
          height: 40,
          margin: 12,
          borderWidth: 1,
          padding: 10,
        }}
        value={fileName}
        placeholder="Enter File Name to be stored"
        onChangeText={(text) => {
          setFileName(text)
        }} />
      <Button
        onPress={onSubmit}
        title="Submit"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
      />

      <FlatList
        data={vedioAvailable.filter(val => val !== ".thumbnails")}
        renderItem={renderItem}
      />

    </View>
  )
}

export default App







