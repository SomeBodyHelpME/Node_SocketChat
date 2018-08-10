const async = require('async');
const moment = require('moment');

const pool = require('../config/dbPool.js');
const db = require('./pool.js');

// FCM
const FCM = require('fcm-node');
const serverKey = require('../config/serverKey').key;
const fcm = new FCM(serverKey);

/* groupName get */
// let searchGroupInfoQuery = 'SELECT * FROM tkb.group WHERE g_idx = ?';
// let searchGroupInfo = await db.queryParamCnt_Arr(searchGroupInfoQuery, [g_idx]);

/* Join 한 User 의 g_idx get */
// let findUserJoinedQuery = 'SELECT g_idx FROM tkb.joined WHERE u_idx = ?';
// let findUserJoined = await db.queryParamCnt_Arr(findUserJoinedQuery, [u_idx]);

// table name : chattest -> getChatroomCtrlName[0].ctrl_name

module.exports = {
	// makeNewChatroomTable : async (...args) => {
	// 	let ctrl_name = args[0];

	// 	let createTableQuery = `
	// 	CREATE TABLE IF NOT EXISTS chatroom.` + ctrl_name + ` (
 //      chat_idx INT(11) NOT NULL AUTO_INCREMENT,
 //      content TEXT NULL DEFAULT NULL,
 //      write_time VARCHAR(45) NULL DEFAULT NULL,
 //      count INT(11) NULL DEFAULT NULL,
 //      u_idx INT(11) NULL DEFAULT NULL,
 //      type INT(11) NULL DEFAULT NULL,
 //      PRIMARY KEY (chat_idx))
 //    ENGINE = InnoDB
 //    DEFAULT CHARACTER SET = utf8`;
 //    let createTable = await db.queryParamCnt_None(createTableQuery);
 //    console.log(createTable);
 //    return createTable;
	// },
	getChatroomList : async (...args) => {
    let u_idx = args[0];
    let g_idx = args[1];

    let findUserJoinedQuery = 'SELECT chatroom_idx FROM tkb.chatroom_joined WHERE u_idx = ? AND g_idx = ?';
    let findUserJoined = await db.queryParamCnt_Arr(findUserJoinedQuery, [u_idx, g_idx]);

    let result = [];
    if (findUserJoined && findUserJoined.length > 0) {
      for (let i = 0 ; i < findUserJoined.length ; i++) {
        let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
        let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [findUserJoined[i].chatroom_idx]);

        let getLastMessageQuery = 'SELECT * FROM chatroom.' + getChatroomCtrlName[0].ctrl_name + ' ORDER BY chat_idx DESC LIMIT 1';
        let getLastMessage = await db.queryParamCnt_None(getLastMessageQuery);

        let getEndPointQuery = 'SELECT value FROM chatroom.endpoint WHERE u_idx = ? AND chatroom_idx = ?';
				let getEndPoint = await db.queryParamCnt_Arr(getEndPointQuery, [u_idx, findUserJoined[i].chatroom_idx]);

				let unReadCount = getLastMessage[0].chat_idx - getEndPoint[0].value;
        getLastMessage[0].chatroom_idx = findUserJoined[i].chatroom_idx;
        getLastMessage[0].unreadcount = unReadCount;
        result.push(getLastMessage[0]);
      }

      result.sort(function(a, b) {      // descending order
	      return a.write_time > b.write_time ? -1 : a.write_time < b.write_time ? 1 : 0;
	    });

      return result;
    } else {
      return false;
    }
  },
  getSingleChatroomSingleMessage : async (...args) => {
    let u_idx = args[0];
    let chatroom_idx = args[1];

    let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
    let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [findUserJoined[i].chatroom_idx]);

    let getLastMessageQuery = 'SELECT * FROM chatroom.' + getChatroomCtrlName[0].ctrl_name + ' ORDER BY chat_idx DESC LIMIT 1';
    let getLastMessage = await db.queryParamCnt_None(getLastMessageQuery);

    if (getChatroomCtrlName && getLastMessage && getLastMessage.length > 0) {
      getLastMessage[0].chatroom_idx = findUserJoined[i].chatroom_idx;
      return getLastMessage[0];
    } else {
      return false;
    }
  },
	insertNewMessage : async (...args) => {
		let u_idx = args[0];
		let chatroom_idx = args[1];
		let content = args[2];
		let count = args[3];
		let type = args[4];
		let write_time = moment().format('YYYY-MM-DD HH:mm:ss');

		let getAllMemberCountQuery = 'SELECT count(*) AS count FROM tkb.chatroom_joined WHERE chatroom_idx = ?';
		let getAllMemberCount = await db.queryParamCnt_Arr(getAllMemberCountQuery, [chatroom_idx]);

		let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
		let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [chatroom_idx]);


		let insertMessageQuery = 'INSERT INTO chatroom.' + getChatroomCtrlName[0].ctrl_name + ' (u_idx, content, write_time, count, type) VALUES (?, ?, ?, ?, ?)';
		let insertMessage = await db.queryParamCnt_Arr(insertMessageQuery, [u_idx, content, write_time, getAllMemberCount[0].count - count, type]);

		if (!getAllMemberCount || !getChatroomCtrlName || !insertMessage) {
			return false;
		} else {
			return {
				"chatroom_idx" : chatroom_idx,
				"chat_idx" : insertMessage.insertId,
				"content" : content,
				"write_time" : write_time,
				"count" : getAllMemberCount[0].count - count,
				"u_idx" : u_idx,
				"type" : type
			};
		}
	},
	enterChatroom : async (...args) => {
		let u_idx = args[0];
		let chatroom_idx = args[1];

		let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
		let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [chatroom_idx]);

		let getEndPointQuery = 'SELECT value FROM chatroom.endpoint WHERE u_idx = ? AND chatroom_idx = ?';
		let getEndPoint = await db.queryParamCnt_Arr(getEndPointQuery, [u_idx, chatroom_idx]);

		if (!getChatroomCtrlName || !getEndPoint || getEndPoint.length === 0) {
			return false;
		} else {
			let updateChatroomCountQuery = 'UPDATE chatroom.' + getChatroomCtrlName[0].ctrl_name + ' SET count = count - 1 WHERE chat_idx > ? AND type = ?';
			let updateChatroomCount = await db.queryParamCnt_Arr(updateChatroomCountQuery, [getEndPoint[0].value, 0]);

			return true;
		}
	},
	leaveChatroom : async (...args) => {
		let u_idx = args[0];
		let chatroom_idx = args[1];

		let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
		let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [chatroom_idx]);

		let getEndPointQuery = 'SELECT chat_idx FROM chatroom.' + getChatroomCtrlName[0].ctrl_name + ' ORDER BY chat_idx DESC LIMIT 1';
		let getEndPoint = await db.queryParamCnt_None(getEndPointQuery);

		if (!getChatroomCtrlName || !getEndPoint) {
			return false;
		} else {
			if (getEndPoint.length === 0) {
				return true;
			} else {
				let updateEndPointQuery = 'UPDATE chatroom.endpoint SET value = ? WHERE u_idx = ? AND chatroom_idx = ?';
				let updateEndPoint = await db.queryParamCnt_Arr(updateEndPointQuery, [getEndPoint[0].chat_idx, u_idx, chatroom_idx]);

				return true;
			}
		}
	},
	uploadSingleFile : async (...args) => {
		let u_idx = args[0];
		let chatroom_idx = args[1];
		let file = args[2];

		let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
		let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [chatroom_idx]);

		
		let insertFileQuery = 'INSERT INTO chatroom.' + getChatroomCtrlName[0].ctrl_name + ' (u_idx, content, write_time, count, type) VALUES (?, ?, ?, ?, ?)';
		let insertFile = await db.queryParamCnt_Arr(insertFileQuery, [u_idx, file, moment().format('YYYY-MM-DD HH:mm:ss', count, 1)]);
		
		if (!getChatroomCtrlName || !insertFile) {
			return false;
		} else {
			return insertFile;
		}
	},
	// 여러 파일 업로드
	// uploadFiles : async (...args) => {
	// 	let u_idx = args[0];
	// 	let chatroom_idx = args[1];
	// 	let fileArray = args[2];

	// 	let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
	// 	let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [chatroom_idx]);

	// 	for (let i = 0 ; i < fileArray.length ; i++) {
	// 		let insertFileQuery = 'INSERT INTO chatroom.' + getChatroomCtrlName[0].ctrl_name + '_file' + ' (chat_idx, file_url) VALUES (?, ?)';
	// 		let insertFile = await db.queryParamCnt_Arr(insertFileQuery, [chat])
	// 	}
	// },
	showAllMessage : async (...args) => {
		let u_idx = args[0];
		let chatroom_idx = args[1];

		let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
		let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [chatroom_idx]);

		let getAllMessageQuery = 'SELECT * FROM chatroom.' + getChatroomCtrlName[0].ctrl_name + ' ORDER BY chat_idx ASC';
		let getAllMessage = await db.queryParamCnt_None(getAllMessageQuery);

		if (!getChatroomCtrlName || !getAllMessage) {
			return false;
		} else {
			return getAllMessage;
		}
	},
	pagingMessage : async (...args) => {
		let u_idx = args[0];
		let chatroom_idx = args[1];
		let page = args[2];

		let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
		let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [chatroom_idx]);

		let getPageMessageQuery = 'SELECT * FROM chatroom.' + getChatroomCtrlName[0].ctrl_name + ' ORDER BY chat_idx DESC LIMIT ';		// 수정 필요 조금 더 생각을 해보자
		let getPageMessage = await db.queryParamCnt_None(getAllMessageQuery);
		
		if (!getChatroomCtrlName || !getPageMessage) {
			return false;
		} else {
			return getPageMessage;
		}
	}

};