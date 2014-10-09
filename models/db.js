// 依赖引入
var mongoose = require('mongoose');
var config = require('../config').config;

// 连接数据库
mongoose.connect(config.db);

// 管理mongoose连接

// when successfully connected
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open to ' + config.db);
});

// if the connection throws an error
mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// when the connection is disconnected
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

// if the Node process ends, close the Mongoose connection
process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('Mongoose default connection disconnected '
              + 'through app termination');
    process.exit(0);
  });
});