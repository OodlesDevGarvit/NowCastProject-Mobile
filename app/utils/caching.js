import { Platform } from 'react-native';
import shorthash from 'shorthash';
import * as RNFS from 'react-native-fs';

export const cacheDoc = async (uri, ext) => {
    let name = shorthash.unique(uri);
    const extension = (Platform.OS === 'android') ? 'file://' : '';
    const path = `${extension}${RNFS.CachesDirectoryPath}/${name}.${ext}`;
    const doc = await RNFS.exists(path);
    // console.log('doc exists', doc);
    if (doc) {
        return path;
    }
    let path2 = await downloadFile(uri, path);
    return path2;
}

const downloadFile = async (uri, path) => {
    try {
        const res = await RNFS.downloadFile({ fromUrl: uri, toFile: path }).promise;
        return path;
    } catch (err) {
        console.log("error while downloading.....")
    }

}