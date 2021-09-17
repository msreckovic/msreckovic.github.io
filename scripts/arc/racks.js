jsonRacks = {"fNames": [], "fRacks" : [] };

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
    if (i % 3 == 0) {
      total += "</td></tr><tr><td>\n";
    }

    total += " <div class=\"" + jsonRacks.fNames[i][1] + "\" id=\"" + jsonRacks.fNames[i][0] + "\">\n";
    total += "  <ul>\n";
    total += "   <li class=\"bay\">" + jsonRacks.fNames[i][0] + "</li>\n";
    
    // 0, 2, 4, 7, 10 are to the right
    var rightOf = (i==0 || i==2 || i==4 || i==7 || i == 10);
    for (var j=0; j<jsonRacks.fRacks[i].length; j+=1 ) {
      var name = jsonRacks.fRacks[i][j][0];
      var grade = jsonRacks.fRacks[i][j][1];
      var uppers = name.toUpperCase();
      var index = boatsThatAreOnWater.indexOf(uppers);
      
      var classes = "";
      if (index >= 0) {
        classes = "red ";
        countOut += 1;
      }
      if (grade == "damaged") {
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
      } else if (!grade) {
        total += name;
        countBoats +=1;
      } else if (rightOf) {
        countBoats +=1;
        total +=
          name +
          "&nbsp;<img height=\"16\" src=\"https://srecko.ca/ARC/images/cat-" + grade + ".png\">";
      } else {
        countBoats +=1;
        total +=
          "<img height=\"16\" src=\"https://srecko.ca/ARC/images/cat-" + grade + ".png\">&nbsp;" +
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
  // console.log("HERE IS THE INCOMING JSON " + entries);

  var i;
  jsonRacks.fNames = [];
  for (var i=0; i<entries.length; i+=1) {
    var boat = ("" + entries[i].gsx$boats.$t).toLowerCase()
        .split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1))
        .join(' ').replace("Ii", "II");

    var tower_def = entries[i].gsx$tower.$t.split(" / ");
    var tower = parseInt(tower_def[0]);

    while (tower >= jsonRacks.fRacks.length) {
      // This assumes at most 7 racks, indexed 0 through 6, but we correct it below
      jsonRacks.fRacks.push([["&nbsp;",""], ["&nbsp;",""], ["&nbsp;",""],
                             ["&nbsp;",""], ["&nbsp;",""], ["&nbsp;",""], ["&nbsp;",""],]);
      jsonRacks.fNames.push(["", ""]);
    }

    var rack = parseInt(("" + entries[i].gsx$rack.$t).split(" / ")[0]);
    var type = entries[i].gsx$type.$t;
    var grade = entries[i].gsx$grade.$t.toLowerCase();
    
    if (tower >= 0 && rack >= 0) {
      if (jsonRacks.fNames[tower][0] == "") {
        jsonRacks.fNames[tower][0] = tower_def[2];

        // This one gives us the correct CSS - racksL or racksR
        jsonRacks.fNames[tower][1] = "racks" + tower_def[1];
      }

      while (jsonRacks.fRacks[tower].length <= rack) {
        jsonRacks.fRacks[tower].push(["&nbsp;",""]);
      }
      if (jsonRacks.fRacks[tower][rack][0] != "&nbsp;") {
        console.log("Clobber " + tower + ", " + rack + " with " + boat);
      }
      jsonRacks.fRacks[tower][rack] = [type + " " + boat, grade];
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
