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
    "gsx$dist.", 	   // 3
    "gsx$cumul.",          // 4
    "gsx$rated",           // 5
    "gsx$whkm",            // 6
    "gsx$arrivaltime",     // 7
    "gsx$arr.range",       // 8
    "gsx$departuretime",   // 9
    "gsx$dep.range",       // 10
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

function GetKm(where, what)
{
    if (what in where) {
	var fnd = where[what].$t.search("km");
	if (fnd >= 0) {
	    return where[what].$t.substring(0,fnd);
	}
	return where[what].$t;
    }
    return "";
}

function Dump(entry)
{
    return   [GetValue(entry,map[0]),
		GetValue(entry,map[1]),
		GetValue(entry,map[2]),
		GetValue(entry,map[3]),
		GetValue(entry,map[4]),
		GetValue(entry,map[5]),
		GetValue(entry,map[6]),
		GetValue(entry,map[7]),
		GetValue(entry,map[8]),
		GetValue(entry,map[9]),
		GetValue(entry,map[10]),
		GetValue(entry,map[11]),
		GetValue(entry,map[12]),
		GetValue(entry,map[13]),
		GetValue(entry,map[14]),
		GetValue(entry,map[15]),
		GetValue(entry,map[16]),
		];

}

function TripStart(entry)
{
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
	    GetValue(entry,map[7]),
	    GetKm(entry,map[8]),
	    GetValue(entry,map[9]),
	    GetKm(entry,map[10]),
	    GetValue(entry,map[11]),
	    GetValue(entry,map[12]),
	    GetKm(entry,map[13]),
	    GetValue(entry,map[14]),
	    GetKm(entry,map[15]),
	    GetKm(entry,map[16]),
	   ];
}

function TeslaTrips(jsonIn)
{
    AllTheTrips = [];

    var entries = jsonIn.feed.entry;
    if (!entries) return;
    var inTrip = false;
    var single = "";
    for (var i=0; i<entries.length; i++) {
	var first = GetValue(entries[i], map[0]);
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
	    single.fTripLegs.push(TripLeg(entries[i]));
	    if (first == "END" || first == "ENDPLAN") {
		AllTheTrips.push(single);
		inTrip = false;
	    }
	} else {
	    console.log("This is weird, and should not happen");
	}
    }
    if (inTrip) {
	AllTheTrips.push(single);
	inTrip = false;
    }
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
	total += "  <th class=\"fn\">Distance <div class=\"totals\">" + leg[4].trim() + " (" + leg[5].trim() + ")</div></th>\n";
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

    for (var i=AllTheTrips.length-1; i>=0; i-=1) {
	total += FillInSingle(AllTheTrips[i], choice);
	total += "<br>\n";
    }
    total += "</pre>";
    document.getElementById(where).innerHTML = total;
}
