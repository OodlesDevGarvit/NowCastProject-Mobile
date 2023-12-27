import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  Image,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Modal,
  Pressable,
  Platform,
  FlatList,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import CircleCheckBox from 'react-native-circle-checkbox';
import AccountCircle from 'react-native-vector-icons/MaterialCommunityIcons';
import Evilicons from 'react-native-vector-icons/EvilIcons';
import ImagePicker from 'react-native-image-crop-picker';
import { useSelector, useDispatch } from 'react-redux';
import { moderateScale, moderateVerticalScale, scale } from 'react-native-size-matters';

import ThemeConstant, { DynamicThemeConstants } from '../../constant/ThemeConstant';
import * as API from '../../constant/APIs';
import * as API_CONSTANT from '../../constant/ApiConstant';
import { axiosInstance1 } from '../../constant/Auth';
import CreditCard from '../../components/CreditCard';
import FormInput from '../../components/FormInput';
import { styles } from './styles'
import { getUserDetails, logoutUser, updateUserDetails } from '../../store/actions/authAction';
import AddCardModal from '../../components/AddCardModal';
import FastImage from 'react-native-fast-image';
import { useToast } from 'native-base';
import CustomButton from '../../components/CustomButton';
import { AccountDeleteModal } from '../../components';
import { useFocusEffect } from '@react-navigation/native';
import LinkRssPaidOtpModal from '../../components/modal/LinkRssBothModal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SelectDropdown from 'react-native-select-dropdown';
import { SET_ALERT, UPDATE_ISPAYMENTDONE } from '../../store/actions/types';
import {
  purchaseErrorListener,
  purchaseUpdatedListener,
  getSubscriptions,
  requestSubscription,
  clearTransactionIOS,
  clearProductsIOS
} from 'react-native-iap';

