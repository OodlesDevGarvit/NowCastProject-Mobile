
import { db } from "./app/constant/ApiConstant";
import { storeDownloads } from "./app/store/actions/downloadsAction";
import { LOGIN_FAILED, STORE_DOWNLOADS } from "./app/store/actions/types";
import { store } from "./app/store/store";
import { checkDataPresentInTableWithSpecificChannelId, createConversationTable, deleteConversationWithChannelId, insertConversation, getAllFileNames, deleteAllConversationDataInTable, dropTableConversation } from "./query";
// import { checkDataPresentInTableWithSpecificChannelId, createConversationTable, deleteAllConversationDataInTable, deleteAllConversationWithType, deleteConversationWithChannelId, dropTableConversation, insertConversation } from "./conversationQueries";

/*
        Developed By: Oodles Technologies
      Dated On: 21-June-2022
        Description: Creating conversation table
        */

export const createConversationTableService = () => {
    db.transaction(tnx => {
        tnx.executeSql(
            createConversationTable,
            [],
            (sqlTnx, res) => {
                console.log(sqlTnx)
                //console.log("Table Creation for conversation Successfully", res);
            },
            error => {
                //console.log("error on creating conversation Table: " + error.message);
            },
        );
    });
}

/*
        Developed By: Oodles Technologies
      Dated On: 18-November-2022
        Description: Selecting enteries from table
        */
export const getFileNameService = () => {
    let final=[]
    db.transaction(tnx => {
        tnx.executeSql(
            getAllFileNames,
            [],
            (sqlTnx, res) => {
                // console.log(res.rows.length,res, 'sql tnx for getall file name')
                for (let index = 0; index < res.rows.length; index++) {
                    const element = res.rows.item(index);
                    final.push(element)
                    // //console.log('element is', element);
                }
                //console.log('final is',final);
                store.dispatch({type :STORE_DOWNLOADS,payload:final})
                
                return final

                // console.log("getting file_name successfully", res.rows.item(0));
            },
            error => {
                //console.log("error on getting file_name Table: " + error.message);
            },
        );
    });
}


/*
      Developed By: Oodles Technologies
      Dated On: 21-June-2022
      Description:Insert in to conversation table
      */


export const insertConversationService = (
    id,
    fileName,
    createdAt,
    type,
    iv,
    baseId,
    imagePath,
    userId,
    mediaItemId
) => {
    db.transaction(txn => {
        txn.executeSql(
            insertConversation
            , [
                id,
                fileName,
                createdAt,
                type,
                iv,
                baseId,
                imagePath,
                userId,
                mediaItemId
            ],
            (sqlTxn, res) => {
                console.log(`Conversation added successfully`, res);
            },
            error => {
                //console.log("error on Conversation " + error.message);
            },
        );
    });
}

/*
      Developed By: Oodles Technologies
      Dated On: 21-June-2022
      Description: Get conversation Data
      */


export const dropConversationDataTable = (setData) => {
    db.transaction(txn => {
        txn.executeSql(
            dropTableConversation,
            [],
            (sqlTnx, res) => {
                //console.log("Conversation Table dropped successfully");
            },
            error => {
                //console.log("error in dropping conversation Table:", error.message);
            },
        );
    });
};

/*
      Developed By: Oodles Technologies
      Dated On: 21-June-2022
      Description: Truncate conversation Data
      */


export const truncateConversationData = () => {
    db.transaction(txn => {
        txn.executeSql(
            deleteAllConversationDataInTable,
            [],
            (sqlTnx, res) => {
                //console.log("All data in cenversation Table Dropped");
            },
            error => {
                //console.log("error in Dropping conversation Table:", error.message);
            },
        );
    });
}



/*
      Developed By: Oodles Technologies
      Dated On: 21-June-2022
      Description: Set Favorite/Un-Fav conversation Data
      */


export const updateConversationTileStarStatusInDb = (channelId, status) => {
    db.transaction(txn => {
        txn.executeSql(
            `UPDATE conversation SET isFavorite = ${status} WHERE channelId = ${channelId}`, [],
            (sqlTnx, res) => {
                //console.log("item deleted successfull");
            },
            error => {
                //console.log("error in getting restaurant:", error.message);
            },
        );
    });
}



/*
      Developed By: Oodles Technologies
      Dated On: 21-June-2022
      Description: Set Favorite/Un-Fav conversation Data
      */


export const updateConversationTileDetailsInDb = async (createdAt, message, senderId, firstName, messageId, channelId, documentUrl) => {
    //console.log(createdAt, message, senderId, firstName, messageId, channelId, documentUrl)
    if (documentUrl === null) {
        await db.transaction(txn => {
            txn.executeSql(
                `UPDATE conversation SET createdAt = "${createdAt}", message = "${message}", sender = ${senderId}, firstName = "${firstName}", messageid = ${messageId}, documenturl = "" WHERE channelId = ${channelId}`,
                [],
                (sqlTnx, res) => {
                    //console.log("item updateConversationTileDetailsInDb successfull", res, sqlTnx);
                },
                error => {
                    //console.log("error in getting updateConversationTileDetailsInDb:", error.message);
                },
            );
        });
    } else {
        await db.transaction(txn => {
            txn.executeSql(
                `UPDATE conversation SET createdAt = "${createdAt}", message = "${message}", sender = ${senderId}, firstName = "${firstName}", messageid = ${messageId} WHERE channelId = ${channelId}`,
                [],
                (sqlTnx, res) => {
                    //console.log("item updateConversationTileDetailsInDb successfull", res, sqlTnx);
                },
                error => {
                    //console.log("error in getting updateConversationTileDetailsInDb:", error.message);
                },
            );
        });
    }

}



/*
      Developed By: Oodles Technologies
      Dated On: 21-June-2022
      Description: Delete Conversation Tile In Db
      */


export const deleteConversationTileInDb = (type) => {
    //console.log(`${deleteAllConversationWithType} "${type}"`)
    db.transaction(txn => {
        txn.executeSql(
            `${deleteAllConversationWithType} "${type}"`,
            [],
            (sqlTnx, res) => {
                //console.log("Deleting all conversations with type = ", type, res);
            },
            error => {
                //console.log("error in Deleting all conversations with type = ", type, error.message);
            },
        );
    });
}


/*
      Developed By: Oodles Technologies
      Dated On: 21-June-2022
      Description: Delete Conversation Tile In Db
      */


export const deleteConversationTileInDbWithChannelId = (channelId) => {
    //console.log(`${deleteConversationWithChannelId} ${channelId}`)
    db.transaction(txn => {
        txn.executeSql(
            `${deleteConversationWithChannelId} ${channelId}`,
            [],
            (sqlTnx, res) => {
                //console.log("Deleting all conversations with type = ", type, res);
            },
            error => {
                //console.log("error in Deleting all conversations with type = ", type, error.message);
            },
        );
    });
}


/*
      Developed By: Oodles Technologies
      Dated On: 21-June-2022
      Description: Get Conversation Tile In Db
      */


export const getConversationTileInDbWithFileName = (fileName) => {
    //console.log(`${checkDataPresentInTableWithSpecificChannelId}"${fileName}"`);
    let final = []
    db.transaction(txn => {
        txn.executeSql(
            `${checkDataPresentInTableWithSpecificChannelId}"${fileName}"`,
            [],
            (sqlTnx, res) => {
                //console.log(res.rows.item(0), "Message foun for saved")
                if (res.rows.length > 0) {
                    final.push(res.rows.item(0))
                }
            },
            error => {
                //console.log("error in checkDataPresentInTableWithSpecificChannelId all conversations with type = ", type, error.message);
            },
        );
    });
    return final
}