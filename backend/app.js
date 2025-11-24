var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose'); // 引入 mongoose

var roomsRouter = require('./routes/rooms');
var roomslistRouter = require('./routes/roomslist');
var detectionsRouter = require('./routes/detections');
var alarmsRouter = require('./routes/alarms');

var app = express();

// ==========================================
// 1. 连接 MongoDB 数据库
// ==========================================
mongoose.connect('mongodb://localhost:27017/roomMonitor')
    .then(() => console.log('✅ MongoDB 连接成功！'))
    .catch(err => console.error('❌ MongoDB 连接失败:', err));

// ==========================================
// 2. 配置 CORS 跨域 (重要！否则Vue访问会报错)
// ==========================================
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); // 允许任何来源访问
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization"); // 允许的Header
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS"); // 允许的方法
  res.header("Connection", "close"); // 禁用 keep-alive，兼容某些 HTTP 客户端
  if (req.method === 'OPTIONS') {
    res.sendStatus(200); // 让预检请求快速通过
  } else {
    next();
  }
});

// 视图引擎设置 (Express默认带的，不用管)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/rooms', roomsRouter);// 房间数据
app.use('/history', roomslistRouter);
app.use('/detections', detectionsRouter); // 人员检测
app.use('/alarms', alarmsRouter); // 报警管理

// 捕获 404 错误
app.use(function(req, res, next) {
  next(createError(404));
});

// 错误处理器
// error handler
app.use(function(err, req, res, next) {
  console.error('❌ 发生错误:', err.message); // 打印错误到控制台方便调试

  // 直接返回 JSON，不做页面渲染
  res.status(err.status || 500).json({
    code: err.status || 500,
    msg: '服务器内部错误',
    error: req.app.get('env') === 'development' ? err.message : {}
  });
});

module.exports = app;