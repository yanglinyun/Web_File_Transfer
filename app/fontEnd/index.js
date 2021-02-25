let preDialog = ""
function simulateClick(el) {
  var evt;
  if (document.createEvent) {
    // DOM Level 2 standard
    evt = document.createEvent("MouseEvents");
    evt.initMouseEvent(
      "click",
      true,
      true,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );
    el.dispatchEvent(evt);
  } else if (el.fireEvent) {
    // IE
    el.fireEvent("onclick");
  }
}

function gc(className) {
  return document.getElementsByClassName(className);
}
function gco(className) {
  return gc(className)[0];
}
function getStyle(ele, attr) {
  return window.getComputedStyle(ele)[attr];
}
function hasClass(ele, cname) {
  return ele.className.split(" ").forEach((item) => {
    if (item === cname) {
      return true;
    }
  });
}
function show(e) {
  var ele = gc("dialog");
  Array.from(ele).forEach((item) => {
    if (!hasClass(item, e.target.getAttribute("data-func"))) {
      item.style.visibility = "hidden";
    }
  });
  var curDialog = e.target.getAttribute("data-func")
  ele = gco(curDialog);
  ele.style.visibility =
    getStyle(ele, "visibility") != "visible" ? "visible" : "hidden";
}
function batchAddEvent(eles, eventName, func) {
  Array.from(eles).forEach((item) => {
    item.addEventListener(eventName, func);
  });
}
batchAddEvent(gc("func"), "click", show);

var uploadBtn = gco("uploadBtn");
uploadBtn.addEventListener("click", function () {
  simulateClick(gco("uploadInput"));
});

