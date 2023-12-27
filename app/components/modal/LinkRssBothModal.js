import { StyleSheet, View, Text,TouchableOpacity } from 'react-native'
import React from 'react';
import { Modal } from '../Modal';
import { moderateScale, scale } from 'react-native-size-matters';
import { useSelector } from 'react-redux';


 const LinkRssPaidOtpModal=({modal,setModal,price =null,goToCheckOut=null})=> {
    const { mobileTheme: theme, brandColor, website: websiteName, organizationName: orgName } = useSelector((state) => state.brandingReducer.brandingData);

    return (
        
      <Modal
        style={{ flex: 1 }}
        isVisible={modal}
        onRequestClose={() => {
          setModal(false);
        }}
      >
        <TouchableOpacity
          style={{ flex: 1, justifyContent: 'center' }}
          activeOpacity={1}
          onPress={() => {
            setModal(false);
          }}
        >
          <Modal.Container additionalStyles={{ height: 270 }}>
            {/* //one time payment modal with login on platform basis------------------------- */}
            <Modal.Body>
              <View style={{ width: '100%', height: '100%' }}>
                <Text
                  style={{
                    ...styles.textColorWhite,
                    color:
                      theme == 'DARK'
                        ? 'black'
                        : 'white',
                    fontSize: scale(15),
                    textAlign: 'center',
                  }}
                >
                To access this item you will have to subscribe to a plan.Or you can also buy this item for lifetime access,for that please click on Buy item button. 

                </Text>

              </View>
              <Modal.Footer>
                <View>
                  <TouchableOpacity
                    style={{
                      ...styles.btnn,
                      backgroundColor: brandColor,
                      marginBottom: moderateScale(9),

                    }}
                    styleFocused={styles.btnFocused}
                onPress={()=>{
                    goToCheckOut();
                }}
                  >
                    <Text
                      style={{
                        ...styles.btnTextModal,
                        color: '#fff',
                        fontSize: 12,
                      }}
                    >
                       Buy item ${price}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{
                      ...styles.btnn,
                      backgroundColor: brandColor,
                      marginBottom: moderateScale(9),

                    }}
                    styleFocused={styles.btnFocused}
                    onPress={() => {
                      setModal(false);
                    }}
                  >
                    <Text
                      style={{
                        ...styles.btnTextModal,
                        color: '#fff',
                        fontSize: 13,
                        // width:'100%'
                      }}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>
              </Modal.Footer>
            </Modal.Body>
          </Modal.Container>
        </TouchableOpacity>

      </Modal>

    )
  }

  export default LinkRssPaidOtpModal;


const styles = StyleSheet.create({

       //for linksBoth modal
       btnn: {
        borderRadius: 6,
        height: "52%",
        paddingHorizontal: 15,
        minWidth: '43%',
        justifyContent: "center",
        alignItems: "center",
        borderWidth: .8,
        borderColor: "#ffff"
    },
    btnTextModal: {
        fontWeight: "bold"
    },
})