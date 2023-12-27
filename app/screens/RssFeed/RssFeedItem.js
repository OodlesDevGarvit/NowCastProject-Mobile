import React, { useEffect, useState } from "react";
import { View, Text, Platform, StatusBar } from "react-native";
import Loader from "../../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance1 } from '../../constant/Auth';
import * as API from '../../constant/APIs';
import { IOSAccessModal, IOSPaidModal } from "../../components";

const text = 'Please wait...';


const RssFeedItem = ({ route, navigation }) => {
  const { mobileTheme: theme } = useSelector((state) => state.brandingReducer.brandingData);
  const { token, isPaymentDone, isAuthenticated, subscription: { id } } = useSelector(state => state.authReducer)
  const { isVisible } = useSelector(state => state.splashReducer);
  const [rssContent, setRssContent] = useState(null);
  const [rssId, setRssId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rssPrice, setRssPrice] = useState(null);
  const { orgId } = useSelector(state => state.activeOrgReducer);
  const [paidModalVisible, setPaidModalVisible] = useState(false);
  const [accessModalVisible, setAccessModalVisible] = useState(false);

  const fromCheckout = route.params?.fromCheckout;
  const itemId = route.params?.itemId
  const fromSubscription = route.params?.fromSubscription;
  const fromWelcome = route?.params?.fromWelcome;


  useEffect(() => {
    rssData()
  }, [isAuthenticated, fromCheckout, fromSubscription])

  useEffect(() => {
    if(rssContent){
      rssFeedResponseData()
    }
  }, [rssContent])

  const rssData = () => {
    if (isAuthenticated) {
      rssFeed()
    } else {
      rssFeedWithoutAuth()
    }
  }

  const rssFeed = () => {
    setLoading(true)
    let axiosConfig = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + `${token}`,
      },
    };
    axiosInstance1
      .get(`${API.rssFeed}/${itemId}`, axiosConfig)
      .then((res) => {
        const nameList = res.data.data
        setRssId(res.data.data.id);
        setRssPrice(res.data.data.price);
        setRssContent(nameList);
        setLoading(false)
      })
      .catch((err) => {
        setLoading(false)
        console.log('logged in err--', err)
      });
  }

  const rssFeedWithoutAuth = () => {
    setLoading(true)
    axiosInstance1.get(`${API.rssFeedId}/${itemId}?organizationId=${orgId}`)
      .then((res) => {
        const namelist = res.data.data
        setRssId(res.data.data.id);
        setRssPrice(res.data.data.price);
        setRssContent(namelist);
        setLoading(false)
      })
      .catch((err) => console.log('not logged in err ', err));
  }


  const rssFeedResponseData = () => {
    if (rssContent) {
      if (Platform.OS == 'android') {
        if (rssContent?.rssFeedAccessType == 'FREE') {
          handleRssNavigation();
          return;
        } else if (rssContent?.rssFeedAccessType == 'ACCESSREQUIRED') {
          if (!isAuthenticated) {
            setLoading(false)
            navigation.replace('Auth', {
              screen: 'LoginScreen',
              params: {
                rssAccessRequired: true,
                itemId: itemId ? itemId : null,
              }
            })
          } else {
            handleRssNavigation()
          }
        } else if (rssContent?.rssFeedAccessType == 'PAID' && rssContent?.isOneTimePurchase == false) {

          if (!isAuthenticated) {

            return navigation.replace('Auth', {
              screen: 'LoginScreen',
              params: {
                rssPaid: true,
                itemId: itemId ? itemId : null,
                subscriptionPlanIds: rssContent?.subscriptionPlanIds
              }
            })
          }
          else {
            if (rssContent?.subscriptionPlanIds?.includes(id) && isPaymentDone) {
              handleRssNavigation()

            } else if (!rssContent?.subscriptionPlanIds?.includes(id) || !isPaymentDone) {

              setLoading(false)
              return navigation.replace('SubscriptionDetails', {
                RssPlanReq: true,
                itemId: itemId ? itemId : null,
                subscriptionPlanIds: rssContent?.subscriptionPlanIds
              });
            }
          }

        } else if (rssContent?.rssFeedAccessType == 'PAID' && rssContent?.isOneTimePurchase == true && rssContent?.subscriptionPlanIds.length === 0) {
          if (!isAuthenticated) {
            navigation.replace('Auth', {
              screen: 'LoginScreen',
              params: {
                type: 'RSSFEED',
                fromRssOTP: true,
                price: `${rssPrice}`,
                itemId: itemId,
              },
            })

          } else {
            if (rssContent?.isOneTimePurchasePaymentDone == false) {
              return navigation.replace('Checkout', {
                price: `${rssPrice}`,
                fromRss: true,
                itemId: itemId
              })

            } else {
              handleRssNavigation()
            }
          }
        } else if (rssContent?.rssFeedAccessType == 'PAID' && rssContent?.isOneTimePurchase == true && rssContent?.subscriptionPlanIds.length !== 0) {

          if (!isAuthenticated) {
            navigation.replace('Auth', {
              screen: 'LoginScreen',
              params: {
                rssPaid: true,
                price: `${rssPrice}`,
                itemId: itemId,
              },
            })
          } else if (!rssContent?.isOneTimePurchasePaymentDone && !rssContent?.subscriptionPlanIds?.includes(id)) {

            setLoading(false)
            return navigation.replace('SubscriptionDetails', {
              rssBoth: true,
              itemId: itemId,
              price: `${rssPrice}`,
              subscriptionPlanIds: rssContent?.subscriptionPlanIds
            });
          } else {
            handleRssNavigation()
          }
        }
      } else {
        if (rssContent?.rssFeedAccessType !== 'FREE' && !isAuthenticated) {
          return setAccessModalVisible(true);
        }
        else if (rssContent?.rssFeedAccessType == 'FREE' ||
          (rssContent?.rssFeedAccessType == 'ACCESSREQUIRED' && isAuthenticated) ||
          (rssContent?.rssFeedAccessType == 'PAID' && rssContent?.isOneTimePurchasePaymentDone == true) ||
          (rssContent?.rssFeedAccessType == 'PAID' && rssContent?.subscriptionPlanIds?.includes(id) && isPaymentDone)) {
          handleRssNavigation();
          return;
        } else {
          setPaidModalVisible(true);
          return;
        }
      }
    }
  };


  const handleRssNavigation = () => {
    return navigation.replace('RssFeed', {
      id: itemId
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme == 'DARK' ? '#000' : '#fff', justifyContent: 'center', alignItems: "center" }}>
      <StatusBar translucent={false} showHideTransition={true} />
      <Loader loading={loading} />
      <View style={{ flex: 1 / 2, justifyContent: 'flex-end' }}>
        <Text style={{ color: theme == 'DARK' ? '#fff' : '#000', fontSize: 17 }}>{text}</Text>
      </View>
      <View style={{ flex: 1 / 2, width: '50%', justifyContent: 'center' }}>
        <></>

      </View>

      <IOSAccessModal isVisible={accessModalVisible} setIsVisible={setAccessModalVisible} />
      <IOSPaidModal isVisible={paidModalVisible} setIsVisible={setPaidModalVisible} navigate={navigation} rssContent={rssContent} />

    </View>
  )
}

export default RssFeedItem;