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

function TeslaTripsYears(where)
{
  var total = "";
  total += "<h3>";
  total += "<a href=\"?year=2024\">2024</a>,";
  total += "<a href=\"?year=2023\">2023</a>,";
  total += "<a href=\"?year=2022\">2022</a>,";
  total += "<a href=\"?year=2021\">2021</a>,";
  total += "<a href=\"?year=2020\">2020</a>,";
  total += "<a href=\"?year=2019\">2019</a>,";
  total += "<a href=\"?year=2018\">2018</a>";
  total += "</h3>";
  document.getElementById(where).innerHTML = total;
}

function StandardTripYear()
{
  if (TripYear == "All Years") {
    TeslaTripsYears("trip");
    return;
  }

  var sheetIndex = TripYear - 2012;
  if (sheetIndex > 0) {
    var googleSheet = GoogleSheetSquare;

    var script_tag = document.getElementById('tripseason')
    if (script_tag) {
      var argsheet = script_tag.getAttribute("data-sheet");
      if (argsheet) {
        console.log("Setting tripseason.js.GoogleSheetSquare from data-sheet to " + argsheet)
        googleSheet = argsheet;
      }
    }
    V4V3_GetOriginalData(TeslaTripsMade, googleSheet, sheetIndex);
  }
}

var TripYear = GetQueryParameters("year");
if ("" == TripYear || void 0 == TripYear) {
  TripYear = "All Years";
}
console.log("Trip year " + TripYear);

document.getElementById("trip-title").innerHTML = TripYear;
StandardTripYear(TripYear);
