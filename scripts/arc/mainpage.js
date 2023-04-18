var dInM = [31,28,31,30,31,30,31,31,30,31,30,31];
var mNameF = ["January", "February", "March", "April", "May", "June", "July",
              "August", "September", "October", "November", "December"];
var mNameS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
              "Aug", "Sep", "Oct", "Nov", "Dec"];
var dInW = ["", "Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
var dInWL = [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

var NORMAL = 0;
var TODAY = 1;
var EVENT = 2;

var DayProperties = { "0/0/0" : NORMAL };
var DayDescription = { "/0/0/0" : "default" }; 

var WorkoutProperties = { "0/0/0" : NORMAL };
var WorkoutDescription = { "/0/0/0" : "default" }; 

function IdString(y, m, d)
{
  // Well, this changed now that Google sheets return the date as number.
  if (y == 2023) {
    var i;
    var sum = 44926;
    for (i = 0; i < (m-1); i++) {    
      sum = sum + dInM[i];
    }
    sum = sum + d;    
    // console.log("For " + d + "-" + mNameS[m-1] + "-" + y + " return " + sum);
    return sum;
  }
  return "" + d + "-" + mNameS[m-1] + "-" + y;
}

function FillInTheClock()
{
  var total = "";
  total += "<div id='frame_clock'>";
  total += "<div style=''>";
  total += "<div class='clockCont'>";
  total += "<canvas id=\"clockid\" ";
  total += "class=\"CoolClock:clean:125:seconds:";
  total += getTorontoUTCOffset()[0];
  total += "\"></canvas>";
  total += "</div></div>";
  document.getElementById("fixedData").innerHTML = total;
}

function EnumerateMonths(year, month)
{
  for (var i=0; i<dInM[month]; i+=1) {
    var id = IdString(year, month, i+1)
    DayProperties[id] = NORMAL;
  }
}

function getTorontoUTCOffset()
{
  var today = new Date();
  Date.prototype.stdTimezoneOffset = function() {
    var jan = new Date(this.getFullYear(), 0, 1);
    var jul = new Date(this.getFullYear(), 6, 1);
    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  }

  Date.prototype.dst = function() {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
  }

  var utc_offset = -5;
  if (today.dst()) {
    utc_offset = -4;
  }
  var adjust = (utc_offset * 60 + today.getTimezoneOffset()) / 60;
  return [utc_offset, adjust];
}

function getTorontoDate()
{
  var now = new Date();
  var offset = new Date(now.valueOf() - getTorontoUTCOffset()[1] * 60 * 60 * 1000);
  console.log("Now is " + now); 
  console.log("Offset is " + offset); 

  return now;
}

var gTemperature = "";
function reqListener () {
  var str = this.responseText;
  var where = str.search("Temperature: <b>");
  var ss = str.substr(where);
  var start = ss.search("/");
  var end = ss.search("</b>");
  gTemperature = "<a href=\"ARC/status.html\">" + ss.substr(start+1, end-start-1) + "</a>";

  todayString("today", "lastupdated");
}

function todayString(where, note) {
  var now = getTorontoDate();
  var all = dInWL[now.getDay()] + "<div class=\"spacing\">&nbsp;</div>" + mNameF[now.getMonth()].substring(0,3) + " " + now.getDate() + ", " + now.getFullYear() + "<div class=\"spacing\">&nbsp;</div>" + gTemperature;

  document.getElementById(where).innerHTML = all;
  innerHTML = now;
}

function entering(event)
{
  var notes = document.getElementById("notes"); 
  notes.innerHTML = event.target.dataset.description;
  notes.style.display = "inline"; 
}

function leaving(event)
{
  var notes = document.getElementById("notes"); 
  notes.style.display = "none"; 
}

function classForDay(day, thisDate, theDate, theMonth, theYear)
{
  var what = "";
  var id = IdString(theYear, theMonth, thisDate);
  if (theDate == thisDate && WorkoutProperties[id] == EVENT) {
    var notes = document.getElementById("today-notes"); 
    // notes.innerHTML = WorkoutDescription[id];
  }

  if (DayProperties[id] == EVENT) {
    if (theDate == thisDate) {
      var notes = document.getElementById("today-notes"); 
      // notes.innerHTML = WorkoutDescription[id];
      what += " class=\"daycurrentnoted\" ";
    } else {
      what += " class=\"daynoted\"";
    }
    what += " data-description=\"" + DayDescription[id] + "\"";
    what += " onmouseenter=\"entering(event)\"";
    what += " onmouseleave=\"leaving(event)\"";
  } else {
    if (theDate == thisDate) {
      what += " class=\"daycurrent\" ";
    } else if (day == 7 || day == 0) {
      what += " class=\"daysunday\"";
    } else if (day == 6) {
      what += " class=\"daysaturday\"";
    } else {
      what += " class=\"dayweekday\"";
    }
  }
  return what;
}

function getMonth(theDay, theDate, theMonth, theYear)
{
  var total = "<table width=\"315px\">";
  total += "<tr><td class=\"monthheader\" colspan=\"7\">" + mNameF[theMonth] + " " + theYear + "</td></tr>";

  total += "<tr>";
  for (i=1; i<=7; i+=1) {
    total += "<th " + classForDay(i, 0, 1, 0, 0) + ">" + dInW[i] + " </th>";
  }
  total += "</tr>";

  thisDay = 1;
  started = 0;
  while (thisDay <= dInM[theMonth]) {
    total += "<tr>";
    for (i=1; i<8; i++) {
      if (!started && (i == theDay)) {
        started = 1;
      }

      if (started) {
        total += "<td " + classForDay(i, thisDay, theDate, theMonth+1, theYear) + ">" + thisDay + "</td>";
        thisDay ++;
      } else {
        total += "<td>&nbsp;</td>";
      }
      if (thisDay > dInM[theMonth]) {
        break;
      }
    }
    total += "</tr>";
  }
  total += "</table>";
  return total;
}

function getMonths(howMany) {
  // console.log("Calling getMonths " + howMany);
  var t = getTorontoDate();
  var theDate = t.getDate();
  var theMonth = t.getMonth();
  var theYear = t.getFullYear();
  var theDay = (((t.getDay() - theDate + 1) % 7) + 7) % 7;
  if (theDay == 0) {
    theDay = 7;
  }

  var total = [];
  for (var i=0; i<howMany; i++) {
    total.push( "" );

    if (i == 0) {
      total[i] = getMonth(theDay, theDate, theMonth, theYear);
    } else {
      total[i] = getMonth(theDay, -1, theMonth, theYear);
    }

    theDay = (theDay + dInM[theMonth]) % 7;
    if (theDay == 0) {
      theDay = 7;
    }
    theDate = -1;
    if (theMonth >= 11) {
      theYear ++;
    }
    theMonth = (theMonth + 1) % 12;
  }
  return total;
}

function updateThings() {
  var oReq = new XMLHttpRequest();
  oReq.addEventListener("load", reqListener);
  oReq.open("GET", "http://www.mytaglist.com/ethSharedFrame.aspx?pic=1&hide_name=0&hide_temp=0&hide_rh=0&hide_updated=0&hide_signal=1&hide_battery=0&hide_battery_volt=1&hide_motion=1&uuids=3b66ea4c-92fb-4157-9cb4-16e0ef36f18e");
  oReq.send();

  // document.getElementById("current").innerHTML = "Everything is OK, remain calm";
}

// return GetValue(entry, "gsx$totals", "$0");
function GetValue(where, what, instead)
{
  if (what in where) {
    return where[what].$t;
  }
  return instead;
}

function GetLink(entry, link, name)
{
  var n = GetValue(entry, name, "");
  if (n) {
    var l = GetValue(entry, link, "");
    if (!l) {
      l = n;
    }
    return "<a href=\"" + l + "\">" + n + "</a>";
  }
  return "";
}

function JsonCallbackEvents(jsonIn)
{
  var t = getTorontoDate();
  var theDate = t.getDate();
  var theMonth = t.getMonth();
  var theYear = t.getFullYear();
  var theDay = (((t.getDay() - theDate + 1) % 7) + 7) % 7;
  if (theDay == 0) {
    theDay = 7;
  }

  EnumerateMonths(theYear, theMonth+1);
  EnumerateMonths(theYear, (theMonth+2) % 12);
  EnumerateMonths(theYear, (theMonth+3) % 12);

  var entries = [];
  if (jsonIn && jsonIn.feed && jsonIn.feed.entry) {
    entries = jsonIn.feed.entry;
  }

  // console.log("Found " + entries.length + " event entries");
  for (var i=0; i<entries.length; i+=1) {
    // console.log("Entry " + i + " is " + JSON.stringify(entries[i]));
    var when = GetValue(entries[i], "gsx$when", "");
    // console.log("When is " + when);
    if (when) {
      var what = GetValue(entries[i], "gsx$what", "");
      DayProperties[when] = EVENT;
      if (when in DayDescription) {
        DayDescription[when] = DayDescription[when] + " | " + what;
      } else {
        DayDescription[when] = what; 
      }
    }
  }

  var ids = ["current", "second", "third"];
  var months = getMonths(3);

  var i;
  for (i=0; i<months.length; i++) {
    document.getElementById(ids[i]).innerHTML = months[i];
  }
  
  for (i=0; i<4; i+=1) {
    var link = GetLink(entries[i],"gsx$link","gsx$name");
    document.getElementById("link" + (i+1)).innerHTML = link;
  }

  updateThings();
}

function JsonCallbackWorkouts(jsonIn)
{
  var entries = jsonIn.feed.entry;
  for (var i=0; i<entries.length; i+=1) {
    var when = GetValue(entries[i], "gsx$when", "");
    if (when) {
      var what = GetValue(entries[i], "gsx$what", "");
      WorkoutProperties[when] = EVENT;
      if (when in WorkoutDescription) {
        WorkoutDescription[when] = WorkoutDescription[when] + " | " + what;
      } else {
        WorkoutDescription[when] = what; 
      }
    }
  }
}

