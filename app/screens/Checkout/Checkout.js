import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  StatusBar
} from "react-native";
import AddCardModal from '../../components/AddCardModal';
import * as API_CONSTANT from '../../constant/ApiConstant';
import * as API from '../../constant/APIs';
import { moderateScale, scale, moderateVerticalScale, verticalScale } from "react-native-size-matters";
import ThemeConstant from "../../constant/ThemeConstant";
import CreditCard from '../../components/CreditCard';
import { useDispatch, useSelector } from "react-redux";
import CustomButton from "../../components/CustomButton";
import Loader from "../../components/Loader";
import { axiosInstance1 } from "../../constant/Auth";
import { useToast } from 'native-base'
import { SET_ALERT } from "../../store/actions/types";
import { shadeColor } from "../../utils/shadeColor";

//one time payment modal to show added card 
const Checkout = ({ navigation, route }) => {
  const dispatch=useDispatch()
  const toast = useToast();
  const {
    mobileTheme: theme,
    brandColor,
  } = useSelector((state) => state.brandingReducer.brandingData);
  const { token, isAuthenticated, userId, user, subscription: { id }, userCards } = useSelector(state => state.authReducer);
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const { basicInfo: { firstName, lastName, email, mobileNumber } = { firstName: null, lastName: null, mobileNumber: null } } = user ?? {};
  const {
    price,
    fromItem,
    fromEbookItem,
    ebookItemId,
    fromMusicItem,
    fromAlbum,
    fromEbookOTP,
    fromAlbumOTP,
    fromMediaOTP,
    fromMusicOTP,
    itemId,
    fromLink,
    fromRss,
    fromLinkOTP,
    fromRssOTP
  } = route.params
 


  const [cardData, setCardData] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setCardData(userCards[0])
      console.log('card data is', cardData);
    }
  }, [])


  const showToast = (title) => {
    toast.show({ title })
  }

  //make one time payment function 
  const makePayment = async () => {
    setLoading(true)
    let data = {
      amount: price,
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
      isGiving: false,
      last4: cardData.last4,
      lastName: lastName,
      mobile: mobileNumber,
      organizationId: orgId,
      paymentMethod: 'card',
      paymentStatus: 'done',
      mediaItemId: fromItem || fromEbookItem || fromEbookOTP || fromMediaOTP? itemId : null,
      musicId: fromMusicItem || fromMusicOTP ? itemId : null,
      isOneTimePayment: true,
      invoiceId: null,
      rssFeedId:fromRss || fromRssOTP ? itemId :  null,
      linkId: fromLink || fromLinkOTP ? itemId : null,
      albumId: fromAlbum || fromAlbumOTP ? itemId : null,
    };
    console.log('data sent while onetime purchase', data);

    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + `${token}`,
        'Access-Control-Allow-Origin': '*',
      },
    };
    try {
      const res = await axiosInstance1.post(`${API.Payment}`, data, axiosConfig);
      console.log('res while payment done', res);
      setLoading(false);
      setModalVisible(false);
      if(res.data.data.paymentStatus == "Payment Succeed"){
        console.log('inside 1');
        await showToast('Payment successful!')
        if (fromItem || fromMediaOTP) {
          navigation.navigate('MediaItem', {
            fromCheckout: true
          })
        } else if (fromAlbum || fromAlbumOTP) {
          navigation.navigate('AlbumDetail', {
            fromCheckout: true
          })
        } else if (fromEbookItem || fromEbookOTP) {
          navigation.navigate('EbookItem', {
            fromCheckout: true
          })
        } else if (fromMusicItem || fromMusicOTP) {
          navigation.navigate('AudioPlayer', {
            fromCheckout: true
          })
        }else if(fromLink || fromLinkOTP){
          navigation.replace('LinkItem', {
            fromCheckout: true,
            itemId : itemId ? itemId : null
          })
        }else if(fromRss || fromRssOTP){
          navigation.replace('RssFeedItem',{
            fromCheckout:true,
            itemId : itemId ? itemId : null
          })
          }
         else {
          navigation.goBack();
        }  
      }else{
        dispatch({type:SET_ALERT,payload:{
          setShowAlert:true,
          data:{
         message:res.data.data.reason,
         showCancelButton:true,
         onCancelPressed:()=>{
          dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
         },
        }
        }}
        )
      }
    } catch (err) {
      setLoading(false)
      dispatch({type:SET_ALERT,payload:{
        setShowAlert:true,
        data:{
       message:'There is some error while making payment',
       showCancelButton:true,
       onCancelPressed:()=>{
        dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
       },
      }
      }}
      )
      console.log('error payment:', err.response);
    }
  };



  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* <StatusBar animated={true} backgroundColor={brandColor} /> */}
      <StatusBar
        backgroundColor={brandColor}
        hidden={false}
        translucent={false}
      />
      {/* amount section */}
      <View style={styles.amountContainer} >
        <Text style={[styles.superscript]}>$</Text>
        <TextInput
          style={{
            ...styles.amount,
            // color: 'black',
          }}
          value={price}
          editable={false}
          selectTextOnFocus={false}
        />
      </View>

      <View style={styles.mainModalView}>
        <Loader loading={loading} />
        {
          cardData ? (
            <>
              <View style={{ width: '100%', marginBottom: moderateScale(20) }}>
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
                    // height: verticalScale(150),
                  }}
                />
              </View>
            </>
          ) :
            (
              <>
                <View style={{ width: '100%', marginBottom: moderateScale(20) }}>
                  <CreditCard
                    name={'----'}
                    date={
                      '---'
                    }
                    suffix={'----'}
                    style={{
                      width: '100%',
                      height: verticalScale(150),
                    }}
                  />
                </View>
              </>
            )
        }
        <CustomButton
          butttonText={cardData == null ? 'Add Card' : 'Replace Card'}
          onPress={() => {
            setModalVisible(true)
          }
          }
          inputStyle={{
            backgroundColor: brandColor,
            width: '100%',
            zIndex: 2
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
                dispatch({type:SET_ALERT,payload:{
                  setShowAlert:true,
                  data:{
                 message:'Card is not added!',
                 showCancelButton:true,
                 onCancelPressed:()=>{
                  dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
                 },
                }
                }}
                )
              } else {
                makePayment()
              }

            }
            }
            
            inputStyle={{
              backgroundColor:userCards.length == 0 && cardData == null ? shadeColor(brandColor,-60)  : brandColor,
              width: '100%',
            }}
            btnTextStyle={{
              fontSize: moderateScale(14),
              color:userCards.length == 0 && cardData==null ? 'grey' : '#fff',
            }}
          />
        )}
      </View>
      <AddCardModal modalVisible={modalVisible} setModalVisible={setModalVisible} additionalFn={setCardData} email={email} fname={firstName} lname={lastName} />
    </View>

  );
};

export default Checkout;

const styles = StyleSheet.create({
  //payment overlay modal----------
  mainModalView: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(10),
    padding: moderateScale(20),
    width: '100%',
    height: '90%',
  },
  info: {
    fontSize: scale(14),
    fontFamily: ThemeConstant.FONT_FAMILY,
    fontWeight: 'bold',
  },
  loaderContainer: {
    height: moderateVerticalScale(50),
    position: 'absolute',
    top: 0,
    height: '85%',
    zIndex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
    // marginBottom: moderateVerticalScale(10),
  },
  //price at top
  amountContainer: {
    // borderColor:'red',
    // borderWidth:1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateVerticalScale(25),
  },
  amount: {
    borderBottomWidth: scale(2),
    borderBottomColor: 'gray',
    paddingHorizontal: '5%',
    fontSize: scale(50),
    color: '#000'
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


});