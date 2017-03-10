'use strict';

var fs = require('fs'),
  path = require('path'),
  cwd = process.cwd();
// 类yeoman-generator功能模块，用于创建初始目录结构
function Yo(){
  if(!(this instanceof Yo)){
    return new Yo();
  }
}

var exists = function( src, dst, callback ){
  if(fs.existsSync(dst)){
    callback(src,dst);
  }else{
    fs.mkdirSync(dst);
    callback(src,dst);
  }
};

Object.assign(Yo.prototype, {
  mkdir(name) {
    var doing = function(name){
      var dirname = path.join(cwd,name);
      try{
        fs.mkdirSync(dirname);
      }catch(e){
        log.error('sptt:',`create dir "${dirname}}" error`);
        process.exit(1);
      }
    };

    if(Array.isArray(name)){
      name.forEach(function(n){
        doing(n);
      })
    }else{
      doing(name);
    }
  },
  /*
   * 复制目录中的所有文件包括子目录
   * @param{ String } 需要复制的目录
   * @param{ String } 复制到指定的目录
   */
  copy(src,dst) {
     // 读取目录中的所有文件/目录
     var self = this,paths = fs.readdirSync(src);
     paths.forEach(function(path){
       var _src = src + '/' + path,
       _dst = dst + '/' + path,
       readable, writable,st;
       st = fs.statSync( _src);
       // 判断是否为文件
       if(st.isFile()){
         // 创建读取流
         readable = fs.createReadStream(_src);
         // 创建写入流
         writable = fs.createWriteStream(_dst);
         // 通过管道来传输流
         readable.pipe(writable);
       }
       // 如果是目录则递归调用自身
       else if(st.isDirectory()){
         exists(_src,_dst,self.copy);
       }
     });
   },
  /**
   * @param{destination} 拷贝的目标文件，/usr/local/lib/test.sh
   * @param{source} 源文件，/home/test.sh
   */
  cpFile(destination,source) {
    var readable, writable,st;
    st = fs.statSync(source);
    // 判断是否为文件
    if(st.isFile()){
      // 创建读取流
      readable = fs.createReadStream(source);
      // 创建写入流
      writable = fs.createWriteStream(destination);
      // 通过管道来传输流
      readable.pipe(writable);
    }else{
      log.error('sptt:',`${source} must be a file`);
      process.exit(1);
    }
  }
});

module.exports = Yo;