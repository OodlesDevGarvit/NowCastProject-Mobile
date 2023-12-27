// Queries for Conversations Table
export const createConversationTable = `CREATE TABLE IF NOT EXISTS file_name (
    id INTEGER(20) PRIMARY KEY,
    fileName VARCHAR(200),
    createdAt VARCHAR(100),
    type VARCHAR(20),
    iv VARCHAR(1000),
    baseId VARCHAR(1000),
    imagePath VARCHAR(2000),
    userId VARCHAR(1000),
    mediaItemId VARCHAR(200)
    )`

export const insertConversation = `INSERT INTO file_name (
        id,
        fileName,
        createdAt,
        type,
        iv,
        baseId,
        imagePath,
        userId,
        mediaItemId
        ) VALUES (?,?,?,?,?,?,?,?,?)`

        export const getAllFileNames = `SELECT * FROM file_name`;

        export const fetchAllSortedConversationDataFromTable = `SELECT * FROM file_name WHERE `
        export const dropTableConversation = `DROP TABLE IF EXISTS file_name`
        export const deleteAllConversationWithType = `DELETE FROM file_name WHERE type =`
        export const deleteConversationWithChannelId = `DELETE FROM file_name WHERE channelId =`
        export const checkDataPresentInTableWithSpecificChannelId = `SELECT * FROM file_name WHERE fileName =`
        export const deleteAllConversationDataInTable = `DELETE FROM file_name`
        
        // Personal Tab Operations In conversation tables 
        export const fetchPersonalConversationDataFromTable = `SELECT * FROM file_name WHERE type= "PERSONAL" ORDER BY createdAt DESC`
        export const deletePersonalConversationsFromTable = `DELETE FROM file_name WHERE type = "PERSONAL"`
        
        // Channel Tab Operations In conversation tables 
        export const fetchMychannelConversationDataFromTable = `SELECT * FROM file_name WHERE type= "MYCHANNEL" ORDER BY createdAt DESC`
        
        // Task Tab Operations In conversation tables 
        export const fetchTaskConversationDataFromTable = `SELECT * FROM file_name WHERE type= "TASK" ORDER BY createdAt DESC`
        
        // Escalation Tab Operations In conversation tables 
        
        // Queries collections which are not used 
        export const updateValueInConversation = `UPDATE file_name SET firstName = "Rahul", lastName = "Singh" WHERE userId = 22`
        export const createFullConversationTile = `SELECT * FROM file_name WHERE channelId = `
        export const fetchParticipiantWithUserId = `SELECT * FROM file_name WHERE userId = `
        
        // Inserting unique entry in the table
        export const insertIntoTableIfUniqueEntry = `INSERT ignore INTO demo (name, address, tele)
        SELECT * FROM (SELECT 'Rupeart', 'Somaewhere', '022') AS tmp
        WHERE NOT EXISTS (
            SELECT name FROM demo WHERE name = 'Rupert'
        ) LIMIT 1;
        `