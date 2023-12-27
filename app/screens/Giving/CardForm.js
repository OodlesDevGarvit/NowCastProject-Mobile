import React, { PureComponent } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
} from 'react-native';
import CreditCard from '../../components/CreditCard';
import { axiosInstance1, NOWCAST_URL } from '../../constant/Auth';
import ThemeConstant from '../../constant/ThemeConstant';
import * as API_CONSTANT from '../../constant/ApiConstant';
import * as API from '../../constant/APIs';
import Loader from '../../components/Loader';
import FormInput from '../../components/FormInput';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomButton from '../../components/CustomButton';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddCardModal from '../../components/AddCardModal';
import { useEffect } from 'react';
import { SET_ALERT } from '../../store/actions/types';
import { shadeColor } from '../../utils/shadeColor';

const CardForm = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { brandColor, mobileTheme: theme } = useSelector((state) => state.brandingReducer.brandingData);
  const { token, isAuthenticated, user, userGivingCards: userCards } = useSelector(state => state.authReducer);
  const { basicInfo: { firstName: fName, lastName: lname, email: userEmail, mobileNumber } = { firstName: null, lastName: null, mobileNumber: null } } = user ?? {};
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const fromItem = route.params?.fromItem;
  const mediaItemId = route.params?.mediaItemId;

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const [firstName, setFirstName] = useState(fName);
  const [lastName, setLastName] = useState(lname);
  const [email, setEmail] = useState(userEmail);
  const [phone, setPhone] = useState(mobileNumber);


  const [cardData, setCardData] = useState(null);


  //UNCOMMENT THIS CODE TO MAKE PAYMENT WITH ALREADY ADDED CARD IN USER ACCOUNT WITHOUT HAVING TO ADD EVRYTIME YOU VISIT THIS SCREEN
  // |
  // |

  const TopTextStyle = {
    color: theme == 'DARK' ? '#fff' : '#000'
  }

  useEffect(() => {
    if (isAuthenticated) {
      setCardData(userCards[0])
      console.log('card data is ',cardData)
    }
  }, [])



  //making payment with auth----------------------------
  const makePayment = (data) => {
    setLoading(true)
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + `${token}`,
        'Access-Control-Allow-Origin': '*',
      },
    };
    console.log('data sent while making payment >>>', data)
    axiosInstance1
      .post(`${API.Payment}`, data, axiosConfig)
      .then(async (res) => {
        const data = res.data.data;
        setLoading(false)
        if (data.paymentStatus == "Payment Succeed") {
          setLoading(false)
          navigation.navigate('ThankYouScreen', {
            amount: route.params.amount,
            fromItem: fromItem == true ? true : false,
            givingId: data.givingId,
            invoiceId: data.invoiceId,
          });
        }else{
          setLoading(false)
          dispatch({
            type: SET_ALERT, payload: {
              setShowAlert: true,
              data: {
                message: data.reason,
                showCancelButton: true,
                onCancelPressed: () => {
                  dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                },
              }
            }
          })
          return;
        }
      })
      .catch((err) => {
        setLoading(false)
        dispatch({
          type: SET_ALERT, payload: {
            setShowAlert: true,
            data: {
              message: 'There is some error while making payment from our end',
              showCancelButton: true,
              onCancelPressed: () => {
                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
              },
            }
          }
        })
        console.log('error payment:', err.response);
      });
  };

  //making payment without auth--------------------------
  const makePaymentwithoutAuth = (data) => {
    setLoading(true)
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    };
    axiosInstance1
      .post(`${API.PaymentWithoutAuth}`, data, axiosConfig)
      .then(async (res) => {
        const data = res.data.data;
        setLoading(false)
        if (data.paymentStatus == "Payment Succeed") {
          setLoading(false)
          navigation.navigate('ThankYouScreen', {
            amount: route.params.amount,
            fromItem: fromItem == true ? true : false,
            givingId: data.givingId,
            invoiceId: data.invoiceId,
          });
        }else{
          setLoading(false)
          dispatch({
            type: SET_ALERT, payload: {
              setShowAlert: true,
              data: {
                message: data.reason,
                showCancelButton: true,
                onCancelPressed: () => {
                  dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                },
              }
            }
          })
          return;
        }
      })
      .catch((err) => {
        setLoading(false)
        dispatch({
          type: SET_ALERT, payload: {
            setShowAlert: true,
            data: {
              message:'There is some error while making payment from our end',
              showCancelButton: true,
              onCancelPressed: () => {
                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
              },
            }
          }
        })
      });
  };

  //handling add card button-------------
  const handleAddCard = () => {
    if (firstName == null || firstName == '' || firstName.includes('  ') ) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter your name',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      return
    } else if (email == null) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter your email',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      return
    } else if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
      email.trim())) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter valid email address',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      return;
    } else if (phone == null) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter your phone',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      return
    } else if (!/(^\d{5,15}$)|(^\d{5}-\d{4}$)/.test(phone)) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter a valid phone',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      })
      return;
    }
    else {
      setModalVisible(true)
    }

  };

  //handlling the make payment button---------------
  const handleMakePayment = () => {

    let data = {
      amount: route.params.amount,
      card: {
        addressCity: cardData.addressCity,
        addressCountry: cardData.addressCountry,
        addressLine1: cardData.addressLine1,
        addressLine2: cardData.addressLine1,
        addressState: cardData.addressState,
        addressZip: cardData.addressZip,
        addressZipCheck: null,
        autoPayment: true,
        brand: null,
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
        tokenizationMethod: null,
      },
      email: email,
      firstName: firstName,
      frequency: 'ONETIME',
      id: 0,
      isGiving: true,
      last4: cardData.last4,
      lastName: lastName == null ? '' : lastName,
      mobile: phone,
      organizationId: orgId,
      paymentMethod: 'card',
      paymentStatus: 'done',
      mediaItemId: mediaItemId,
      invoiceId: null,
    };

    if (isAuthenticated) {
      makePayment(data)
    }
    else {
      makePaymentwithoutAuth(data);
    }
  };

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme == 'DARK' ? '#000' : '#fff' }]}>
      <KeyboardAwareScrollView>
        <View style={[styles.container, { backgroundColor: theme == 'DARK' ? '#000' : '#fff' }]}>
          <Loader loading={loading} />

          {/* amount section */}
          <View style={styles.amountContainer}>
            <Text style={[styles.superscript, { color: theme == 'DARK' ? '#fff' : '#000' }]}>$</Text>
            <TextInput
              style={{
                ...styles.amount,
                color: theme == 'DARK' ? '#fff' : '#000',
              }}
              value={route.params.amount}
              editable={false}
              selectTextOnFocus={false}
            />
          </View>

          {/* //user-details section--- */}
          <View>
            <View style={{ marginBottom: moderateVerticalScale(10) }}>
              <Text style={[styles.info, { color: theme == 'DARK' ? '#fff' : '#000' }]}>Your information</Text>
            </View>

            <View style={styles.topFields}>
              <View style={{ flex: 0.48 }}>
                <FormInput
                  name={'First Name'}
                  required={true}
                  onChangeText={(text) => {
                    setFirstName(text)
                  }}
                  value={firstName}
                  editable={isAuthenticated ? false : true}
                  topTextstyle={{ ...TopTextStyle }}
                />
              </View>
              <View style={{ flex: 0.48 }}>
                <FormInput
                  name={'Last Name'}
                  onChangeText={(text) => {
                    setLastName(text)
                  }}
                  value={lastName}
                  editable={isAuthenticated ? false : true}
                  topTextstyle={{ ...TopTextStyle }}
                />
              </View>
            </View>

            <FormInput
              name={'Email'}
              required={true}
              onChangeText={(text) => {
                setEmail(text)
              }}
              value={email}
              autoCapitalize="none"
              editable={isAuthenticated ? false : true}
              textViewstyle={{ marginTop: moderateVerticalScale(10) }}
              topTextstyle={{ ...TopTextStyle }}
            />

            <FormInput
              name={"Phone"}
              required={true}
              value={phone}
              onChangeText={(text) => {
                setPhone(text)
              }}
              topTextstyle={{ ...TopTextStyle }}
              keyboardType={'phone-pad'}
              editable={isAuthenticated ? false : true}
              textViewstyle={{ marginTop: moderateVerticalScale(10) }}
            />

          </View>

          {/* card details */}
          <View style={{ marginTop: moderateVerticalScale(20) }}>
            {/* {isAuthenticated && userCards.length > 0 && (
              <>
                <Text
                  style={{
                    ...styles.info,
                    marginBottom: moderateVerticalScale(20),
                  }}
                >
                  Card Details
                </Text>

                <View style={{ flex: 1 }}>
                  <CreditCard
                    name={userCards[0].brand}
                    date={
                      userCards[0].expMonth +
                      '/' +
                      userCards[0].expYear.toString().substr(-2)
                    }
                    suffix={userCards[0].last4}
                    style={{
                      width: '100%',
                      height: verticalScale(180),
                    }}
                  />
                </View>
              </>
            )} */}

            {
              cardData && cardData?.tokenId && (
                <>
                  <Text
                    style={{
                      ...styles.info,
                      marginBottom: moderateVerticalScale(20),
                    }}
                  >
                    Card Details
                  </Text>

                  <View style={{ flex: 1 }}>
                    <CreditCard
                      name={cardData.brand}
                      date={
                        cardData.expMonth +
                        '/' +
                        cardData.expYear.toString().substr(-2)
                      }
                      suffix={cardData.last4}
                      style={{
                        width: '100%',
                        height: verticalScale(180),
                      }}
                    />
                  </View>
                </>
              )
            }

          </View>

          <View>
            <CustomButton
              butttonText={cardData == null ? 'Add Card' : 'Replace Card'}
              onPress={() => {
                 handleAddCard();
              }
              }
              inputStyle={{
                backgroundColor: brandColor,
                marginVertical: moderateVerticalScale(20),
                borderRadius: moderateScale(20),
              }}
              btnTextStyle={{
                fontSize: moderateScale(14),
              }}
            />

            {cardData !== null && (
              <CustomButton
                butttonText={'Make Payment'}
                onPress={() => {
                  if (cardData == null) {
                    dispatch({
                      type: SET_ALERT, payload: {
                        setShowAlert: true,
                        data: {
                          message: 'Card is not added!',
                          showCancelButton: true,
                          onCancelPressed: () => {
                            dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                          },
                        }
                      }
                    })
                  } else {
                    if(!isAuthenticated){
                      if(
                        firstName == null || firstName == '' || firstName.includes('  ') ||
                        email == null ||
                        !/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                          email.trim()) ||
                          phone == null ||
                          !/(^\d{5,15}$)|(^\d{5}-\d{4}$)/.test(phone)
                      ){
                        handleAddCard()
                      }else{
                        handleMakePayment();
                      }
                    }else{
                      handleMakePayment()
                    }
                   
                    
                  }
                }}
                inputStyle={{
                  backgroundColor: userCards.length == 0 && cardData == null ? shadeColor(brandColor, -60) : brandColor,
                  borderRadius: moderateScale(20),
                }}
                btnTextStyle={{
                  fontSize: moderateScale(14),
                  color: userCards.length == 0 && cardData == null ? 'grey' : '#fff',
                }}
              />
            )}
          </View>
        </View>
        <AddCardModal isGiving={true} modalVisible={modalVisible} setModalVisible={setModalVisible} additionalFn={setCardData} email={email} fname={firstName} lname={lastName} />
      </KeyboardAwareScrollView>
    </View>
  );

}
export default CardForm;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: moderateScale(24),
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateVerticalScale(50),
  },
  info: {
    fontSize: scale(14),
    fontFamily: ThemeConstant.FONT_FAMILY,
    fontWeight: 'bold',
  },
  topFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  containers: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  amount: {
    borderBottomWidth: scale(2),
    borderBottomColor: 'gray',
    paddingHorizontal: '5%',
    fontSize: scale(90),
  },
  superscript: {
    fontSize: scale(24),
    color: '#656565',
    fontWeight: 'bold',
    left: scale(20),
    alignItems: 'center',
    marginVertical: moderateVerticalScale(5),
    top: scale(-16),
  },
  ///////////
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: verticalScale(2),
    },
    shadowOpacity: 0.25,
    shadowRadius: scale(4),
    elevation: scale(5),
    height: verticalScale(400),
  },
  textStyle: {
    color: 'white',
    // fontWeight: "bold",
    textAlign: 'center',
  }
});
