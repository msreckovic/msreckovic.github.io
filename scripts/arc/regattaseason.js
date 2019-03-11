var GoogleSheetSquare = "";
var QueryString = window.location.search.slice(1);
var QueryParameters = {};
QueryString.split("&").forEach(function(e) {
  var t = e.split("=");
  QueryParameters[t[0]] = decodeURIComponent(t[1])
});
console.log("Parameters " + QueryString);

var Regatta = QueryParameters.regatta.replace("_", " ").replace("%20", " ");
console.log("Regatta " + Regatta), document.getElementById("regatta-title").innerHTML = Regatta;

function GetValue(e, t, a) {
    return e && t in e ? e[t].$t : a
}
StandardRegattaConfiguration(Regatta);
var gdata = new Object;

function ExamineRegattas(e) {
  var sheetIndex = 0;

  if ("" == Regatta || void 0 == Regatta) {
    console.log("Showing all regattas instead");
    CallbackListRegattas(e);
    return;
  }

  StandardRegattaCallback(e);
  var t = e.feed.entry;
  for (i = 1; i < t.length; i++) {
    if (GetValue(t[i], "gsx$shortname", "").toLowerCase() == Regatta.toLowerCase()) {
      sheetIndex = GetValue(t[i], "gsx$index", "");
      console.log("Found " + Regatta + " at index " + i + " and value " + sheetIndex);
      break;
    }
  }

  if (sheetIndex > 0) {
    var googleSheet = GoogleSheetSquare;

    var script_tag = document.getElementById('regattaseason')
    if (script_tag) {
      var argsheet = script_tag.getAttribute("data-sheet");
      if (argsheet) {
        console.log("Setting regattaseason.js.GoogleSheetSquare from data-sheet to " + argsheet)
        googleSheet = argsheet;
      }
    }

    var a = document.createElement("script");
    a.type = "text/javascript", a.src = "https://spreadsheets.google.com/feeds/list/" + googleSheet + "/" + sheetIndex + "/public/values?alt=json-in-script", document.getElementsByTagName("script")[0].parentNode.appendChild(a)
  }
}

gdata.io = new Object, gdata.io.handleScriptLoaded = function(e) { JsonCallback(e) };
