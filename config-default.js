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
  oauth: {
    weibo: {
      app_key: '43664777',
      app_secret: '80cbe41c3e9db32f806e3a603a3c9ee1'
    },
    github: {
      client_id: '98cc4a8b12d1bbb005e0',
      client_secret: '74fd998bea35b13c744d72d53f6e609daabcd3b2',
      callback: 'http://localhost:8080/user/auth/github/callback'
    }
  },
  administrators: ['shieldax@gmail.com'],
  site_domain: 'www.dililid.com',
  mailgun: {
    api_key: 'key-0c037b4df8bb453c97d8200f82d0f41d',
    domain: 'noreply.dililid.com'
  }
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
