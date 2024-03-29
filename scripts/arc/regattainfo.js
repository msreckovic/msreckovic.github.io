// gsx$shortname
// gsx$name
// gsx$date
// gsx$location
// gsx$entrydue
// gsx$trailerload
// gsx$trailerunload
// gsx$details
// gsx$entries
// gsx$payment
// gsx$link
// gsx$store
// gsx$index

var AutomatedLinksYear = "";

function GV(entry,shrt)
{
  var what = "gsx$" + shrt;
  if (entry && what in entry) {
    return entry[what].$t;
  }
  return "";
}

function CallbackListRegattasHow(jsonIn, active)
{
  var whatyear = AutomatedLinksYear;
  var script_tag = document.getElementById('regattainfo')
  if (script_tag) {
    var argyear = script_tag.getAttribute("data-year");
    if (argyear) {
      console.log("Setting regattainfo.js.whatyear from data-year to " + argyear)
      whatyear = argyear;
    }
  }

  var now = Date.now();
  
  var total = "";
  var entries = jsonIn.feed.entry;
  
  for (var i=0; i<entries.length; i++) {
    var entry = entries[i];
    if (GV(entry, "name") == "") continue;
    var one = "<td>" + GV(entry,"date") + "</td><td>" + GV(entry,"name") + "</td><td>" + GV(entry,"location") + "</td>";
    var detail = "";
    
    var ed = GV(entry,"entrydue");
    if (active && ed) {
      detail += "<small>Due: " + ed + "</small><br>";
    }
    var ln = GV(entry,"link");
    var ind = GV(entry,"index");
    if (ln) {
      detail += "<a target=\"_blank\" href=\"" + ln + "\">click for details</a>";
    } else if (whatyear && ind) {
      var sn = GV(entry,"shortname");
      ln = "?regatta=" + sn;
      detail += "<a target=\"_blank\" href=\"" + ln + "\">click for details</a>";
    } else if (active) {
      detail += "<a href=\"mailto:matt@argonautrowingclub.com\">click to inquire</a>";
    }
    if (!detail) {
      detail = "&nbsp;";
    }
    one += "<td>" + detail + "</td>";
    total += "<tr>" + one + "</tr>";
  }

  var head = "<tr><th>Date</th><th>Regatta</th><th>Location</th><th>";
  if (active) {
    // head += "Entries Due";
    head += "Details";
  } else {
    head += "Details";
  }
  head += "</th></tr>"
  var el = document.getElementById("regattas");
  if (el) {
    el.innerHTML = "<table id=\"regattas-table\">" + head + total + "</table>";
  }
}

function CallbackListRegattas(jsonIn)
{
  CallbackListRegattasHow(jsonIn, true);
}

function CallbackListRegattasInactive(jsonIn)
{
  CallbackListRegattasHow(jsonIn, false);
}

function InfoSingleRegatta(entry)
{
  var loading = GV(entry, "trailerload");
  var unloading = GV(entry, "trailerunload");
  var entrydue = GV(entry, "entrydue");
  var when = GV(entry, "date");
  var location = GV(entry, "location");
  
  var total = "";
  total += "<ul>";
  total += GV(entry, "details");
  if (when && location) {
    total += "<li>The regatta is held on " + when + " at " + location + "</li>";
  }
  if (entrydue) {
    total += "<li>Entry deadline (see below for details) is " + entrydue + ".</li>";
  }
  if (loading) {
    total += "<li>Boats are loaded on " + loading + ". Each crew must have enough members present to safely load the trailer.</li>";
  }
  if (unloading) {
    total += "<li>Boats are unloaded on " + unloading + ". Each crew must have enough members present to safely unload the trailer.</li>";
  }
  total += "<li>See the bottom of this page for the current entries and outstanding fees.</li>";
  total += "<li>For more details and event list and timing, go to <a target=\"_blank\" href=\"http://regattacentral.com\">regattacentral.com</a></li>";
  total += "</ul>";
  return total;
}

function InfoSingleEntries(entry)
{
  var total = "";
  total += "<ul>";
  total += GV(entry, "entries");
  total += "<li>Everybody in the crew needs to be in an active club member, registered with RCA.</li>";
  total += "<li>Talk to your program coach or coordinator about entry submissions.</li>";
  total += "<li>Once the entries are submitted, you are responsible for the payment, whether you race or not.</li>";
  total += "<li>Send an e-mail to <a href=\"mailto:matt@argonautrowingclub.com\">Matt</a>, with any questions or problems.</li>";
  total += "</ul>";
  return total;
}

