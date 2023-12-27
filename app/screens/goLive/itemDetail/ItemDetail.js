import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert, StatusBar, Modal, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// import { NodeCameraView } from 'react-native-nodemediaclient';
import { useDispatch, useSelector } from "react-redux";
import { useIsFocused } from "@react-navigation/native";
import { moderateScale, moderateVerticalScale, scale } from "react-native-size-matters";
import { useNavigation } from "@react-navigation/native";
import { axiosInstance1 } from "../../../constant/Auth";
import { styles } from "./styles";
import { CloseModal, FormInputLive } from "../../../components";
import { parseISO, format } from "date-fns";
import Loader from "../../../components/Loader";
import Icon from 'react-native-vector-icons/Ionicons'
import SocialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as API from '../../../constant/APIs';
import FontAwesom from 'react-native-vector-icons/FontAwesome';
import { convertTime } from "../../../utils/TimeFormat";
import ThemeConstant from "../../../constant/ThemeConstant";
import { Checkbox } from "native-base";
import CustomButton from "../../../components/CustomButton";
import FormInput from "../../../components/FormInput";
import FastImage from "react-native-fast-image";
import { SET_ALERT } from "../../../store/actions/types";

const SOCIALTYPE = {
    INSTA: 'INSTA',
    TWITTER: "TWITTER"
}

