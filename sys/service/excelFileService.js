/**
 * the service which deal with the excel
 * Created by dapaer on 16/10/6.
 */
var excelHelper =  require('../../utils/excelHelper');
var formidable = require('formidable');
var fs = require('fs');  //node.js核心的文件处理模块
var excelFileService = {
    parseExcel : function(req, res, params){
        var message = '';
        var form = new formidable.IncomingForm();   //创建上传表单
        form.encoding = 'utf-8';        //设置编码
        form.uploadDir = 'public/maintain/upload/';     //设置上传目录
        form.keepExtensions = true;     //保留后缀
        form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

        form.parse(req, function(err, fields, files) {
            if (err) {
                console.log(err);
                res.send(global.configResult({},"服务器更新维护中请稍后",false));
            }

            var filename = files.file.name;

            // 对文件名进行处理，以应对上传同名文件的情况
            var nameArray = filename.split('.');
            var type = nameArray[nameArray.length-1];
            var name = '';
            for(var i=0; i<nameArray.length-1; i++){
                name = name + nameArray[i];
            }
            var rand = Math.random()*100 + 900;
            var num = (new Date()).getTime();

            var avatarName = name + num +  '.' + type;
            var newPath = form.uploadDir + avatarName ;
            fs.renameSync(files.file.path, newPath);  //重命名
            excelHelper.importExcel(newPath)
            res.send(global.configResult(newPath.replace('public/','/')));
            
        });
    }
}

module.exports = excelFileService;