function InfoSinglePayment(entry)
{
  // List elements from the payment
  var total = "";
  total += "<ul>";
  total += GV(entry, "payment");
  total += "<li>Find your name in the list below, see what your total fees are.</li>";
  total += "<li>Please monitor the email you registered with, that is where you will get the payment reminders.</li>";
  total += "</ul>";
  return total;
}

function InfoSingleFAQ(entry)
{
  // Full valid HTML
  var total = "";
  total += "<ul>";
  total += "<li>You have to be a registered ARC member, as well as registered with RCA. Without that in place, we cannot add you to the crew roster in the regatta registration system.</li>";
  total += "<li>Getting all the things in place will take a few days, so please submit the entries as early as possible.</li>";
  total += "<li>If you are rowing in a composite crew, with non-ARC members, start the process earlier. Note that the trailer fees are doubled for non-ARC members.</li>";
  total += "<li>Note that you may not get the first choice of a boat for the race.</li>";
  total += "</ul>";
  return total;
}

function CallbackForRegatta(entry)
{
  var el;
  el = document.getElementById("title");
  if (el) {
    el.innerHTML = GV(entry, "name") + " (" + GV(entry, "date") + ")";
  }

  el = document.getElementById("regatta-title");
  if (el) {
    el.innerHTML = GV(entry, "name");
  }

  el = document.getElementById("regatta");
  if (el) {
    el.innerHTML = InfoSingleRegatta(entry);
  }
  el = document.getElementById("entries");
  if (el) {
    el.innerHTML = InfoSingleEntries(entry);
  }
  el = document.getElementById("payment");
  if (el) {
    el.innerHTML = InfoSinglePayment(entry);
  }
}

function CallbackSingleRegatta(jsonIn, index)
{
  var entries = jsonIn.feed.entry;
  CallbackForRegatta(entries[index]);
}

function IndexFromShortName(entries, shortname)
{
  for (var i=0; i<entries.length; i++) {
    var sn = GV(entries[i], "shortname");
    if (sn == shortname) {
      return i;
    }
  }
  return -1;
}

function CallbackNamedRegatta(jsonIn, shortname)
{
  var entries = jsonIn.feed.entry;
  var index = IndexFromShortName(entries, shortname);
  if (index >= 0) {
    CallbackForRegatta(entries[index]);
  }
}
var RegattaSpecificName = "";
function SetRegattaSpecificName(shortname)
{
  RegattaSpecificName = shortname;
}

function StandardRegattaConfiguration(shortname, yearsheet, regattasheet)
{
  RegattaSpecificName = shortname;
  var total = "";
  total += "<h3>Regatta Details & Deadlines</h3><div id=\"regatta\"></div>\n";
  total += "<h3>Entries</h3><div id=\"entries\"></div>\n";
  total += "<h3>Payment</h3><div id=\"payment\"></div>\n";
  total += "<hr>\n";
  total += "<h3>Current Registration Information</h3>\n";
  total += "<h4 id=\"title\">Regatta</h4>\n";
  total += "<h4>Summary</h4><div id=\"summary\"></div>\n";
  total += "<hr />\n";
  total += "<h4>Athletes</h4><div id=\"athletes\"></div>\n";
  total += "<hr />\n";
  total += "<h4>Event List</h4><div id=\"details\"></div>\n";
  total += "<hr />\n";
  total += "<h4>Boats</h4><div id=\"boats\"></div>\n";
  total += "<hr />\n";
  total += "<h4>Trailer Map</h4><div id=\"trailermap\"></div>\n";

  console.log("Calling with yearsheet " + yearsheet);
  console.log("Calling with regattasheet " + regattasheet);

  var div = document.getElementById("standardregatta");
  if (div) {
    console.log("Setting on the standardregatta");
    div.innerHTML = total;
    if (yearsheet) {
      var src = "https://spreadsheets.google.com/feeds/list/" + yearsheet + "/public/values?alt=json-in-script&callback=StandardRegattaCallback";
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = src;
      div.insertBefore(script, null);
    }
    if (regattasheet) {
      console.log("This is regatta sheet " + regattasheet);
      var src = "https://spreadsheets.google.com/feeds/list/" + regattasheet + "/public/values?alt=json-in-script&callback=RegattasCallback";
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = src;
      div.insertBefore(script, null);
    }
  }
}

function StandardRegattaCallback(jsonIn) {
  CallbackNamedRegatta(jsonIn,RegattaSpecificName);
}