const SubscriptionDetails = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const toast = useToast();
  const fromItem = route.params?.fromItem;
  const fromEbookItem = route.params?.fromEbookItem;
  const fromMusicItem = route.params?.fromMusicItem;
  const fromAlbum = route.params?.fromAlbum;
  const RssPlanReq = route.params?.RssPlanReq;
  const LinkPlanReq = route.params?.LinkPlanReq;
  const linkPaid = route.params?.linkPaid;
  const rssPaid = route.params?.rssPaid;
  const subscriptionPlanIds = route.params?.subscriptionPlanIds;
  const itemId = route.params?.itemId;
  const linkBoth = route.params?.linkBoth;
  const rssBoth = route.params?.rssBoth;
  const price = route.params?.price




  const { subscriptionPlanIds: subscriptionPlanIdsIOS } = useSelector(state => state.iosCompReducer)

  const { mobileTheme: theme, brandColor, website: websiteName, organizationName: orgName } = useSelector((state) => state.brandingReducer.brandingData);
  const { token, isAuthenticated, user, userId, isAdmin, userCards: cards, subscription: { id } } = useSelector(state => state.authReducer);
  const { basicInfo: { firstName, lastName, email, mobileNumber } = { firstName: null, lastName: null, mobileNumber: null }, logo } = user ?? {};


  const [screenVisible, setScreenVisible] = useState(fromItem || fromEbookItem || fromMusicItem || fromAlbum || linkPaid || rssPaid || RssPlanReq || LinkPlanReq || linkBoth || rssBoth ? 'SUBSCRIPTION' : 'USER')

  //MAIN USER DATA FIELDS__
  const [userEmail, setUserEmail] = useState(email)
  const [logoId, setLogoId] = useState(user?.logoId);
  const [fullName, setFullName] = useState(`${firstName} ${lastName == null ? '' : lastName}`);
  const [mailingAdd, setMailingAdd] = useState(user?.mailingAddress?.addressLine1);
  const [city, setCity] = useState(user?.mailingAddress?.city);
  const [state, setState] = useState(user?.mailingAddress?.state);
  const [zipCode, setZipCode] = useState(user?.mailingAddress?.postalCode);
  const [phoneNumber, setPhoneNumber] = useState(mobileNumber);
  const [currentPlan, setCurrentPlan] = useState(user?.subscriptionPlanId);

  // ALL LOADER ON THIS SCREEN
  const [userScreenLoading, setUserScreenLoading] = useState(false); //this shows loader on user screen
  const [subScreenLoading, setSubScreenLoading] = useState(true) //this show loader on the sub screen
  const [updatingContact, setUpdatingContact] = useState(false); //this is on save button when contact is updating
  const [uploadingImage, setUploadingImage] = useState(false); //this is shown on the image placeholder when image is uploading
  const { orgId } = useSelector(state => state.activeOrgReducer);


  const [planToSubscribe, setPlanToSubscribe] = useState(null);
  const [packages, setPackages] = useState([]);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [modal2Visible, setModal2Visible] = useState(false);
  const [headerImage, SetHeaderImage] = useState(null);
  const [imageBackgroundColor, setImageBackgroundColor] = useState(null);
  const [modal, setModal] = useState(false);
  const [allStates, setAllStates] = useState('')
  const [invoiceId, setInvoiceId] = useState(null)
  const [doneClearing, setDoneClearing] = useState(false);

  //trick to call api only once
  const [count, setCount] = useState(0);
  //account deletion MODAL-
  const [accountDeleteModalVisible, setAccountDeleteModalVisible] = useState(false)

  // THIS IS TO STYLE FORM INPUT ---
  const formInputStyle = {
    ...styles.textInputName,
    backgroundColor:
      theme == 'DARK'
        ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_WHITE
        : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_BODY,
    color:
      theme == 'DARK'
        ? DynamicThemeConstants.DARK
          .TEXT_COLOR_PRIMARY_REVERSE
        : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
    borderWidth: 0
  }
  //TO SET TOP MARGIN OF FORM DATA IN COMPONENT--
  const StyleTop = {
    marginTop: moderateVerticalScale(10)
  }
  const TopTextStyle = {
    color: theme == 'DARK' ? '#fff' : '#000'
  }
  useFocusEffect(
    React.useCallback(async () => {
      await clearTransactionIOS();
      await clearProductsIOS();
      setDoneClearing(true)

      if (linkBoth || rssBoth) {
        setModal(true)
      }
    }, [])
  )


  useEffect(() => {
    if (doneClearing && Platform.OS == 'ios') {
      updateListner();
      (async () => {
        const res = await createSubIdsArrayForIOS();
        const products = await getSubscriptions({ skus: res });
        if (fromItem || fromEbookItem || fromMusicItem || fromAlbum || linkPaid || rssPaid || RssPlanReq || LinkPlanReq || linkBoth || rssBoth) {
          let arr = [];
          products.forEach(product => {
            for (let i = 0; i < subscriptionPlanIdsIOS.length; i++) {
              if (product.productId == subscriptionPlanIdsIOS[i]) {
                arr.push(product);
              }
            }
          })
          setPackages(arr);
          await setSubScreenLoading(false)
        } else {
          setPackages(products);
          await setSubScreenLoading(false)
        }
      })()
    }
    return () => removeEventListener();
  }, [doneClearing])


  const updateListner = async () => {
    purchaseUpdatedListener((purchase) => {
      if (purchase && purchase.transactionReceipt && (purchase.originalTransactionIdentifierIOS || purchase.transactionId) && count == 0) {
        handlePurchase(purchase);
      } else {
      }
    })
    purchaseErrorListener(err => {
      console.log('Purchase error listner', err)
    })
  }

  const removeEventListener = async () => {
    await purchaseUpdatedListener().remove();
    await purchaseErrorListener().remove();
  }

  const handlePurchase = async (purchase) => {
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    const { originalTransactionIdentifierIOS, productId, transactionId } = purchase
    try {
      const res = await axiosInstance1.post(`${API.subscribePlan}?subscriptionPlanId=${productId}&transactionId=${originalTransactionIdentifierIOS ? originalTransactionIdentifierIOS : transactionId}`, null, axiosConfig);
      await setCurrentPlan(productId)
      await dispatch(getUserDetails(token, userId))
      setSubScreenLoading(false)
      setCount(1);
      if (fromItem || fromEbookItem || fromMusicItem) {
        navigation.goBack();
      }
      else if (fromAlbum) {
        navigation.goBack();
      }
      else if (linkPaid || LinkPlanReq || linkBoth) {
        navigation.replace('LinkItem', {
          fromSubscription: true,
          itemId: itemId ? itemId : null
        })
      } else if (rssPaid || RssPlanReq || rssBoth) {
        navigation.replace('RssFeedItem', {
          fromSubscription: true,
          itemId: itemId ? itemId : null
        })
      }

    } catch (error) {
      console.log('Encountered issue while sending data to backend', err)
    }

  }

  const createSubIdsArrayForIOS = async () => {
    let array = []
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    try {
      const res = await axiosInstance1.get(`${API.subscription}?organizationId=${orgId}`, axiosConfig);
      let data2 = res.data.data;
      console.log('sub plan UIS', subscriptionPlanIdsIOS, data2)

      if (fromItem || fromEbookItem || fromMusicItem || fromAlbum || linkPaid || rssPaid || RssPlanReq || LinkPlanReq || linkBoth || rssBoth) {
        for (let i = 0; i < subscriptionPlanIdsIOS.length; i++) {
          for (let j = 0; j < data2?.length; j++) {
            if (subscriptionPlanIdsIOS[i] == data2[j].id) {
              array.push(data2[j].id)
            }
          }
        }

        array = array.map((item) => item.length === 1 ? '0' + item : item);

      }
      else {
        data2.map(item => array.push(item.id))
        array = array.map((item) => item.length === 1 ? '0' + item : item);
      }



    } catch (err) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Could not fetch plans',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      }
      )
      setSubScreenLoading(false)

    }


    return array;

  }

  //Get all Subscription plans list for Android and all stated list--
  useEffect(() => {
    getAllStateList()
    if (Platform.OS == 'android') {
      getAllPackages();
      return;
    }
  }, [])


  const getAllPackages = () => {
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    axiosInstance1
      .get(`${API.subscription}?organizationId=${orgId}`, axiosConfig)
      .then((res) => {
        console.log('packages>', res)
        if (fromItem || fromEbookItem || fromMusicItem || fromAlbum || linkPaid || rssPaid || RssPlanReq || LinkPlanReq || linkBoth || rssBoth) {
          let tempArr = [];
          // console.log('res.data.data', res.data.data)
          // console.log('subscriptionPlanIds', subscriptionPlanIds)
          for (let i = 0; i < subscriptionPlanIds.length; i++) {
            for (let j = 0; j < res.data.data?.length; j++) {
              console.log('this loop is called', res.data.data[j])
              if (subscriptionPlanIds[i] == res.data.data[j].id) {
                console.log('this is called')
                tempArr.push(res.data.data[j])
              }

              console.log('tempArr', tempArr)
            }
          }
          setPackages(tempArr)
          setSubScreenLoading(false);
        }
        else {
          setPackages(res.data.data);
          setSubScreenLoading(false)
        }


      })
      .catch((err) => {
        dispatch({
          type: SET_ALERT, payload: {
            setShowAlert: true,
            data: {
              message: 'Could not fetch plans',
              showCancelButton: true,
              onCancelPressed: () => {
                dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
              },
            }
          }
        }
        )
        setSubScreenLoading(false)
      });
  }

  //to set the headerimage according to the selectedplan---
  useEffect(() => {
    if (currentPlan == null) {
      SetHeaderImage(null)
      setImageBackgroundColor(ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR)
    }
    else {
      packages.map((item, index) => {
        if (item.id == currentPlan) {
          if (item?.documentId !== null) {
            SetHeaderImage(`${API.IMAGE_LOAD_URL}/${item.documentId}?${API_CONSTANT.STACK_WIDE}`)
            setImageBackgroundColor(item?.imageColor)
          }
          else {
            SetHeaderImage(null)
            setImageBackgroundColor(ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR)
          }

        }
      })
    }
  }, [currentPlan, packages]);

  //to update the isPaymentStatus based on the invoice
  useEffect(() => {
    if (invoiceId !== null) {
      invoiceStatus(invoiceId)
    }
  }, [invoiceId])

  const ShowToast = (title) => {
    toast.show({ title })
  }

  const goToCheckOut = () => {
    setModal(false);
    setTimeout(() => {
      return navigation.replace('Checkout', {
        price: price,
        fromLinkOTP: linkBoth ? true : false,
        fromRssOTP: rssBoth ? true : false,
        itemId: itemId ? itemId : null,
      })
    }, 400);
  }

  // TO GET ALL THE STATES LIST---------
  const getAllStateList = async () => {
    try {
      const res = await axiosInstance1.get(`${API.getAllCountryList}`)
      const namelist = res.data.data.countryList[0].states
      const states = []
      namelist.forEach((item) => {
        states.push(item.name)
      });
      setAllStates(states)
    } catch (err) {
      console.log('error while getting states', err);
    }
  };

  //to handle subscription and unsubscription----------------------------------------------
  function handleSubscription(id) {
    setSubScreenLoading(true)
    if (id !== currentPlan) {
      const axiosConfig = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      axiosInstance1.post(`${API.subscribePlan}?subscriptionPlanId=${id}`,
        null,
        axiosConfig
      )
        .then(async (res) => {
          await setInvoiceId(res.data.data)
          await setCurrentPlan(id)
          await dispatch(getUserDetails(token, userId))
          await ShowToast('Plan is selected!');
          await setSubScreenLoading(false)
        })
        .catch((err) => {
          setSubScreenLoading(false)
          dispatch({
            type: SET_ALERT, payload: {
              setShowAlert: true,
              data: {
                message: 'Error while subscribing plan',
                showCancelButton: true,
                onCancelPressed: () => {
                  dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                },
              }
            }
          }
          )
        });
    }


  }

  const invoiceStatus = async () => {
    console.log('this is called');
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };
    await axiosInstance1.get(`${API.invoice}/${invoiceId}`, axiosConfig)
      .then(async (res) => {
        console.log('res for invoice ', res);
        await setSubScreenLoading(false)
        if (res.data.data.status == 'PAID') {
          await dispatch({ type: UPDATE_ISPAYMENTDONE, payload: true });
          await ShowToast('Plan is selected!');
          if (fromItem || fromEbookItem || fromMusicItem) {
            navigation.goBack();
          }
          else if (fromAlbum) {
            navigation.goBack();
          }
          else if (linkPaid || LinkPlanReq || linkBoth) {
            navigation.replace('LinkItem', {
              fromSubscription: true,
              itemId: itemId ? itemId : null
            })
          } else if (rssPaid || RssPlanReq || rssBoth) {
            navigation.replace('RssFeedItem', {
              fromSubscription: true,
              itemId: itemId ? itemId : null
            })
          }
          else { null }
        } else {
          dispatch({
            type: SET_ALERT, payload: {
              setShowAlert: true,
              data: {
                message: res.data.data.reason,
                showCancelButton: true,
                onCancelPressed: () => {
                  dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
                },
              }
            }
          }
          )
        }

      })
      .catch((error) => {
        setSubScreenLoading(false)
        console.log('error', error);
      })
  }

  async function callOnSubsription(id) {
    if (Platform.OS == 'android') {
      if (cards.length === 0) {
        // console.log('card length is 0 so show modal and set plan to subscribe to ',id)
        await setPlanToSubscribe(id);
        setSubModalVisible(true);
      } else {
        handleSubscription(id);
      }
    } else {
      try {
        setSubScreenLoading(true);
        console.log('this is being called')
        const subscribe = await requestSubscription({ sku: id })
        console.log('DEBUG', subscribe);
      }
      catch (err) {
        setSubScreenLoading(false)
        console.log('error while purchasing ', err)
      }

    }

  }

  //This is pop up dialog box that will show up after you  use delete button to delete individual delete-------
  const showConfirmDialog = (id) => {
    if (user.isIOSUser && Platform.OS == 'android') {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: "Your plan can be changed only from iOS device or first cancel your current plan from iOS device and then you can come here and select any other plan",
            showCancelButton: true,
            cancelText: 'OK',
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }

        }
      }
      )

    }
    else if (id != currentPlan) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: "Are you sure you want to subscribe this plan",
            showCancelButton: true,
            cancelText: 'No',
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
            showConfirmButton: true,
            confirmText: 'Yes',
            onConfirmPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } }),
                callOnSubsription(id);

            }
          }

        }
      }
      )

    }
  };

  const handleInputChange = (val, logoId) => {
    if (/^\d{5}(-\d{4})?$/.test(val)) {
      setZipCode(val);
      _handleSaveButton(logoId);
      ShowToast('Profile updated!')
    }
    else {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter a valid Zip code',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      }
      )
      return;
    }
  };

  //added validation for mobile number 
  const _Validation = () => {
    if (!mailingAdd) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter your mailing address',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      }
      )
      return;
    }
    else if (!phoneNumber) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter phone number',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      }
      )
      return;
    }
    else if (!/(^\d{5,15}$)|(^\d{5}-\d{4}$)/.test(phoneNumber)) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter a valid phone number',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      }
      )
      return;
    }
    else if (!city) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter your city',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      }
      )
      return;
    }
    else if (!state) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter your state',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      }
      )
      return;
    }
    else if (!zipCode) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'Please enter your Zip code',
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      }
      )
      return;
    } else {
      handleInputChange(zipCode, logoId)
    }
  }

  //to handle updating contact detail on clicking save button-----------
  const _handleSaveButton = async (logoId) => {
    console.log('update contact is called')
    await setUpdatingContact(true);
    let [firstName, ...lastName] = fullName.split(' ');
    lastName = lastName.join(' ');
    const userData = {
      basicInfo: {
        email: userEmail,
        firstName: firstName,
        lastName: lastName ? lastName : null,
        mobileNumber: phoneNumber
      },
      id: userId,
      mailingAddress: {
        addressLine1: mailingAdd,
        city: city,
        postalCode: zipCode,
        state: state
      },
      logoId: logoId,
      subscriptionPlanId: currentPlan
    };
    await dispatch(updateUserDetails(userData, token, userId))
    await setUpdatingContact(false)
  };

  const _handleLogoUpdate = async (logoId) => {
    console.log('update lgoo is called')
    await setUpdatingContact(true);
    let [firstName, ...lastName] = fullName.split(' ');
    lastName = lastName.join(' ');
    const userData = {
      basicInfo: {
        email: userEmail,
        firstName: firstName,
        lastName: lastName ? lastName : null,
        mobileNumber: phoneNumber
      },
      id: userId,
      logoId: logoId,
      subscriptionPlanId: currentPlan
    }
    await dispatch(updateUserDetails(userData, token, userId))
    await setUpdatingContact(false)

  }

  //updatingContactafter uploading image--
  const updateContactAfterImageUpload = async (logoId) => {
    // console.log('logo  id >>>', logoId)
    setLogoId(logoId);
    _handleLogoUpdate(logoId)
    setUploadingImage(false)
    setModal2Visible(false)
  };

  //to upload image--
  const handlePicker = () => {
    ImagePicker.openPicker({
      cropping: true,
      width: 900,
      height: 700,
      cropperCircleOverlay: true,
      compressImageMaxHeight: 1,
      compressImageMaxWidth: 1,
      compressImageMaxWidth: 1500,
      compressImageMaxHeight: 1000,
      freeStyleCropEnabled: true,
      includeBase64: true,
    })
      .then((image) => {
        // console.log('image after cropping is :', image);
        setModal2Visible(false)
        setUploadingImage(true);
        let uri = image.data;
        let name = image.path.split('/').pop();
        //axoios config to check for logged in user--
        let axiosConfig = {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + `${token}`,
          },
        };
        const data = {
          imageString: uri,
          isLogo: true,
          name: name,
        };

        axiosInstance1
          .post(`${API.uploadBase64}`, data, axiosConfig)
          .then((res) => {
            updateContactAfterImageUpload(res.data.data.id);

          })
          .catch((err) => {
            // console.log('err while uploading the image is ', err)
          });

      })
      .catch((err) => console.log('err while picking the image is ', err));
  };

  //alert message to navigate to contact us form
  const unsubscribeAlert = () => {

    if (user.isIOSUser && Platform.OS == 'android') {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: "Your plan can be changed only from iOS device or first cancel your current plan from iOS device and then you can come here and select any other plan",
            showCancelButton: true,
            cancelText: 'OK',
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
          }
        }
      }
      )
    }
    else if (currentPlan !== null) {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: "To stop your current plan, Please place the request through Contact Us form",
            showCancelButton: true,
            onCancelPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } })
            },
            showConfirmButton: true,
            confirmText: 'Contact Us',
            onConfirmPressed: () => {
              dispatch({ type: SET_ALERT, payload: { setShowAlert: false } }),
                navigation.navigate('ContactUsStackScreen', {
                  fromUnsubscribe: true
                })

            }
          }

        }
      }
      )
    }
    else {
      dispatch({
        type: SET_ALERT, payload: {
          setShowAlert: true,
          data: {
            message: 'You are not subscribed to any plan',
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

  // MODAL TO UPLOAD OR REMOVE LOGO
  function UploadLogoModal() {
    return (
      <View style={styles.centeredView}>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modal2Visible}
          onRequestClose={() => {
            setModal2Visible(!modal2Visible);
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              setModal2Visible(!modal2Visible);
            }}
          >
            <View
              style={{
                ...styles.centeredView,
              }}
            >
              {/* actual visible area--- */}
              <View style={{ ...styles.modal2View }}>
                <Text
                  style={{
                    borderBottomWidth: 0.7,
                    borderColor: ThemeConstant.BORDER_COLOR_BETA,
                    width: '100%',
                    textAlign: 'center',
                    textAlignVertical: 'center',
                    color: ThemeConstant.TEXT_COLOR_SUBTEXTS,
                    fontSize: 12,
                    paddingVertical: 20,
                  }}
                >
                  Select Photo
                </Text>
                <View
                  style={{
                    width: '100%',
                    flex: 1,
                    justifyContent: 'space-evenly',
                  }}
                >
                  {logo &&
                    <TouchableOpacity
                      style={{ width: '100%', height: '50%' }}
                      onPress={() => {
                        updateContactAfterImageUpload(null);
                      }}
                    >

                      <Text
                        style={{
                          ...styles.modalText,
                          borderBottomColor: ThemeConstant.BORDER_COLOR_BETA,
                          borderBottomWidth: 0.7,
                        }}
                      >
                        Remove logo
                      </Text>
                    </TouchableOpacity>
                  }
                  <TouchableOpacity
                    style={{ width: logo ? '100%' : undefined, height: logo ? '50%' : undefined }}
                    onPress={() => handlePicker()}
                  >
                    <Text style={styles.modalText}>Choose from Library...</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  }

  //this is to handle account deletion i n IOS--
  const _handleAccountDeletion = () => {
    setAccountDeleteModalVisible(true)
  }

  const _sendDeleteRequest = async () => {
    setAccountDeleteModalVisible(false)
    setUserScreenLoading(true)
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + `${token}`,
      },
    };

    const data = {
      deviceType: Platform.OS == 'android' ? 'MOBILE_ANDROID' : 'MOBILE_IOS',
      email: userEmail,
      attachmentId: null,
      firstName: firstName,
      messageType: "ACCOUNT",
      lastName: lastName,
      message: 'Request to delete my account',
      mobileNumber: phoneNumber,
      sourceType: 'CONTACT_US_MOBILE'
    };
    try {
      const res = await axiosInstance1.post(
        `${API.contactuswithlogin}`,
        data,
        axiosConfig
      );
      ShowToast('Request raised.')
      dispatch(logoutUser(token))
      setTimeout(() => {
        navigation.replace('Auth')
        setUserScreenLoading(false);
      }, 2000);
    } catch (err) {
      // console.log('error while saving contact us data with login', err);
      setSubScreenLoading(false);
    }
  };


  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#fff',
      }}
    >

      {/* <StatusBar animated={true} backgroundColor={brandColor} /> */}
      <StatusBar
        backgroundColor={brandColor}
        hidden={false}
        translucent={false}
      />

      {/* HEADER COMPONENT TO SWITCH BETWENN USER PROFILE AND SUBSCRIPTION PLANS */}
      <View
        style={{
          ...styles.header,
          backgroundColor:
            theme == 'DARK'
              ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
              : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
        }}
      >
        <View style={[
          styles.mainContainer,
          {
            borderBottomWidth: scale(2),
            borderBottomColor:
              screenVisible == 'USER'
                ? theme == 'DARK'
                  ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                  : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                : 'gray',
            borderRightWidth: scale(1.1),
            borderRightColor: 'gray',

          }
        ]}>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => setScreenVisible('USER')}
            style={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text
              style={{
                ...styles.headerText,
                color:
                  screenVisible == 'USER'
                    ? theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                    : 'gray',
              }}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.mainContainer,
            {
              borderBottomWidth: scale(2),
              borderBottomColor:
                screenVisible == 'SUBSCRIPTION'
                  ? theme == 'DARK'
                    ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                    : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                  : 'gray',

            }
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => { setScreenVisible('SUBSCRIPTION') }}
            style={{
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Text
              style={{
                ...styles.headerText,
                color:
                  screenVisible == 'SUBSCRIPTION'
                    ? theme == 'DARK'
                      ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                      : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                    : 'gray',
              }}
            >
              Subscribe
            </Text>
          </TouchableOpacity>
        </View>

      </View>
      {/* ------------HEADER COMPONENT END ----------------- */}

      {/*  -----THIS IS USER DETAILS SCREEN DATA START_______ */}
      {
        screenVisible == 'USER' &&
        (
          <View
            style={{
              backgroundColor:
                theme == 'DARK'
                  ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                  : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
              paddingHorizontal: 25
            }}
          >
            {/* THIS IS LOADER */}
            {
              userScreenLoading &&
              <View style={styles.loaderContainer}>
                <ActivityIndicator
                  animating={userScreenLoading}
                  color={'gray'}
                  size="large"
                  style={{
                    alignItems: 'center',
                    height: 80,
                  }}
                />
              </View>
            }
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="never"
              contentContainerStyle={{
                paddingBottom: moderateVerticalScale(30),
                backgroundColor:
                  theme == 'DARK'
                    ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                    : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
              }}
            >
              <KeyboardAvoidingView enabled keyboardVerticalOffset={200}>

                <>
                  {/* THIS IS THE USER IMAGE COMPOENT ON TOP  START*/}
                  <View View style={{ alignItems: 'center' }}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => {
                        setModal2Visible(true);
                      }}
                    >
                      <ActivityIndicator
                        animating={uploadingImage}
                        color={'gray'}
                        size="small"
                        style={{ position: 'absolute', alignSelf: 'center', top: '50%' }}
                      />
                      {logo == null || !isAuthenticated ? (
                        <AccountCircle
                          name="account-circle"
                          size={100}
                          style={{
                            color:
                              theme == 'DARK'
                                ? DynamicThemeConstants.DARK.ICON_COLOR_WHITE
                                : DynamicThemeConstants.LIGHT.ICON_COLOR_BLACK,
                            opacity: 0.5,
                          }}
                        />
                      ) : (
                        <FastImage
                          source={{
                            uri: logo?.path,
                            priority: FastImage.priority.high
                          }}
                          style={{ width: 80, height: 80, marginTop: 20, borderRadius: 40, backgroundColor: 'grey' }}

                        />
                      )}
                    </TouchableOpacity>
                  </View>
                  {/* USER LOGO COMPONENT END */}

                  {/* Users name  in the header   */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 10,
                    }}
                  >
                    <TextInput
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        letterSpacing: 1.2,
                        textAlign: 'center',

                        color:
                          theme == 'DARK'
                            ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                            : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                      }}
                      maxLength={25}
                      value={fullName}
                      onChangeText={(text) => setFullName(text)}
                    />
                    {/* PENCIL ICON */}
                    <Evilicons name="pencil" color={theme == 'DARK' ? '#fff' : '#000'} size={22} />
                  </View>

                  {/* FOR EMAIL */}
                  <FormInput
                    name={'Email'}
                    editable={false}
                    defaultValue={email}
                    inputStyle={{ ...formInputStyle }}
                    textViewstyle={{ ...StyleTop }}
                    topTextstyle={{ ...TopTextStyle }}
                  />

                  {/* for mailing address---------------------- */}
                  <FormInput
                    name={'Mailing Address'}
                    defaultValue={mailingAdd}
                    keyboardType={
                      Platform.OS === 'ios'
                        ? 'ascii-capable'
                        : 'visible-password'
                    }
                    onChangeText={(text) => {
                      setMailingAdd(text);
                    }}
                    inputStyle={{ ...formInputStyle }}
                    textViewstyle={{ ...StyleTop }}
                    topTextstyle={{ ...TopTextStyle }}
                  />

                  {/* phone number field ---------------------- */}
                  <FormInput
                    name={'Phone'}
                    defaultValue={mobileNumber}
                    // keyboardType={
                    //   Platform.OS === 'ios'
                    //     ? 'ascii-capable'
                    //     : 'visible-password'
                    // }
                    keyboardType='phone-pad'
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                    }}
                    inputStyle={{ ...formInputStyle }}
                    textViewstyle={{ ...StyleTop }}
                    topTextstyle={{ ...TopTextStyle }}
                  />

                  {/* city and state----------------- */}
                  <View style={{
                    flexDirection: 'row'
                  }}>

                    {/* for city------------ */}
                    <View style={{
                      flex: 1 / 2,
                      marginRight: moderateScale(20)
                    }}>
                      <FormInput
                        name={'City'}
                        defaultValue={user?.mailingAddress?.city}
                        onChangeText={(text) => setCity(text)}
                        keyboardType={
                          Platform.OS === 'ios'
                            ? 'ascii-capable'
                            : 'visible-password'
                        }
                        inputStyle={{ ...formInputStyle, height: '100%' }}
                        textViewstyle={{ ...StyleTop }}
                        topTextstyle={{ ...TopTextStyle }}
                      />
                    </View>

                    {/* for state */}
                    <View style={{
                      flex: 1 / 2
                    }}>
                      <View style={{ flexDirection: 'row', marginTop: 10 }}>
                        <Text
                          style={{
                            ...styles.inputTopText,
                            color: theme == 'DARK' ? '#fff' : '#000',
                            marginBottom: moderateVerticalScale(5),
                          }}
                        >
                          State
                        </Text>
                      </View>
                      <SelectDropdown
                        data={allStates}
                        onSelect={(selectedItem, index) => {
                          setState(selectedItem)
                        }}
                        defaultButtonText={state}
                        buttonTextAfterSelection={() => {
                          return state;
                        }}
                        rowTextForSelection={(item, index) => {
                          return item;
                        }}
                        buttonStyle={{
                          ...styles.dropdown1BtnStyle,
                          backgroundColor:
                            theme == 'DARK'
                              ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_WHITE
                              : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_BODY,
                        }}
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
                          // textTransform: 'capitalize',
                          color: '#000'
                        }}
                        selectedRowStyle={{
                          backgroundColor: state == 'Select' ? '#EEEE' : 'grey',
                        }}
                      />

                    </View>
                  </View>

                  {/* for zipcode and blank------------ */}

                  <View style={{
                    flexDirection: 'row'
                  }}>

                    {/* for ZIP CODE------------ */}
                    <View style={{
                      flex: 1 / 2,
                      marginRight: moderateScale(20)
                    }}>
                      <FormInput
                        name={'Zip Code'}
                        defaultValue={user?.mailingAddress?.postalCode}
                        onChangeText={(val) => setZipCode(val)}
                        // keyboardType={
                        //   Platform.OS === 'ios'
                        //     ? 'ascii-capable'
                        //     : 'visible-password'
                        // }
                        keyboardType='numeric'
                        inputStyle={{ ...formInputStyle }}
                        textViewstyle={{ ...StyleTop }}
                        topTextstyle={{ ...TopTextStyle }}
                        onSubmitEditing={() => { handleInputChange(zipCode); }}
                      />

                    </View>

                    {/* TRICK FOR BLANK SPACE AFTER ZIP */}
                    <View style={{
                      flex: 1 / 2
                    }} />
                  </View>

                  {/* ______SAVE BUTTON_______ */}
                  <View style={{ width: '100%', marginVertical: 20 }}>
                    <CustomButton
                      inputStyle={{
                        backgroundColor: brandColor,
                      }}
                      onPress={() => {
                        _Validation(logoId);
                      }}
                      butttonText={!updatingContact ? (
                        <Text style={styles.textStyle}>Save</Text>
                      ) : (
                        <ActivityIndicator
                          animating={true}
                          color={
                            theme === 'DARK'
                              ? DynamicThemeConstants.DARK.ICON_COLOR
                              : DynamicThemeConstants.LIGHT.ICON_COLOR_BLACK
                          }
                          _
                          size="small"
                        // style={{
                        //   height: 15,
                        // }}
                        />
                      )}
                    />
                  </View>

                </>


                {/* -----------------USER plan details START--------------------- */}

                {
                  user?.subscriptionPlanName &&
                  <View
                    style={{
                      paddingTop: 15,
                      marginTop: 10,
                      borderTopWidth: 1,
                      borderTopColor:
                        theme == 'DARK'
                          ? DynamicThemeConstants.DARK.BORDER_COLOR_PRIMARY
                          : DynamicThemeConstants.LIGHT.BORDER_COLOR_PRIMARY,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '700',
                        marginBottom: 15,
                        color:
                          theme === 'DARK'
                            ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                            : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                      }}
                    >
                      Current Plan
                    </Text>

                    <View
                      style={{
                        ...styles.card,
                        backgroundColor:
                          theme === 'DARK'
                            ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_WHITE
                            : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_BODY,
                      }}
                    >
                      <View style={{ justifyContent: 'center', marginLeft: 40 }}>
                        <Text
                          style={{
                            fontWeight: '600',
                            fontSize: 20,
                            letterSpacing: 1.1,
                          }}
                        >
                          {user?.subscriptionPlanName ? user?.subscriptionPlanName : 'No Plan is Selected'}
                        </Text>
                        {user?.price && user?.subscriptionPlanDuration &&
                          <Text
                            style={{
                              fontWeight: '300',
                              fontSize: 16,
                              letterSpacing: 1.1,
                            }}
                          >
                            ${user?.price}/{user?.subscriptionPlanDuration}
                          </Text>
                        }
                      </View>
                    </View>
                  </View>
                }


                {/* ------------------USER PLAN DETAIL END--------------------------- */}

                {/* -----------------card details---------------- */}
                {(!isAdmin && cards.length !== 0) &&
                  (
                    <View
                      style={{
                        paddingTop: 15,
                        marginTop: 10,
                        borderTopWidth: 1,
                        borderTopColor:
                          theme == 'DARK'
                            ? DynamicThemeConstants.DARK.BORDER_COLOR_PRIMARY
                            : DynamicThemeConstants.LIGHT.BORDER_COLOR_PRIMARY,
                        marginBottom: moderateVerticalScale(20)
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 20,
                          fontWeight: '700',
                          marginTop: 10,
                          marginBottom: 10,
                          color:
                            theme === 'DARK'
                              ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY
                              : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY,
                        }}
                      >
                        Card Details
                      </Text>

                      <View
                        style={{
                          paddingVertical: 10,
                          alignItems: 'center',
                        }}
                      >
                        <CreditCard
                          style={{ width: '100%' }}
                          name={'Visa'}
                          date={cards[0]?.expMonth + '/' + cards[0]?.expYear.toString().substr(-2)}
                          suffix={cards[0]?.last4}
                        />
                      </View>
                      <Pressable
                        style={[
                          styles.button,
                          styles.buttonOpen,
                          {
                            marginTop: 20,
                            marginBottom: moderateVerticalScale(5),
                            backgroundColor: brandColor,
                          },
                        ]}
                        onPress={() => setUserModalVisible(true)}
                      >
                        <Text style={styles.textStyle}>Replace Card</Text>
                      </Pressable>
                    </View>
                  )
                }
              </KeyboardAvoidingView>
              {Platform.OS == 'ios' && <CustomButton butttonText={'Delete Account'} inputStyle={{ backgroundColor: 'red' }} onPress={_handleAccountDeletion} />}
              <AddCardModal modalVisible={userModalVisible} setModalVisible={setUserModalVisible} email={email} fname={firstName} lname={lastName} />
              <AccountDeleteModal isVisible={accountDeleteModalVisible} setIsVisible={setAccountDeleteModalVisible} onSubmit={_sendDeleteRequest} />

              {UploadLogoModal()}

            </ScrollView>
          </View>
        )
      }
      {/* ---------USER DETAILS SCREEN END--------- */}

      {/* --------THIS IS THE SUBSCRIPTION PLAN SCREEN  For Android---*/}
      {
        screenVisible == 'SUBSCRIPTION' && Platform.OS == 'android' &&
        (
          <View
            style={{
              flex: 1,
              position: 'relative',
              backgroundColor:
                theme == 'DARK'
                  ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                  : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
            }}
          >
            {/* THIS IS LOADER */}
            {
              subScreenLoading &&
              <View style={styles.loaderContainer}>
                <ActivityIndicator
                  animating={subScreenLoading}
                  color={'gray'} _
                  size="large"
                  style={{
                    alignItems: 'center',
                    height: 80,
                  }}
                />
              </View>
            }
            <View style={{ ...styles.subscriptionTitle }}>
              {
                headerImage ?
                  <Image
                    style={{ width: '100%', height: '100%', backgroundColor: imageBackgroundColor, zIndex: 2 }}
                    source={{ uri: headerImage }}
                  />
                  :
                  <Image
                    style={{ width: '100%', height: '100%', zIndex: 2 }}
                    source={require('../../assets/PlaceHolder.png')} />
              }
            </View>


            {/* FLATLIST CONTAINER */}
            <View style={{ flex: 1, zIndex: 100 }}>
              <FlatList
                style={styles.allPlans}
                showsVerticalScrollIndicator={false}
                data={packages}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                  paddingTop: moderateVerticalScale(120),
                  paddingBottom: moderateVerticalScale(10)
                }}
                ListFooterComponent={() =>
                  fromItem || fromEbookItem || fromMusicItem || fromAlbum || linkPaid ?
                    null
                    :
                    packages !== null && packages?.length > 0 &&
                    (currentPlan !== null ?
                      <View style={{ flexDirection: "row", justifyContent: "center" }}>

                        <TouchableOpacity
                          style={{ alignItems: "center" }}
                          onPress={() => { unsubscribeAlert() }}
                        >
                          <Text style={{ color: '#0645AD' }}>
                            Unsubscribe
                          </Text>
                        </TouchableOpacity>
                        <Text
                          style={{
                            color: theme == 'DARK' ? 'white' : 'black'
                          }}
                        > this Plan</Text>
                      </View>

                      :

                      <View style={{ alignItems: "center" }}>

                        <Text style={{ color: theme == 'DARK' ? 'white' : 'black' }}>
                          Unsubscribe this plan
                        </Text>

                      </View>
                    )
                }
                renderItem={({ item }) => (
                  <TouchableWithoutFeedback 
                  onPress={()=>{
                    isAdmin ? null : showConfirmDialog(item.id)
                  }}
                  >
                  <View
                    style={{
                      ...styles.card,
                      backgroundColor:
                        theme === 'DARK'
                          ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_NOTE
                          : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_BODY,
                      elevation: 2, 
                    }}
                  >

                    {isAdmin ? null : (
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: 20,
                        }}
                      >
                        <CircleCheckBox
                          checked={item.id == currentPlan ? true : false}
                          onToggle={() => showConfirmDialog(item.id)}
                          outerColor={'#000'}
                          innerColor={'#000'}
                        />
                      </View>
                    )}

                    <View style={{ justifyContent: 'center', marginLeft: 20 }}>
                      <Text
                      numberOfLines={2}
                        style={{
                          fontWeight: '600',
                          fontSize: 20,
                          letterSpacing: 1.1,
                          paddingRight:moderateScale(50),
                          color: theme == 'DARK' ? '#ffff' : '#000'
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 16,
                          color: theme == 'DARK' ? '#ffff' : '#000',
                          textTransform: 'capitalize'
                        }}
                      >
                        ${item.price} / {item.subscriptionPlanDuration}
                      </Text>
                    </View>
                  </View>
                  </TouchableWithoutFeedback>

                )}
              />
              {/* } */}
            </View>
           

            <AddCardModal modalVisible={subModalVisible} setModalVisible={setSubModalVisible} planToSubscribe={planToSubscribe} handleSubscription={handleSubscription} toSubscribe={true} email={email} fname={firstName} lname={lastName}/>
            <LinkRssPaidOtpModal modal={modal} setModal={setModal} price={price} goToCheckOut={goToCheckOut} />
          </View>
        )
      }


      {/* --------THIS IS THE SUBSCRIPTION PLAN SCREEN For IOS ---*/}
      {
        screenVisible == 'SUBSCRIPTION' && Platform.OS == 'ios' &&
        (
          <View
            style={{
              flex: 1,
              position: 'relative',
              backgroundColor:
                theme == 'DARK'
                  ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK
                  : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
            }}
          >
            {/* THIS IS LOADER */}
            {
              subScreenLoading &&
              <View style={styles.loaderContainer}>
                <ActivityIndicator
                  animating={subScreenLoading}
                  color={'gray'} _
                  size="large"
                  style={{
                    alignItems: 'center',
                    height: 80,
                  }}
                />
              </View>
            }
            <FlatList
              style={styles.allPlans}
              contentContainerStyle={{
                paddingTop: moderateVerticalScale(30)
              }}
              showsVerticalScrollIndicator={false}
              data={packages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={{
                    ...styles.card,
                    height: moderateVerticalScale(130),
                    backgroundColor:
                      theme === 'DARK'
                        ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_NOTE
                        : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_BODY,
                    elevation: 2,
                  }}
                >
                  {isAdmin ? null : (
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginLeft: 20,
                      }}
                    >
                      <CircleCheckBox
                        checked={item?.productId == id ? true : false}
                        onToggle={() => showConfirmDialog(item?.productId)}
                        outerColor={'#000'}
                        innerColor={'#000'}
                      />
                    </View>
                  )}

                  <View style={{ justifyContent: 'center', marginLeft: 20, flex: 1 }}>
                    <Text
                      style={{
                        fontWeight: '600',
                        fontSize: 20,
                        letterSpacing: 1.1,
                        color: theme == 'DARK' ? '#ffff' : '#000',
                        marginBottom: moderateVerticalScale(4)
                      }}
                    >
                      {item?.title}
                    </Text>

                    <Text
                      numberOfLines={2}
                      style={{
                        fontWeight: '500',
                        fontSize: scale(12),
                        letterSpacing: 1.1,
                        color: theme == 'DARK' ? '#ffff' : '#000',
                        width: '90%',
                        marginBottom: moderateVerticalScale(10)
                      }}
                    >
                      {item?.description}
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        color: theme == 'DARK' ? '#ffff' : '#000',
                      }}
                    >
                      {item.localizedPrice} for {item.subscriptionPeriodNumberIOS} {item?.subscriptionPeriodUnitIOS}
                    </Text>
                  </View>
                </View>
              )}
            />

            <AddCardModal modalVisible={subModalVisible} setModalVisible={setSubModalVisible} planToSubscribe={planToSubscribe} handleSubscription={handleSubscription} toSubscribe={true} email={email} fname={firstName} lname={lastName}/>
            <LinkRssPaidOtpModal modal={modal} setModal={setModal} price={price} goToCheckOut={goToCheckOut} />
          </View>
        )
      }
    </View >
  )
};

export default SubscriptionDetails;


