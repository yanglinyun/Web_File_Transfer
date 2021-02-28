
var preDialog = "";
$(".func").on("click", function () {
  var ele = $("." + $(this).attr("data-func"));
  if (ele.css("visibility") === "visible") {
    ele.css("visibility", "hidden");
  } else {
    $(".dialog").css("visibility", "hidden");
    $(".link").css("transition", "all 0s ease").css("width", "60%");
    ele.css(
      "visibility",
      ele.css("visibility") === "hidden" ? "visible" : "hidden"
    );
  }
});

$(".copyLink").on("click", copyContent);
function copyContent(e) {
  var c = document.getElementById("copyInfo");

  c.select(); // 选择对象

  document.execCommand("Copy"); // 执行浏览器复制命令

  alert("已复制好，可贴粘。");
}
$(".getCode").on("input",function() {
  if($(this).val().length==4){
    let code = $(this).val()
    $.ajax({
      url:`/check?file=${window.location.search.split("=")[1].replace("code",code)}`,
      method: 'get',
      dataType: 'json',
      success: function(data){
        console.log(data)
        if(data.err){
          alert("密码错误")
          $(".getCode").val("")
        }else{
          console.log(data)
          window.open(data.url,'blank')
        }
      }
    })
  }
})
