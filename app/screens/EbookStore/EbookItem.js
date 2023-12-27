import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Platform,
    RefreshControl,
    Image,
    useWindowDimensions,
} from 'react-native';
import Icons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector, } from 'react-redux';
import { axiosInstance1 } from '../../constant/Auth';
import * as API from '../../constant/APIs';
import { moderateScale, moderateVerticalScale, scale, verticalScale } from 'react-native-size-matters';
import ThemeConstant, {
    DynamicThemeConstants,
} from '../../constant/ThemeConstant';
import { Modal } from '../../components/Modal';
import styles from './Styles';
import CustomButton from '../../components/CustomButton';
import Loader from '../../components/Loader';
import { format } from 'date-fns';
import AntDesign from 'react-native-vector-icons/AntDesign'
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SET_IOSCOMP, SET_ACCESS_MODAL_IOS, SET_SUB_PLAN_IDS } from '../../store/actions/types';
import LinearGradient from 'react-native-linear-gradient';
import { shadeColor } from '../../utils/shadeColor';
import GetIcon from '../../services/IconBasedOnId';


const EbookItem = ({ route, navigation }) => {
    const dispatch = useDispatch();
    const isFocused = useIsFocused();
    const { width, height } = useWindowDimensions();
    //routes data--------------
    const {
        mobileTheme: theme,
        subdomain: subDomain,
        brandColor,
        website: websiteName,
        organizationName: orgName,
    } = useSelector((state) => state.brandingReducer.brandingData);
    const { token, isPaymentDone, isAuthenticated, userId, user, subscription: { id }, userCards } = useSelector(state => state.authReducer);
    const { orgId } = useSelector(state => state.activeOrgReducer);
    const [numberOfLine, setNumberOflines] = useState(3);
    const [ebookContent, setEbookContent] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [bookCover, setBookCover] = useState(null);
    const [ebookTitle, setEbookTitle] = useState(null);
    const [ebookSubtitle, setEbookSubtitle] = useState(null);
    const [ebookDateText, setEbookDateText] = useState(null);
    const [ebookDescription, setEbookDescription] = useState(null);
    const [path, setPath] = useState(null);
    const [pdfPath, setPdfPath] = useState(null)
    const [speaker, setSpeaker] = useState(null);
    const [showReadMore, setShowReadMore] = useState(false);
    const [cardData, setCardData] = useState(null);

    const {
        type,
        imageBgColor,
        ebookItemId
    } = route.params;
    const fromCheckout = route.params?.fromCheckout

    useEffect(() => {
        getData();
    }, [token, ebookItemId, id, fromCheckout]);

    useEffect(() => {
        if (isAuthenticated) {
            setCardData(userCards[0])
        }
    }, [])

    //format date string-----
    const formatDate = (date) => {
        let formatedDate = format(new Date(date), 'MMMM dd, yyyy');
        return formatedDate;
    };

    //called when pull down refresh is called------
    const onRefresh = async () => {
        setRefreshing(true);
        await getData();
    };

    const handleNavigate = () => {
        if (type == 'pdf') {
            navigation.navigate('Ebook', {
                pdfPath,
                ebookTitle,
                ebookSubtitle,
                ebookItemId
            })
        } else {
            navigation.navigate('Epub', {
                path,
                ebookTitle,
                ebookSubtitle,
                ebookItemId

            })
        }
    }
    const getBase64 = async (id) => {
        console.log('id is', id);

        try {
            const response = await axiosInstance1.post(
                `${API.epubBase64}?documentId=${id}`
            )
            return response.data.data;

        } catch (error) {
            console.log('erro is', error);
        }

    }

    const getData = async () => {
        if (isAuthenticated) {
            getItemDataWithAuth();
        } else {
            getItemDataWithoutAuth();
        }
    };

    const getItemDataWithoutAuth = async () => {
        try {
            const response = await axiosInstance1.get(
                `/mediaItem/mediaItemId/${ebookItemId}?organizationId=${orgId}`
            );
            if (response.status == 200) {
                const nameList = response.data.data;
                setEbookContent(nameList);
                setBookCover(nameList.ebookArtwork?.document?.path)
                setEbookTitle(nameList.title);
                setEbookSubtitle(nameList.subTitle);
                setEbookDateText(nameList.date);
                setEbookDescription(nameList.description);
                setSpeaker(nameList.speaker);
                setPath(Platform.OS === 'ios' ? await getBase64(nameList.document.id) : nameList.document.path);
                setPdfPath(nameList.document.path)
                setRefreshing(false);
                setLoading(false);
            }
        } catch (err) {
            setLoading(false);
            setRefreshing(false)
            console.log('error while getting data without auth', err);
        }
    };

    const getItemDataWithAuth = async () => {
        setLoading(true)
        let axiosConfig = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + `${token}`,
            },
        };
        try {
            const response = await axiosInstance1.get(
                `/mediaItem/${ebookItemId}`,
                axiosConfig
            );
            if (response.status == 200) {
                const nameList = response.data.data;
                // console.log('name with auth',nameList);
                setEbookContent(nameList);
                setEbookTitle(nameList.title);
                setEbookSubtitle(nameList.subTitle);
                setEbookDateText(nameList.date);
                setEbookDescription(nameList.description);
                setSpeaker(nameList.speaker);
                setBookCover(nameList.ebookArtwork?.document?.path)
                setPath(Platform.OS === 'ios' ? await getBase64(nameList.document.id) : nameList.document.path);
                setPdfPath(nameList.document.path)
                setRefreshing(false);
                setLoading(false);
            }
        } catch (err) {
            setLoading(false);
            setRefreshing(false)
            console.log('error while getting data with auth', err);
        }
    };


    const _handleGetAccessButton = async () => {
        await setModalVisible(false);
        setTimeout(() => {
            navigation.navigate('SubscriptionDetails', {
                fromEbookItem: true,
                subscriptionPlanIds: ebookContent?.subscriptionPlanIds,
            });
        }, 400);

    };

    const _handleLogin = () => {
        setModalVisible(false);
        setTimeout(() => {
            navigation.navigate('Auth', {
                screen: 'LoginScreen',
                params: { fromEbookItem: true, ebookItemId: ebookItemId },
            });
        }, 400);

    };

    const _signUpButton = async () => {
        await setModalVisible(false);
        setTimeout(() => {
            navigation.navigate('Auth', {
                screen: 'RegisterScreen',
                params: { fromEbookItem: true, ebookItemId: ebookItemId },
            });
        }, 400);

    };

    //modal component
    function Alertmodal() {
        return (
            <Modal
                style={{ flex: 1 }}
                isVisible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                {
                    ebookContent?.isOneTimePurchase == true && ebookContent?.subscriptionPlanIds.length == 0 && ebookContent?.mediaAccessType !== 'ACCESSREQUIRED' &&
                    (
                        <TouchableOpacity
                            style={{ flex: 1, justifyContent: 'center' }}
                            activeOpacity={1}
                            onPress={() => {
                                setModalVisible(false);
                            }}
                        >
                            <Modal.Container>
                                {token !== null ?

                                    //one time payment modal with login on platform basis-------------------------
                                    Platform.OS == 'ios' ?
                                        (
                                            <Modal.Body>
                                                <View style={{ width: '90%', height: '80%' }}>
                                                    <Text
                                                        style={{
                                                            // ...styles.textColorWhite,
                                                            color:
                                                                theme == 'DARK'
                                                                    ? 'black'
                                                                    : 'white',
                                                            fontSize: 16,
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        You must be a {orgName} one time paid subscriber to read this book,pay by downloading{' '}
                                                        {orgName} android mobile app or visit our website{' '}

                                                    </Text>
                                                    <Text style={{
                                                        color: "yellow",
                                                        fontWeight: '600',
                                                        fontSize: 16,
                                                        textAlign: 'center',
                                                    }}>
                                                        {websiteName}
                                                    </Text>
                                                </View>
                                            </Modal.Body>
                                        )
                                        :
                                        (
                                            <Modal.Body>
                                                <View style={{ width: '100%', height: '65%' }}>
                                                    <Text
                                                        style={{
                                                            ...styles.textColorWhite,
                                                            color:
                                                                theme == 'DARK'
                                                                    ? 'black'
                                                                    : 'white',
                                                            fontSize: scale(16),
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        You must be a {orgName} one time paid subscriber to read this book

                                                    </Text>

                                                </View>
                                                <Modal.Footer>
                                                    <CustomButton butttonText={'Buy now'} inputStyle={{ backgroundColor: brandColor, width: '100%', }}
                                                        onPress={() => {
                                                            setModalVisible(false)
                                                            if (isAuthenticated) {
                                                                navigation.navigate('Checkout', {
                                                                    price: ebookContent?.price,
                                                                    fromEbookItem: true,
                                                                    itemId: ebookItemId
                                                                })
                                                            } else {
                                                                navigation.navigate('Auth', {
                                                                    screen: 'RegisterScreen',
                                                                    params: {
                                                                        type: 'MEDIA_ITEM',
                                                                        fromEbookOTP: true,
                                                                        price: ebookContent?.price,
                                                                        itemId: ebookItemId,
                                                                    },
                                                                })
                                                            }
                                                        }
                                                        }
                                                    />
                                                </Modal.Footer>
                                            </Modal.Body>
                                        )
                                    :
                                    (
                                        <Modal.Body>
                                            <View style={{ alignItems: "center" }}>
                                                <Text
                                                    style={{
                                                        ...styles.textColorWhite,
                                                        color: theme == 'DARK'
                                                            ? 'black'
                                                            : 'white',
                                                        fontSize: scale(15),
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    You must be  {orgName} one time paid subscriber to read this book

                                                </Text>

                                            </View>
                                            <Modal.Footer>
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        marginTop: moderateScale(-3),
                                                    }}
                                                >
                                                    <TouchableOpacity
                                                        style={{
                                                            ...styles.btnn,
                                                            backgroundColor: brandColor,
                                                        }}
                                                        onPress={_handleLogin}
                                                    >
                                                        <Text
                                                            style={{
                                                                ...styles.btnTextModal,

                                                                color: '#ffff',
                                                            }}
                                                        >
                                                            Sign in
                                                        </Text>
                                                    </TouchableOpacity>

                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            marginTop: moderateScale(8),
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                ...styles.textColorWhite,
                                                                color: theme == 'DARK'
                                                                    ? 'black'
                                                                    : 'white',
                                                                fontSize: scale(15),
                                                            }}
                                                        >
                                                            {' '}
                                                            or{' '}
                                                        </Text>
                                                        <TouchableOpacity onPress={_signUpButton}>
                                                            <Text
                                                                style={{
                                                                    textDecorationLine: 'underline',
                                                                    fontWeight: 'bold',
                                                                    fontSize: scale(15),
                                                                    color: theme == 'DARK'
                                                                        ? 'black'
                                                                        : 'white',
                                                                }}
                                                            >
                                                                Sign up
                                                            </Text>
                                                        </TouchableOpacity>
                                                        <Text
                                                            style={{
                                                                color: theme == 'DARK'
                                                                    ? 'black'
                                                                    : 'white',
                                                                fontSize: scale(15),
                                                            }}
                                                        >
                                                            {' '}
                                                            to Subscribe
                                                        </Text>
                                                    </View>
                                                </View>
                                            </Modal.Footer>
                                        </Modal.Body>
                                    )
                                }
                            </Modal.Container>
                        </TouchableOpacity>
                    )

                }
                {
                    (ebookContent?.mediaAccessType == 'ACCESSREQUIRED' || (ebookContent?.mediaAccessType == 'PAID' && ebookContent?.subscriptionPlanIds.length > 0)) &&
                    (
                        <TouchableOpacity
                            style={{ flex: 1, justifyContent: 'center' }}
                            activeOpacity={1}
                            onPress={() => {
                                setModalVisible(false);
                            }}
                        >

                            {isAuthenticated &&
                                (ebookContent?.document == null && ebookContent?.subscriptionPlanIds?.includes(id) ? (
                                    Platform.OS == 'ios' ? (

                                        //without payment user in ios-------------------------------------------
                                        <Modal.Container>
                                            <Modal.Body>
                                                <View style={{ width: '90%', height: '60%' }}>
                                                    <Text
                                                        style={{
                                                            color: theme == 'DARK'
                                                                ? 'black'
                                                                : 'white',
                                                            fontSize: scale(16),
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        To read this paid book, subscribe by downloading{' '}
                                                        {orgName} android mobile app or visit our website{' '}

                                                    </Text>
                                                    <Text style={{
                                                        color: "yellow",
                                                        fontWeight: '600',
                                                        fontSize: 16,
                                                        textAlign: 'center',
                                                    }}>
                                                        {websiteName}
                                                    </Text>
                                                </View>
                                            </Modal.Body>
                                        </Modal.Container>
                                    ) : (

                                        //withlogin without paymentdone  modal for android------------------------------
                                        <Modal.Container>
                                            <Modal.Body>
                                                <Text
                                                    style={{
                                                        ...styles.textColorWhite,
                                                        color:
                                                            theme == 'DARK'
                                                                ? 'black'
                                                                : 'white',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    You must be a {orgName} subscriber to read this book
                                                </Text>
                                                <TouchableOpacity
                                                    style={{
                                                        ...styles.btnn,
                                                        backgroundColor: brandColor,
                                                        marginTop: moderateScale(9),
                                                    }}
                                                    styleFocused={styles.btnFocused}
                                                    onPress={_handleGetAccessButton}
                                                >
                                                    <Text
                                                        style={{
                                                            ...styles.btnTextModal,
                                                            color:
                                                                theme == 'DARK'
                                                                    ? 'black'
                                                                    : 'white',
                                                        }}
                                                    >
                                                        Get Access Now
                                                    </Text>
                                                </TouchableOpacity>
                                            </Modal.Body>
                                        </Modal.Container>
                                    )
                                ) : Platform.OS == 'ios' ? (

                                    //registered or login user without required plan to read book ios---------------------------------
                                    <Modal.Container>
                                        <Modal.Body>
                                            <View style={{ marginTop: -10 }}>
                                                <Text
                                                    style={{
                                                        color: theme == 'DARK'
                                                            ? 'black'
                                                            : 'white',
                                                        fontWeight: '600',
                                                        fontSize: scale(16),
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    You must be a {orgName} subscriber to read this book, subscribe by downloading{' '}
                                                    {orgName} android mobile app or visit our website{' '}
                                                </Text>
                                                <Text style={{
                                                    color: "yellow",
                                                    fontWeight: '600',
                                                    fontSize: scale(16),
                                                    textAlign: 'center',
                                                }}>
                                                    {websiteName}
                                                </Text>
                                            </View>
                                        </Modal.Body>
                                    </Modal.Container>
                                ) : (

                                    //registered or logged in user without required plan to read book android-------------------------------
                                    <Modal.Container>
                                        <Modal.Body>
                                            <View style={{ alignItems: 'center' }}>
                                                <Text
                                                    style={{
                                                        textAlign: 'center',
                                                        color:
                                                            theme == 'DARK'
                                                                ? 'black'
                                                                : 'white',
                                                        fontSize: scale(16)
                                                    }}
                                                >
                                                    You must be a {orgName} subscriber to read this book
                                                </Text>
                                            </View>
                                            <TouchableOpacity
                                                style={{
                                                    ...styles.btnn,
                                                    backgroundColor: brandColor,
                                                    marginTop: moderateScale(9),
                                                }}
                                                styleFocused={styles.btnFocused}
                                                onPress={_handleGetAccessButton}
                                            >
                                                <Text
                                                    style={{
                                                        ...styles.btnTextModal,
                                                        color: '#ffff',
                                                    }}
                                                >
                                                    Get Access Now
                                                </Text>
                                            </TouchableOpacity>
                                        </Modal.Body>
                                    </Modal.Container>
                                ))}
                            {!isAuthenticated &&
                                (ebookContent?.mediaAccessType == 'PAID' ? (
                                    Platform.OS == 'ios' ? (

                                        //without login user paid book ios--------------------------------------------------------
                                        <Modal.Container>
                                            <Modal.Header />
                                            <Modal.Body>
                                                <View style={{ alignItems: "center" }}>
                                                    <Text
                                                        style={{
                                                            color:
                                                                theme == 'DARK'
                                                                    ? 'black'
                                                                    : 'white',
                                                            textAlign: 'center',
                                                            fontSize: scale(16)
                                                        }}
                                                    >
                                                        You must be a {orgName} subscriber to read this book
                                                    </Text>
                                                </View>
                                                <Modal.Footer>
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginTop: moderateScale(-3),
                                                        }}
                                                    >
                                                        <TouchableOpacity
                                                            style={{
                                                                ...styles.btnn,
                                                                backgroundColor: brandColor,
                                                            }}
                                                            onPress={_handleLogin}
                                                        >
                                                            <Text
                                                                style={{
                                                                    ...styles.btnTextModal,
                                                                    color: '#ffff',
                                                                }}
                                                            >
                                                                Sign in
                                                            </Text>
                                                        </TouchableOpacity>

                                                        <View
                                                            style={{
                                                                flexDirection: 'row',
                                                                marginTop: moderateScale(8),
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    fontSize: scale(16),
                                                                    color:
                                                                        theme == 'DARK'
                                                                            ? 'black'
                                                                            : 'white',
                                                                }}
                                                            >
                                                                {' '}
                                                                or{' '}
                                                            </Text>
                                                            <TouchableOpacity onPress={_signUpButton}>
                                                                <Text
                                                                    style={{
                                                                        textDecorationLine: 'underline',
                                                                        fontWeight: 'bold',
                                                                        fontSize: scale(16),
                                                                        color: theme == 'DARK'
                                                                            ? 'black'
                                                                            : 'white',
                                                                    }}
                                                                >
                                                                    Sign up
                                                                </Text>
                                                            </TouchableOpacity>
                                                            <Text
                                                                style={{
                                                                    ...styles.textColorWhite,
                                                                    fontSize: scale(16),
                                                                    color: theme == 'DARK'
                                                                        ? 'black'
                                                                        : 'white',
                                                                }}
                                                            >
                                                                {' '}
                                                                and Subscribe
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </Modal.Footer>
                                            </Modal.Body>
                                        </Modal.Container>
                                    ) : (

                                        //without login paid book android-------------------------------------------------------------
                                        <Modal.Container>
                                            <Modal.Header />
                                            <Modal.Body>
                                                <View style={{ alignItems: "center" }}>
                                                    <Text
                                                        style={{
                                                            color:
                                                                theme == 'DARK'
                                                                    ? 'black'
                                                                    : 'white',
                                                            textAlign: 'center',
                                                            fontSize: scale(16)
                                                        }}
                                                    >
                                                        You must be a {orgName} subscriber to read this book
                                                    </Text>
                                                </View>
                                                <Modal.Footer>
                                                    <View
                                                        style={{
                                                            flex: 1,
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginTop: moderateScale(-3),
                                                        }}
                                                    >
                                                        <TouchableOpacity
                                                            style={{
                                                                ...styles.btnn,
                                                                backgroundColor: brandColor,
                                                            }}
                                                            onPress={_handleLogin}
                                                        >
                                                            <Text
                                                                style={{
                                                                    ...styles.btnTextModal,
                                                                    color: '#ffff',
                                                                }}
                                                            >
                                                                Sign in
                                                            </Text>
                                                        </TouchableOpacity>

                                                        <View
                                                            style={{
                                                                flexDirection: 'row',
                                                                marginTop: moderateScale(8),
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    color:
                                                                        theme == 'DARK'
                                                                            ? 'black'
                                                                            : 'white',
                                                                    fontSize: scale(16),
                                                                }}
                                                            >
                                                                {' '}
                                                                or{' '}
                                                            </Text>
                                                            <TouchableOpacity onPress={_signUpButton}>
                                                                <Text
                                                                    style={{
                                                                        textDecorationLine: 'underline',
                                                                        fontWeight: 'bold',
                                                                        fontSize: scale(16),
                                                                        color:
                                                                            theme == 'DARK'
                                                                                ? 'black'
                                                                                : 'white',
                                                                    }}
                                                                >
                                                                    Sign up
                                                                </Text>
                                                            </TouchableOpacity>
                                                            <Text
                                                                style={{
                                                                    fontSize: scale(16),
                                                                    color:
                                                                        theme == 'DARK'
                                                                            ? 'black'
                                                                            : 'white',
                                                                }}
                                                            >
                                                                {' '}
                                                                and Subscribe
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </Modal.Footer>
                                            </Modal.Body>
                                        </Modal.Container>
                                    )
                                ) : Platform.OS == 'ios' ? (
                                    //access required book ios
                                    <Modal.Container>
                                        <Modal.Body>
                                            <Text style={{
                                                fontSize: scale(16),
                                                color: theme == 'DARK'
                                                    ? 'black'
                                                    : 'white',
                                                textAlign: 'center',
                                            }}>
                                                You must be a {orgName} subscriber to read this free book
                                            </Text >
                                            <Modal.Footer>
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <TouchableOpacity
                                                        style={{
                                                            ...styles.btnn,
                                                            backgroundColor: brandColor,
                                                        }}
                                                        onPress={_handleLogin}
                                                    >
                                                        <Text
                                                            style={{
                                                                ...styles.btnTextModal,
                                                                color: '#ffff',
                                                            }}
                                                        >
                                                            Sign in
                                                        </Text>
                                                    </TouchableOpacity>

                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            marginTop: moderateScale(8),
                                                        }}
                                                    >
                                                        <Text style={{
                                                            fontSize: scale(16),
                                                            color: theme == 'DARK'
                                                                ? 'black'
                                                                : 'white',

                                                        }}> or </Text>
                                                        <TouchableOpacity onPress={_signUpButton}>
                                                            <Text
                                                                style={{
                                                                    textDecorationLine: 'underline',
                                                                    fontWeight: 'bold',
                                                                    fontSize: scale(16),
                                                                    color: theme == 'DARK'
                                                                        ? 'black'
                                                                        : 'white',
                                                                }}
                                                            >
                                                                Sign up
                                                            </Text>
                                                        </TouchableOpacity>
                                                        <Text style={{
                                                            fontSize: scale(16),
                                                            color: theme == 'DARK'
                                                                ? 'black'
                                                                : 'white',

                                                        }}> to Subscribe</Text>
                                                    </View>
                                                </View>
                                            </Modal.Footer>
                                        </Modal.Body>
                                    </Modal.Container>
                                ) : (
                                    //access required book android
                                    <Modal.Container>
                                        <Modal.Body>
                                            <Text style={{
                                                fontSize: scale(16),
                                                color:
                                                    theme == 'DARK'
                                                        ? 'black'
                                                        : 'white',
                                                textAlign: 'center',
                                            }}>
                                                You must be a {orgName} subscriber to read this free book
                                            </Text >
                                            <Modal.Footer>
                                                <View
                                                    style={{
                                                        flex: 1,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <TouchableOpacity
                                                        style={{
                                                            ...styles.btnn,
                                                            backgroundColor: brandColor,
                                                        }}
                                                        onPress={_handleLogin}
                                                    >
                                                        <Text
                                                            style={{
                                                                ...styles.btnTextModal,

                                                                color: '#ffff',
                                                            }}
                                                        >
                                                            Sign in
                                                        </Text>
                                                    </TouchableOpacity>

                                                    <View
                                                        style={{
                                                            flexDirection: 'row',
                                                            marginTop: moderateScale(8),
                                                        }}
                                                    >
                                                        <Text style={{
                                                            fontSize: scale(16),
                                                            color:
                                                                theme == 'DARK'
                                                                    ? 'black'
                                                                    : 'white',

                                                        }}> or </Text>
                                                        <TouchableOpacity onPress={_signUpButton}>
                                                            <Text
                                                                style={{
                                                                    textDecorationLine: 'underline',
                                                                    fontWeight: 'bold',
                                                                    fontSize: scale(16),
                                                                    color:
                                                                        theme == 'DARK'
                                                                            ? 'black'
                                                                            : 'white',
                                                                }}
                                                            >
                                                                Sign up
                                                            </Text>
                                                        </TouchableOpacity>
                                                        <Text style={{
                                                            fontSize: scale(16),
                                                            color:
                                                                theme == 'DARK'
                                                                    ? 'black'
                                                                    : 'white',

                                                        }}> to Subscribe</Text>
                                                    </View>
                                                </View>
                                            </Modal.Footer>
                                        </Modal.Body>
                                    </Modal.Container>
                                ))}
                        </TouchableOpacity>
                    )
                }
            </Modal>
        );
    }


    const _handleReadBook = () => {
        if (ebookContent?.mediaAccessType == 'FREE' || (ebookContent?.mediaAccessType == 'ACCESSREQUIRED' && isAuthenticated)) {
            console.log('code is here 1');
            handleNavigate();
        }
        else {
            if (Platform.OS == 'android') {
                if (ebookContent?.mediaAccessType == 'ACCESSREQUIRED') {
                    if (!isAuthenticated) {
                        setModalVisible(true);
                    } else {
                        handleNavigate();
                    }
                } else if (ebookContent?.mediaAccessType == 'PAID') {
                    if ((ebookContent?.subscriptionPlanIds?.includes(id) && isPaymentDone) || ebookContent?.isOneTimePurchasePaymentDone == true) {
                        handleNavigate();
                    } else if (ebookContent?.isOneTimePurchase == true && ebookContent?.subscriptionPlanIds.length === 0) {
                        if (isAuthenticated) {
                            navigation.navigate('Checkout', {
                                price: ebookContent?.price,
                                fromEbookItem: true,
                                itemId: ebookItemId
                            })
                        } else {
                            navigation.navigate('Auth', {
                                screen: 'RegisterScreen',
                                params: {
                                    type: 'MEDIA_ITEM',
                                    fromEbookOTP: true,
                                    price: ebookContent?.price,
                                    itemId: ebookItemId,
                                },
                            })
                        }

                    }
                    else {
                        setModalVisible(true);
                    }
                } else {
                    setModalVisible(true);
                }
            } else {
                if (ebookContent?.mediaAccessType !== 'FREE' && !isAuthenticated) {
                    return dispatch({ type: SET_ACCESS_MODAL_IOS, payload: true });
                }
                else if (ebookContent?.mediaAccessType == 'FREE' ||
                    (ebookContent?.mediaAccessType == 'ACCESSREQUIRED' && isAuthenticated) ||
                    (ebookContent?.mediaAccessType == 'PAID' && ebookContent?.isOneTimePurchasePaymentDone == true) ||
                    (ebookContent?.mediaAccessType == 'PAID' && ebookContent?.subscriptionPlanIds?.includes(id)) && isPaymentDone) {
                    handleNavigate();
                    return;
                } else {
                    console.log('   ');
                    dispatch({ type: SET_SUB_PLAN_IDS, payload: ebookContent?.subscriptionPlanIds })
                    return dispatch({ type: SET_IOSCOMP, payload: true })
                }
            }
        }

    }


    const onTextLayout = useCallback((e) => {
        setShowReadMore(e.nativeEvent.lines.length >= 3);
    }, []);

    const TextComponent = () => {
        return (
            <View style={styles.detailsContainer}>
                <View style={styles.titleTextContainer}>
                    <Text
                        style={{
                            ...styles.titleText,
                            color:
                                theme == 'DARK'
                                    ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                                    : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                        }}
                    >
                        {ebookTitle}
                        {/* Complete Salvation Part 3 */}
                    </Text>
                </View>

                {ebookSubtitle ? (
                    <View style={styles.subtitleContainer}>
                        <Text
                            style={{
                                ...styles.subtitleText,
                                color:
                                    theme == 'DARK'
                                        ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                                        : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                            }}
                        >
                            {ebookSubtitle}
                            {/* with Rochelle L. Avalos */}
                        </Text>
                    </View>
                ) : null}

                <View style={styles.dateTextContainer}>
                    {ebookDateText && <Text style={styles.dateText}>{formatDate(ebookDateText)}</Text>}

                    {speaker ? (
                        <>
                            {ebookDateText && <Text style={styles.dateText}>{'.'}</Text>}
                            <Text style={styles.dateText}>{speaker}</Text>
                        </>
                    ) : null}
                </View>
            </View>
        );
    };

    //every single button that is in the center as (Downloads , Take a note , Share)
    const CenterButton = ({
        iconName,
        name,
        onPress,
        styleContainer,
        styleItem,
    }) => {
        return (
            <View style={styleContainer}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styleItem}
                    onPress={onPress}
                >
                    <Icons
                        name={iconName}
                        size={ThemeConstant.ICON_SIZE_TINNY}
                        color={ThemeConstant.ICONS_COLOR_DARK}
                    />
                </TouchableOpacity>
                <Text
                    style={{
                        fontFamily: ThemeConstant.FONT_FAMILY,
                        // borderWidth:1,
                        // borderColor:"red",
                        color:
                            theme == 'DARK'
                                ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                                : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                    }}
                >
                    {name}
                </Text>
            </View>
        );
    };

    //book description component---
    const DescriptionTextComponent = () => {
        return ebookDescription ? (
            <View
                style={{
                    ...styles.descriptionTextContainer,
                }}
            >
                <Text
                    onTextLayout={onTextLayout}
                    numberOfLines={numberOfLine}
                    style={styles.dateText}
                >
                    {ebookDescription}
                </Text>
            </View>
        ) : null;
    };

    const ButtonsContainer = () => {
        return (
            <View style={styles.buttonsContainer}>
                <CenterButton
                    styleContainer={styles.individualButtonOuterContainer}
                    styleItem={{
                        ...styles.individualButtonInnerContainer,
                        paddingLeft: 4,
                    }}
                    iconName="document-text"
                    name="Take a note"
                    onPress={() => {
                        navigation.navigate('NoteStackScreen', {
                            screen: 'AddNote',
                            params: { ebookTitle, bookCover, ebookItemId, imageBgColor },
                        });
                    }}
                />
                {/* THIS IS GIVING ICON */}
                {ebookContent?.isGivingEnabled == true && (
                    <View style={styles.individualButtonOuterContainer}>
                        <TouchableOpacity
                            style={styles.individualButtonInnerContainer}
                            onPress={() => {
                                navigation.navigate('GivingStackScreen', {
                                    screen: 'GivingCollectData',
                                    params: { fromItem: true, mediaItemId: mediaItemId },
                                });
                            }}
                        >
                            <GetIcon
                                id={91}
                                width={22}
                                height={22}
                                fill={ThemeConstant.ICONS_COLOR_DARK}
                            />
                        </TouchableOpacity>
                        <Text
                            style={{
                                fontFamily: ThemeConstant.FONT_FAMILY,
                                // borderWidth:1,
                                // borderColor:"red",
                                color:
                                    theme == 'DARK'
                                        ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                                        : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                            }}
                        >
                            Giving
                        </Text>
                    </View>
                )}
            </View>
        );
    };


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
            {
                Platform.OS == 'android' ?
                    <LinearGradient
                        style={{ height: StatusBar.currentHeight }}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        colors={[shadeColor(imageBgColor ?? ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR, -80), shadeColor(imageBgColor ?? ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR, -55)]}
                    >
                        <StatusBar translucent backgroundColor={'transparent'} />
                    </LinearGradient >
                    :
                    isFocused && <StatusBar backgroundColor={imageBgColor} />
            }

            <Loader loading={loading} />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ minHeight: '100%' }}
                refreshControl={
                    <RefreshControl
                        tintColor={'gray'}
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >

                {/* HEADER COMPONENT START */}
                <View style={{
                    width: '130%',
                    aspectRatio: 1920 / 1080,
                    position: 'relative'
                }} >
                    <Image
                        source={{ uri: bookCover }}
                        style={{
                            width: width * 2,
                            height: '100%',
                            right: width * 0.5,
                            backgroundColor: imageBgColor
                        }}
                        blurRadius={3}
                    />
                    <View style={{
                        aspectRatio: 1920 / 1080,
                        width: '100%',
                        position: 'absolute',
                        zIndex: 2,
                        backgroundColor: 'rgba(0,0,0,0.6)'
                    }} />
                    <SafeAreaView
                        edges={['top']}
                        style={{
                            position: 'absolute',
                            zIndex: 2,
                            flexDirection: 'row',
                            width: width,
                            justifyContent: 'space-between',
                            paddingHorizontal: moderateScale(15),
                            alignItems: 'center',
                            height: moderateVerticalScale(70),
                        }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ marginTop: Platform.OS == 'android' ? moderateVerticalScale(-25) : 0 }}
                        >
                            <AntDesign name={'arrowleft'} size={22} color={'#fff'} />
                        </TouchableOpacity>

                        {/* <View style={{
                            marginRight: moderateScale(-2)
                        }}>
                            <TouchableOpacity style={{marginTop: Platform.OS == 'android' ? moderateVerticalScale(-25) : 0}} onPress={_handleReadBook}>
                                <Text
                                    style={{
                                        color: '#fff',
                                        fontFamily: ThemeConstant.FONT_FAMILY,
                                        fontSize: 15,
                                        fontWeight: 'bold'
                              

                                    }}>
                                    {ebookContent ?
                                        Platform.OS == 'android' ?
                                            ebookContent?.isOneTimePurchase && !ebookContent?.isOneTimePurchasePaymentDone && ebookContent?.subscriptionPlanIds.length == 0 ? '' : 'READ'
                                            : 'READ'
                                        : ''
                                    }
                                </Text>
                            </TouchableOpacity>
                        </View> */}

                    </SafeAreaView>
                </View>
                {/* HEADER COMPONENT END */}


                {/* EBOOK COVER START  */}
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                        if (Platform.OS == 'android') {
                            if (ebookContent?.isOneTimePurchase && !ebookContent?.isOneTimePurchasePaymentDone && ebookContent?.subscriptionPlanIds.length == 0) {
                                null
                            } else {
                                _handleReadBook()
                            }
                        } else {
                            _handleReadBook()
                        }

                    }}
                    style={{
                        width: moderateScale(260),
                        aspectRatio: 396 / 612,
                        alignSelf: 'center',
                        borderRadius: 10,
                        overflow: 'hidden',
                        resizeMode: 'contain',
                        marginTop: Platform.OS === 'ios' ? moderateVerticalScale(-185) : moderateVerticalScale(-215),
                        marginBottom: moderateVerticalScale(15),
                    }}>
                    <Image
                        source={{ uri: bookCover }}
                        style={{ ...styles.bannerImageBackground, backgroundColor: imageBgColor }}
                    />
                </TouchableOpacity>
                {/* EBOOK COVER END */}

                <TextComponent />

                <DescriptionTextComponent />
                {
                    ebookDescription !== null && (
                        <TouchableOpacity
                            style={{
                                paddingHorizontal: ThemeConstant.PADDING_EXTRA_LARGE,
                                paddingTop: ThemeConstant.PADDING_NORMAL
                            }}
                            onPress={() => {
                                if (numberOfLine === 3) {
                                    setNumberOflines(1000);
                                } else {
                                    setNumberOflines(3);
                                }
                            }}
                        >
                            <Text
                                style={{
                                    color: theme == 'DARK' ? '#fff' : '#000',
                                    fontWeight: 'bold',
                                }}
                            >
                                {showReadMore ? numberOfLine === 3 ? 'Read More' : 'Show less' : ''}
                            </Text>
                        </TouchableOpacity>
                    )
                }

                {/* THIS IS ONE TIME PURCHASE BUTTON */}
                {
                    Platform.OS == 'android' && ebookContent && ebookContent?.isOneTimePurchase && !ebookContent?.isOneTimePurchasePaymentDone && !ebookContent.subscriptionPlanIds.includes(id) && <CustomButton
                        onPress={() => {
                            if (Platform.OS == 'android') {
                                if (isAuthenticated) {
                                    navigation.navigate('Checkout', {
                                        price: ebookContent?.price,
                                        fromEbookItem: true,
                                        itemId: ebookItemId
                                    })
                                } else {
                                    navigation.navigate('Auth', {
                                        screen: 'RegisterScreen',
                                        params: {
                                            type: 'MEDIA_ITEM',
                                            fromEbookOTP: true,
                                            price: ebookContent?.price,
                                            itemId: ebookItemId,
                                        },
                                    })
                                }
                            } else {
                                setModalVisible(true)
                            }
                        }
                        }
                        butttonText={`Buy item $${ebookContent?.price}`}
                        inputStyle={{
                            marginHorizontal: ThemeConstant.MARGIN_EXTRA_LARGE,
                            marginVertical: ThemeConstant.MARGIN_EXTRA_LARGE,
                            backgroundColor: brandColor
                        }} />
                }
                <ButtonsContainer />

                <View style={{ marginBottom: 15 }}>
                </View>

            </ScrollView>

            {Alertmodal()}
        </View>
    );
};

export default EbookItem;
