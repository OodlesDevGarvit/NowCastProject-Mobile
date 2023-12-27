import React, { useEffect, useLayoutEffect, useState, useRef, useCallback } from 'react'
import { View, useWindowDimensions, TouchableOpacity, Text, ActivityIndicator } from 'react-native'
import { useSelector } from 'react-redux';
import Carousel from 'react-native-snap-carousel';
import { moderateScale, moderateVerticalScale, scale } from 'react-native-size-matters';
import FastImage from 'react-native-fast-image';
import Video from 'react-native-video';
import * as API from '../constant/APIs';
import * as API_CONSTANT from '../constant/ApiConstant';
import { navigateItem } from '../services/TabDesignsService';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import ThemeConstant from '../constant/ThemeConstant';
import { Styles } from '../components/StackTypeItem'
import CustomButton from './CustomButton';


const HeaderComponent = ({ listDesign }) => {

    const { token } = useSelector(state => state.authReducer);
    const { width } = useWindowDimensions()
    const refCarousel = useRef();
    const navigation = useNavigation();

    const [staticImage, setStaticImage] = useState(null);
    const [headerType, setHeaderType] = useState(null);
    const [CarouselImages, setCarouselImages] = useState([]);
    const [margin, setMargin] = useState(false); //true or false
    const [marginType, setMarginType] = useState('VERYTHIN');
    const [marginEdges, setMarginEdges] = useState('CURVE');
    const [staticBannercolor, setStaticBannerColor] = useState(null);
    const [carouselType, setCarouselType] = useState('');
    const [staticType, setStaticType] = useState('');
    const [order, setOrder] = useState('forward');
    const [activeSlide, setActiveSlide] = useState(0);
    const [shadow, setShadow] = useState(false);
    const [videoId, setVideoId] = useState(null);
    const [videoUrl, setVideoUrl] = useState(null);
    const [showBannerTransparency, setShowBannerTransparency] = useState(false);
    const [transparencyColor, setTransparencyColor] = useState('');
    const [transparencyCount, setTransparencyCount] = useState('');


    useEffect(() => {
        processData()
    }, [listDesign])

    //use for changing the carousel in android--
    useLayoutEffect(() => {
        let interval = setInterval(() => {
            if (order == 'forward') {
                if (activeSlide !== CarouselImages.length - 1) {
                    refCarousel?.current?.snapToItem(activeSlide + 1);
                } else {
                    setOrder('backward');
                }
            } else if (order == 'backward') {
                if (activeSlide != 0) {
                    refCarousel?.current?.snapToItem(activeSlide - 1);
                } else {
                    setOrder('forward');
                }
            }
        }, 3000);


        return () => clearInterval(interval);
    });


    const processData = () => {
        if (listDesign != null) {
            setCarouselType(listDesign.carouselType);
            setStaticType(listDesign.staticType);
            setHeaderType(listDesign.headerType);
            setVideoUrl(listDesign?.videoUrl);
            setVideoId(listDesign?.mediaItemId);
            setTransparencyColor(listDesign.transparencyColor)
            setShowBannerTransparency(listDesign.showBannerTransparency)
            setTransparencyCount(listDesign.transparencyCount)

            if (listDesign.margins !== null) {
                setMargin(listDesign.margins);
                if (listDesign.marginType !== null) {
                    setMarginType(listDesign.marginType);
                }
                if (listDesign.marginEdges !== null) {
                    setMarginEdges(listDesign.marginEdges);
                }
            }

            if (listDesign.shadow != null) {
                setShadow(listDesign.shadow);
            }

            //TO GET CAROUSEL IMAGES--
            let arr = [];
            if (
                listDesign.carouselContentsList != null &&
                listDesign.carouselContentsList.length > 0
            ) {
                if (listDesign.carouselType == 'WIDE') {
                    listDesign.carouselContentsList.forEach((item) => {
                        arr.push({
                            image: `${API.IMAGE_LOAD_URL}/${item?.wideArtwork?.document?.id}?${API_CONSTANT.STACK_WIDE}`,
                            color: item?.wideArtwork?.document?.imageColur,
                            item: item,
                        });
                    });
                } else {
                    listDesign.carouselContentsList.forEach((item) => {
                        arr.push({
                            image: `${API.IMAGE_LOAD_URL}/${item?.bannerArtwork?.document?.id}?${API_CONSTANT.BANNER_IMAGE_HEIGHT_WIDTH}`,
                            color: item?.bannerArtwork?.document?.imageColur,
                            item: item,
                        });
                    });
                }
            }
            if (arr && arr.length > 0) {
                setCarouselImages(arr);
            }

            //TO GET STATIC IMAGE---
            if (listDesign.headerType == "STATIC") {
                if (listDesign.staticType == 'WIDE') {
                    setStaticImage(
                        `${API.IMAGE_LOAD_URL}/${listDesign.staticImageId}?${API_CONSTANT.WIDE_IMAGE_HEIGHT_WIDTH}`
                    );
                } else {
                    setStaticImage(
                        `${API.IMAGE_LOAD_URL}/${listDesign.landscapeImageId}?${API_CONSTANT.BANNER_IMAGE_HEIGHT_WIDTH}`
                    );
                }

                if (listDesign.staticImageColor != null || listDesign.landscapeImageColor != null) {
                    if (listDesign.staticType == 'WIDE') {
                        setStaticBannerColor(listDesign?.staticImageColor ? listDesign?.staticImageColor : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR);
                    } else {
                        setStaticBannerColor(listDesign?.landscapeImageColor ? listDesign?.landscapeImageColor : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR);
                    }
                }
            }
        }


    }

    const _handlesCarouselPress = async (item) => {
        navigateItem(item.item, token, navigation);
    };

    const renderItem = ({ item, index }) => {
        return (
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => {
                    _handlesCarouselPress(item);
                }}
            >
                <ImageComp item={item} carouselType={carouselType} margin={margin} marginEdges={marginEdges} showBannerTransparency={showBannerTransparency}
                    transparencyColor={transparencyColor} transparencyCount={transparencyCount} listDesign={listDesign}
                />

            </TouchableOpacity >
        );
    };

    return (
        <>
            {
                headerType == 'OFF' ?
                    null :
                    headerType == 'STATIC' && staticImage != null && staticImage != '' ?
                        (
                            staticType == "VIDEO" ?
                                <VideoCompStatic margin={margin} marginEdges={marginEdges} listDesign={listDesign} videoId={videoId} videoUrl={videoUrl} navigation={navigation} />
                                :
                                <ImageCompStatic staticType={staticType} margin={margin} marginEdges={marginEdges} staticBannercolor={staticBannercolor} staticImage={staticImage} listDesign={listDesign} />
                        )

                        :
                        headerType == 'CAROUSEL' && CarouselImages !== null && CarouselImages.length > 0 ?
                            <Carousel
                                ref={refCarousel}
                                layout={'default'}
                                autoplayInterval={3000}
                                data={CarouselImages}
                                sliderWidth={width}
                                autoplay={false}
                                loop={false}
                                // inactiveSlideShift={1}
                                inactiveSlideScale={1}
                                inactiveSlideOpacity={1}
                                activeSlideAlignment={'start'}
                                enableSnap={true}
                                slideStyle={{
                                    paddingRight: margin && listDesign.itemLayout !== 'ROWS' ?
                                        marginType === 'VERYTHIN'
                                            ? ThemeConstant.MARGIN_VERY_THIN
                                            : marginType === 'THIN'
                                                ? ThemeConstant.MARGIN_THIN
                                                : ThemeConstant.MARGIN_THICK
                                        :
                                        0
                                }}
                                itemWidth={
                                    margin && listDesign.itemLayout !== 'ROWS' ?
                                        marginType === 'VERYTHIN'
                                            ? width - ThemeConstant.MARGIN_VERY_THIN * 2 + ThemeConstant.MARGIN_VERY_THIN
                                            : marginType === 'THIN'
                                                ? width - ThemeConstant.MARGIN_THIN * 2 + ThemeConstant.MARGIN_THIN
                                                : width - ThemeConstant.MARGIN_THICK * 2 + ThemeConstant.MARGIN_THICK
                                        :
                                        width
                                }
                                renderItem={renderItem}
                                onSnapToItem={(index) => {
                                    setActiveSlide(index);
                                }}
                            />
                            :
                            null
            }
        </>
    )
}

