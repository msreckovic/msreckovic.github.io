AllTheTrips =
  [ {"fTripRaw" : "",
     "fTripCities" : "",
     "fTripDate" : "",
     "fTripTemp" : "",
     "fTripLegs" : []
    },
  ];

var map = [
  "gsx$trip",            // 0
  "gsx$city",            // 1
  "gsx$address",         // 2
  "gsx$distance",        // 3
  "gsx$cumul",           // 4
  "gsx$rated",           // 5
  "gsx$whkm",            // 6
  "gsx$arrivaltime",     // 7
  "gsx$arrivalrange",    // 8
  "gsx$departuretime",   // 9
  "gsx$departurerange",  // 10
  "gsx$driveduration",   // 11
  "gsx$chargeduration",  // 12
  "gsx$added",           // 13
  "gsx$usage",           // 14
  "gsx$chargekmh",       // 15
  "gsx$drivekmh",        // 16
];

var Headers =
    [
      [["Distance","120",    3,"km",     4,"km"],
       ["Arrival","130",     7,"",      11,""],
       ["Departure","130",    9,"",      12,""],
       ["Arr. Range","120",  8,"km",     5,"km"],
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

function GetValue(where, what)
{
  if (what in where) {
    return where[what].$t;
  }
  return "";
}

function FormatAsTime(when)
{
  var sec = Math.round(when * 86400);
  var minutes = Math.floor(sec / 60);
  sec = sec - minutes * 60;
  var hours = Math.floor(minutes / 60);
  minutes = minutes - hours * 60;
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  consolelog("CONVERTING " + when + " to " + hours + ":" + minutes + ":" + sec);

  return "" + hours + ":" + minutes;
}

function GetTime(where, what)
{
  var thet = "";  
  if (what in where) {
    thet = where[what].$t;
  }
  if (thet == "") return "";
  
  return FormatAsTime(thet);
}

function GetDuration(where, what)
{
  var thet = "";  
  if (what in where) {
    thet = where[what].$t;
  }
  if (thet == "") return "";
  
  return FormatAsTime(thet);
}

function GetPercentage(where, what)
{
  var thet = "";  
  if (what in where) {
    thet = where[what].$t;
  }
  if (thet == "") return "";
  
  return "" + Math.round(100*parseFloat(thet)) + "%";
}

function GetKm(where, what)
{
  if (what in where) {
    var thet = where[what].$t;
    if (thet == "") return "";

    var fnd = String(thet).search("km");
    if (fnd >= 0) {
      return "" + Math.round(parseFloat(String(thet).substring(0,fnd)));
    }
    return "" + Math.round(parseFloat(thet));
  }
  return "";
}

function GetKph(where, what)
{
  if (what in where) {
    var thet = where[what].$t;
    if (thet == "") return "";

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
  consolelog("fTripRaw " + GetValue(entry,map[0]));
  consolelog("fTripCities " + GetValue(entry,map[1]))
  consolelog("fTripDate " + GetValue(entry,map[2]))
  consolelog("fTripTemp " + GetValue(entry,map[3]))

  return  {"fTripRaw" : GetValue(entry,map[0]),
           "fTripCities" : GetValue(entry,map[1]),
           "fTripDate" : GetValue(entry,map[2]),
           "fTripTemp" : GetValue(entry,map[3]),
           "fTripLegs" : []
          };
}

function TripLeg(entry)
{
  return [GetValue(entry,map[0]),
          GetValue(entry,map[1]),
          GetValue(entry,map[2]),
          GetKm(entry,map[3]),
          GetKm(entry,map[4]),
          GetKm(entry,map[5]),
          GetValue(entry,map[6]),
          GetTime(entry,map[7]),
          GetKm(entry,map[8]),
          GetTime(entry,map[9]),
          GetKm(entry,map[10]),
          GetDuration(entry,map[11]),
          GetDuration(entry,map[12]),
          GetKm(entry,map[13]),
          GetPercentage(entry,map[14]),
          GetKph(entry,map[15]),
          GetKph(entry,map[16]),
         ];
}

function TeslaTripsPlan(jsonIn)
{
  TeslaTripsCommon(jsonIn);
  FillInTrips("trip", 0); 
}

function TeslaTripsMade(jsonIn)
{
  TeslaTripsCommon(jsonIn);
  FillInTrips("trip", 1); 
}

function TeslaTripsCommon(jsonIn)
{
  AllTheTrips = [];
  
  consolelog("Calling TeslaTrips");

  var entries = jsonIn.feed.entry;
  if (!entries) {
    consolelog("NO ENTRIES AT ALL");
    return;
  }
  consolelog("01");
  var inTrip = false;
  var single = "";
  consolelog("02");
  consolelog("03 entries length " + entries.length);
  for (var i=0; i<entries.length; i++) {
    consolelog("ENTRY " + i + " IS " + JSON.stringify(entries[i]));

    var first = GetValue(entries[i], map[0]);
    consolelog("FIRST " + first);
    if (first == "START" || first == "STARTPLAN") {
      if (inTrip) {
        AllTheTrips.push(single);
        inTrip = false;
      }
      if (!inTrip) {
        single = TripStart(entries[i]);
        inTrip = true;
      }
    } else if (inTrip) {
      var leg = TripLeg(entries[i]);
      consolelog("LEG " + leg);
      single.fTripLegs.push(leg);
      if (first == "END" || first == "ENDPLAN") {
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

function FillInSingle(trip, choice)
{
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
  return total;
}

// choice is 0 for plan, 1 for actual
function FillInTrips(where, choice)
{
  var total = "";
  // Do the menu to get to all of them.  Maybe iframe or scroll-to.
  
  consolelog("CALLING FillInTrips " + AllTheTrips.length);
  consolelog("WHERE IS " + where);

  for (var i=AllTheTrips.length-1; i>=0; i-=1) {
    total += FillInSingle(AllTheTrips[i], choice);
    total += "<br>\n";
  }
  total += "</pre>";
  document.getElementById(where).innerHTML = total;
}
