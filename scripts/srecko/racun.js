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

function RacunEverything(racuni)
{
  var el = document.getElementById("summary-racun");
  if (el) {
    var total = "<span>";
    for (var racun in racuni) {
      var found = racuni[racun];
      if (found[2]) {
        total += `    <a href="?racun=${ racun }">${ found[0] }</a>`;
      }
    }
    total += "  </span>";
    el.innerHTML = total;
  }
}

function RacunStandard(title, racun_index, details)
{
  console.log(`Racun with ${ title }, ${ racun_index }, ${ details }`);

  var showtitle = title;
  if (details != "") {
    showtitle = `${ showtitle } (${ details })`;
  }

  var el;
  el = document.getElementById("title");
  if (el) {
    el.innerHTML = title;
  }

  var div = document.getElementById("standard-racun");
  if (div) {
    var total = `
  <h1> ${ showtitle } </h1>
  <h2>Summary</h2>
  <div id="summary"></div>
  <hr>
  <h2>Details</h2>
  <div id="details"></div>
  <hr>
  <br><br>`
    div.innerHTML = total;

    var src = `V4V3_GetOriginalData(JsonCallback,"1oWmF6mKi126JJFoBIG2_XH7zV8I7LxzeP5MfyMhrT_4",${ racun_index } - 1)`;
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.innerHTML = src;
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

    console.log(`${ tabName } = ${ name }, ${ details }, ${ tabIndex }, ${ reminder }`);
    racuni[tabName] = [name, details, tabIndex, reminder];
  }
  
  ProcessRacun(racuni);
}

function ProcessRacun(racuni)
{
  var racun = GetQueryParameters("racun");
  console.log(`Racun ${ racun }`);

  if (racun == undefined) {
    RacunEverything(racuni);
  } else {
    var found = racuni[racun];
    RacunStandard(found[0], found[2], found[1]);
  }
}
