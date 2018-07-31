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
  getChatroomList : async (...args) => {
    let u_idx = args[0];
    let g_idx = args[1];

    let findUserJoinedQuery = 'SELECT chatroom_idx FROM tkb.chatroom_joined WHERE u_idx = ? AND g_idx = ?';
    let findUserJoined = await db.queryParamCnt_Arr(findUserJoinedQuery, [u_idx, g_idx]);

    if (findUserJoined && findUserJoined.length > 0) {
      let result = [];
      for (let i = 0 ; i < findUserJoined.length ; i++) {
        let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
        let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [findUserJoined[i].chatroom_idx]);

        let getLastMessageQuery = 'SELECT * FROM chatroom.' + getChatroomCtrlName[0].ctrl_name + ' ORDER BY chat_idx DESC LIMIT 1';
        let getLastMessage = await db.queryParamCnt_None(getLastMessageQuery);

        getLastMessage[0].chatroom_idx = findUserJoined[i].chatroom_idx;
        result.push(getLastMessage[0]);
      }
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
    let getLastMessage = await db.queryParamCnt_None(getLastMessageQuery]);

    if (getChatroomCtrlName && getLastMessage && getLastMessage.length > 0) {
      getLastMessage[0].chatroom_idx = findUserJoined[i].chatroom_idx;
      return getLastMessage[0];
    } else {
      return false;
    }
  }
};