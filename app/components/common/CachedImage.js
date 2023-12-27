import { Animated, Platform, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react';
import FastImage from 'react-native-fast-image';
import { useSelector } from 'react-redux';
import * as API from '../../constant/APIs';
import shorthash from 'shorthash';
import * as RNFS from 'react-native-fs'



const CachedImage = ({ uri, imgStyle }) => {
    const [URL, setURL] = useState(null);
    const fadeIN = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        (async () => {
            dikhaDo();
            let name = shorthash.unique(uri);
            const extension = (Platform.OS === 'android') ? 'file://' : '';
            const path = `${extension}${RNFS.CachesDirectoryPath}/${name}.png`;
            const image = await RNFS.exists(path);
            if (image) {
                setURL(path);
                return;
            }
            await downloadFile(uri, path)
        })()
    }, [])

    const dikhaDo = () => {
        Animated.timing(fadeIN, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
        }).start()
    }

    const downloadFile = (uri, path) => {
        RNFS.downloadFile({ fromUrl: uri, toFile: path }).promise
            .then(res => {
                // console.log('Downloading image.......')
                setURL(path)
            })
            .catch(err => console.log("error while downloading....."))
    }

    return (
        <Animated.Image
            style={[imgStyle, { opacity: fadeIN }]}
            source={{
                uri: URL,
                priority: FastImage.priority.high
            }}
            resizeMode={FastImage.resizeMode.contain}
        />
    )
}

export default CachedImage
