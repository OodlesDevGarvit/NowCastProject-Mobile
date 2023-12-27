import React, { useState } from 'react'
import { View, Text, Modal, StyleSheet, ActivityIndicator, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { axiosInstance1 } from '../constant/Auth';
import * as API from '../constant/APIs'
import { getCards } from '../store/actions/authAction';
import { moderateScale, moderateVerticalScale, scale } from 'react-native-size-matters';
import { SET_ALERT, SET_PUBLISHED_KEY } from '../store/actions/types';
import { useToast } from 'native-base'
import { createToken, CardField } from '@stripe/stripe-react-native';
import FormInput from './FormInput';
import DropDownNative from './DropDownNative';

const AddCardModal = ({ isGiving = false, modalVisible, setModalVisible, additionalFn = null, makePayment = null, ...props }) => {
    var shortYear = new Date().getFullYear() + 50;
    var year = shortYear.toString().substr(-2);

    const dispatch = useDispatch()
    const toast = useToast()
    const { key } = useSelector(state => state.publishableKey);
    const { orgId } = useSelector(state => state.activeOrgReducer);
    const { token, isAuthenticated } = useSelector(state => state.authReducer);
    const { brandColor, mobileTheme: theme } = useSelector((state) => state.brandingReducer.brandingData);

    const [name, setName] = useState(null);
    const [address, setAddress] = useState(null);
    const [country, setCountry] = useState(null);
    const [state, setState] = useState(null);
    const [city, setCity] = useState(null);
    const [zipCode, setZipCode] = useState(null);

    const [allCountries, setAllCountries] = useState([]);
    const [allStates, setAllState] = useState([]);

    const [countryCode, setCountryCode] = useState('');
    const [isPostalCodeEnabled, setIsPostalCodeEnabled] = useState(true);
    const [loading, setLoading] = useState(false)
    const [cardInfo, setCardInfo] = useState(null);

    // HACK:hack to resolve STRIPE TOKEN ISSUE
    useEffect(() => {
        if (true) {
            setTimeout(() => {
                setCountryCode('');
                setIsPostalCodeEnabled(false)
            }, 300)
        }
    }, [])

    useEffect(() => {
        if (isAuthenticated) {
            getSecreKey();
        }
        else {
            getSecreKeyWithoutAuth()
        }
        getAllCountrydata();
    }, [])

    useEffect(() => {
        if (country) {
            allCountries.map((item, index) => {
                if (item?.code2 == country) {
                    setAllState(item?.states)
                    return;
                }
            })
        }
    }, [country])

    //setting US as default selected country
    useEffect(() => {
        if (allCountries && modalVisible == true) {
            allCountries.map((item) => {
                if (item?.code2 == 'US' || item?.code2 == 'us') {
                    setCountry(item?.code2);
                    return;
                }
            })
        }
    }, [allCountries, modalVisible])

    const handleInputChange = (val) => {
        // if (/^\d{5}(-\d{4})?$/.test(val)) {
        setZipCode(val);
        // }
        // else {
        //     dispatch({
        //         type: SET_ALERT, payload: {
        //             setShowAlert: true,
        //             data: {
        //                 message: 'Please enter a valid Zip code',
        //                 showCancelButton: true,
        //                 onCancelPressed: () => {
        //                     dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
        //                 },
        //             }
        //         }
        //     }
        //     )
        //     return;
        // }
    };


    const changeTextFieldvalueWithValidation = (value, setValue) => {
        if (value.toString().length == 1) {
            var result = value.toString().replace(/\s+/g, '');
            setValue(result)
            return;
        } else if (setValue == setZipCode) {
            var result = value.toString().replace(/\s+/g, '');
            setValue(result)
            return
        }
        var result = value.toString().replace(/\s+/g, ' ');
        setValue(result)
        return
    }

    const showToast = (title) => {
        toast.show({ title }, toast.close)
    }

    const getSecreKey = () => {
        let axiosConfig = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + `${token}`,
                'Access-Control-Allow-Origin': '*',
            },
        };
        axiosInstance1
            .get(`${API.SecretKeyGiving}`, axiosConfig)
            .then((res) => {
                dispatch({ type: SET_PUBLISHED_KEY, payload: isGiving ? res.data.data.givingStripeApiKey : res.data.data.stripeApiKey })
            })
            .catch((err) => console.log('error:', err));
    };

    const getSecreKeyWithoutAuth = () => {
        axiosInstance1
            .get(
                `${API.SecretKeyWithoutLogin}?organizationId=${orgId}`
            )
            .then((res) => {
                dispatch({ type: SET_PUBLISHED_KEY, payload: isGiving ? res.data.data.givingStripeApiKey : res.data.data.stripeApiKey })
            })
            .catch((err) => console.log('error of secret key:', err));
    };

    const onDone = async () => {

        setLoading(true)
        try {
            let { token } = await createToken(
                {
                    ...cardInfo,
                    address: {
                        city: city.trim(),
                        country: country,
                        line1: address.trim(),
                        postalCode: zipCode.trim(),
                        state: state
                    },
                    name: name.trim(),
                    currency: 'USD',
                    type: 'Card',
                })

            if (token !== undefined) {
                let obj = {
                    addressLine1: token.card?.address.line1,
                    addressCountry: token.card?.address.country,
                    addressState: token.card?.address.state,
                    addressCity: token.card?.address.city,
                    addressZip: token.card?.address.postalCode,
                    autoPayment: true,
                    currency: token.card.currency,
                    expMonth: token.card.expMonth,
                    expYear: token.card.expYear,
                    last4: token.card.last4,
                    name: token.card.name,
                    tokenId: token.id,
                    cardId: token.card?.id,
                    brand: token.card.brand,
                };
                if (isAuthenticated) {
                    postingCardData(obj);
                } else {
                    postingCardDataWithoutAuth(obj);
                }
            } else {
                dispatch({
                    type: SET_ALERT, payload: {
                        setShowAlert: true,
                        data: {
                            message: 'Encountered some error while adding card! Please try again after sometime',
                            showCancelButton: true,
                            onCancelPressed: () => {
                                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                                setLoading(false)
                                setModalVisible(false)
                                onCancel()
                            },
                        }
                    }
                }
                )
            }



        }
        catch (err) {
            dispatch({
                type: SET_ALERT, payload: {
                    setShowAlert: true,
                    data: {
                        message: err,
                        showCancelButton: true,
                        onCancelPressed: () => {
                            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                        },
                    }
                }
            }
            )

        }
    }

    const onCancel = () => {
        setName(null);
        setState(null);
        setCity(null);
        setZipCode(null);
        setAddress(null);
        setCountry(null);
        setAllState([]);
    }

    //sending card data to backend----
    const postingCardData = async (cardData) => {
        let axiosConfig = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + `${token}`,
                'Access-Control-Allow-Origin': '*',
            },
        };

        let data = {
            card: {
                addressCountry: cardData.addressCountry,
                addressState: cardData.addressState,
                addressCity: cardData.addressCity,
                addressLine1: cardData.addressLine1,
                addressZip: cardData.addressZip,
                autoPayment: true,
                brand: cardData.brand,
                country: cardData.country,
                currency: cardData.currency,
                cvcCheck: null,
                dynamicLast4: null,
                funding: null,
                id: cardData.cardId,
                expMonth: cardData.expMonth,
                expYear: cardData.expYear,
                last4: cardData.last4,
                name: cardData.name,
                object: null,
                tokenId: cardData.tokenId,
                forGiving: isGiving ? true : false,
                selectForPayment: true
            },
            email: props.email,
            firstName: props.fname,
            id: 0,
            lastName: props.lname,
            organizationId: orgId,
        };
        axiosInstance1
            .post(`${API.AddCardDetail}`, data, axiosConfig)
            .then(async (res) => {
                // console.log('successFully added card with login', res);
                await setLoading(false)
                await setModalVisible(false);
                await dispatch(getCards(token));
                showToast('Successful');
                onCancel();
                if (props.toSubscribe == true) {
                    props.handleSubscription(props.planToSubscribe);
                }
                if (additionalFn !== null) {
                    additionalFn(cardData);
                }
                if (makePayment !== null) {
                    makePayment(cardData)
                }

            })
            .catch((err) => {
                setLoading(false)
                dispatch({
                    type: SET_ALERT, payload: {
                        setShowAlert: true,
                        data: {
                            message: 'error in adding card',
                            showCancelButton: true,
                            onCancelPressed: () => {
                                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                            },
                        }
                    }
                }
                )
            });

    };

    //sending cardData without Auth--
    const postingCardDataWithoutAuth = async (cardData) => {
        let axiosConfig = {
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        };
        let data = {
            card: {
                addressCountry: cardData.addressCountry,
                addressState: cardData.addressState,
                addressCity: cardData.addressCity,
                addressLine1: cardData.addressLine1,
                addressZip: cardData.addressZip,
                autoPayment: true,
                brand: cardData.brand,
                country: cardData.country,
                currency: cardData.currency,
                cvcCheck: null,
                dynamicLast4: null,
                funding: null,
                id: cardData.cardId,
                expMonth: cardData.expMonth,
                expYear: cardData.expYear,
                last4: cardData.last4,
                name: cardData.name,
                object: null,
                tokenId: cardData.tokenId,
                forGiving: isGiving ? true : false,
                selectForPayment: true
            },
            email: props.email,
            firstName: props.fname,
            id: 0,
            lastName: props.lname,
            organizationId: orgId,
        };
        try {
            const res = await axiosInstance1.post(`${API.AddCardDetailWithoutAuth}`, data, axiosConfig);
            // console.log('Successfully added card without login', res);
            await setLoading(false)
            await setModalVisible(false);
            showToast('Successful');
            onCancel();
            if (additionalFn !== null) {
                additionalFn(cardData);
            }
        }
        catch (err) {
            setLoading(false)
            dispatch({
                type: SET_ALERT, payload: {
                    setShowAlert: true,
                    data: {
                        message: 'There is some error while adding card',
                        showCancelButton: true,
                        onCancelPressed: () => {
                            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                        },
                    }
                }
            }
            )
            console.log('Error whhile posting card data without Auth')
        }



    }

    const fetchCardDetail = (cardDetails) => {
        if (cardDetails.complete) {
            setCardInfo(cardDetails)
        } else {
            setCardInfo(null)
        }
    }

    const getAllCountrydata = async () => {
        try {
            const res = await axiosInstance1.get(`${API.getCountryData}`);
            setAllCountries(res.data.data.countryList)
        } catch (error) {
            console.log('err country data', err.reponse)
        }
    }


    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
                setModalVisible(false);
            }}
        >

            <View style={styles.centeredView}>
                <View style={styles.modalView}>

                    <View style={styles.loaderContainer}>
                        <ActivityIndicator
                            animating={loading}
                            color={'gray'}
                            size="large"
                            style={{
                                alignItems: 'center',
                                height: 80,
                            }}
                        />
                    </View>

                    <View style={styles.inputCont}>
                        <FormInput placeholder={'Name on Card'} value={name} onChangeText={text => changeTextFieldvalueWithValidation(text, setName)} />
                    </View>

                    <View style={{ borderWidth: 1, borderColor: '#dadae8', borderRadius: scale(5), marginBottom: 10, padding: moderateScale(1) }}>
                        <CardField
                            postalCodeEnabled={isPostalCodeEnabled}
                            countryCode={countryCode}
                            placeholders={{
                                number: '4242 4242 4242 4242',
                            }}
                            cardStyle={{
                                backgroundColor: '#FFFFFF',
                                textColor: '#000000',
                            }}
                            style={{
                                width: 280,
                                height: moderateScale(40),

                            }}
                            onCardChange={(cardDetails) => {
                                console.log('card details', cardDetails);
                                fetchCardDetail(cardDetails)
                            }}
                        />
                    </View>

                    <View style={styles.inputCont}>
                        <FormInput placeholder={'Address'} value={address} onChangeText={text => changeTextFieldvalueWithValidation(text, setAddress)} />
                    </View>

                    <View style={[styles.inputCont, styles.row]}>
                        <View style={[styles.halfCont, { marginRight: 10 }]}>
                            <DropDownNative options={allCountries} value={country} setValue={(text) => {
                                setCountry(text)
                                setState("")
                            }} placeholder={'Country'} />
                        </View>
                        <View style={styles.halfCont}>
                            {
                                allStates.length ?
                                    <DropDownNative options={allStates} value={state} setValue={setState} placeholder={'State'} />
                                    :
                                    <FormInput placeholder={'State'} value={state} onChangeText={text => changeTextFieldvalueWithValidation(text, setState)} />
                            }
                        </View>
                    </View>

                    <View style={[styles.inputCont, styles.row]}>
                        <View style={[styles.halfCont, { marginRight: 10 }]}>
                            <FormInput placeholder={'City'} value={city} onChangeText={text => changeTextFieldvalueWithValidation(text, setCity)} />
                        </View>
                        <View style={styles.halfCont}>
                            <FormInput placeholder={'Zipcode'} keyboardType={'numeric'} value={zipCode} onChangeText={text => changeTextFieldvalueWithValidation(text, setZipCode)} onSubmitEditing={() => handleInputChange(zipCode)} onBlur={() => handleInputChange(zipCode)} />
                        </View>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-around',
                            marginTop: moderateVerticalScale(15)
                        }}
                    >

                        <View style={[styles.btn, { backgroundColor: brandColor }]}>
                            <TouchableOpacity>
                                <Text
                                    onPress={() => {
                                        setLoading(false)
                                        setModalVisible(!modalVisible)
                                        setCardInfo(null)
                                        onCancel();
                                    }}
                                    style={{ color: '#fff', fontSize: scale(16), }}
                                >
                                    Cancel
                                </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.btn, { backgroundColor: brandColor, opacity: cardInfo && name && address && state && country && city && zipCode ? 1 : 0.7 }]}>
                            <TouchableOpacity
                                 disabled={!cardInfo}
                                onPress={() => {
                                    if (cardInfo.expiryYear > year) {
                                        dispatch({
                                            type: SET_ALERT, payload: {
                                                setShowAlert: true,
                                                data: {
                                                    message: 'Please enter valid expiry year of your card',
                                                    showCancelButton: true,
                                                    onCancelPressed: () => {
                                                        dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                                                    },
                                                }
                                            }
                                        }
                                        )
                                    } else if (loading == false && cardInfo.complete && name && address && state && country && city && zipCode) {
                                        onDone(cardInfo)
                                    }
                                }}>
                                <Text style={{ color: '#fff', fontSize: scale(16) }}>
                                    Done
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </View>
        </Modal>
    )
}

export default AddCardModal

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },
    modalView: {
        // margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: moderateVerticalScale(20),
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        // minHeight: 200,
        width: '88%'
    },
    containers: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    loaderContainer: {
        height: moderateVerticalScale(100),
        position: 'absolute',
        top: 0,
        height: '85%',
        zIndex: 1,
        alignSelf: 'center',
        justifyContent: 'center',
        marginBottom: moderateVerticalScale(10),
        zIndex: 1
    },
    cardField: {
        width: '100%',
        height: 50,
        marginVertical: 30,
    },
    btn: {
        width: moderateVerticalScale(120),
        height: moderateVerticalScale(35),
        borderRadius: scale(8),
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputCont: {
        marginBottom: 10
    },
    row: {
        flexDirection: 'row'
    },
    halfCont: {
        flex: 1 / 2,
    }
})
