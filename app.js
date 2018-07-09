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
			root_io.emit('adduser', null);	
		} else {
			root_io.emit('adduser', result);	
		}
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('enterroom', async function (data) {
		let u_idx = data.u_idx;
		let chatroom_idx = data.chatroom_idx;
		
		let result = await chatsql.enterChatroom(u_idx, chatroom_idx);

		if (!result) {
			console.log('false');
		} else {
			console.log('true');
		}

		root_io.emit('check1', "hi");
	});

	// when the client emits 'adduser', this listens and executes
	socket.on('leaveroom', async function (nickname) {
		let u_idx = data.u_idx;
		let chatroom_idx = data.chatroom_idx;
		
		let result = await chatsql.leaveChatroom(u_idx, chatroom_idx);

		if (!result) {
			console.log('false');
		} else {
			console.log('true');
		}

		root_io.emit('check1', "hi");
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', async function (data) {
		var data = JSON.parse(data);
		let u_idx = data.u_idx;
		let chatroom_idx = data.chatroom_idx;
		let content = data.content;
		let count = 0;
		let type = data.type;
		
		console.log("sendchat");
		console.log(data);
		
		let result = await chatsql.insertNewMessage(u_idx, chatroom_idx, content, count);
		
		if (!result) {
			root_io.emit('updatechat', null);	
		} else {
			root_io.emit('updatechat', data);	
		}
	});


	

});

server.listen(3030, function() {
  console.log('Socket IO server listening on port 3030 in app.js');
});
module.exports = app;
