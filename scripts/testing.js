function FixLink() {
  var all = document.getElementsByTagName("a");
  for (var i=0; i<all.length; i++) {
    var el = all[i];
    if (el.innerHTML.includes("Pay Online Now") || el.innerHTML.includes("Payez maintenant")) {
      if (el.hasAttributes()) {
        var attrs = el.attributes;
        for (var j=0; j<attrs.length; j++) {
          if (attrs[j].name.includes("href")) {
            attrs[j].value = "https://www.google.com/";
          }
        }
      }
    }
  }
}

var ss=window.location.href.includes("Agree");
if(ss){
  document.getElementById("arcextra").innerHTML =
    "<h2>Click the Accept button at bottom left, and follow the payment instructions.</h2>";
}

var sc=window.location.href.includes("Complete");
if(sc){
  document.getElementById("arcextra").innerHTML =
    "<h2><a href=\"https://argonaut-rowing-club.myshopify.com/cart/16140123537510:1?note=" +
    document.getElementById("HeadLoginName").innerHTML +
    "-for-2019-membership\">Click here to open the Argo store and complete the payment</a></h2>";
  document.addEventListener('DOMContentLoaded', FixLink, false);
}