const ItemDetail = ({ navigation, route }) => {
    const dispatch = useDispatch()
    const { brandColor, timeZone } = useSelector((state) => state.brandingReducer.brandingData);
    const { token } = useSelector(state => state.authReducer);
    const playerRef = useRef(null);
    const isFocused = useIsFocused();
    const itemFromHome = route.params?.item;
    const newStream = route.params?.newStream;
    const id = route.params?.id;

    const [body, setBody] = useState([]); //list to fb account to sent to add to live stream

    //All social accounts that are connected to organisations state--
    const [allFbPages, setAllFbPages] = useState([]);
    const [allFbProfiles, setAllFbProfiles] = useState([]);
    const [allYtChannel, setAllYtChannel] = useState(null);

    const [renderHack, setRenderHack] = useState(false);
    //LIVE STATE CAN WE STARTING ,LIVE,OFFLINE

    const [modalVisible, setModalVisisble] = useState(false); //modal to show all connected fb accounts.
    const [modalToConnect, setModalToConnect] = useState(false); //modal to connect fb accounts-
    const [instaTwitterModal, setInstaTwitterModal] = useState(false);

    //lots of useState- for DATA-
    const [item, setItem] = useState(itemFromHome);
    const [showBasicInfo, setShowBasicInfo] = useState(true)
    const [showSetting, setShowSettings] = useState(false);
    const [showSocial, setShowSocial] = useState(false);
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState(null);
    const [subtitle, setSubtitle] = useState(null);
    const [lecturer, setLecturer] = useState(null);
    const [addLabel, setAddLabel] = useState(null);
    const [desc, setDesc] = useState(null);
    const [socialMediaDTO, setSocialMediaDTO] = useState({});
    const [socialMediaLiveStreamDTO, setSocialMediaLiveStreamDTO] = useState([]);

    //fb
    const [fbConnected, setFbConnect] = useState(false);
    const [fbPages, setFbPages] = useState(null)
    const [fbProfiles, setFBProfiles] = useState(null)
    //yt
    const [ytConnected, setYtConnect] = useState(false);
    const [connectedChannel, setConnectedChannel] = useState(null);

    //instagram and twitter 
    const [instaConnected, setInstaConnected] = useState(false);
    const [instaRTMP, setInstaRTMP] = useState(null);
    const [instaStreamKey, setInstaStreamKey] = useState(null);
    const [twitetrConnected, setTwitterConnected] = useState(false);
    const [active, setActive] = useState(null);
    // insta and twitter end

    //all dates and times
    const [startDate, setStartDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [endTime, setEndTime] = useState(null);



    useEffect(() => {
        setRenderHack(true)
        _getAllSocialAccount();
        return () => {
            setRenderHack(false)
        }
    }, [])

    useEffect(() => {
        getItem();
    }, [])


    const _handlePressStream = () => {
        if (item.liveStreamDataDTO.validateMessage !== null) {
            dispatch({
                type: SET_ALERT, payload: {
                    setShowAlert: true,
                    data: {
                        message: `${item.liveStreamDataDTO.validateMessage}`,
                        showCancelButton: true,
                        onCancelPressed: () => {
                            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                        },
                    }
                }
            })
            return;
        }
        showConfirmDialog();
    }

    const showConfirmDialog = () => {
        dispatch({
            type: SET_ALERT, payload: {
                setShowAlert: true,
                data: {
                    message: 'You are going live',
                    showCancelButton: true,
                    onCancelPressed: () => {
                        dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                    },
                    showConfirmButton: true,
                    confirmText: 'Go Live',
                    onConfirmPressed: async () => {
                        await navigation.navigate("LiveScreen", { url: item?.liveStreamDataDTO?.rtmpUrl, streamId: item?.liveStreamDataDTO?.streamId })
                        dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })


                    }
                }

            }
        }
        )
    };

    //handle toggle show of basic info
    const _handleBasicInfoToggle = () => {
        setShowBasicInfo(!showBasicInfo);
    }

    //handle settings section toggle-
    const _handleSettingsToggle = () => {
        setShowSettings(!showSetting);
    }

    //handle social section toggle-
    const _handleSocialToggle = () => {
        setShowSocial(!showSocial);
    }

    //save updated details--
    const _handleSaveButton = async () => {
        setLoading(true);
        updateItem();
    }

    const getItem = async () => {
        const axiosConfig = {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`
            }
        }
        try {
            let pagesArr = [];
            let profileArr = [];
            let res = await axiosInstance1.get(`${API.mediaItem}/${id ? id : itemFromHome?.id}`, axiosConfig);
            console.log('data!!!!!!>', res.data.data)
            let liveDTO = res.data.data.liveStreamDataDTO;
            let [startDate, startTime] = convertTime(timeZone, res.data.data.liveStreamDataDTO.startDate, res.data.data.liveStreamDataDTO.startTime);
            let [endDate, endTime] = convertTime(timeZone, res.data.data.liveStreamDataDTO.endDate, res.data.data.liveStreamDataDTO.endTime);
            await setStartDate(startDate);
            await setStartTime(startTime);
            await setEndDate(endDate);
            await setEndTime(endTime);



            await setItem(res.data.data);
            await setTitle(res.data.data.title);
            await setFbConnect(res.data.data.liveStreamDataDTO.enableFacebookLiveStream);
            await setYtConnect(res.data.data.liveStreamDataDTO.enableYoutubeLiveStream);
            let allAccounts = res.data.data.liveStreamDataDTO.socialMediaTokenInfoDTO;
            let instaAndtwitterAccounts = res.data.data.liveStreamDataDTO.socialMediaLiveStreamDTO;

            if (instaAndtwitterAccounts) instaAndtwitterAccounts?.socialMediaType == 'INSTA' ? setInstaConnected(true) : instaAndtwitterAccounts?.socialMediaType == 'TWITTER' ? setTwitterConnected(true) : null;



            console.log('all accounts >>>', instaAndtwitterAccounts);
            setSocialMediaDTO(allAccounts);
            setSocialMediaLiveStreamDTO(instaAndtwitterAccounts);
            allAccounts.map((item) => {
                if (item?.socialMediaType == 'FACEBOOK' && item?.socialMediaAccountType == 'PAGE') {
                    pagesArr.push(item);
                }
                if (item?.socialMediaType == 'FACEBOOK' && item?.socialMediaAccountType == 'PROFILE') {
                    profileArr.push(item)
                }
                if (item?.socialMediaType == 'YOUTUBE') {
                    console.log('yt ', item)
                    setConnectedChannel(item)
                }
            })
            setFbPages(pagesArr);
            setFBProfiles(profileArr);
            setLoading(false)

        }
        catch (err) {
            await console.log('error while getting stream item data', err.response)
            setLoading(false)
        }
    }

    const updateItem = async () => {
        const axiosConfig = {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`
            }
        }

        const data = {
            "additionalLabel": addLabel,
            "description": desc,
            "itemType": "LIVE_STREAMING",
            "liveStreamDataDTO": {
                "enableFacebookLiveStream": fbConnected,
                "enableYoutubeLiveStream": ytConnected,
                "deviceType": "MOBILE_APP",
                "streamName": title,
                "videoLiveType": "LIVE",
                "startDate": "",
                "endDate": "",
                "startTime": "",
                "endTime": "",
                "socialMediaTokenInfoDTO": socialMediaDTO,
                "socialMediaLiveStreamDTO": socialMediaLiveStreamDTO
            },
            "isPublished": true,
            "status": "PUBLISHED",
            "title": title,
            "speaker": lecturer,
            "subTitle": subtitle,
            "videoName": title,
        }

        try {
            const res = await axiosInstance1.put(`${API.mediaItem}/${id}`, data, axiosConfig);
            console.log('res after updating data>>', res);
            setLoading(false)

        } catch (err) {
            dispatch({
                type: SET_ALERT, payload: {
                    setShowAlert: true,
                    data: {
                        message: 'Incountered error while updating data!',
                        showCancelButton: true,
                        onCancelPressed: () => {
                            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                        },
                    }
                }
            })

            console.log('err>>', err.response)
            setLoading(false);
        }

    }

    const connectFbAccounts = async () => {
        setLoading(true)
        const axiosConfig = {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`
            }
        }
        try {
            const res = await axiosInstance1.put(`${API.addFbAccounts}?mediaItemId=${id ? id : itemFromHome?.id}`, body, axiosConfig)
            await getItem();
            console.log('res,white connect', res);
            setModalToConnect(false);
            setLoading(false);


        } catch (err) {
            console.log('error while adding fb accounts>', err),
                dispatch({
                    type: SET_ALERT, payload: {
                        setShowAlert: true,
                        data: {
                            message: 'Problem occured while adding accounts!',
                            showCancelButton: true,
                            onCancelPressed: () => {
                                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                            },
                        }
                    }
                })
            setModalToConnect(false)
            setLoading(false)
        }
    }

    const connectYtAccount = async () => {
        setLoading(true)
        const axiosConfig = {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`
            }
        }
        try {
            const res = await axiosInstance1.put(`${API.addYtAccount}/?id=${allYtChannel.id}&mediaItemId=${id ? id : itemFromHome?.id}`, axiosConfig)
            await getItem();
            console.log('res,white connect', res);
            setLoading(false);
        } catch (err) {
            console.log('error while adding yt accounts>', err),
                dispatch({
                    type: SET_ALERT, payload: {
                        setShowAlert: true,
                        data: {
                            message: 'Problem occured while adding accounts!',
                            showCancelButton: true,
                            onCancelPressed: () => {
                                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                            },
                        }
                    }
                })
            setLoading(false)
        }
    }

    const connectInstaOrTwitter = async () => {
        setLoading(true);
        const axiosConfig = {
            headers: {
                accept: "application/json",
                Authorization: `Bearer ${token}`
            }
        }
        const body = {
            "rtmpUrl": instaRTMP,
            "socialMediaType": active == SOCIALTYPE.INSTA ? SOCIALTYPE.INSTA : SOCIALTYPE.TWITTER,
            "streamId": item?.liveStreamDataDTO?.streamId,
            "streamKey": instaStreamKey
        }

        console.log('this is being sent>>', body)
        try {
            const res = await axiosInstance1.post(`${API.socialMediaLiveStreaming}`, body, axiosConfig)
            await getItem();
            console.log('res,white connect', res);
            setInstaTwitterModal(false)
            setInstaRTMP(null)
            setInstaStreamKey(null);
            setLoading(false);
        } catch (err) {
            console.log('error while adding yt accounts>', err),
                dispatch({
                    type: SET_ALERT, payload: {
                        setShowAlert: true,
                        data: {
                            message: 'Problem occured while adding accounts!',
                            showCancelButton: true,
                            onCancelPressed: () => {
                                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                            },
                        }
                    }
                })
            setLoading(false)
        }
    }


    const _getAllSocialAccount = async () => {
        const axiosConfig = {
            headers: {
                "accept": "application/json",
                "Authorization": 'Bearer ' + token
            }
        }
        try {
            const res = await axiosInstance1.get(`${API.getSocialAccounts}`, axiosConfig);
            // console.log(res.data.data, 'res all social accounts')
            _processSocialAccounts(res.data.data);
        } catch (err) {
            console.log('error while getting the accounts>', err)
        }
    }

    const showYtConnectModal = () => {
        dispatch({
            type: SET_ALERT, payload: {
                setShowAlert: true,
                data: {
                    message: 'Are you sure you want to connect your stream  to youtube ?',
                    showCancelButton: true,
                    onCancelPressed: () => {
                        dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                    },
                    showConfirmButton: true,
                    confirmText: 'Yes',
                    onConfirmPressed: () => {
                        connectYtAccount()
                        dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })

                    }
                }

            }
        }
        )
    };


    /**
     * 
     * @param {*} social accounts and set them in respective state 
     */
    const _processSocialAccounts = (res) => {
        let allFbPages = res.filter((item) => item.socialMediaType == "FACEBOOK" && item.socialMediaAccountType == 'PAGE');
        let allProfiles = Array.from(allFbPages.reduce((m, t) => m.set(t.userName, t), new Map()).values());

        res.map(item => {
            if (item.socialMediaType == 'YOUTUBE') {
                // console.log('allyt channel', item)
                setAllYtChannel(item);
            }
        })
        setAllFbPages(allFbPages);
        setAllFbProfiles(allProfiles);
    }

    return (
        <SafeAreaView style={styles.container}>
            {isFocused && <StatusBar translucent backgroundColor={'transparent'} />}
            <Loader loading={loading} />
            <Header _handlePressStream={_handlePressStream} />
            {renderHack ?
                <View style={styles.cameraViewContainer}>
                    {/* <NodeCameraView
                        style={styles.camera}
                        ref={playerRef}
                        camera={{ cameraId: 1, cameraFrontMirror: true }}
                        audio={{ bitrate: 32000, profile: 1, samplerate: 44100 }}
                        video={{ preset: 1, bitrate: 500000, profile: 1, fps: 30, videoFrontMirror: false }}
                        smoothSkinLevel={3}
                        autopreview={true}
                    /> */}
                    <View style={styles.overlay} />
                </View>
                : null
            }

            <ScrollView style={styles.scrollViewStyle}>

                {/* THIS IS THE FORM SECTION TO FILL BASIC DETAILS */}
                <View style={styles.formSectionContainer}>
                    <View style={styles.flexRow}>
                        <Text style={styles.title}>Basic Info</Text>
                        <View style={{
                            marginLeft: moderateScale(10)
                        }}>
                            <TouchableOpacity onPress={_handleBasicInfoToggle}>
                                <Icon name={!showBasicInfo ? "chevron-down" : "chevron-up"} color={"#fff"} size={23} />
                            </TouchableOpacity>
                        </View>

                    </View>
                    {
                        showBasicInfo &&
                        <>
                            <View style={{
                                marginTop: moderateVerticalScale(10)
                            }}>
                                <FormInputLive title={"Title"} value={title} defaultValue={item?.title} placeholder={"Title"} disabled={!newStream} onChangeText={val => setTitle(val)} />
                            </View>
                            <View style={{
                                marginTop: moderateVerticalScale(10)
                            }} >
                                <FormInputLive title={"Subtitle"} value={subtitle} defaultValue={item?.subTitle} placeholder={'Subtitle'} disabled={!newStream} onChangeText={val => setSubtitle(val)} />
                            </View>
                            <View style={{
                                marginTop: moderateVerticalScale(10),
                                flexDirection: "row"
                            }}>
                                <View style={{ flex: 1 / 2, marginRight: moderateScale(10) }}>
                                    <FormInputLive title={"Lecturer"} value={lecturer} defaultValue={item?.speaker} placeholder={"Lecturer"} disabled={!newStream} onChangeText={val => setLecturer(val)} />
                                </View>
                                <View style={{ flex: 1 / 2 }}>
                                    <FormInputLive title={"Additional label"} value={addLabel} defaultValue={item?.additionalLabel} placeholder={"Additional label"} disabled={!newStream} onChangeText={val => setAddLabel(val)} />
                                </View>
                            </View>
                            <View style={{
                                marginTop: moderateVerticalScale(10)
                            }} >
                                <FormInputLive title={"Description"} value={desc} defaultValue={item?.description} placeholder={'Desciption'} disabled={!newStream} onChangeText={val => setDesc(val)} />
                            </View>
                            {
                                (!newStream && (item?.liveStreamDataDTO?.startDate !== null && item?.liveStreamDataDTO?.startTime !== null && item?.liveStreamDataDTO?.endDate !== null && item?.liveStreamDataDTO?.endTime !== null)) &&
                                <>
                                    <View style={{
                                        marginTop: moderateVerticalScale(10),
                                        flexDirection: "row"
                                    }}>
                                        <View style={{ flex: 1 / 2, marginRight: moderateScale(10) }}>
                                            <FormInputLive title={"Start Date"} disabled placeholder={"Start Date"} defaultValue={startDate} />
                                        </View>
                                        <View style={{ flex: 1 / 2 }}>
                                            <FormInputLive title={"Start Time"} disabled placeholder={"Start Time"} defaultValue={startTime} />
                                        </View>
                                    </View>
                                    <View style={{
                                        marginTop: moderateVerticalScale(10),
                                        flexDirection: "row"
                                    }}>
                                        <View style={{ flex: 1 / 2, marginRight: moderateScale(10) }}>
                                            <FormInputLive title={"End Date"} disabled placeholder={"End Date"} defaultValue={endDate} />
                                        </View>
                                        <View style={{ flex: 1 / 2 }}>
                                            <FormInputLive title={"End Time"} disabled placeholder={"End Time"} defaultValue={endTime} />
                                        </View>
                                    </View>
                                </>
                            }
                        </>
                    }
                </View>

                {/* THIS IS SETTINGS SECTION FOR SOME ADDITIONAL DETAILS */}
                <View style={{ ...styles.formSectionContainer, marginTop: moderateVerticalScale(35) }}>
                    <View style={styles.flexRow}>
                        <Text style={styles.title}>Settings</Text>
                        <View style={{
                            marginLeft: moderateScale(10)
                        }}>
                            <TouchableOpacity onPress={_handleSettingsToggle}>
                                <Icon name={!showSetting ? "chevron-down" : "chevron-up"} color={"#fff"} size={23} />
                            </TouchableOpacity>
                        </View>

                    </View>
                    {
                        showSetting &&
                        <>
                            <View style={{
                                marginTop: moderateVerticalScale(10)
                            }}>
                                <FormInputLive title={"Stream Id"} disabled placeholder={"Stream Id"} defaultValue={item?.liveStreamDataDTO?.streamId} />
                            </View>
                            <View style={{
                                marginTop: moderateVerticalScale(10)
                            }} >
                                <FormInputLive title={"Stream name/key"} disabled placeholder={'Stream name/key'} defaultValue={item?.liveStreamDataDTO?.streamName} />
                            </View>
                        </>
                    }
                </View>


                {/* THIS IS SOCIAL MEDIA SECTION */}
                <View style={styles.socialMediaSection}>
                    <View style={styles.flexRow}>
                        <Text style={styles.title}>Destination</Text>
                        <View style={{
                            marginLeft: moderateScale(10)
                        }}>
                            <TouchableOpacity onPress={_handleSocialToggle}>
                                <Icon name={!showSocial ? "chevron-down" : "chevron-up"} color={"#fff"} size={23} />
                            </TouchableOpacity>
                        </View>

                    </View>

                    <Text style={styles.dateSubtitle}>Simultanously share your stream to other platforms.</Text>


                    {/* section for top two icons */}
                    {
                        showSocial &&
                        <>
                            <View style={styles.socialSection}>

                                {/* FB SECTION STARTS */}
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        if (fbConnected) setModalVisisble(true);
                                        else if (!fbConnected) {
                                            setModalToConnect(true)
                                        }
                                    }}
                                    style={styles.socialCard}>
                                    <View style={styles.socialButton}>
                                        <SocialIcon name={"facebook"} color={ThemeConstant.COLOR_FB} size={40} />
                                    </View>
                                    <View activeOpacity={0.8} style={{ ...styles.socialName }}>
                                        <Text style={styles.socialName}>{"Facebook"}</Text>
                                        {fbConnected ?
                                            <Text style={{
                                                color: '#fff',
                                                flex: 1,
                                                paddingHorizontal: 12,
                                                fontSize: scale(7)
                                            }}>Click here to see all connected accounts.</Text>
                                            : (fbConnected == false) ?
                                                <Text style={{
                                                    color: '#fff',
                                                    flex: 1,
                                                    paddingHorizontal: 12,
                                                    fontSize: scale(7)
                                                }}>Click here see the list of all fb accounts.</Text>
                                                : null
                                        }
                                    </View>
                                    <View style={styles.btnCont}>
                                        <Text style={{
                                            ...styles.socialText,
                                        }}>
                                            {fbConnected ? "Connected" : "Not Connected"}
                                        </Text>
                                    </View>

                                </TouchableOpacity >
                                {/* FB SECTION ENDS */}


                                {/* YOUTUBE SECTION STARTS */}
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={() => {
                                        if (!ytConnected) {
                                            showYtConnectModal();
                                        }
                                    }}
                                    style={styles.socialCard}>
                                    <View style={styles.socialButton}>
                                        <SocialIcon name={"youtube"} color={ThemeConstant.COLOR_YT} size={40} />
                                    </View>
                                    <View activeOpacity={0.8} style={{ ...styles.socialName }}>
                                        <Text style={styles.socialName}>{ytConnected ? connectedChannel?.userName : "Youtube"}</Text>
                                        {!ytConnected &&
                                            <Text
                                                style={{
                                                    color: '#fff',
                                                    flex: 1,
                                                    paddingHorizontal: 12,
                                                    fontSize: scale(7)
                                                }}>Click here to connect your stream to youtube.</Text>
                                        }
                                    </View>
                                    <View style={styles.btnCont}>
                                        <Text style={{
                                            ...styles.socialText
                                        }}>
                                            {ytConnected ? "Connected" : "Not Connected"}
                                        </Text>
                                    </View>


                                </TouchableOpacity >
                                {/* YOUTUBE SECTION ENDS */}


                                <SocialIconComp iconColor={ThemeConstant.COLOR_TWITTER} iconName={"twitter"} status={twitetrConnected} title={"Twitetr"} setModalVisisble={setInstaTwitterModal} setActive={setActive} />
                                <SocialIconComp iconColor={ThemeConstant.COLOR_INSTA} iconName={"instagram"} status={instaConnected} title={"Instagram"} setModalVisisble={setInstaTwitterModal} setActive={setActive} />
                            </View>
                        </>
                    }
                </View>
            </ScrollView>
            <TouchableOpacity
                disabled={!newStream}
                activeOpacity={newStream ? 0.8 : 1}
                onPress={() => {
                    if (newStream) {
                        _handleSaveButton()
                    }
                }}
                style={{ ...styles.btnContainer, backgroundColor: newStream ? brandColor : `${brandColor}a4` }}>
                <SocialIcon name={"content-save"} size={16} color={'#fff'} />
                <Text style={styles.btnText}>Save</Text>
            </TouchableOpacity>

            <ShowSocialModal modalVisible={modalVisible} setModalVisisble={setModalVisisble} fbPages={fbPages} fbProfiles={fbProfiles} />
            <AddSocialModal modalVisible={modalToConnect} setModalVisisble={setModalToConnect} fbPages={allFbPages} connectFbAccounts={connectFbAccounts} fbProfiles={allFbProfiles} body={body} setBody={setBody} />
            <InstaModal setModalVisisble={setInstaTwitterModal} modalVisible={instaTwitterModal} setRTMP={setInstaRTMP} setStreamKey={setInstaStreamKey} connectInsta={connectInstaOrTwitter} rtmp={instaRTMP} streamkey={instaStreamKey} />
        </SafeAreaView>
    )
}

