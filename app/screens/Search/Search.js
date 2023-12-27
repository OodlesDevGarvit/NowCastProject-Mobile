import React, { useState, useEffect } from 'react'

import { View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native'

//importing Icons 
import SearchIcon from 'react-native-vector-icons/Feather'
import MicIcon from 'react-native-vector-icons/Entypo'
import AsyncStorage from '@react-native-async-storage/async-storage'

//importing constants----------------------------
import ThemeConstant from '../../constant/ThemeConstant';
import { DynamicThemeConstants } from '../../constant/ThemeConstant';
import { useSelector } from 'react-redux'

export default function Search({ navigation, route }) {

    const {mobileTheme:theme} = useSelector((state)=>state.brandingReducer.brandingData);
    //for the search bar - if it is focused some styles will change--
    const [focused, setFocused] = useState(false);

    //this is for the search bar when we will input something this will decide what will render below the search bar-
    const [searching, setSearching] = useState(false);

    //This is data that will render below search bar when searching is tru--
    const [Data, setData] = useState([]);

    //the value that you have to search on the text change in search bar----
    const [textToSearch, setTextToSearch] = useState('');

    //to filter the search result from the available data----
    useEffect(() => {
        const newData = Data.filter((item) => {
            if (item.title.toLowerCase().includes(textToSearch.toLowerCase())) {   ///toLowercase is added just  to make  this case-insensitive
                return item;
            }
        })

        setData(newData)
    }, [textToSearch]);



    return (
        <View style={
            {
                display: 'flex',
                flex: 1,
                backgroundColor: (theme == 'DARK') ? DynamicThemeConstants.DARK.BACKGROUND_COLOR_BLACK : DynamicThemeConstants.LIGHT.BACKGROUND_COLOR_WHITE,
                flexGrow: 1
            }
        }>
            <View style={{
                ...Styles.searchBar,
                borderColor: !focused ? 'rgba(211,211,211,0.4)' : '#0866F7'
            }}>
                <SearchIcon style={Styles.searchIcon} name="search" size={25} color={"gray"} />
                <TextInput
                    style={
                        {
                            ...Styles.textInput,
                            color: (theme == "DARK") ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                        }
                    }
                    placeholder="Search media..."
                    placeholderTextColor={(theme == "DARK") ? DynamicThemeConstants.DARK.TEXT_COLOR_SECONDARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY}
                    onPressIn={() => {
                        setFocused(true)
                    }}
                    onBlur={() => {
                        setFocused(false)
                        // setSearching(false)
                        // setTex
                    }}
                    onChangeText={(val) => {
                        if (val) {
                            setSearching(true)
                            setTextToSearch(val)
                        }
                        else {
                            setSearching(false)
                        }
                    }}
                />
            </View>


            {/* rendering content on condition if searching is true or false */}

            {
                !searching ?

                    // when we are not searching it will render screen Browse By

                    <View style={Styles.optionContainer}>
                        <Text style={
                            {
                                ...Styles.optionsHeader,
                                color: (theme == "DARK") ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                            }
                        }>Browse by</Text>
                        {/* <FlatList/> */}
                        <TouchableOpacity
                            onPress={() => {
                                navigation.navigate('Speakers', theme)
                            }}>
                            <View style={Styles.option}>
                                <MicIcon name="modern-mic" size={30} color={"#d3d3d3"} />
                                <Text style={
                                    {
                                        fontSize: 20,
                                        marginLeft: 15,
                                        color: (theme == "DARK") ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                                    }
                                }>Speaker</Text>
                            </View>
                        </TouchableOpacity>

                    </View> :

                    //rendering screen after checking if data is available--------
                    Data.length ?

                        //when we are searching something it will render the list of all matching results (if there are any)----
                    <View style={Styles.content}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                data={Data}
                                renderItem={({ item }) =>

                                    <TouchableOpacity onPress={() => {
                                        alert(`${item.id} pressed`)
                                    }}>
                                        <View style={
                                            {
                                                ...Styles.card
                                            }
                                        }>
                                            <Image style={Styles.cardImage} source={{ uri: "https://images.unsplash.com/photo-1630523628199-f2681ef83443?ixid=MnwxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxNXx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60" }} />
                                            <Text
                                                numberOfLines={1}
                                                style={
                                                    {
                                                        ...Styles.cardText,
                                                        color: (theme == "DARK") ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                                                    }
                                                }>
                                                {item.title}</Text>
                                        </View>

                                    </TouchableOpacity>

                                }
                                keyExtractor={item => item.id}
                            />
                        </View> :

                        //this will render when after searhching we do not find any matching data

                        <View style={Styles.noResult}>
                            <SearchIcon name="search" size={40} color={"gray"} />
                            <Text
                                style={
                                    {
                                        fontWeight: 'bold',
                                        marginTop: 15,
                                        fontSize: 18,
                                        color: (theme == "DARK") ? DynamicThemeConstants.DARK.TEXT_COLOR_PRIMARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_PRIMARY
                                    }
                                }>
                                No results found
                            </Text>
                            <Text
                                style={
                                    {
                                        color: 'rgba(0,0,0,0.5)',
                                        fontSize: 16,
                                        color: (theme == "DARK") ? DynamicThemeConstants.DARK.TEXT_COLOR_SECONDARY : DynamicThemeConstants.LIGHT.TEXT_COLOR_SECONDARY
                                    }
                                }>
                                Please try another search term
                            </Text>
                        </View>



            }


        </View >
    )
}

const Styles = StyleSheet.create({
    searchBar: {
        borderWidth: 2,
        borderColor: 'rgba(211,211,211,0.4)',
        backgroundColor: 'rgba(211,211,211,0.2)',
        display: 'flex',
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 20,
        height: 40,
        borderRadius: 10,


    },
    searchIcon: {
        // borderWidth: 1,
        textAlignVertical: 'center',
        paddingHorizontal: 10
    },
    textInput: {
        // borderWidth: 1,
        // borderColor: 'red',
        flexGrow: 1,
        padding: 0,
        fontSize: 18
    },
    optionContainer: {
        // borderWidth: 1,
        margin: 20,
        flexGrow: 1
    },
    optionsHeader: {
        borderBottomWidth: 1,
        borderBottomColor: '#d3d3d3',
        fontSize: 16,
        fontWeight: 'bold',
        paddingBottom: 20
    },

    option: {
        borderBottomWidth: 1,
        borderColor: '#D3D3D3',
        display: 'flex',
        flexDirection: 'row',
        paddingVertical: 20,
    },
    content: {
        // borderWidth: 1,
        marginHorizontal: 20,
        flex: 1,
        // marginBottom: 2,
        flexGrow: 1
    },
    card: {
        // borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#d3d3d3",
        height: 80,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        // padding: 10
    },
    cardImage: {
        borderWidth: 1,
        width: 90,
        height: 50,
        borderRadius: 5


    },
    cardText: {
        // borderWidth: 1,
        paddingLeft: 20,
        fontSize: 17,
        fontWeight: 'bold',
        maxHeight: 25,
        maxWidth: 250,
        flexGrow: 1
    },
    noResult: {
        // borderWidth: 1,
        marginHorizontal: 20,
        flex: 1,
        marginBottom: 2,
        flexGrow: 1,
        display: "flex",
        justifyContent: 'center',
        alignItems: 'center'

    }
})