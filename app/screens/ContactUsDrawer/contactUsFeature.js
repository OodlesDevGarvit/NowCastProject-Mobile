import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  Keyboard,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import * as API_CONSTANT from '../../constant/ApiConstant';
import * as API from '../../constant/APIs';
import Loader from '../../components/Loader';
import { axiosInstance1, NOWCAST_URL } from '../../constant/Auth';
import ThemeConstant from '../../constant/ThemeConstant';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import StringConstant from '../../constant/StringConstant';
import { heightPixel, Percentage, pixelSizeHorizontal } from '../../constant/Theme';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from 'react-native-size-matters';
import { useDispatch, useSelector } from 'react-redux';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import FilePicker, { types } from 'react-native-document-picker';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SelectDropdown from 'react-native-select-dropdown';
import { CachedImg } from '../../components';
import { getTextAccordingToBrandColor } from '../../utils/getIntensityOfBrandColor';
import { SET_ALERT } from '../../store/actions/types';

const contactUsFea = ({ navigation,route }) => {
  const dispatch=useDispatch();
  const brandingData = useSelector((state) => state.brandingReducer);
  const { logoId, brandColor } = brandingData.brandingData;
  const { token, isAuthenticated, user } = useSelector(state => state.authReducer);
  const { basicInfo } = user ?? {};
  const fromUnsubscribe = route.params?.fromUnsubscribe
  const { orgId } = useSelector(state => state.activeOrgReducer);

  const [firstName, setFirstName] = useState(basicInfo?.firstName);
  const [lastName, setLastName] = useState(basicInfo?.lastName);
  const [userEmail, setUserEmail] = useState(basicInfo?.email);
  const [phone, setPhone] = useState(basicInfo?.mobileNumber);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errortext, setErrortext] = useState('');
  const [attachmentId, setAttachmentId] = useState('');
  const [fileData, setFileData] = useState([]);
  const [allSubjects, setAllSubjects] = useState('');
  const [subject, setSubject] = useState(fromUnsubscribe ? 'PLAN' : null);
  const [defaultText, setDefaultText] = useState(fromUnsubscribe ? 'Plan' :  'Choose an option')
  const [dynamicTextColor, setDynamicTextColor] = useState('');
  useLayoutEffect(() => {
    let textColor = getTextAccordingToBrandColor(brandColor);
    setDynamicTextColor(textColor);
  }, []);
  useEffect(() => {
    getMessageType();
  }, []);


  // CALLED WHEN SUBMIT BUTTON IS PRESSED
  const handleSubmitButton = () => {
    setErrortext('');
    if (!firstName) {
      dispatch({type:SET_ALERT,payload:{
        setShowAlert:true,
        data:{
       message:'Please enter your first name',
       showCancelButton:true,
       onCancelPressed:()=>{
        dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
       },
      }
      }
      })
      // alert('Please enter your first name');
      return;
    }

    if (!userEmail) {
      dispatch({type:SET_ALERT,payload:{
        setShowAlert:true,
        data:{
       message:'Please enter your email',
       showCancelButton:true,
       onCancelPressed:()=>{
        dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
       },
      }
      }}
      )
      return;
    }
    if (
      !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        userEmail
      )
    ) {
      dispatch({type:SET_ALERT,payload:{
        setShowAlert:true,
        data:{
       message:'Please enter a valid email',
       showCancelButton:true,
       onCancelPressed:()=>{
        dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
       },
      }
      }}
      )
      // alert('Please enter a valid email');
      return;
    }
    if (!phone) {
      dispatch({type:SET_ALERT,payload:{
        setShowAlert:true,
        data:{
       message:'Please enter phone number',
       showCancelButton:true,
       onCancelPressed:()=>{
        dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
       },
      }
      }}
      )
      return;
    }
    if (!/(^\d{5,15}$)|(^\d{5}-\d{4}$)/.test(phone)) {
      dispatch({type:SET_ALERT,payload:{
        setShowAlert:true,
        data:{
       message:'Please enter a valid phone number',
       showCancelButton:true,
       onCancelPressed:()=>{
        dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
       },
      }
      }}
      )
      // alert('Please enter a valid phone number');
      return;
    }
    if (!subject) {
      dispatch({type:SET_ALERT,payload:{
        setShowAlert:true,
        data:{
       message:'Please select a subject',
       showCancelButton:true,
       onCancelPressed:()=>{
        dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
       },
      }
      }}
      )
      // alert('Please select a subject');
      return;
    }
    if (subject == 'Choose an option') {
      dispatch({type:SET_ALERT,payload:{
        setShowAlert:true,
        data:{
       message:'Please select a subject',
       showCancelButton:true,
       onCancelPressed:()=>{
        dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
       },
      }
      }}
      )
      // alert('Please select a subject');
      return;
    }

    if (!message) {
      dispatch({type:SET_ALERT,payload:{
        setShowAlert:true,
        data:{
       message:'Please enter details in message box',
       showCancelButton:true,
       onCancelPressed:()=>{
        dispatch({type:SET_ALERT,payload:{ setShowAlert:false}})
       },
      }
      }}
      )
      // alert('Please enter details in Message box');
      return;
    }

    //called to post the data to api---
    submitData();
  };

  // TO GET ALL THE QUERY TYPE THAT A USER WILL CONTACT ABOUT
  const getMessageType = async () => {
    try {
      const res = await axiosInstance1.get(`${API.messageType}`)
      setAllSubjects(res.data.data)

    } catch (err) {
      console.log('error while getting message type', err);
    }
  };

  //to select and upload attachment from device
  const handleFilePicker = async () => {
    setLoading(true);
    try {
      const response = await FilePicker.pick({
        presentationStyle: 'fullScreen',
        type: [types.video, types.images, types.pdf, types.docx, types.plainText],
        mode: 'open',
      });
      await fileUploadToApi(response);

      console.log('this the data of file picked', response);
      setFileData(response);
      setLoading(false);
    } catch (err) {
      console.log('error', err);
      setLoading(false);
    }
  };

  const fileUploadToApi = async (response) => {
    let axiosConfig = {
      headers: {
        ' accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
    };
    const data = new FormData();
    data.append('file', response[0]);

    try {
      const res = await axiosInstance1.post(
        `${API.uploadDocument}`,
        data,
        axiosConfig
      );
      console.log('this is the res for uploadapi', res.data.data.id);
      setAttachmentId(res.data.data.id);
    } catch (error) {
      console.log('this is error while posting attachment', error);
      setLoading(false);
    }
  };

  const submitData = async (res) => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        sendDataWithLogin();
      } else {
        sendDataWithoutLogin();
      }
    } catch (err) {
      console.log('error while getting token', err);
    }
  };

  const sendDataWithLogin = async () => {
    try {
      let axiosConfig = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + `${token}`,
        },
      };
      const data = {
        deviceType:
          Platform.OS == 'android' ? 'MOBILE_ANDROID' : 'MOBILE_IOS',
        email: userEmail,
        attachmentId: attachmentId,
        firstName: firstName,
        messageType: subject,
        lastName: lastName,
        message: message,
        mobileNumber: phone,
        sourceType: 'CONTACT_US_MOBILE'
      };
      const res = await axiosInstance1.post(
        `${API.contactuswithlogin}`,
        data,
        axiosConfig
      );
      console.log('data sent with login >>', res);
      navigation.navigate('QuerySent', {
        message: setMessage(''),
        fileData: setFileData([]),
        attachmentId: setAttachmentId(null),
        messageType: setSubject(defaultText),
      });
      setLoading(false);
      setDefaultText('Choose an option')
    } catch (err) {
      console.log('error while saving contact us data with login', err);
      setLoading(false);
    }
  };

  const sendDataWithoutLogin = async (item) => {
    try {
      console.log('this data of withoutlogin', data);
      const data = {
        // deviceType: Platform.OS == 'android' ? 'MOBILE_ANDROID' : 'MOBILE_IOS',
        deviceType: 'MOBILE',
        attachmentId: attachmentId,
        email: userEmail,
        firstName: firstName,
        lastName: lastName,
        message: message,
        messageType: subject,
        mobileNumber: phone,
        organizationId: orgId,
        sourceType:'CONTACT_US_MOBILE',
      };
      console.log('this data of withoutlogin', data);
      const res = await axiosInstance1.post(
        `${API.contactusWithoutLogin}`,
        data
      );
      console.log('data sent without login >>', res);
      navigation.navigate('QuerySent', {
        userEmail: setUserEmail(''),
        firstName: setFirstName(''),
        lastName: setLastName(''),
        phone: setPhone(''),
        message: setMessage(''),
        fileData: setFileData([]),
        attachmentId: setAttachmentId(null),
        messageType: setSubject(defaultText),

      });
      setLoading(false);
    } catch (err) {
      console.log(
        'error while saving contact us data without login',
        err
      );
      setLoading(false);
    }
  };

  return (
    <View style={{ ...styles.container, backgroundColor: brandColor }}>
      <StatusBar
        animated={true}
        backgroundColor={brandColor}
      />
      <Loader loading={loading} />
      <KeyboardAwareScrollView enableOnAndroid={true}>
        <View style={{ alignItems: 'center' }}>
          <CachedImg imgStyle={styles.logoStyle} uri={`${API.IMAGE_LOAD_URL}/${logoId}`} />
          {/* <Image
            source={{ uri: `${API.IMAGE_LOAD_URL}/${logoId}` }}
            style={styles.logoStyle}
          /> */}
        </View>
        <View style={styles.sectionStyle}>
          <View>
            <FormInput
              name={'First Name'}
              required={true}
              editable={isAuthenticated ? false : true}
              onChangeText={(firstName) => setFirstName(firstName)}
              value={firstName}
              underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
              placeholder=""
              placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
              autoCapitalize="sentences"
              returnKeyType="next"
              blurOnSubmit={false}
              topTextstyle={{ color: dynamicTextColor }}
            />

            <FormInput
              name={'Last Name'}
              onChangeText={(lastName) => setLastName(lastName)}
              value={lastName}
              editable={isAuthenticated ? false : true}
              underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
              placeholder=""
              placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
              returnKeyType="next"
              blurOnSubmit={false}
              topTextstyle={{ color: dynamicTextColor }}
            />

            <FormInput
              name={'Email'}
              required={true}
              onChangeText={(userEmail) => setUserEmail(userEmail)}
              value={userEmail}
              editable={isAuthenticated ? false : true}
              underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
              placeholder=""
              placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
              topTextstyle={{ color: dynamicTextColor }}
            />

            <FormInput
              name={'Phone'}
              required={true}
              onChangeText={(phoneNo) => setPhone(phoneNo)}
              value={phone}
              editable={isAuthenticated ? false : true}
              underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
              placeholder=""
              placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
              autoCapitalize="sentences"
              maxLength={15}
              secureTextEntry={false}
              returnKeyType="next"
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit={false}
              keyboardType="phone-pad"
              topTextstyle={{ color: dynamicTextColor }}
            />
          </View>

          <View
            style={{
              marginTop: moderateVerticalScale(20),
              marginBottom: moderateVerticalScale(5),
            }}
          >
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={{
                  ...styles.inputTopText,
                  color: dynamicTextColor,
                  marginBottom: moderateVerticalScale(5),
                }}
              >
                Subject
              </Text>
              <Text style={{ color: 'red' }}> *</Text>
            </View>
            <SelectDropdown
              data={allSubjects}
              onSelect={(selectedItem, index) => {
                setSubject(selectedItem);
              }}
              defaultButtonText={defaultText}
              buttonTextAfterSelection={() => {
                return subject;
              }}
              rowTextForSelection={(item, index) => {
                return item;
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
                backgroundColor: subject == defaultText ? '#EEEE' : brandColor,
              }}
            />

          </View>
          <>
            <View
              style={{
                flexDirection: 'row',
                marginTop: moderateVerticalScale(20),
                marginBottom: moderateVerticalScale(5),
              }}
            >
              <Text
                style={{
                  ...styles.inputTopText,
                  color: dynamicTextColor,
                }}
              >
                Message
              </Text>
              <Text style={{ color: 'red' }}> *</Text>
            </View>
            <View style={styles.SectionStyle}>
              <TextInput
                multiline={true}
                maxLength={500}
                underlineColorAndroid={ThemeConstant.LIGHT_BLACK}
                placeholder={fromUnsubscribe ? "Please let us know Plan name, amount and reason for unsubscribing it." : "Type your message in less than 500 characters"}
                placeholderTextColor={ThemeConstant.TEXT_COLOR_SUBTEXTS}
                autoCapitalize="sentences"
                secureTextEntry={false}
                returnKeyType="next"
                onSubmitEditing={Keyboard.dismiss}
                blurOnSubmit={false}
                // keyboardType="text"
                keyboardType={
                  Platform.OS === 'ios'
                    ? 'ascii-capable'
                    : 'visible-password'
                }
                onChangeText={(message) => setMessage(message)}
                value={message}
                style={{
                  ...styles.inputStyle,
                  textAlignVertical: 'top',
                }}
              />
            </View>
          </>

          <Text
            style={{
              ...styles.inputTopText,
              color: dynamicTextColor,
              marginTop: moderateVerticalScale(20),
              marginBottom: moderateVerticalScale(5),
            }}
          >
            File Attachment
          </Text>
          <View style={{
            flexDirection: 'row',
            height: moderateScale(40),
            position: 'relative',
            alignItems: "center",
            borderWidth: 1,
            borderRadius: scale(5),
            borderColor: '#dadae8',
            backgroundColor: '#fff'
          }}>

            {fileData.length > 0

              ? fileData.map((ls, index) => {
                return (
                  <View style={{ flexDirection: "row", width: "80%", marginLeft: moderateScale(5) }} key={index}>
                    <Text numberOfLines={2} style={{ fontSize: 12 }}>{ls.name}</Text>
                    <TouchableOpacity style={{ color: 'gray' }} onPress={() => { setAttachmentId(null); setFileData([]); }}>
                      <Entypo
                        name={'cross'}
                        size={15}
                      />
                    </TouchableOpacity>
                  </View>
                );
              })
              : null}

            <View style={styles.iconContainer}>
              <TouchableOpacity style={{ marginRight: 5 }} onPress={handleFilePicker}>
                <Feather
                  name={'paperclip'}
                  color={'gray'}
                  size={22}
                />
              </TouchableOpacity>
            </View>
          </View>
       
          {errortext != '' ? (
            <Text style={styles.errorTextStyle}> {errortext} </Text>
          ) : null}
          <CustomButton
            onPress={handleSubmitButton}
            butttonText={StringConstant.SUBMIT}
            inputStyle={{
              marginTop: moderateVerticalScale(24),
              backgroundColor: brandColor,
              borderWidth: 1,
              borderColor: '#fff'
            }}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};
