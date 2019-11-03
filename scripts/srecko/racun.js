function GetValue(e, t, a) {
    return e && t in e ? e[t].$t : a
}

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

function RacunStandard(title, racun_index)
{
  var el;
  el = document.getElementById("title");
  if (el) {
    el.innerHTML = title;
  }

  var div = document.getElementById("standard-racun");
  if (div) {
    var total = "" +
"  <h2>Summary</h2>" +
"  <div id=\"summary\"></div>" +
"  <hr>" +
"  <h2>Details</h2>" +
"  <div id=\"details\"></div>" +
"  <hr>" +
"  <div class=\"itistiny\">" +
"  <a target=\"_blank\" href=\"https://srecko.ca/racun/download.html\"><h5>app download</h5></a>" +
"  <div id=\"appsetup\"></div>" +
"  <br><br>";
    div.innerHTML = total;

    var src = "https://spreadsheets.google.com/feeds/list/1oWmF6mKi126JJFoBIG2_XH7zV8I7LxzeP5MfyMhrT_4/" + racun_index + "/public/values?alt=json-in-script&callback=JsonCallback";
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = src;
    div.insertBefore(script, null);
  }
}

function CollectDetails(jsonIn)
{
  var entries = jsonIn.feed.entry;
  var racuni = {};
  for (var i = 0; i < entries.length; i++) {
    var tabName = GetValue(entries[i], "gsx$tabname", "");
    if (tabName == "") continue;

    var name = GetValue(entries[i], "gsx$name", "");
    var details = GetValue(entries[i], "gsx$details", "");
    var tabIndex = GetValue(entries[i], "gsx$tabindex", "");
    var reminder = GetValue(entries[i], "gsx$reminder", "");

    racuni[tabName] = [name, details, tabIndex, reminder];
  }
  
  ProcessRacun(racuni);
}

function RacunEverything()
{
  var div = document.getElementById("standard-racun");
  if (div) {
    var total = "" +
"  <span>" +
"    <a href=\"euro2017.html\">Euro 2017</a>" +
"    <a href=\"maui2018.html\">Maui 2018</a>" +
"    <a href=\"maui2019/\">Maui 2019</a>" +
"  </span>";
    div.innerHTML = total;
  }
}

function ProcessRacun(racuni)
{
  var racun = GetQueryParameters("racun");
  console.log("Racun " + racun);

  if (racun == undefined) {
    RacunEverything(racuni);
  } else {
    RacunStandard(racuni[racun][0], racuni[racun][2]);
  }
}
