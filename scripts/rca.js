function FixLink(url) {
  var all = document.getElementsByTagName("a");
  for (var i=0; i<all.length; i++) {
    var el = all[i];
    if (el.innerHTML.includes("Pay Online Now") || el.innerHTML.includes("Payez maintenant")) {
      if (el.hasAttributes()) {
        var attrs = el.attributes;
        for (var j=0; j<attrs.length; j++) {
          if (attrs[j].name.includes("href")) {
            attrs[j].value = url;
          }
        }
      }
    }
  }
}

function Everything() {
  if (window.location.href.includes("Agree")) {
    var text = "Click the Accept button at bottom left, and follow the payment instructions.";
    document.getElementById("arcextra").innerHTML =
      "<h2>" + text + "</h2>";
  } else if (window.location.href.includes("Complete")) {
    var text = "Click here to open the Argo store and complete the payment";
    var url = "https://argonaut-rowing-club.myshopify.com/collections/membership/" +
               "products/2019-adult-membership";
    var el = document.getElementById("HeadLoginName");
    if (el) {
      url = "https://argonaut-rowing-club.myshopify.com/cart/16140123537510:1?note=" +
        el.innerHTML + "-for-2019-membership";
    }

    document.getElementById("arcextra").innerHTML =
      "<a href=\"" + url + "\"><h2>" + text + "</h2></a>";

    FixLink(url);
  }
}

document.addEventListener('DOMContentLoaded', Everything, false);
