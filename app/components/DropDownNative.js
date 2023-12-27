import React from 'react'
import { Select, CheckIcon } from "native-base";
import { moderateScale } from 'react-native-size-matters';
import { Platform } from 'react-native';

const DropDownNative = ({ value, setValue, options, placeholder }) => {
    return (

        <Select
            _actionSheet={{
                useRNModal: Platform.OS == 'ios',
            }}
            style={{
        }} selectedValue={value} accessibilityLabel="Select Service" placeholder={placeholder ?? 'placeholder'}
            _selectedItem={{
                bg: 'red',
            }}
            _important={{ fontSize: 12, color: 'black', height: moderateScale(40) }}
            onValueChange={itemValue => setValue(itemValue)}>
            {
                options.map((item, index) => {
                    return (
                        < Select.Item key={index} label={item.name} value={item?.code2 ? item?.code2 : item?.code} />
                    )
                })
            }

        </Select>
    )
}

export default DropDownNative
