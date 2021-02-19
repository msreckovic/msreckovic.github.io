var jsonRacks = 
{"fNames":
 [["westbay", "racksR", "West Bay"],
  ["middlebaywest", "racksL", "Middle Bay - Left"],
  ["middlebayeast", "racksR", "Middle Bay - Right"],

  ["eastbaywest", "racksL", "East Bay - Left"],
  ["eastbayeast", "racksR", "East Bay - Right"],
  ["eastbayfront", "racksL", "East Bay - Singles"],

  ["doublesbaywest", "racksL", "Doubles Bay - Front"],
  ["doublesbayeast", "racksR", "Doubles Bay - Right"],
  ["doublesbayrear", "racksL", "Doubles Bay - Back"],

  ["outsidewall", "racksL", "Outside - Wall"],
  ["outsidefront", "racksR", "Outside - Front"],
 ],
 "fRacks" : [],
};

var boatsThatAreOnWater = [];
var boatsThatAreOnWaterExtra = [];

function FillRacks(elementRacks)
{
    var countBoats = 0;
    var countDamaged = 0;
    var countOut = 0;

    var total = "<table id=\"boathouse\">";
    total += "<tr><td>\n";
    for (var i=0; i<jsonRacks.fNames.length; i+=1) {
	total += " <div class=\"" + jsonRacks.fNames[i][1] + "\" id=\"" + jsonRacks.fNames[i][0] + "\">\n";
	total += "  <ul>\n";
	total += "   <li class=\"bay\">" + jsonRacks.fNames[i][2] + "</li>\n";

	// 0, 2, 4, 7, 10 are to the right
	var rightOf = (i==0 || i==2 || i==4 || i==7 || i == 10);
	for (var j=0; j<jsonRacks.fRacks[i].length; j+=1 ) {
	    var name = jsonRacks.fRacks[i][j][0];
	    var category = jsonRacks.fRacks[i][j][1];
	    var uppers = name.toUpperCase();
	    var index = boatsThatAreOnWater.indexOf(uppers);

	    var classes = "";
	    if (index >= 0) {
		classes = "red ";
		countOut += 1;
	    }
	    if (category == "damaged") {
		classes += "damaged ";
		countDamaged +=1;
	    }
	    if (classes) {
  		total += "   <li class=\"" + classes + "\">";
	    } else {
  		total += "   <li>";
	    }

	    if (index >= 0) {
		total += "<a href=\"#\">" +
		    "<span class=\"tooltip\">" +
		    boatsThatAreOnWater[index] + " out since " +
		    boatsThatAreOnWaterExtra[index][0] + " at " +
		    boatsThatAreOnWaterExtra[index][1] +
		    "</span></a>";
	    }
	    if (name == "&nbsp;") {
		total += name;
	    } else if (!category) {
		total += name;
		countBoats +=1;
	    } else if (rightOf) {
		countBoats +=1;
		total +=
		    name +
		    "&nbsp;<img height=\"16\" src=\"https://srecko.ca/ARC/images/cat-" + category + ".png\">";
	    } else {
		countBoats +=1;
		total +=
		    "<img height=\"16\" src=\"https://srecko.ca/ARC/images/cat-" + category + ".png\">&nbsp;" +
		    name;
	    }
	    total += "</li>\n";
	}
	total += "  </ul>\n";
	total += " </div><!-- " + jsonRacks.fNames[i][0] + " -->\n";
    }
    total += "</td></tr></table>\n";
    document.getElementById(elementRacks).innerHTML = total;

    var stats = "" + countBoats + " boats";
    if  (countDamaged) {
	stats += ", " + countDamaged + " damaged";
    }
    if (countOut) {
	stats += ", " + countOut + " on the water";
    }
    return stats;
}

function UpdateStatus(jsonIn)
{
    boatsThatAreOnWater = [];
    boatsThatAreOnWaterExtra = [];

    //boatsThatAreOnWater = ["4+ FINLESS '52", "4X DYNAMIC",];
    //boatsThatAreOnWaterExtra = [["Today","9am"],["Also today", "8am"],];
    if ("entry" in jsonIn.feed) {
	var entries = jsonIn.feed.entry;
	for (var i=0; i<entries.length; i+=1) {
  	    boatsThatAreOnWater.push(entries[i].gsx$boat.$t.toUpperCase());
	    boatsThatAreOnWaterExtra.push([entries[i].gsx$date.$t,
					   entries[i].gsx$time.$t]);
	}
    }
}

function AssignedBoats(jsonIn)
{
    var entries = jsonIn.feed.entry;
    var i;
    for (i=0; i<jsonRacks.fNames.length; i+=1) {
	jsonRacks.fRacks.push([["&nbsp;",""],["&nbsp;",""],["&nbsp;",""],["&nbsp;",""],["&nbsp;",""],["&nbsp;",""],["&nbsp;",""],]);
    }
    for (i=0; i<entries.length; i+=1) {
	var boat = entries[i].gsx$boats.$t;
	var rack = entries[i].gsx$rack.$t;
	var spot = entries[i].gsx$spot.$t;
	var type = entries[i].gsx$type.$t;
	var category = entries[i].gsx$category.$t.toLowerCase();

	if (rack >= 0 && spot >= 0) {
	    while (jsonRacks.fRacks[rack].length <= spot) {
		jsonRacks.fRacks[rack].push(["&nbsp;",""]);
	    }
	    if (jsonRacks.fRacks[rack][spot][0] != "&nbsp;") {
		console.log("Clobber " + rack + ", " + spot + " with " + boat);
	    }
	    jsonRacks.fRacks[rack][spot] = [type + " " + boat, category];
	}
    }
}

function DockStatus(jsonIn)
{
    var entries = jsonIn.feed.entry;
    var el = document.getElementById("dockstatus");
    if (el) {
	el.innerHTML = entries[0].gsx$dockstatus.$t;
    }
    el = document.getElementById("dockstatusdetails");
    if (el) {
	el.innerHTML = entries[1].gsx$dockstatus.$t;
    }
}
