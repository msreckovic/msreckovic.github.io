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
}
