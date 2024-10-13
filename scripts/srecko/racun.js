// START OF STANDARD START OF STANDARD START OF STANDARD START OF STANDARD START OF STANDARD START OF STANDARD 

var GoogleSheetSquare = "";

var Loud = false;
function ConsoleLog(str)
{
  if (Loud) console.log(str);
}

function GetNumber(a)
{
  return parseFloat(a.replace(/[^0-9.-]+/g,""));
}

function ParseJSON(value)
{
  try {
    var parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  }
  catch (e) { }
  return "";
}

function GetQueryParameters(what) {
  var queryString = window.location.search.slice(1);
  var queryParameters = {};
  queryString.split("&").forEach(function(e) {
    var t = e.split("=");
    queryParameters[t[0]] = decodeURIComponent(t[1])
  });
  var res = queryParameters[what];
  if (res) return res.replace("_", " ").replace("%20", " ");
  return undefined;
}

function GetDataURL(sheet_string, tab_string, k)
{
  var url = "https://sheets.googleapis.com/v4/spreadsheets/" + sheet_string + "/values/" + tab_string + "?alt=json&key=" + k;
  return url;
}

function FinalCallbackName(f, whole_thing_str)
{
  if (whole_thing_str == "") {
     return;
  }
  var whole_thing = JSON.parse(whole_thing_str);
  f(whole_thing["values"]);
}

function GetAllData(f, sheet_string, tab_string, k)
{
  if (sheet_string == "") return;

  var url = GetDataURL(sheet_string, tab_string, k);

  const Http = new XMLHttpRequest();
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = (e) => {
    FinalCallbackName(f, Http.responseText);
  }
}

// END OF STANDARD END OF STANDARD END OF STANDARD END OF STANDARD END OF STANDARD END OF STANDARD 

// Specific

function ForAmount(amount)
{
  var summary = "    <td data-label=Verdict>";

  var asInt = parseInt(amount, 10);
  if (asInt < 0) {
    summary += amount + " (due)</td>\n";
  } else if (asInt > 0) {
    summary += amount + " (owes)</td>\n";
  } else {
    summary += amount + "&nbsp;</td>\n";
  }
  return summary;
}

function ForPeople(who, spent, paid)
{
  var summary = `
    <td data-label=Who>${ who }</td>
    <td data-label=Spent>${ spent }</td>
    <td data-label=Paid>${ paid }</td>
  `;
  return summary;
}

function DivSummary(map, entries)
{
  var when = entries[4][1];
  var summary = `
<h4>Last updated ${ when }</h4>
<table>
  <thead>
    <tr>
      <th>Who</th>
      <th>Spent</th>
      <th>Paid</th>
      <th>Verdict</th>
    </tr>
  </thead>
  `;

  summary += "  <tbody>\n";
  for (j in map) {
    summary += "   <tr>";
    summary += ForPeople(map[j].who,
                         entries[2][map[j].cut],
                         entries[2][map[j].paid]);
    summary += ForAmount(entries[3][map[j].paid]);
    summary += "   </tr>\n";
  }

  summary += "  </tbody>\n";
  summary += "</table>\n";

  return summary;
}

function DivDetails(map, entries)
{
  var details = `<table>
  <thead>
    <tr>
      <th>When</th>
      <th>What</th>
      <th>Amount</th>
      <th>Paid-By</th>
  `;

  for (var j in map) {
    details += "      <th>" + map[j].label + "</th>\n";
  }

  // details += "      <th>Per-Person</th>\n";
  details += "    </tr>\n";
  details += "  </thead>\n";
  details += "  <tbody>\n";

  for (var i=entries.length-1; i>=4 ; i--) {
    var doit = false;
    var amount = 0;
    var who = "";
    var cur = "$";

    var what = entries[i][2];
    var when = entries[i][0];
    var perperson = entries[i][18];

    var people = [];
    var cuts = [];
    var labels = [];

    for (j in map) {
      var pp = entries[i][map[j].people];
      var cc = entries[i][map[j].cut];
      var ll = map[j].label;
      people.push(pp);
      cuts.push(cc);
      labels.push(ll);

      var pd = entries[i][map[j].paid];
      if (pd) {
        var val = GetNumber(entries[i][map[j].paid]);
        am = val;
        if (am > 0) {
          amount += am;
          doit = true;
          who = map[j].who;
        }
      }
    }

    if (doit) {
      details += "    <tr>";
      details += `    <td data-label=When>${ when }</td>`;
      details += `    <td data-label=What>${ what }</td>`;
      details += `    <td data-label=Amount>${ cur + amount }</td>`;
      details += `    <td data-label=Paid-By>${ who }</td>`;
      for (j=0; j<people.length; j+=1) {
        if (people[j] == 1) {
          details += `    <td data-label=${ labels[j] }>${ cuts[j] }</td>`;
        } else if (people[j] && people[j] != 0) {
          details += `    <td data-label=${ labels[j] }>${ cuts[j] } (${ people[j] })</td>`;
        } else {
          details += `    <td data-label=${ labels[j] }>${ cuts[j] }</td>`;
        }
      }
      // details += `    <td data-label=Per-Person>${ perperson }</td>`;
      details += "    </tr>";
    }
  }

  details += "  </tbody>\n";
  details += "</table>\n";
  return details;
}

function FoodMade(values)
{
  var map = ParseJSON(values[3][1]);
  ConsoleLog("MAP IS " + JSON.stringify(map));
  document.getElementById("summary").innerHTML = DivSummary(map, values);
  document.getElementById("details").innerHTML = DivDetails(map, values);
}

function FoodTrips(where)
{
  var total = "";
  total += "<h3>";
  total += "<a href=\"?trip=Boston2024\">Boston 2024</a>,";
  total += "<a href=\"?trip=Boston2022\">Boston 2022</a>,";
  total += "<a href=\"?trip=Oahu2020\">Oahu 2020</a>,";
  total += "</h3>";
  document.getElementById(where).innerHTML = total;
}

function StandardTrip()
{
  if (Trip == "All Trips") {
    FoodTrips("summary");
    return;
  }

  var googleSheet = GoogleSheetSquare;

  var script_tag = document.getElementById('racun')
  if (script_tag) {
    var argsheet = script_tag.getAttribute("data-sheet");
    if (argsheet) {
      googleSheet = argsheet;
    }
    var ksheet = script_tag.getAttribute("k");
    GetAllData(FoodMade, googleSheet, Trip, ksheet);
  }
}

var Trip = GetQueryParameters("trip");
if ("" == Trip || void 0 == Trip) {
  Trip = "All Trips";
}

var GoLoud = GetQueryParameters("loud");
if ("" == GoLoud || void 0 == GoLoud) {
} else {
  Loud = true;
}

document.getElementById("trip-title").innerHTML = Trip;
StandardTrip(Trip);
