import { StyleSheet, Text, View, Image, useWindowDimensions } from 'react-native'
import React from 'react'
import { moderateVerticalScale, scale } from 'react-native-size-matters'

const BlurredHeader = ({ color, bannerImg, type = 'banner', screen = null }) => {
    const { width, height } = useWindowDimensions();
    return (
        <View style={[styles.container, { aspectRatio: type == 'banner' ? 1920 / 692 : 1920 / 1080 }]}>
            <Image
                source={{ uri: bannerImg }}
                style={{
                    width: width * 2,
                    height: '100%',
                    alignItems: 'center',
                    right: width * 0.5,
                    backgroundColor: color,
                }}
                blurRadius={3}
            />
            <View style={[styles.overlay, { aspectRatio: type == 'banner' ? 1920 / 692 : 1920 / 1080 }]} />
            {
                screen != 'mediaItem' && <View style={styles.centerContainer}>
                    <Image
                        source={{ uri: bannerImg }}
                        style={{
                            aspectRatio: type == 'banner' ? 1920 / 692 : 1920 / 1080,
                            backgroundColor: color,
                            borderRadius: scale(10)
                        }}
                    />

                </View>
            }
        </View>
    )
}

export default BlurredHeader

const styles = StyleSheet.create({
    container: {
        marginBottom: moderateVerticalScale(40),
        shadowRadius: 0,
        shadowOffset: {
            height: 0,
        },
        shadowColor: 'transparent',
        width: '100%',
        position: 'relative',
    },
    overlay: {
        width: '100%',
        position: 'absolute',
        zIndex: 2,
        backgroundColor: 'rgba(0,0,0,0.6)'
    },
    centerContainer: {
        position: 'absolute',
        zIndex: 3,
        width: '89%',
        alignSelf: 'center',
        top: moderateVerticalScale(50),
    }
})