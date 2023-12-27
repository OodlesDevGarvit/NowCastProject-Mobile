import { StyleSheet, Text, View, Modal, Pressable } from 'react-native'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import FormInput from '../FormInput';
import SelectDropdown from 'react-native-select-dropdown';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useState } from 'react';
import { axiosInstance1 } from '../../constant/Auth';
import * as API from '../../constant/APIs';
import { moderateScale, moderateVerticalScale, scale, verticalScale } from 'react-native-size-matters';
import ThemeConstant from '../../constant/ThemeConstant';
import { useNavigation } from '@react-navigation/native';
import Loader from '../Loader';
import CloseModal from './CloseModal';

const DEFAULT_TEXT = "Select";

const AddItemModal = ({ modalVisible, setModalVisible }) => {
    const navigation = useNavigation();
    const { token } = useSelector(state => state.authReducer);
    const { brandColor } = useSelector(state => state.brandingReducer.brandingData);
    const [allSeries, setAllSeries] = useState([]);
    const [selectedMS, setSelectedMS] = useState(null);
    const [title, setTitle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getAllSeries = async () => {
        let axiosConfig = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + `${token}`,
            },
        };
        try {
            const res = await axiosInstance1.get(`${API.mediaSeriesList}?page=1&isDropDown=true&seriesType=MEDIA_SERIES&size=1000`, axiosConfig);
            setAllSeries(res.data.data)
        } catch (err) {
            console.log('error in getting all mediaSeries>>', err, reponse);

        }
    }

    //to set error to null when changes made in title field
    useEffect(() => {
        setError(null);
    }, [title])

    const validationCheck = () => {
        if (title == null || title == '') {
            setError('Please enter the title')
        }
        else {
            goToUpdateScreenAfterCreating()
        }
    }

    const goToUpdateScreenAfterCreating = async () => {
        setLoading(true)
        //first create mediaItem of live stream type and than navigate to detail screen on go live-

        //header to send--
        let axiosConfig = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + `${token}`,
            }
        };

        //data to send to create a mediaItem--
        const data = {
            "liveStreamDataDTO": {
                "deviceType": "MOBILE_APP",
                "enableFacebookLiveStream": false,
                "enableYoutubeLiveStream": false,
                "startDate": null,
                "endDate": null,
                "startTime": "",
                "endTime": "",
                "facebookSocialMediaTokenInfoId": null,
                "streamId": null,
                "streamName": title,
                "videoLiveType": "LIVE",
                "youtubeSocialMediaTokenInfoId": null,
                "videoId": null,
                "videoDTO": null,
                "liveStreamSettingId": null,
                "m3u8Url": ""
            },
            "mediaSeriesId": selectedMS?.id,
            "title": title,
            "itemType": "LIVE_STREAMING",
        }

        try {
            const res = await axiosInstance1.post(`${API.createMediaItem}`, data, axiosConfig);
            // console.log('created mediItem for liveStream>>', res)

            if (res.status = 201) {
                setModalVisible(false);
                navigation.navigate('ItemDetail', { newStream: true, id: res.data.data });
            }

            setLoading(false)


        } catch (err) {
            console.log('error while creating media item >>', err.reponse);
            setLoading(false);
            alert('The operation could not be completed.')
            setModalVisible(false)
        }
    }

    useEffect(() => {
        getAllSeries();
    }, [])

    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={{...styles.centeredView,backgroundColor:'rgba(26,26,29,0.7)'}}>
                    <Loader loading={loading} />
                    <View style={styles.modalView}>
                        <FormInput
                            error={error}
                            name={'Title'}
                            textViewstyle={{ marginTop: 0 }}
                            required
                            onChangeText={(text) => {
                                setTitle(text)
                            }} />
                        <View style={styles.dropDownContainer}>
                            <Text style={{ color: ThemeConstant.TEXT_COLOR }}>Video Series</Text>
                            <SelectDropdown
                                data={allSeries}
                                rowTextForSelection={(item, index) => {
                                    return item.title;
                                }}
                                onSelect={(selectedItem, index) => {
                                    setSelectedMS(selectedItem);
                                }}
                                defaultButtonText={DEFAULT_TEXT}
                                buttonTextAfterSelection={() => {
                                    return selectedMS.title;
                                }}

                                buttonStyle={styles.dropdown1BtnStyle}
                                buttonTextStyle={{
                                    ...styles.dropdown1BtnTxtStyle,
                                    textTransform: 'capitalize',
                                }}
                                renderDropdownIcon={(isOpened) => {
                                    return (
                                        <FontAwesome
                                            name={isOpened ? 'chevron-up' : 'chevron-down'}
                                            color={'gray'}
                                            size={15}
                                        />
                                    );
                                }}
                                dropdownIconPosition={'right'}
                                dropdownStyle={styles.dropdown1DropdownStyle}
                                rowTextStyle={{
                                    ...styles.dropdown1RowTxtStyle,
                                    textTransform: 'capitalize',
                                }}
                                selectedRowStyle={{
                                    backgroundColor: selectedMS?.title == DEFAULT_TEXT ? '#EEEE' : '#696969'
                                }}
                            />
                        </View>
                        <Pressable
                            style={[styles.button, { backgroundColor: brandColor }]}
                            onPress={validationCheck}
                        >
                            <Text style={styles.textStyle}>Create</Text>
                        </Pressable>

                        {/* THIS IS THE BUTTON TO CLOSE MODAL */}
                        <View style={{
                            width: moderateScale(25),
                            height: moderateScale(25),
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            top: 10,
                            right: 10

                        }}>
                            <CloseModal onPress={() => {
                                setModalVisible(false)
                            }} />
                        </View>
                    </View>
                </View>
            </Modal>
         </View>
    )
}

export default AddItemModal

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: scale(18)
    },
    modalView: {
        width: '100%',
        backgroundColor: "#fff",
        borderRadius: scale(20),
        paddingHorizontal: scale(35),
        paddingVertical: scale(20),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        position: 'relative'
    },
    button: {
        borderRadius: 20,
        paddingHorizontal: scale(30),
        paddingVertical: scale(10),
        elevation: 2
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    dropdown1BtnStyle: {
        paddingLeft: moderateScale(15),
        borderWidth: scale(1),
        borderRadius: scale(5),
        borderColor: '#dadae8',
        width: '100%',
        height: moderateScale(40),
        backgroundColor: '#FFF',
    },
    dropdown1BtnTxtStyle: {
        color: '#444',
        textAlign: 'left',
        fontSize: 14
    },
    dropdown1RowTxtStyle: {
        textAlign: 'left',
        fontSize: 14
    },
    dropDownContainer: {
        marginTop: moderateVerticalScale(10),
        marginBottom: moderateVerticalScale(20)
    },
    dropdown1DropdownStyle: {
        backgroundColor: '#EFEFEF',
        borderRadius: 8,
        marginTop: verticalScale(-20),
    },
})