//COMPONENT FOR THE SOCIAL ICONS
const SocialIconComp = React.memo(({ iconName, iconColor, pageTitle, status = false, setModalVisisble = function () { }, setActive, ...props }) => {

    return (
        <TouchableOpacity activeOpacity={0.8}
            onPress={() => {
                if (!status) {
                    if (iconName == 'twitter') {
                        setActive(SOCIALTYPE.TWITTER)
                    } else if (iconName == 'instagram') {
                        setActive(SOCIALTYPE.INSTA);
                    }
                    setModalVisisble(true)
                }

            }} style={styles.socialCard}>
            <View style={styles.socialButton}>
                <SocialIcon name={iconName} color={iconColor} size={40} />
            </View>
            <View activeOpacity={0.8} style={{ ...styles.socialName }}>
                <Text style={styles.socialName}>{`${iconName.charAt(0).toUpperCase()}${iconName.slice(1,)}`}</Text>
            </View>
            <View style={styles.btnCont}>
                <Text style={{
                    ...styles.socialText
                }}>
                    {status ? "Connected" : "Not Connected"}
                </Text>
            </View>
        </TouchableOpacity >
    )
})

//THIS IS THE COMPONENT RENDERED ON THE TOP OF TEH SCREEN WITH ICONS AND BACK Button-
const ICON_SIZE = scale(25);
const ICON_COLOR = '#d3d3d3';
const Header = ({ _handlePressStream }) => {

    const navigation = useNavigation();

    const _handleGoBack = () => {
        navigation.goBack();
    }

    return (
        <View style={styles.headerContainer}>
            <View style={styles.iconSection}>
                <View style={styles.icon}>
                    <TouchableOpacity onPress={_handleGoBack}>
                        <Icon name={"arrow-back"} size={ICON_SIZE} color={ICON_COLOR} />
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.iconSection}>
                <View style={styles.icon}>
                    <TouchableOpacity onPress={_handlePressStream}>
                        <Icon name={"videocam"} size={ICON_SIZE} color={ICON_COLOR} />
                    </TouchableOpacity>
                </View>
            </View>
        </View >
    )
}