export default contactUsFea;

const styles = StyleSheet.create({
  container: { flex: 1 },
  regContainer: {
    flex: 1,
    backgroundColor: ThemeConstant.PRIMARY_COLOR,
    justifyContent: 'center',
  },
  sectionStyle: {
    // borderRadius: pixelSizeHorizontal(5),
    // margin: pixelSizeHorizontal(10),
    // backgroundColor: ThemeConstant.BACKGROUND_COLOR,
    paddingHorizontal: moderateScale(24),

  },
  regLogo: {
    height: heightPixel(150),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  logoStyle: {
    width: '90%',
    height: heightPixel(240),
    resizeMode: 'contain',
  },
  mainContainer: { alignItems: 'center' },

  wrongInput: {
    borderColor: ThemeConstant.ERROR_COLOR,
  },
  errorTextStyle: {
    color: ThemeConstant.ERROR_COLOR,
    textAlign: 'center',
    fontSize: Percentage(14),
  },

  successTextStyle: {
    color: ThemeConstant.TEXT_COLOR_WHITE,
    textAlign: 'center',
    fontSize: Percentage(18),
    padding: pixelSizeHorizontal(30),
  },
  registerTextStyle: {
    color: ThemeConstant.TEXT_COLOR_LIGHT,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: Percentage(14),
    alignSelf: 'center',
    padding: pixelSizeHorizontal(10),
  },
  backArrow: {
    position: 'absolute',
    top: 10,
    left: 0,
    width: 40,
    height: 30,
  },
  textStyle: {
    fontSize: 15,
    marginBottom: 16,
    marginTop: 20,
    marginRight: 35,
    textAlign: 'center',
  },
  pickerstyles: {
    height: 60,
    width: "100%",
    color: "#000",
    justifyContent: "center",
    borderRadius: pixelSizeHorizontal(5),
    borderWidth: 1,
    borderColor: "black"
  },
  inputStyle: {
    flex: 1,
    color: '#000',
    paddingLeft: moderateScale(15),
    borderWidth: scale(1),
    borderRadius: scale(5),
    borderColor: '#dadae8',
  },
  SectionStyle: {
    height: moderateScale(100),
    position: 'relative',
    borderRadius: pixelSizeHorizontal(5),
    backgroundColor: '#fff'


  },
  inputTopText: {
    color: '#656565',
    color: ThemeConstant.TEXT_COLOR,
  },

  //select-dropdown-list libray
  dropdown1DropdownStyle: {
    backgroundColor: '#EFEFEF',
    borderRadius: 8,
    marginTop: verticalScale(-20),
  },
  dropdown1RowTxtStyle: {
    textAlign: 'left',
    fontSize: 14
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

  iconContainer: {
    position: 'absolute',
    right: moderateScale(10),
    zIndex: 2,
  },

});