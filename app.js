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
var chatsql = require('./module/chatsql.js');

root_io.sockets.on('connection', async function (socket) {
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
		
		socket.join(chatroom_idx);
		socket.room = chatroom_idx;
		
		
		let result = await chatsql.enterChatroom(u_idx, chatroom_idx);
		let result2 = await chatsql.showAllMessage(u_idx, chatroom_idx);

		console.log("enterroom result : ", socket.conn.server.clientsCount);
		if (result) {
			socket.emit('enterresult', result2);
		} else {
			socket.emit('enterresult', result);
		}
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
		// console.log("before userlist splice : ", socket.userlist);
		// const idx = socket.userlist.indexOf(u_idx);
		// if (idx > -1)
		// 	socket.userlist.splice(idx, 1);
		// console.log("after userlist splice : ", socket.userlist);

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
		console.log("sendchat data : ", data);
		
		let result = await chatsql.insertNewMessage(u_idx, chatroom_idx, content, count, type);
		console.log("sendchat result : ", result);
		if (!result) {
			root_io.in(chatroom_idx).emit('updatechat', null);
		} else {
			root_io.in(chatroom_idx).emit('updatechat', result);
		}
	});


	

});

server.listen(3030, function() {
  console.log('Socket IO server listening on port 3030 in app.js');
});
module.exports = app;
