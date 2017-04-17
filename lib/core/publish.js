'use strict';

var shelljs = require('shelljs');
var path = require('path');
var fs = require('fs');
var http = require('http');
var log = require('npmlog');

exports.send = function(versition){
  var originName = 'DaRenShop.app';
  var filename = `DaRenShop.${versition}.zip`;

  if(!fs.existsSync(originName)){
    originName = 'DaRenShop.ipa';
    filename = `DaRenShop.${versition}.zip`;
  }

  shelljs.exec(`zip -r ${filename} ./${originName}`,{silent: true},function(code, stdout, stderr) {

    function upload(){

      var boundaryKey = '----' + Date.now();

      var options = {

        host: '192.168.0.61',

        port: 8110,

        method: 'POST',

        path:'/uploadDaRenShopTestPackage?fileName='+ filename,

        headers:{
          'Content-Type':'multipart/form-data; boundary=' + boundaryKey
        }

      };

      var req = http.request(options,function(res){

        res.setEncoding('utf8');

        res.on('data',function(trunk){
        });

        res.on('end',function(err){
          if(err){
            log.error('spon:','哎呀，上传zip包失败');
            return;
          }

          log.info('spon:','上传zip包成功');
        });

      });

      req.write(
        '--' + boundaryKey + '\r\n' +
        'Content-Disposition: form-data; name="'+ filename +'"; filename="'+ filename +'"\r\n' +
        'Content-Type: application/octet-stream\r\n\r\n'
      );

      //设置1M的缓冲区
      var fileStream = fs.createReadStream('./' + filename);
      fileStream.pipe(req,{end:false});

      fileStream.on('end',function(){

        req.end('\r\n--' + boundaryKey + '--');

      });

    }

    upload();
  });

};