const ImageComp = ({ item, carouselType, margin, marginEdges, transparencyColor, transparencyCount, showBannerTransparency, listDesign }) => {
    const [showBg, setShowBg] = useState(true);
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: showBg ? item.color ? item.color : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR : null,
                borderRadius: margin && marginEdges === 'CURVE' ? 10 : 0,
                overflow: 'hidden',
                marginTop: moderateVerticalScale(-1)
            }}
        >
            <FastImage
                source={{ uri: item.image }}
                style={{
                    width: '100%',
                    aspectRatio: carouselType == "WIDE" ? 16 / 9 : 1920 / 692,
                    borderRadius: margin && marginEdges === 'CURVE' ? 10 : 0,
                }}
                onLoad={() => {
                    setShowBg(false)
                }}
                resizeMode={FastImage.resizeMode.contain}

            />
            {
                listDesign?.itemTitles == "OVERLAY" &&
                <>
                    <View style={{
                        borderRadius: margin && marginEdges === 'CURVE' ? scale(10) : 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        position: 'absolute',
                        aspectRatio: carouselType == "WIDE" ? 16 / 9 : 1920 / 692,
                        zIndex: 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        paddingHorizontal: moderateScale(15)
                    }}>
                        <Text numberOfLines={1}
                            style={{
                                ...Styles.title,
                                color: '#fff',
                                width: '92%',
                                textAlign: 'center',
                                elevation: 8,
                                textShadowColor: 'rgba(0, 0, 0, 0.75)s)',
                                textShadowOffset: { width: .5, height: 1 },
                                textShadowRadius: 0,
                                fontSize: scale(19),
                                letterSpacing: scale(-0.5)
                            }}
                            includeFontPadding={false}>{item?.item?.title}</Text>
                        <Text numberOfLines={1}
                            style={{
                                ...Styles.description,
                                width: '95%',
                                textAlign: 'center',
                                color: '#fff',
                                elevation: 8,
                                textShadowColor: 'rgba(0, 0, 0, 0.75)s)',
                                textShadowOffset: { width: 1, height: 1 },
                                textShadowRadius: 4,
                                fontSize: scale(14),
                                marginTop: Platform.OS == 'android' ? moderateVerticalScale(-6) : moderateVerticalScale(-4)
                            }}>{item?.item?.subTitle}</Text>
                    </View>
                    {
                        showBannerTransparency &&
                        <View style={{
                            borderRadius: margin && marginEdges === 'CURVE' ? scale(10) : 0,
                            width: '100%',
                            display: 'flex',
                            position: 'absolute',
                            backgroundColor: transparencyColor,
                            opacity: transparencyCount / 10,
                            aspectRatio: carouselType == "WIDE" ? 16 / 9 : 1920 / 692,

                        }}>
                        </View>
                    }
                </>
            }
        </View>
    )
}

