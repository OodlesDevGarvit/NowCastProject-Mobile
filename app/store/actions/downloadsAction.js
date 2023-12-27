import { STORE_DOWNLOADS } from "./types"

export const storeDownloads =(data)=>{
    console.log('action is-----');
    return {
        type :STORE_DOWNLOADS,
        payload : data
    }
}