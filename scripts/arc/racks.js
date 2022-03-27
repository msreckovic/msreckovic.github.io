jsonRacks = {"fNames": [], "fRacks" : [] };

var boatsThatAreOnWater = [];
var boatsThatAreOnWaterExtra = [];

function FillRacks(elementRacks)
{
  var countBoats = 0;
  var countDamaged = 0;
  var countOut = 0;
  
  console.log("RACKS " + jsonRacks.fNames);

  var total = "<table id=\"boathouse\">";
  total += "<tr><td>\n";
  for (var i=0; i<jsonRacks.fNames.length; i+=1) {
    if (i == 0 || i == 2 || i == 4 || i == 6) {
      total += "</td></tr><tr><td>\n";
    }

    console.log("RACKS " + i + " is " + jsonRacks.fNames);

    total += " <div class=\"" + jsonRacks.fNames[i][1] + "\" id=\"" + jsonRacks.fNames[i][0] + "\">\n";
    total += "  <ul>\n";
    total += "   <li class=\"bay\">" + jsonRacks.fNames[i][0] + "</li>\n";
    
    var rightOf = (i==1 || i==3 || i==5 || i==7 || i == 9);
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
  console.log("TOTAL IS " + total);
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
  console.log("HERE IS THE INCOMING JSON " + entries);

  var i;
  jsonRacks.fNames = [];
  jsonRacks.fRacks = [];
  
  for (var i = 0; i < 9; i++) {  
  jsonRacks.fRacks.push([["&nbsp;",""], ["&nbsp;",""], ["&nbsp;",""], ["&nbsp;",""],
                         ["&nbsp;",""], ["&nbsp;",""], ["&nbsp;",""], ["&nbsp;",""],
                         ["&nbsp;",""],]);
    jsonRacks.fNames.push(["", ""]);
  }
  console.log("RACKS INITIAL " + jsonRacks.fRacks.length + " = " + jsonRacks.fRacks);
  console.log("NAMES INITIAL " + jsonRacks.fNames.length + " = " + jsonRacks.fNames);

  for (var i=0; i<entries.length; i+=1) {
    var boat = ("" + entries[i].gsx$boats.$t).toLowerCase()
        .split(' ').map(word => word.charAt(0).toUpperCase() + word.substring(1))
        .join(' ').replace("Ii", "II");

    console.log("TOWER ENTRY " + entries[i].gsx$tower.$t);

    var tower_def = entries[i].gsx$tower.$t.split(" \(");
    console.log("TOWER DEF " + tower_def.length + " = " + tower_def);
    var tower = 0;
    var leftOrRight = "L";
    if (tower_def[0] == "AW") {
      tower = 0;
      leftOrRight = "L";
    } else if (tower_def[0] == "AE") {
      tower = 1;
      leftOrRight = "R";
    } else if (tower_def[0] == "CW") {
      tower = 2;
      leftOrRight = "L";
    } else if (tower_def[0] == "CE") {
      tower = 3;
      leftOrRight = "R";
    } else if (tower_def[0] == "RW") {
      tower = 4;
      leftOrRight = "L";
    } else if (tower_def[0] == "RE") {
      tower = 5;
      leftOrRight = "R";
    } else if (tower_def[0] == "DWF") {
      tower = 6;
      leftOrRight = "L";
    } else if (tower_def[0] == "DWR") {
      tower = 7;
      leftOrRight = "L";
    } else if (tower_def[0] == "DE") {
      tower = 8;
      leftOrRight = "R";
    }
    console.log("BOAT " + boat + " TOWER_DEF " + tower_def[0] + " and index " + tower);

    var rack = parseInt(("" + entries[i].gsx$rack.$t).split(" / ")[0]);
    var type = entries[i].gsx$type.$t;
    var grade = entries[i].gsx$grade.$t.toLowerCase();
    
    console.log("RACK " + rack + " TYPE " + type + " GRADE " + grade);

    if (tower >= 0 && rack >= 0) {
      console.log("TOWER INDEX " + tower + " out of " + jsonRacks.fNames.length);
      if (jsonRacks.fNames[tower][0] == "") {
        jsonRacks.fNames[tower][0] = tower_def[0];

        // This one gives us the correct CSS - racksL or racksR
        jsonRacks.fNames[tower][1] = "racks" + leftOrRight;
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
