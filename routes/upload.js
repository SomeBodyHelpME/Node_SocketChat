const express = require('express');
const router = express.Router();
const moment = require('moment');

const upload = require('../config/multer');
const db = require('../module/pool.js');
const statuscode = require('../module/statuscode.js');
const chatsql = require('../module/chatsql.js');

router.post('/photo/single', upload.single('photo'), async(req, res, next) => {
	var photo = null;
	if (!req.file) {
		res.status(400).send({
			message : "No Photo"
		});
	} else {
		photo = req.file.location;
		let chatroom_idx = req.body.chatroom_idx;
		let u_idx = req.body.u_idx;
		let write_time = moment().format('YYYY-MM-DD HH:mm:ss');
		let count = 0;
		let type = 1;

		let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
		let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [chatroom_idx]);

		if (!getChatroomCtrlName) {
			res.status(500).send({
				message : "Internal Server Error"
			});
		} else {
			let insertPhotoQuery = 'INSERT INTO chatroom.' + getChatroomCtrlName[0].ctrl_name + ' (u_idx, content, write_time, count, type) VALUES (?, ?, ?, ?, ?)';
			let insertPhoto = await db.queryParamCnt_Arr(insertPhotoQuery, [u_idx, photo, write_time, count, type]);

			if (!insertPhoto) {
				res.status(500).send({
					message : "Internal Server Error"
				});
			} else {
				let result = await chatsql.fcmSendWhenMakeThings(u_idx, chatroom_idx, statuscode.uploadSinglePhoto, insertPhoto.insertId, insertPhoto.insertId);
				res.status(201).send({
					message : "Success to Store Single Photo"
				});	
			}
		}
	}
});

router.post('/photo/array', upload.array('photo'), async(req, res, next) => {
	if (!req.files) {
		res.status(400).send({
			message : "No Photo"
		});
	} else {
		let chatroom_idx = req.body.chatroom_idx;
		let u_idx = req.body.u_idx;
		let write_time = moment().format('YYYY-MM-DD HH:mm:ss');
		let count = 0;
		let type = 2;

		let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
		let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [chatroom_idx]);

		if (!getChatroomCtrlName) {
			res.status(500).send({
				message : "Internal Server Error"
			});
		} else {
			for (let i = 0 ; i < req.files.length ; i++) {
				let insertPhotoQuery = 'INSERT INTO chatroom.' + getChatroomCtrlName[0].ctrl_name + ' (u_idx, content, write_time, count, type) VALUES (?, ?, ?, ?, ?)';
				var insertPhoto = await db.queryParamCnt_Arr(insertPhotoQuery, [u_idx, req.files[i].location, write_time, count, type]);

				if (!insertPhoto) {
					break;
				}
			}	

			if (!insertPhoto) {
				res.status(500).send({
					message : "Internal Server Error"
				});
			} else {
				let result = await chatsql.fcmSendWhenMakeThings(u_idx, chatroom_idx, statuscode.uploadMultiplePhoto, insertPhoto.insertId, insertPhoto.insertId);
				res.status(201).send({
					message : "Success to Store Photo Array"
				});
			}
		}
	}
});

router.post('/file', upload.single('file'), async(req, res, next) => {
	var file = null;
	if (!req.file) {
		res.status(400).send({
			message : "No file"
		});
	} else {
		file = req.file.location;
		let chatroom_idx = req.body.chatroom_idx;
		let u_idx = req.body.u_idx;
		let write_time = moment().format('YYYY-MM-DD HH:mm:ss');
		let count = 0;
		let type = 3;

		let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
		let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [chatroom_idx]);

		if (!getChatroomCtrlName) {
			res.status(500).send({
				message : "Internal Server Error"
			});
		} else {
			let insertFileQuery = 'INSERT INTO chatroom.' + getChatroomCtrlName[0].ctrl_name + ' (u_idx, content, write_time, count, type) VALUES (?, ?, ?, ?, ?)';
			let insertFile = await db.queryParamCnt_Arr(insertFileQuery, [u_idx, file, write_time, count, type]);

			if (!insertFile) {
				res.status(500).send({
					message : "Internal Server Error"
				});
			} else {
				let result = await chatsql.fcmSendWhenMakeThings(u_idx, chatroom_idx, statuscode.uploadFile, insertFile.insertId, insertFile.insertId);
				res.status(201).send({
					message : "Success to Store File"
				});	
			}
		}
	}
});

router.post('/video', upload.single('video'), async(req, res, next) => {
	var video = null;
	if (!req.file) {
		res.status(400).send({
			message : "No Video"
		});
	} else {
		video = req.file.location;
		let chatroom_idx = req.body.chatroom_idx;
		let u_idx = req.body.u_idx;
		let write_time = moment().format('YYYY-MM-DD HH:mm:ss');
		let count = 0;
		let type = 4;

		let getChatroomCtrlNameQuery = 'SELECT ctrl_name FROM tkb.group_chatroom WHERE chatroom_idx = ?';
		let getChatroomCtrlName = await db.queryParamCnt_Arr(getChatroomCtrlNameQuery, [chatroom_idx]);

		if (!getChatroomCtrlName) {
			res.status(500).send({
				message : "Internal Server Error"
			});
		} else {
			let insertVideoQuery = 'INSERT INTO chatroom.' + getChatroomCtrlName[0].ctrl_name + ' (u_idx, content, write_time, count, type) VALUES (?, ?, ?, ?, ?)';
			let insertVideo = await db.queryParamCnt_Arr(insertVideoQuery, [u_idx, video, write_time, count, type]);

			if (!insertVideo) {
				res.status(500).send({
					message : "Internal Server Error"
				});
			} else {
				let result = await chatsql.fcmSendWhenMakeThings(u_idx, chatroom_idx, statuscode.uploadVideo,  insertVideo.insertId, insertVideo.insertId);
				res.status(201).send({
					message : "Success to Store Video"
				});	
			}
		}
	}
});
module.exports = router;