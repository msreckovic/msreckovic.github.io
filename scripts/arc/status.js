var FullLog = [];
var ActiveLog = [];
var LastStamp = "";
var NumberOfEntries = 0;

function CreateEntry(boat, ondate, starttime, endtime)
{
  return {"fDate" : ondate,
          "fBoat" : boat,
          "fStart" : starttime,
          "fEnd" : endtime};
}

function GetFullLog(jsonIn)
{
  if ("entry" in jsonIn.feed) {
    var entries = jsonIn.feed.entry;
    for (var i=0; i<entries.length; i+=1) {
      LastStamp = entries[i].gsx$date.$t + " at " + entries[i].gsx$stamp.$t;
      /*console.log("Entry " + entries[i].gsx$status.$t + "; " +
        entries[i].gsx$date.$t + "; " +
        entries[i].gsx$time.$t + "; " +
        entries[i].gsx$stamp.$t + "; " +
        entries[i].gsx$boat.$t + "; " +
        entries[i].gsx$processed.$t + "; " +
        entries[i].gsx$match.$t + "; ");*/
      if (entries[i].gsx$processed.$t == "Matched") {
        // Need to adjust by 2 - first row is ignored, and the sheet is 1 based
        FullLog.push(CreateEntry(entries[i].gsx$boat.$t,
                                 entries[i].gsx$date.$t,
                                 entries[i].gsx$time.$t,
                                 entries[entries[i].gsx$match.$t-2].gsx$stamp.$t));
      } else if (entries[i].gsx$processed.$t == "From") {
      } else {
        ActiveLog.push(CreateEntry(entries[i].gsx$boat.$t,
                                   entries[i].gsx$date.$t,
                                   entries[i].gsx$time.$t,
                                   ""));
      }
    }
  }
  NumberOfEntries = entries.length;
}

function FillLog(thediv)
{
  var total = "";
  if (FullLog.length > 0) {
    if (NumberOfEntries > 1800) {
      total += "<h2 class=\"red\">ARC Boat Log</h2>";
    } else {
      total += "<h2>ARC Boat Log</h2>";
    }
    total += "<center><table width=\"80%\">";
    total += "<tr>";
    total += "<th width=\"16%\">Date</th>";
    total += "<th width=\"60%\">Boat</th>";
    total += "<th width=\"12%\">Launched</th>";
    total += "<th width=\"12%\">Docked</th>";
    total += "</tr>";
    
    var prev = "";
    for (var i=FullLog.length-1; i>=0; i-=1) {
      var one = FullLog[i];
      total += "<tr>";
      if (prev != one.fDate) {
        total += "<td class=\"special\">" + one.fDate + "</td>";
      } else {
        total += "<td>" + one.fDate + "</td>";
      }
      prev = one.fDate;
      total += "<td>" + one.fBoat + "</td>";
      total += "<td>" + one.fStart + "</td>";
      total += "<td class=\"end\">" + one.fEnd + "</td>";
      total += "</tr>";
    }
    total += "</table></center>";
  }
  document.getElementById(thediv).innerHTML = total;
  return "Last entry made on " + LastStamp + " total " + FullLog.length;
}

function FillActive(thediv)
{
  var total = "";
  if (ActiveLog.length > 0) {
    total += "<h2>ARC Boats Out</h2>";
    total += "<center><table width=\"80%\">";
    total += "<tr>";
    total += "<th width=\"20%\">Date</th>";
    total += "<th width=\"60%\">Boat</th>";
    total += "<th width=\"10%\">Launched</th>";
    total += "</tr>";
    for (var i=0; i<ActiveLog.length; i+=1) {
      var one = ActiveLog[i];
      total += "<tr>";
      total += "<td>" + one.fDate + "</td>";
      total += "<td>" + one.fBoat + "</td>";
      total += "<td>" + one.fStart + "</td>";
      total += "</tr>";
    }
    total += "</table>";
  }
  document.getElementById(thediv).innerHTML = total;
}
