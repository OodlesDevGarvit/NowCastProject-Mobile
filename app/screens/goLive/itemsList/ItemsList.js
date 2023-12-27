import { FlatList, View, Text, RefreshControl, Alert, Linking } from 'react-native';
import React, { useEffect, useState } from 'react';
import { styles } from './styles';
import { useDispatch, useSelector } from 'react-redux';
import { axiosInstance1 } from '../../../constant/Auth';
import * as API from '../../../constant/APIs';
import Loader from '../../../components/Loader';
import { AddItemModal, AddItemButton, ListItem } from '../../../components';
import { cameraPermission } from '../../../utils/permissions/CameraPermission';
import { SET_ALERT } from '../../../store/actions/types';



const ItemsList = ({ navigation }) => {
    const dispatch = useDispatch()
    const { token } = useSelector(state => state.authReducer);
    const { mobileTheme: theme } = useSelector(state => state.brandingReducer.brandingData)
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        getLiveItemsList();
    }, [])

    //to get the list of all list items.
    const getLiveItemsList = async () => {
        let axiosConfig = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + `${token}`,
            },
        };
        try {
            const res = await axiosInstance1.get(`${API.liveItemsList}?itemType=LIVE_STREAMING&page=1&size=10000`, axiosConfig);
            const list = res.data.data.content;
            console.log('all list >>', list);
            const newList = list.filter(item => item.videoLiveType == "LIVE" && (item.status == "PUBLISHED"));

            console.log('data>>>', newList);
            setData(newList);
            setLoading(false)
            setRefreshing(false);

        } catch (err) {
            console.log('Got Error while trying to fetch liveItems', err.response)
            setLoading(false);
            setRefreshing(false);
            // setLoadingMore(false);
        }
    }

    const onRefresh = async () => {
        getLiveItemsList();
    }

    const _handleAddItemButton = async () => {
        await setLoading(true)
        let res = await cameraPermission();

        if (res["android.permission.CAMERA"] == 'denied' || res["android.permission.RECORD_AUDIO"] == 'denied') {
            setLoading(false)
        }
        else if (res["android.permission.CAMERA"] == 'never_ask_again' || res["android.permission.RECORD_AUDIO"] == 'never_ask_again') {

            await dispatch({
                type: SET_ALERT, payload: {
                    setShowAlert: true,
                    data: {
                        message: "Streaming App needs access to your camera and microphone.",
                        showCancelButton: true,
                        onCancelPressed: () => {
                            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                        },
                        showConfirmButton: true,
                        confirmText: 'Settings',
                        onConfirmPressed: async () => {
                            await dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                            await Linking.openSettings();


                        }
                    }

                }
            }
            )
            setLoading(false)

        } else {
            setModalVisible(!modalVisible)
            setLoading(false)
        }
    }

    const _handleLiveStart = async (item) => {
        await setLoading(true)
        let res = await cameraPermission();
        if (res["android.permission.CAMERA"] == 'denied' || res["android.permission.RECORD_AUDIO"] == 'denied') {
            setLoading(false)
        }
        else if (res["android.permission.CAMERA"] == 'never_ask_again' || res["android.permission.RECORD_AUDIO"] == 'never_ask_again') {
            dispatch({
                type: SET_ALERT, payload: {
                    setShowAlert: true,
                    data: {
                        message: "Streaming App needs access to your camera and microphone.",
                        showCancelButton: true,
                        onCancelPressed: () => {
                            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                        },
                        showConfirmButton: true,
                        confirmText: 'Open settings',
                        onConfirmPressed: async () => {
                            await dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                            await Linking.openSettings();

                        }
                    }

                }
            }
            )
            setLoading(false)

        } else {
            navigation.navigate('ItemDetail', { item });
            setLoading(false)
        }

    }

    return (
        <View style={[styles.container, { backgroundColor: theme == "DARK" ? "#000" : "#fff" }]}>
            <Loader loading={loading} />
            <FlatList
                showsVerticalScrollIndicator={false}
                data={data}
                refreshControl={
                    <RefreshControl tintColor={"gray"} refreshing={refreshing} onRefresh={onRefresh} />
                }
                keyExtractor={item => item.id}
                ListHeaderComponent={() => {
                    return (
                        <View style={[styles.headerContainer, { backgroundColor: theme == "DARK" ? "#000" : "#fff" }]}>
                            <Text style={[styles.headerText, { color: theme == "DARK" ? "#fff" : "#000" }]}>RECENT LIVE STREAMS</Text>
                            <AddItemButton onPress={_handleAddItemButton} />
                        </View>
                    )
                }}
                renderItem={({ item, index }) => <ListItem item={item} onPress={() => _handleLiveStart(item)} />}
            />
            {
                modalVisible && <AddItemModal modalVisible={modalVisible} setModalVisible={setModalVisible} />
            }
        </View>
    )
}

export default ItemsList