const cons = require("consolidate");
var express = require("express");
var formidable = require("formidable");
var fs = require("fs");
var path = require("path");
var router = express.Router();
var mime = require("mime"); //引入mime模块

const uploadFilePath = `${path.resolve(__dirname, "../public/uploads/")}/`;
const mb = 1024*1024
const singleMaxSize = 100 * mb //限制上传文件大小
const diskMaxSize = 100 * mb //限制服务器存储盘大小
/* GET home page. */

router.get("/", function (req, res, next) {
  res.render("index", { title: "文件上传" });
});
// 提取界面
router.get("/share", function (req, res, next) {
  res.render("share", { title: "文件提取" });
});

// 下载接口
router.get("/download", function (req, res, next) {
  let filename = req.query.file;
  let webPath = path.join(__dirname, `../public/uploads/${filename}`);
  fs.exists(webPath, function (exists) {
    //    文件和目录不存在的情况下；
    if (!exists) {
      res.json({ err: true });
    } else {
      putFile(webPath, res);
    }
  });
});
// 提取码检验接口
router.get("/check", function (req, res, next) {
  let filename = req.query.file;
  let webPath = path.join(__dirname, `../public/uploads/${filename}`);
  console.log("-----------------");
  console.log(webPath);

  fs.exists(webPath, function (exists) {
    //    文件和目录不存在的情况下；
    if (!exists) {
      console.log("no");
      res.json({ err: true });
    } else {
      console.log("yes");
      res.json({ err: false, url: `/download?file=${filename}` });
    }
  });
});

// 下载读文件函数
function putFile(filename, res) {
  fs.readFile(filename, function (err, data) {
    if (err) {
      throw err;
    }
    res.writeHead(200, { "Content-type": mime.getType(filename) }).end(data);
  });
}

// 文件上传接口
router.post("/fileUpload", function (req, res) {
  var form = null;
  form = new formidable.IncomingForm();
  form.keepExtensions = false; //隐藏后缀
  form.multiples = true; //多文件上传
  form.uploadDir = uploadFilePath;
  uploadFileFun(form, req, res, fs);
});

//上传逻辑
function uploadFileFun(form, req, res, fs) {
  form.parse(req, function (error, fields, file) {
    var filename = "";
    var gUpload = uploadFilePath;
    file = file.files;
    let uploadSize = file.size;
    if (uploadSize > singleMaxSize) {
      res.json({ error: true, info: "100M以下才行" });
    }

    let uploadPath = path.join(__dirname, `../public/uploads`);
    let usedSize = geFileList(uploadPath);
    let mb = 1024 * 1024;
    if (usedSize + uploadSize >= diskMaxSize) {
      res.json(JSON.stringify({ error: true, info: "服务器空间不足" }));
      return;
    }
    let resultPath = [];
    filename = uploadOper(fs, gUpload, file, resultPath);
    console.log("files:" + JSON.stringify(file));
    //返回结果
    let code = filename
      .split("/")
      [filename.split("/").length - 1].split("-")[0];
    let expire = new Date(
      parseInt(filename.split("-")[1]) + 1000 * 3600 * 3
    ).format("yyyy-MM-dd-hh:mm:ss");
    let fileName = "/share?file=" + filename;
    fileName = fileName.replace(`/${code}-`, `/code-`);
    res.json(
      JSON.stringify({ error: false, filename: fileName, expire, code })
    );
  });
}

function codeBit(code) {
  let num = 1;
  while (parseInt(code / 10)) {
    num++;
    code = parseInt(code / 10);
  }
  return num;
}
function bitsZero(num) {
  let str = "";
  while (num) {
    num--;
    str += "0";
  }
  return str;
}

function geFileList(path) {
  var filesList = [];
  readFile(path, filesList);
  let totalSize = 0;
  for (var i = 0; i < filesList.length; i++) {
    var item = filesList[i];
    totalSize += item.size;
  }
  return totalSize;
}

//遍历读取文件
function readFile(path, filesList) {
  files = fs.readdirSync(path); //需要用到同步读取
  files.forEach(walk);
  function walk(file) {
    states = fs.statSync(path + "/" + file);
    if (states.isDirectory()) {
      readFile(path + "/" + file, filesList);
    } else {
      //创建一个对象保存信息
      var obj = new Object();
      obj.size = states.size; //文件大小，以字节为单位
      obj.name = file; //文件名
      obj.path = path + "/" + file; //文件绝对路径
      filesList.push(obj);
    }
  }
}

function uploadOper(fs, gUpload, fileS, resultPath) {
  var code = Math.floor(Math.random() * 10000);
  code = bitsZero(4 - codeBit(code)) + code;
  var fileTypeName = fileS.name.substring(fileS.name.lastIndexOf(".") + 1),
    catDir = gUpload + fileTypeName + "/",
    catDetailDir = catDir + new Date().format("yyyyMMdd") + "/",
    secondDir = "/" + new Date().format("yyyyMMdd") + "/",
    fourCode = code,
    fileName =
      fourCode +
      "-" +
      new Date().getTime() +
      "-" +
      parseInt(Math.random() * 10000000) +
      "." +
      fileTypeName,
    uploadPath = catDetailDir + fileName; //如果需要目录 catDetailDir+fileName
  // console.log(uploadPath);
  resultPath.push(uploadPath.replace("public/", ""));

  if (fileS.name.lastIndexOf(".") > -1) {
    //只能传有后缀的文件，前台上传做个限制（后台暂时没找到方法）
    if (!fs.existsSync(catDir)) {
      //2级目录不存在
      fs.mkdirSync(catDir);
    }

    if (!fs.existsSync(catDetailDir)) {
      //3级目录不存在
      fs.mkdirSync(catDetailDir);
    }
    fs.renameSync(fileS.path, uploadPath);
  }
  // console.log(fileTypeName + secondDir + fileName);
  return fileTypeName + secondDir + fileName;
}

//时间格式化
Date.prototype.format = function (fmt) {
  //author: meizz
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
};

module.exports = router;