//THIS IS to SHOW SOCIAL ACCOUNTS LIST__
const ShowSocialModal = ({ modalVisible, setModalVisisble, ...props }) => {
    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisisble(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
                            <CloseModal onPress={() => setModalVisisble(false)} />
                        </View>
                        <Text style={styles.modalPagesHeader}>
                            Pages</Text>
                        <FlatList
                            style={{
                                maxHeight: moderateVerticalScale(150)
                            }}
                            data={props?.fbPages}
                            keyExtractor={item => item.id}
                            renderItem={({ item, index }) => {
                                return (
                                    <View style={styles.modalCardContainer}>
                                        <Text style={styles.pageNameText}>{item.pageName}</Text>
                                        {
                                            item?.profilePictureUrl ?
                                                <FastImage
                                                    source={{
                                                        uri: item?.profilePictureUrl
                                                    }}
                                                    style={{
                                                        height: moderateVerticalScale(40),
                                                        aspectRatio: 1 / 1,
                                                        backgroundColor: ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR,
                                                        borderRadius: moderateVerticalScale(100)
                                                    }}
                                                />
                                                :
                                                <FontAwesom name={"user-circle-o"} size={40} color={'#4267B2'} />
                                        }
                                    </View>
                                )
                            }}
                        />
                        <Text style={{ ...styles.modalPagesHeader, marginTop: moderateVerticalScale(10) }}>Profiles</Text>
                        <FlatList
                            style={{
                                maxHeight: moderateVerticalScale(150)
                            }}
                            data={props?.fbProfiles}
                            keyExtractor={item => item.id}
                            renderItem={({ item, index }) => {
                                return (
                                    <View style={styles.modalCardContainer}>
                                        <Text style={styles.pageNameText}>{item.userName}</Text>
                                        <FontAwesom name={"user-circle-o"} size={40} color={ThemeConstant.COLOR_FB} />
                                    </View>
                                )
                            }}
                        />


                    </View>
                </View>
            </Modal>
        </View>
    )
}

