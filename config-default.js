//config.js

var pkg = require('./package.json');
var mkdirp = require('mkdirp');

var config = {
  debug: true,
  name: 'VCard',
  description: '微名片,记住你',
  keywords: '名片 微名片 电子名片 云 微信 二维码 扫二维码 扫一扫',
  version: pkg.version,

  db: 'mongodb://127.0.0.1/microcard_stage',
  db_name: 'microcard_stage',
  session_secret: 'microcard_o91$der.2',
  auth_cookie_name: 'microcard',
  port: 8081,
  administrators: ['shieldax@gmail.com']
};

mkdirp('./public/uploads/images', function (err) {
  if (err) {
    console.error(err);
  } else {
    mkdirp('./public/uploads/avatar', function (err) {
      if (err) {
        console.error(err);
      } else {
        console.log('Essential DIRs Has Been Initialized!');
      }
    });
  }
});

module.exports = config;
module.exports.config = config;
