const express = require('express');
const router = express.Router();

const sql = require('../module/sql.js');
const jwt = require('../module/jwt.js');

router.get('/:g_idx', async(req, res) => {
	let token = req.headers.token;
  let decoded = jwt.verify(token);
  if (decoded === -1) {
    res.status(400).send({
      message : "Verification Failed"
    });
  } else {
    let u_idx = decoded.u_idx;
		let g_idx = req.params.g_idx;

		let result = await sql.getChatroomList(u_idx, g_idx);

		if (!result) {
			res.status(500).send({
				message : "Internal Server Error"
			});
		} else {
			res.status(200).send({
				message : "Success to Get Chatroom List",
				data : result
			});
		}
	}
});

router.get('/single/:chatroom_idx', async(req, res) => {
	let token = req.headers.token;
	let decoded = jwt.verify(token);
	if (decoded === -1) {
		res.status(400).send({
			message : "Verification Failed"
		});
	} else {
		let u_idx = decoded.u_idx;
		let chatroom_idx = req.params.chatroom_idx;

		let result = await sql.getSingleChatroomSingleMessage(u_idx, chatroom_idx);

		if (!result) {
			res.status(500).send({
				message : "Internal Server Error"
			});
		} else {
			res.status(200).send({
				message : "Success to Get Single Message",
				data : result
			});
		}
	}
});

module.exports = router;