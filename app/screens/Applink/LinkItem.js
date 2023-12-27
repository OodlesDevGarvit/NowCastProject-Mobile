import React, { useEffect, useState } from "react";
import { View, Text, Linking, Platform, StatusBar } from "react-native";
import Loader from "../../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance1 } from '../../constant/Auth';
import * as API from '../../constant/APIs'
import { SET_ACCESS_MODAL_IOS, SET_ALERT, SET_IOSCOMP } from "../../store/actions/types";
import { IOSAccessModal, IOSPaidModal } from "../../components";

const text = 'Please wait...'

const LinkItem = ({ route, navigation }) => {
    const dispatch = useDispatch()
    const { mobileTheme: theme } = useSelector((state) => state.brandingReducer.brandingData);
    const { token, isPaymentDone, isAuthenticated, subscription: { id } } = useSelector(state => state.authReducer)
    const { orgId } = useSelector(state => state.activeOrgReducer);
    const [linkContent, setLinkContent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [linkPrice, setLinkPrice] = useState(null);

    const [paidModalVisible, setPaidModalVisible] = useState(false);
    const [accessModalVisible, setAccessModalVisible] = useState(false);

    const itemId = route.params?.itemId
    const fromCheckout = route.params?.fromCheckout;
    const fromSubscription = route.params?.fromSubscription;


    useEffect(() => {
        linkData()
    }, [isAuthenticated, fromCheckout, fromSubscription])

    useEffect(() => {
        if (linkContent) {
            navigationLink()
        }
    }, [linkContent])

    const linkData = () => {
        if (isAuthenticated) {
            contactUsData()
        } else {
            contactUsDataWithoutAuth()
        }
    }

    const contactUsData = async () => {
        let axiosConfig = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + `${token}`,
                'Access-Control-Allow-Origin': '*',
            },
        };
        try {
            const response = await axiosInstance1.get(`${API.link}/${itemId}`, axiosConfig)
            if (response.status == 200) {
                const nameList = response.data.data
                setLinkPrice(nameList.price)
                setLinkContent(nameList)
                setLoading(false)
            }

        } catch (error) {
            setLoading(false)
            console.log('error is with auth api ', error);
        }
    };

    const contactUsDataWithoutAuth = async () => {
        try {
            const response = await axiosInstance1.get(`${API.linkId}/${itemId}?organizationId=${orgId}`)
            if (response.status == 200) {
                const nameList = response.data.data
                setLinkPrice(nameList.price)
                setLinkContent(nameList)
                setLoading(false)
            }
        } catch (error) {
            setLoading(false)
            console.log('error is withauth ', error);
        }

    };

    const navigationLink = () => {
        if (linkContent) {
            if (Platform.OS == 'android') {
                if (linkContent?.linkAccessType == 'FREE' || (linkContent?.linkAccessType == 'ACCESSREQUIRED' && isAuthenticated)) {
                    handleLinkNavigation();
                    return;
                }
                if (linkContent?.linkAccessType == 'ACCESSREQUIRED' || linkContent?.isOneTimePurchasePaymentDone == true) {
                    if (!isAuthenticated) {
                        setLoading(false)
                        navigation.replace('Auth', {
                            screen: 'LoginScreen',
                            params: {
                                linkAccessRequired: true,
                                itemId: itemId ? itemId : null,
                            }
                        })
                    } else {
                        handleLinkNavigation()
                    }
                }
                else if (linkContent?.linkAccessType == 'PAID' && linkContent?.isOneTimePurchase == false && linkContent?.isOneTimePurchasePaymentDone == false) {

                    if (!isAuthenticated) {
                        return navigation.replace('Auth', {
                            screen: 'LoginScreen',
                            params: {
                                linkPaid: true,
                                itemId: itemId ? itemId : null,
                                subscriptionPlanIds: linkContent?.subscriptionPlanIds
                            }
                        })
                    }
                    else {
                        if (linkContent?.subscriptionPlanIds?.includes(id) && isPaymentDone) {
                            handleLinkNavigation()
                        } else if (!linkContent?.subscriptionPlanIds?.includes(id) || !isPaymentDone) {
                            setLoading(false)
                            return navigation.replace('SubscriptionDetails', {
                                LinkPlanReq: true,
                                itemId: itemId ? itemId : null,
                                subscriptionPlanIds: linkContent?.subscriptionPlanIds
                            });
                        }
                    }

                }
                else if (linkContent?.linkAccessType == 'PAID' && linkContent?.isOneTimePurchase == true && linkContent?.subscriptionPlanIds.length === 0) {
                    if (!isAuthenticated) {
                        navigation.replace('Auth', {
                            screen: 'LoginScreen',
                            params: {
                                type: 'LINK',
                                fromLinkOTP: true,
                                price: `${linkPrice}`,
                                itemId: itemId,
                            },
                        })

                    } else {
                        if (linkContent?.isOneTimePurchasePaymentDone == false) {
                            return navigation.replace('Checkout', {
                                price: `${linkPrice}`,
                                fromLink: true,
                                itemId: itemId
                            })

                        } else if (linkContent?.isOneTimePurchasePaymentDone == true) {
                            handleLinkNavigation()
                        }
                    }
                }
                else if (linkContent?.linkAccessType == 'PAID' && linkContent?.isOneTimePurchase == true && linkContent?.subscriptionPlanIds.length !== 0) {
                    if (!isAuthenticated) {
                        return navigation.replace('Auth', {
                            screen: 'LoginScreen',
                            params: {
                                linkPaid: true,
                                price: `${linkPrice}`,
                                itemId: itemId,
                            },
                        })
                    } else if (!linkContent?.isOneTimePurchasePaymentDone && !linkContent?.subscriptionPlanIds?.includes(id)) {
                        setLoading(false)
                        return navigation.replace('SubscriptionDetails', {
                            linkBoth: true,
                            itemId: itemId ? itemId : null,
                            price: `${linkPrice}`,
                            type: 'LINK',
                            subscriptionPlanIds: linkContent?.subscriptionPlanIds
                        });
                    } else {
                        handleLinkNavigation()
                    }
                }
            } else {
                if (linkContent?.linkAccessType !== 'FREE' && !isAuthenticated) {
                    return setAccessModalVisible(true);
                }
                else if (linkContent?.linkAccessType == 'FREE' ||
                    (linkContent?.linkAccessType == 'ACCESSREQUIRED' && isAuthenticated) ||
                    (linkContent?.linkAccessType == 'PAID' && linkContent?.isOneTimePurchasePaymentDone == true) ||
                    (linkContent?.linkAccessType == 'PAID' && linkContent?.subscriptionPlanIds?.includes(id) && isPaymentDone)) {
                    handleLinkNavigation();
                    return;
                } else {
                    console.log('   ');
                    return setPaidModalVisible(true);
                }

            }
        }
    }

    const handleLinkNavigation = () => {
        const type = linkContent.type;
        switch (type) {
            case 'APP_LINK':
                return navigation.replace('AppLink', {
                    pathUr: linkContent.url,
                    title: linkContent.title,
                });
            case 'GIVING':
                // return navigation.replace('AppLink', {
                //     pathUr: linkContent.url,
                //     title: linkContent.title,
                // });
                return navigation.replace('GivingStackScreen');
            case 'VIDEO':
                // navigation.goBack()
                return navigation.replace('AppLink', {
                    pathUr: linkContent.url,
                    title: linkContent.title,
                });
            case 'NOWCAST_GIVING':
                // navigation.goBack()
                return navigation.replace('GivingStackScreen');
            case 'CONTACT_US':
                // navigation.goBack()
                return navigation.replace('ContactUsStackScreen');
            case 'BIBLE':
                // navigation.goBack()
                return navigation.replace('Bible', { fromHome: true });
            case 'WEBSITE':
                Linking.openURL(`${linkContent.url}`);
                setTimeout(() => {
                    navigation.goBack()
                }, 100);
                return

            case 'CONTACT':
                if (isNaN(linkContent.contact)) {
                    navigation.goBack()
                    return Linking.openURL(`mailto:${linkContent.contact}`)
                        .then(res => console.log(res))
                        .catch(err =>
                            dispatch({
                                type: SET_ALERT, payload: {
                                    setShowAlert: true,
                                    data: {
                                        message: 'Do not have app to open mail',
                                        showCancelButton: true,
                                        onCancelPressed: () => {
                                            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                                        },
                                    }
                                }
                            }
                            )
                        )
                } else {
                    navigation.goBack()
                    return Linking.openURL(`tel:${linkContent.contact}`);
                }

        }
    }
    return (
        <View style={{ flex: 1, backgroundColor: theme == 'DARK' ? '#000' : '#fff', justifyContent: 'center', alignItems: "center" }}>
            <Loader loading={loading} />
            <StatusBar showHideTransition={true} translucent={false} backgroundColor={theme == 'DARK' ? '#000' : '#fff'} />
            <View style={{ flex: 1 / 2, justifyContent: 'flex-end' }}>
                <Text style={{ color: theme == 'DARK' ? '#fff' : '#000', fontSize: 17 }}>{text}</Text>
            </View>
            <View style={{ flex: 1 / 2, width: '50%', justifyContent: 'center' }}>
                <></>

            </View>

            <IOSAccessModal isVisible={accessModalVisible} setIsVisible={setAccessModalVisible} />
            <IOSPaidModal isVisible={paidModalVisible} setIsVisible={setPaidModalVisible} navigate={navigation} linkContent={linkContent} />

        </View>

    )
}

export default LinkItem



