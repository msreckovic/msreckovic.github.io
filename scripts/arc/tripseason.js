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

function TeslaTripsYears()
{
  var total = "";
  total += "<h3>";
  total += "<a href=\"?year=2024\">2024</a>, ";
  total += "<a href=\"?year=2023\">2023</a>, ";
  total += "<a href=\"?year=2022\">2022</a>, ";
  total += "<a href=\"?year=2021\">2021</a>,<br>";
  total += "<a href=\"?year=2020\">2020</a>, ";
  total += "<a href=\"?year=2019\">2019</a>, ";
  total += "<a href=\"?year=2018\">2018</a>,<br>";
  total += "<a href=\"?year=plans\">Plans</a>, ";
  total += "<a href=\"?year=live\">Live</a>";
  total += "</h3>";
  return total;
}

function Message()
{
 var googleSheet = GoogleSheetSquare;

  var script_tag = document.getElementById('tripseason')
  if (script_tag) {
    var argsheet = script_tag.getAttribute("data-sheet");
    if (argsheet) {
      console.log("Setting tripseason.js.GoogleSheetSquare from data-sheet to " + argsheet)
      googleSheet = argsheet;
    }
    var ksheet = script_tag.getAttribute("k");
    GetAllData(TeslaMessage, googleSheet, "messages", ksheet);
  }
}

function StandardTripYear()
{
  if (TripYear == "All Years") {
    Message();
    return;
  }

  document.getElementById("trip-title").innerHTML = TripYear;

  var googleSheet = GoogleSheetSquare;

  var script_tag = document.getElementById('tripseason')
  if (script_tag) {
    var argsheet = script_tag.getAttribute("data-sheet");
    if (argsheet) {
      console.log("Setting tripseason.js.GoogleSheetSquare from data-sheet to " + argsheet)
      googleSheet = argsheet;
    }
    var ksheet = script_tag.getAttribute("k");
    GetAllData(TeslaTripsMade, googleSheet, TripYear, ksheet);
  }
}

function TeslaMessage(values)
{
  var total = "";
  if (values.length > 1) {
    var i;
    for (i = values.length - 1; i > 0; i--) {
      total += "<h4><b>" + values[i][0] + "</b>: " + values[i][1] + "</h4>";
    }
  }

  total += TeslaTripsYears();
  document.getElementById("trip").innerHTML = total;
}

var TripYear = GetQueryParameters("year");
if ("" == TripYear || void 0 == TripYear) {
  TripYear = "All Years";
}
console.log("Trip year " + TripYear);
StandardTripYear(TripYear);
