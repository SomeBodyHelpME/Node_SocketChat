var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

var server = require('http').createServer(app);
var root_io = require('socket.io')(server);
const chatsql = require('./module/chatsql.js');
const statuscode = require('./module/statuscode.js');


// \/(\d+)$

// global entry point for new connections
root_io.of(/\/(\d+)$/).on('connection', function (socket) {
  // extract namespace from connected url query param 'ns'
  // var ns = url.parse(socket.handshake.url, true).query.ns;
  const newNsp = socket.nsp;
  console.log('Namespace : ', newNsp.name);
  let namespace = newNsp.name;

  socket.on('enterchatlist', async function (data) {
  	var data = JSON.parse(data);
  	let u_idx = data.u_idx;
  	let g_idx = namespace.slice(1);
  	socket.namespace = g_idx;
  	console.log("root_io.sockets : ", root_io.sockets);
  	let result = await chatsql.getChatroomList(u_idx, g_idx);
		console.log("g_idx : ", g_idx);
		console.log("result : ", result);

  	if (!result) {
  		socket.emit('listresult', null);
  	} else {
  		socket.emit('listresult', result);
  	}
  });

  socket.on('leavechatlist', async function () {
  	socket.namespace = 0;
  	socket.disconnect();
  });

  // socket.on('leavechatlisttrue', async function () {
  // 	socket.namespace = 0;
  // 	console.log("leavechatlisttrue");
  // 	console.log("before root_io.sockets : ", root_io.sockets);
  // 	socket.disconnect(true);
  // 	console.log("after root_io.sockets : ", root_io.sockets);
  // 	socket.emit('leavechatlisttrueresult', 'leavechatlisttrueresult');
  // });

  // socket.on('leavechatlistfalse', async function () {
  // 	socket.namespace = 0;
  // 	console.log("leavechatlistfalse");
  // 	console.log("before root_io.sockets : ", root_io.sockets);
  // 	socket.disconnect(false);
  // 	console.log("after root_io.sockets : ", root_io.sockets);
  // 	socket.emit('leavechatlistfalseresult', 'leavechatlistfalseresult');
  // });

	console.log('client connected');
	// when the client emits 'adduser', this listens and executes
	socket.on('adduser', async function (data) {
		var data = JSON.parse(data);
		let u_idx = data.u_idx;
		let chatroom_idx = data.chatroom_idx;
		
		
		console.log("updatechat");
		console.log(data);
		
		let result = await chatsql.showAllMessage(u_idx, chatroom_idx);
		
		if (!result) {
			socket.emit('adduser', null);	
		} else {
			socket.emit('adduser', result);	
		}
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('enterroom', async function (data) {
		var data = JSON.parse(data);
		let u_idx = data.u_idx;
		let chatroom_idx = data.chatroom_idx;
		
		let exitflag = true;		// 정상종료 flag / true 가 정상종료, false 가 강제 종료
		let existflag = false;	// 챗룸에 들어와있는지 테스트하는 flag / true 가 for문내에서 찾았을 때, false는 for문내에 없을 때 
		socket.join(chatroom_idx);
		socket.room = chatroom_idx;
		console.log('before enter dev2 : ', root_io.userlist);
		if (!root_io.userlist) {		// array 생성 전
			root_io.userlist = [{"room_id" : chatroom_idx, "members" : [u_idx]}];
		} else {
			for (let i = 0 ; i < root_io.userlist.length ; i++) {
				if (root_io.userlist[i].room_id === chatroom_idx) {		// 이미 한 사람이 들어와 있을 때
					var found = root_io.userlist[i].members.find(function (element) {
						return element === u_idx;
					});
					console.log("found : ", found);
					if (!found) {
						exitflag = true;
						root_io.userlist[i].members.push(u_idx);	// 정상종료
					} else {
						exitflag = false;													// 강제종료
					}
					existflag = true;
					break;
				}
			}

			if (!existflag) {		// 내가 그 방에 처음 들어갈 때
				root_io.userlist.push({"room_id" : chatroom_idx, "members" : [u_idx]});
			}
		}
		console.log('after enter dev2 : ', root_io.userlist);
		
		if (exitflag) {
			var result = await chatsql.enterChatroom(u_idx, chatroom_idx);
		}
		let result2 = await chatsql.showAllMessage(u_idx, chatroom_idx);

		root_io.of(newNsp.name).in(chatroom_idx).emit('roomresult', result2);
	});

	
	// when the client emits 'adduser', this listens and executes
	socket.on('leaveroom', async function (data) {
		var data = JSON.parse(data);
		let u_idx = data.u_idx;
		let chatroom_idx = data.chatroom_idx;
		
		let result = await chatsql.leaveChatroom(u_idx, chatroom_idx);

		console.log("leaveroom result : ", result);

		socket.emit('leaveresult', result);

		socket.leave(socket.room);

		for (let i = 0 ; i < root_io.userlist.length ; i++) {
			if (root_io.userlist[i].room_id === chatroom_idx) {
				console.log("before dev2 i userlist splice : ", root_io.userlist[i]);
				const idx = root_io.userlist[i].members.indexOf(u_idx);
				if (idx > -1)
					root_io.userlist[i].members.splice(idx, 1);
				console.log("after dev2 i userlist splice : ", root_io.userlist[i]);

				if (root_io.userlist[i].members.length === 0) {		// splice index 가 0 일 경우
					root_io.userlist.splice(i, 1);
					console.log("after dev2 userlist splice : ", root_io.userlist);
				}
			}
		}

	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', async function (data) {
		var data = JSON.parse(data);
		let u_idx = data.u_idx;
		let chatroom_idx = data.chatroom_idx;
		let content = data.content;
		let count = socket.conn.server.clientsCount;
		let type = data.type;
		
		console.log("count : ", count);
		// console.log("sendchat data : ", data);
		
		let result = await chatsql.insertNewMessage(u_idx, chatroom_idx, content, count, type);
		console.log("unreadcount : ", result.count);
		console.log("sendchat result : ", result);
		if (!result) {
			root_io.of(newNsp.name).in(chatroom_idx).emit('updatechat', null);
			root_io.of(newNsp.name).emit('updatechatlist', null);
		} else {
			root_io.of(newNsp.name).in(chatroom_idx).emit('updatechat', result);
			root_io.of(newNsp.name).emit('updatechatlist', result);
		}
	});
  
});

server.listen(3030, function() {
  console.log('Socket IO server listening on port 3030 in app.js');
});

module.exports = app;