//THIS IS to Add FB ACCOUNTS __
const AddSocialModal = ({ modalVisible, setModalVisisble, body, setBody, connectFbAccounts, ...props }) => {

    //This is done to remove dublicate account names from fbprofiles and show only single name in profiles 
    const uniqueAccountNames = new Set(props.fbProfiles.map(item => item.accountName));
    const uniqueData = [...uniqueAccountNames].map(accountName => {
        return props.fbProfiles.find(item => item.accountName === accountName);
    });

    const { brandColor } = useSelector((state) => state.brandingReducer.brandingData)
    /**
     * @desc - to remove an onject with a specific attribute from the given array.
     * @returns  the remaining array
     */

    var removeByAttr = function (arr, attr, value) {
        var i = arr.length;
        while (i--) {
            if (arr[i]
                && arr[i].hasOwnProperty(attr)
            ) {
                arr.splice(i, 1);
            }
        }
        return arr;
    }

    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisisble(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
                            <CloseModal onPress={() => setModalVisisble(false)} />
                        </View>
                        <Text style={styles.modalPagesHeader}>
                            Pages</Text>
                        <FlatList
                            showsVerticalScrollIndicator={true}
                            style={{
                                maxHeight: moderateVerticalScale(150)
                            }}
                            data={props?.fbPages}
                            keyExtractor={item => item.id}
                            renderItem={({ item, index }) => {
                                return (
                                    <View style={styles.modalCardContainer}>
                                        <View style={{ flex: 1 }}>
                                            <Checkbox
                                                onChange={(state) => {
                                                    if (state) {
                                                        setBody(prev => [...prev, { [item.id]: "PAGE" }])
                                                    } else {
                                                        let data = [...body];
                                                        let newData = removeByAttr(data, item.id, true);
                                                        setBody(newData);
                                                    }
                                                }}>
                                                <Text style={styles.pageNameText}>{item.pageName}</Text>
                                            </Checkbox>
                                        </View>
                                        {
                                            item?.profilePictureUrl ?
                                                <FastImage
                                                    source={{
                                                        uri: item?.profilePictureUrl
                                                    }}
                                                    style={{
                                                        height: moderateVerticalScale(40),
                                                        aspectRatio: 1 / 1,
                                                        backgroundColor: ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR,
                                                        borderRadius: moderateVerticalScale(100)
                                                    }}
                                                />
                                                :
                                                <FontAwesom name={"user-circle-o"} size={40} color={ThemeConstant.COLOR_FB} />
                                        }
                                    </View>
                                )
                            }}
                        />
                        <Text style={{ ...styles.modalPagesHeader, marginTop: moderateVerticalScale(10) }}>Profiles</Text>
                        <FlatList
                            showsVerticalScrollIndicator={true}
                            style={{
                                maxHeight: moderateVerticalScale(150)
                            }}
                            data={uniqueData}
                            keyExtractor={item => item.id}
                            renderItem={({ item, index }) => {
                                return (
                                    <View style={styles.modalCardContainer}>
                                        <View style={{ flex: 1 }}>
                                            <Checkbox
                                                onChange={(state) => {
                                                    if (state) {
                                                        setBody(prev => [...prev, { [item.id]: "PROFILE" }])
                                                    } else {
                                                        let data = [...body];
                                                        let newData = removeByAttr(data, item.id, true);
                                                        setBody(newData);
                                                    }
                                                }}>
                                                <Text style={styles.pageNameText}>{item.accountName}</Text>
                                            </Checkbox>
                                        </View>
                                        {
                                            item?.accountProfilePictureUrl ?
                                                <FastImage
                                                    source={{
                                                        uri: item?.accountProfilePictureUrl
                                                    }}
                                                    style={{
                                                        height: moderateVerticalScale(40),
                                                        aspectRatio: 1 / 1,
                                                        backgroundColor: ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR,
                                                        borderRadius: moderateVerticalScale(100)
                                                    }}
                                                />
                                                :
                                                <FontAwesom name={"user-circle-o"} size={40} color={ThemeConstant.COLOR_FB} />
                                        }
                                    </View>
                                )
                            }}
                        />
                        <View style={{ marginTop: moderateVerticalScale(20) }}>
                            <CustomButton inputStyle={{ backgroundColor: brandColor }} butttonText={'Connect'} onPress={connectFbAccounts} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const InstaModal = ({ rtmp, setRTMP, streamkey, setStreamKey, modalVisible, setModalVisisble, connectInsta }) => {
    const { brandColor } = useSelector((state) => state.brandingReducer.brandingData);
    const [error1, setError1] = useState(null);
    const [error2, setError2] = useState(null);

    const _handleConnect = () => {
        if (rtmp == null) {
            setError1('Please enter rtmp url');
        }
        if (streamkey == null) {
            setError1('Please enter Stream key');
        }
        else if (streamkey !== null && streamkey !== '' && rtmp !== null && rtmp !== '') {
            connectInsta()
        }
    }
    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setError1(null)
                    setError2(null)
                    setRTMP(null)
                    setStreamKey(null)
                    setModalVisisble(!modalVisible);
                }}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
                            <CloseModal onPress={() => {
                                setError1(null)
                                setError2(null)
                                setRTMP(null)
                                setStreamKey(null)
                                setModalVisisble(false)
                            }
                            } />
                        </View>

                        <View style={{ marginVertical: moderateVerticalScale(5) }}>
                            <FormInput name={"Rtmp Url"} value={rtmp} onChangeText={txt => setRTMP(txt)} error={error1} />
                            <FormInput name={"Stream Key"} value={streamkey} onChangeText={txt => setStreamKey(txt)} error={error2} />
                        </View>

                        <View style={{ marginTop: moderateVerticalScale(20) }}>
                            <CustomButton inputStyle={{ backgroundColor: brandColor }} butttonText={'Connect'} onPress={_handleConnect} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>

    )
}

export default ItemDetail;