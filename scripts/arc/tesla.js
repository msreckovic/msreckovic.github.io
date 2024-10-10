function ConsoleLog(str)
{
  if (false) console.log(str);
}

function GetDataURL(sheet_string, tab_string, k)
{
  var url = "https://sheets.googleapis.com/v4/spreadsheets/" + sheet_string + "/values/" + tab_string + "?alt=json&key=" + k;
  ConsoleLog("URL " + url);
  return url;
}

function FinalCallbackName(f, whole_thing_str)
{
  if (whole_thing_str == "") {
     return;
  }
  console.log(whole_thing_str);
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

AllTheTrips =
  [ {"fTripRaw" : "",
     "fTripCities" : "",
     "fTripDate" : "",
     "fTripTemp" : "",
     "fTripLegs" : []
    },
  ];

var Headers =
    [
      [["Distance","120",    3,"km",     4,"km"],
       ["Arrival","130",     7,"",      11,""],
       ["Arr. Range","120",  8,"km",     5,"km"],
       ["Departure","130",    9,"",      12,""],
       ["Dep. Range","120", 10,"km",    13,"km"],
       ["Wh/km","110",       6,"",      14,""],
       ["km\/h","120",      16,"km\/h", 15,"km\/h"],
      ],
      [["Distance","120",    3,"km",     4,"km"],
       ["Rated","120",       5,"km",    16,"km\/h"],
       ["Driving","130",    11,"",       7,""],
       ["Charging","130",   12,"",       9,""],
       ["Wh/km","110",       6,"",      14,""],
       ["Arr. Range","120",  8,"km",    13,"km"],
       ["Dep. Range","120", 10,"km",    15,"km\/h"],
      ]
    ];

var ChargeToCurve =
    [ [42, 42*14],
      [84, 42*13],
      [126, 42*11],
      [168, 42*10],
      [210, 42*9],
      [252, 42*8],
      [294, 42*7],
      [336, 42*6],
      [378, 42*4],
      [420, 42*3],
    ];

function consolelog(what)
{
  // console.log(what);
}

function ChargingTime(starting, ending)
{
  var totalSeconds = 0;
  for (var i=0; i<ChargeToCurve.length; i++) {
    var c2 = ChargeToCurve[i][0];
    if (starting > c2) continue;
    if (c2 > ending) c2 = ending;
    var cn = c2 - starting;
    var ss = 3600.0 * cn / ChargeToCurve[i][1];
    totalSeconds += ss;
    starting = c2+1;
  }
  
  if (totalSeconds <= 0) {
    return [0,0,0];
  }
  var h = Math.floor(totalSeconds/3600);
  var m = Math.floor((totalSeconds % 3600)/60);
  if (m < 10) {
    m = "0" + m;
  }
  var s = Math.floor(totalSeconds % 60);
  if (s < 10) {
    s = "0" + s;
  }
  return [h,m,s];
}

function GetTime(thet)
{
  if (thet) return thet;
  return "";
}

function GetPercentage(thet)
{
  if (thet) return thet;
  return "";
}

function GetKm(thet)
{
  if (thet) {
    var fnd = String(thet).search("km");
    if (fnd >= 0) {
      return "" + Math.round(parseFloat(String(thet).substring(0,fnd)));
    }
    return "" + Math.round(parseFloat(thet));
  }
  return "";
}

function GetKph(thet)
{
  if (thet) {
    var fnd = String(thet).search("km");
    if (fnd >= 0) {
      return "" + Math.round(parseFloat(String(thet).substring(0,fnd)));
    }
    return "" + Math.round(parseFloat(thet));
  }
  return "";
}

function TripStart(entry)
{
  consolelog("fTripRaw " + entry[0]);
  consolelog("fTripCities " + entry[1]);
  consolelog("fTripDate " + entry[2]);
  consolelog("fTripTemp " + entry[3]);

  return  {"fTripRaw" : entry[0],
           "fTripCities" : entry[1],
           "fTripDate" : entry[2],
           "fTripTemp" : entry[3],
           "fTripLegs" : []
          };
}

function TripLeg(entry)
{
    return [entry[0],
	    entry[1],
	    entry[2],
	    GetKm(entry[3]),
	    GetKm(entry[4]),
	    GetKm(entry[5]),
	    GetKm(entry[6]),
	    GetTime(entry[7]),
	    GetKm(entry[8]),
	    GetTime(entry[9]),
	    GetKm(entry[10]),
	    GetTime(entry[11]),
	    GetTime(entry[12]),
	    GetKm(entry[13]),
	    GetPercentage(entry[14]),
	    GetKph(entry[15]),
	    GetKph(entry[16])
	   ];
}

function TeslaTripsMade(values)
{
  TeslaTripsCommon(values);
  FillInTrips("trip");
}

function TeslaTripsCommon(values)
{
  AllTheTrips = [];
  
  consolelog("Calling TeslaTrips");

  var inTrip = false;
  var single = "";
  consolelog("values length " + values.length);
  for (var i=1; i<values.length; i++) {
    consolelog("ENTRY " + i + " IS " + values[i]);

    var first = values[i][0];
    consolelog("FIRST " + first);
    if (first == "START" || first == "PLAN" || first == "PLAN-LATER" || first == "START-LATER") {
      if (inTrip) {
        AllTheTrips.push(single);
        inTrip = false;
      }
      if (!inTrip) {
        single = TripStart(values[i]);
        inTrip = true;
      }
    } else if (inTrip) {
      var leg = TripLeg(values[i]);
      consolelog("LEG " + leg);
      single.fTripLegs.push(leg);
      if (first == "END") {
        AllTheTrips.push(single);
        inTrip = false;
      }
    } else {
      consolelog("This is weird, and should not happen");
    }
  }
  if (inTrip) {
    consolelog("CLOSING " + single);
    AllTheTrips.push(single);
    inTrip = false;
  }
  consolelog("AT THIS POINT " + AllTheTrips.length);
}

function FillInSingle(trip)
{
  var choice = -1;
  console.log("trip.fTripRaw is " + trip.fTripRaw);
  if (trip.fTripRaw == "START" ) {
    choice = 1;
  } else if (trip.fTripRaw == "PLAN") {
    choice = 0;
  } else {
    return "";
  }

  var total = "";
  total += "<table>";
  total += " <tr>";
  total += "  <th colspan=\"2\" class=\"tripper\">";
  total += trip.fTripCities + "<br>" +
    trip.fTripDate + ", " + trip.fTripTemp;
  total += "  </th>";
  var jj;
  for (jj=0; jj<Headers[choice].length; jj+=1) {
    var what = Headers[choice][jj];
    total += "  <th width=\"" + what[1] + "px\" data-label=\"" + what[0] + "\">" + what[0] + "</th>";
  }
  total += " </tr>\n";
  
  var leg;
  
  var regularLegs = trip.fTripLegs.length;
  if (regularLegs > 0) {
    leg = trip.fTripLegs[regularLegs-1];
    if (leg[1] == "SUMMARY") {
      regularLegs --;
    }
  }
  
  for (var i=0; i<regularLegs; i+=1) {
    leg = trip.fTripLegs[i];
    var classeff;
    total += " <tr>\n";
    if (leg[0] == "flyby") {
      total += "  <th class=\"citysmall\" width=\"115px\">" + leg[1] + "</th>\n";
      total += "  <td class=\"addresssmall\" width=\"150px\">" + leg[2] + "</td>\n";
      classeff = "faded";
    } else {
      total += "  <th class=\"city\" width=\"115px\">" + leg[1] + "</th>\n";
      total += "  <td class=\"address\" width=\"150px\">" + leg[2] + "</td>\n";
      classeff = "eff";
    }
    for (jj=0; jj<Headers[choice].length; jj+=1) {
      total += "  <td class=\"" + classeff + "\">" +
        leg[Headers[choice][jj][2]] +
        " <div class=\"fn\">" +
        leg[Headers[choice][jj][4]] + " " +
        (leg[Headers[choice][jj][4]] ? Headers[choice][jj][5] : "");
      if ((choice == 0 && jj == 2) ||
          (choice == 1 && jj == 3)) {
        var fromRangeIndex = 8; // Magic number, see Headers array
        var fromRangeValue = leg[fromRangeIndex];
        var toRangeIndex = 10; // Magic number, see Headers array
        var toRangeValue = leg[toRangeIndex];
        
        var fromRangeInt = parseInt(fromRangeValue);
        var toRangeInt = parseInt(toRangeValue);
        
        if (!isNaN(fromRangeInt) && !isNaN(toRangeInt)) {
          var hms = ChargingTime(fromRangeInt, toRangeInt);
          total += "(" + hms[0] + ":" + hms[1] + ":" + hms[2] + ")";
        }
      }
      total += "</div></td>\n";
    }
    total += " </tr>\n";
  }
  
  // Last one is special, it's the summary:
  if (regularLegs < trip.fTripLegs.length) {
    leg = trip.fTripLegs[trip.fTripLegs.length-1];
    total += " <tr class=\"summary\">\n";
    total += "  <th class=\"city\" width=\"115px\">" + leg[1] + "</th>\n";
    total += "  <th></th>\n";
    total += "  <th class=\"fn\">Distance <div class=\"totals\">" + String(leg[4]).trim() + "</div></th>\n";
    total += "  <th class=\"fn\">Total Time <div class=\"totals\">" + leg[9] + "</div></th>\n";
    total += "  <th class=\"fn\">Drive Time <div class=\"totals\">" + leg[11] + "</div></th>\n";
    total += "  <th class=\"fn\">Charge Time <div class=\"totals\">" + leg[12] + "</div></th>\n";
    total += "  <th class=\"fn\">Effective<div class=\"totals\">" + leg[14] + "</div></th>\n";
    total += "  <th class=\"fn\">Average km\/h <div class=\"totals\">" + leg[15] + "</div></th>\n";
    total += "  <th class=\"fn\">Drive km\/h <div class=\"totals\">" + leg[16] + "</div></th>\n";
    total += " </tr>\n";
  }
  
  total += "<tr><td colspan=\"9\"</td></tr></table>";
  total += "<br>\n";
  return total;
}

function FillInTrips(where)
{
  var total = "";
  // Do the menu to get to all of them.  Maybe iframe or scroll-to.
  
  consolelog("CALLING FillInTrips " + AllTheTrips.length);
  consolelog("WHERE IS " + where);

  for (var i=AllTheTrips.length - 1; i >= 0; i-=1) {
    total += FillInSingle(AllTheTrips[i]);
  }
  total += "</pre>";
  document.getElementById(where).innerHTML = total;
}
