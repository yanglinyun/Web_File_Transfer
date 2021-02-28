// 初始化异步上传函数
function setupload(uploadname, isCheck) {
  $(document).off("change", "#" + uploadname);
  $(document).on("change", "#" + uploadname, function () {
    if (this.files[0].size > 1024 * 1024 * 100) {
      return alert("文件过大");
    }
    var formData = new FormData();
    formData.append("files", this.files[0]);
    if (true || checkFile(this, isCheck)) {
      //这里限制为图片类型，可以取消限制
      $.ajax({
        url: "/fileUpload", //用于文件上传的服务器端请求地址
        type: "post",
        data: formData,
        contentType: false,
        processData: false,
        xhr: function () {
          var xhr = new XMLHttpRequest();
          //使用XMLHttpRequest.upload监听上传过程，注册progress事件，打印回调函数中的event事件
          xhr.upload.addEventListener("progress", function (e) {
            console.log(e);
            //loaded代表上传了多少
            //total代表总数为多少
            var progressRate = (e.loaded / e.total) * 100;

            //通过设置进度条的宽度达到效果
            $("progress").attr("value", progressRate);
          });
          return xhr;
        },
        success: function (data) {
          //服务器成功响应处理函数

          obj = JSON.parse(data);
          if (obj.error) {
            return alert(obj.info);
          }
          console.log(obj);
          let { code, expire, filename } = obj;
          let url = window.location.host + filename;
          $(".dialog").css("visibility", "hidden");
          $(".link").css("visibility", "visible");
          $(".link").css("transition", "all 2s ease");
          $(".token").text(code);
          $(".expire").text(expire);
          $(".link").css("width", "100%");
          $(".copyLink").attr("data-link", url);
          $(".qr").attr(
            "src",
            `https://api.pwmqr.com/qrcode/create/?url=${url}`
          );
          $("#copyInfo").val(url + " 提取码:" + code);
        },
        error: function (data, status, e) {},
      });
    }
  });
}

setupload("uploadInput", true);
// 检查文件格式
function checkFile(upfile, isCheck) {
  alert("checkFile");
  var filePath = upfile.value || upfile.name;
  // console.log("filePath:"+filePath);
  //检查文件格式
  var imgFormat = filePath.substr(filePath.lastIndexOf(".")).toLowerCase();
  //Check extension to image types.
  if (isCheck) {
    var imgFNumb = ".gif,.jpg,.png,.jpeg,.ico,".indexOf(imgFormat + ",");
    if (imgFNumb <= -1) {
      alert("文件类型不对(现在支持的图片文件类型有：gif,jpg,png,jpeg,ico)");
      return false;
    }
  }
  return true;
}