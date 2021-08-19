var GoogleSheetSquare = "";

function GetQueryParameters(what) {
  var queryString = window.location.search.slice(1);
  var queryParameters = {};
  queryString.split("&").forEach(function(e) {
    var t = e.split("=");
    queryParameters[t[0]] = decodeURIComponent(t[1])
  });
  console.log("Parameters " + queryString);
  var res = queryParameters[what];
  if (res) return res.replace("_", " ").replace("%20", " ");
  return undefined;
}

var Regatta = GetQueryParameters("regatta");
console.log("Regatta " + Regatta);

function GetValue(e, t, a) {
    return e && t in e ? e[t].$t : a
}

function ExamineRegattas(e) {
  var sheetIndex = 0;

  if ("" == Regatta || void 0 == Regatta) {
    console.log("Showing all regattas instead");
    CallbackListRegattas(e);
    return;
  }

  console.log("Continuing with Regatta set to " + Regatta);
  
  console.log("Called with " + JSON.stringify(e));

  StandardRegattaCallback(e);
  var t = e.feed.entry;
  console.log("Feed entry is " + t + " with length " + t.length);
  for (i = 1; i < t.length; i++) {
    console.log("Short name is " + GetValue(t[i], "gsx$shortname", ""));
    if (GetValue(t[i], "gsx$shortname", "").toLowerCase() == Regatta.toLowerCase()) {
      sheetIndex = GetValue(t[i], "gsx$index", "");
      console.log("Found " + Regatta + " at index " + i + " and value " + sheetIndex);
      break;
    }
  }

  console.log("Sheet index is " + sheetIndex);

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

if ("" != Regatta && void 0 != Regatta) {
  document.getElementById("regatta-title").innerHTML = Regatta;

  StandardRegattaConfiguration(Regatta);
  var gdata = new Object;
  gdata.io = new Object, gdata.io.handleScriptLoaded = function(e) { JsonCallback(e) };
}