const ImageCompStatic = ({ staticType, margin, marginEdges, staticBannercolor, staticImage, listDesign }) => {
    const [showBg, setShowBg] = useState(true);
    return (
        <View
            style={{
                backgroundColor:
                    showBg ?
                        staticBannercolor != null
                            ? staticBannercolor
                            : ThemeConstant.DEFAULT_IMAGE_BACKGROUND_COLOR
                        : null,
                borderRadius: margin && marginEdges === 'CURVE' && listDesign.itemLayout != 'ROWS' ? scale(14) : 0,
                marginHorizontal: !margin ? -1 : 0
            }}
        >
            <FastImage
                source={{ uri: staticImage }}
                style={{
                    borderRadius: margin && marginEdges === 'CURVE' && listDesign.itemLayout != 'ROWS' ? scale(10) : 0,
                    width: '100%',
                    aspectRatio: staticType == 'WIDE' ? 16 / 9 : 1920 / 692,

                }}
                onLoad={() => setShowBg(false)}
                resizeMode={FastImage.resizeMode.contain}
            />
            {
                listDesign?.itemTitles == "OVERLAY" && listDesign.showBannerTransparency &&
                <View style={{
                    borderRadius: margin && marginEdges === 'CURVE' && listDesign.itemLayout != 'ROWS' ? scale(10) : 0,
                    width: '100%',
                    display: 'flex',
                    position: 'absolute',
                    backgroundColor: listDesign.transparencyColor,
                    opacity: listDesign.transparencyCount / 10,
                    aspectRatio: staticType == 'WIDE' ? 16 / 9 : 1920 / 692,

                }}>

                </View>
            }
        </View>
    )
}

const VideoCompStatic = ({ margin, marginEdges, listDesign, videoUrl, videoId, navigation }) => {

    const videoHeaderRef = useRef();
    const route = useRoute();
    const [currentTime, setCurrentTime] = useState(null);
    const [paused, setPaused] = useState(false)
    const [isBuffering, setIsBuffering] = useState(true);

    const _handleOnProgress = (progress) => {
        setCurrentTime(Math.floor(progress.currentTime));
    };

    const _handleOnEnd = () => {
        setCurrentTime(0);
    }

    const _handleOnLoad = () => {
        setIsBuffering(false)
    }

    useFocusEffect(
        React.useCallback(() => {
            setPaused(false)
        }, [])
    )

    return (
        <TouchableOpacity
            onPress={() => {
                setPaused(true)
                navigation.navigate('VideoPlayer', { fromHeader: true, videoId: videoId, videoUrlHeader: videoUrl, currentTimeHeader: currentTime })
            }}>
            <View
                style={{
                    backgroundColor: '#000',
                    overflow: 'hidden',
                    borderRadius: margin && marginEdges === 'CURVE' && listDesign.itemLayout != 'ROWS' ? scale(14) : 0,
                }}
            >
                {
                    isBuffering &&
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1,
                        height: '100%',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <ActivityIndicator animating={true} color={'#d3d3d3'} size={'large'} />
                    </View>
                }
                <Video
                    ref={videoHeaderRef}
                    paused={paused ? true : false}
                    onProgress={_handleOnProgress}
                    playWhenInactive={true}
                    onEnd={_handleOnEnd}
                    source={{
                        uri: videoUrl
                    }}
                    style={{
                        aspectRatio: 1920 / 1080,
                        backgroundColor: '#000'
                    }}
                    onBuffer={({ isBuffering }) => {
                        if (isBuffering) {
                            setIsBuffering(true);
                        } else {
                            setIsBuffering(false);
                        }
                    }}
                    useTextureView={false}
                    playInBackground={true}
                    disableFocus={true}
                    muted
                    repeat
                    resizeMode={'cover'}
                />
            </View>
        </TouchableOpacity>
    )
}


export default HeaderComponent