// gsx$regatta
// gsx$event1
// ...
// gsx$eventN
// gsx$totals
// gsx$paid
// gsx$note

function MakeSureD(val)
{
  var v;
  if (val[0] == "$") {
    v = parseFloat(val.substring(1));
  } else {
    v = parseFloat(val);
  }
  if (isNaN(v)) {
    return val;
  }
  return "$" + Math.ceil(v);
}

function ForEvent(event, crews, trailer, entry, total, captains)
{
  var summary = "";
  summary += "    <td class=\"athletes\" data-label=Event>" + event + "</td>\n";
  if (!crews) crews = "n/a";
  summary += "    <td data-label=Crews>" + crews;
  if (captains) {
    summary += ": " + captains;
  }
  summary +=       "</td>\n";
  summary += "    <td data-label=Entry-Fees>" + MakeSureD(entry) + "</td>\n";
  summary += "    <td data-label=Trailer-Fees>" + MakeSureD(trailer) + "</td>\n";
  summary += "    <td data-label=Event-Total>" + MakeSureD(total) + "</td>\n";
  return summary;
}

function GetValue(where, what, instead)
{
  if (where && what in where) {
    return where[what].$t;
  }
  return instead;
}

function GetValueD(where, what, instead)
{
  return MakeSureD(GetValue(where, what, instead));
}

function GetValueX(where, what, instead)
{
  if (what in where) {
    var val = where[what].$t;
    if (!val) val = instead;
    return MakeSureD(val);
  }
  return MakeSureD(instead);
}

function GetTotal(entry)
{
  return GetValue(entry, "gsx$totals", "0");
}

function GetTotalD(entry)
{
  return MakeSureD(GetTotal(entry));
}

function AllSummary(entries, count)
{
  var summary = "<table>\n";
  summary += "  <thead>\n";
  summary += "    <tr>\n";
  summary += "      <th>Crews</th>\n";
  summary += "      <th>Athletes</th>\n";
  summary += "      <th>Entry-Fees</th>\n";
  summary += "      <th>Trailer-Fees</th>\n";
  summary += "      <th>Total-Fees</th>\n";
  summary += "      <th>Collected</th>\n";
  summary += "    </tr>\n";
  summary += "  </thead>\n";
  summary += "  <tbody>\n";
  
  summary += "    <tr>";
  summary += "    <td data-label=Crews>" + GetTotal(entries[3]) + " (" + GetTotal(entries[6]) + " seats)</td>\n";
  summary += "    <td data-label=Athletes>" + count + "</td>\n";
  summary += "    <td data-label=Entry-Fees>" + GetTotalD(entries[5]) + "</td>\n";
  summary += "    <td data-label=Trailer-Fees>" + GetTotalD(entries[4])  + "</td>\n";
  summary += "    <td data-label=Total-Fees>" + GetTotalD(entries[7])  + "</td>\n";
  summary += "    <td data-label=Collected>" + GetValueD(entries[7], "gsx$paid", "0")  + "</td>\n";
  summary += "    </tr>";
  
  summary += "  </tbody>\n";
  summary += "</table>\n";
  return summary;
}

function BoatFromCaptain(captain)
{
  var collected = [];
  if (captain) {
    // TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO 
    var split = captain.search("; ");
    while (split > 0) {
      var found = captain.search("- ");
      collected.push(captain.substring(found+2, split));
      captain = captain.substring(split+2, captain.length);
      split = captain.search("; ");
    }
    var found = captain.search("- ");
    collected.push(captain.substring(found+2, captain.length));
  }
  return collected;
}

function ValFromType(type)
{
  if (type.search("o trailer") > 0) {
    return "";
  }
  
  if (type.search("8") >= 0) {
    return "8";
  }
  if (type.search("4") >= 0) {
    return "4";
  }
  if (type.search("2") >= 0) {
    return "2";
  }
  if (type.search("1") >= 0) {
    return "1";
  }
  return "";
};


function BoatsFromSet(boats)
{
  // Don't care if another boat type shows up
  var all = {"8":[], "4":[], "2":[], "1":[]};
  
  var boatsA = Array.from(boats);
  for (var j=0; j<boatsA.length; j+=1) {
    var boat = boatsA[j];
    var what = ValFromType(boat);
    if (what) {
      all[what].push(boat);
    }
  }
  
  all["8"].sort();
  all["4"].sort();
  all["2"].sort();
  all["1"].sort();
  
  var total = "<table id=\"boats\">";
  total += "<tr><th class=\"athletes\">Eights</th><th>Fours</th><th>Doubles</th><th>Singles</th></tr>";
  total += "<tr>";
  
  total += "<td data-label=Eights><ul>"; // Eights
  for (i=0; i<all["8"].length; i+=1) {
    total += "<li>" + all["8"][i] + "</li>";
  }
  total += "</ul></td>";
  
  total += "<td data-label=Fours><ul>"; // Fours/Quads
  for (i=0; i<all["4"].length; i+=1) {
    total += "<li>" + all["4"][i] + "</li>";
  }
  total += "</ul></td>";
  
  total += "<td data-label=Doubles><ul>"; // Doubles/Pairs
  for (i=0; i<all["2"].length; i+=1) {
    total += "<li>" + all["2"][i] + "</li>";
  }
  total += "</ul></td>";
  
  total += "<td data-label=Singles><ul>"; // Singles
  for (i=0; i<all["1"].length; i+=1) {
    total += "<li>" + all["1"][i] + "</li>";
  }
  total += "</ul></td>";
  total += "</tr></table>";
  
  return total;
}

function CountEvents(entries)
{
  var en0 = entries[0];
  for (var i=1; i<=100; i+=1) {
    if (!("gsx$event"+i in en0)) break;
  }
  
  return i;
}

function AllDetails(entries, evented)
{
  var boats = new Set();
  
  var details = "<table>\n";
  details += "  <thead>\n";
  details += "    <tr>\n";
  details += "      <th class=\"athletes\">Event</th>\n";
  details += "      <th>Crews</th>\n";
  details += "      <th>Entry-Fees</th>\n";
  details += "      <th>Trailer-Fees</th>\n";
  details += "      <th>Event-Total</th>\n";
  details += "    </tr>\n";
  details += "  </thead>\n";
  
  details += "  <tbody>\n";
  
  var en0 = entries[0];
  var en3 = entries[3];
  var en4 = entries[4];
  var en5 = entries[5];
  var en7 = entries[7];
  var en10 = entries[10];
  var i;
  
  for (i=1; i<=100; i+=1) {
    details += "   <tr>";
    if (!("gsx$event"+i in en0)) break;
    var ev = "gsx$event"+i;
    var captain = GetValue(en10, ev, "");
    if (i in evented) {
      var repl = captain.search("(crew)");
      if (repl >= 0) {
        captain = captain.substring(0, repl) +
          evented[i] +
          captain.substring(repl+4,captain.length);
      }
    }
    details += ForEvent(GetValue(en0, ev, ""),
                        GetValue(en3, ev, ""),
                        GetValue(en4, ev, ""),
                        GetValue(en5, ev, ""),
                        GetValue(en7, ev, ""),
                        captain);
    details += "   </tr>\n";
    
    var boat = BoatFromCaptain(captain);
    for (var j=0; j<boat.length; j+=1) {
      boats.add(boat[j]);
    }
  }
  
  details += "  </tbody>\n";
  details += "</table>\n";
  return [i, details, boats];
}

function ExtractAthletes(entries, count)
{
  // Count isn't really count because there is no event 0
  var en0 = entries[0];
  
  // { Name : [Events, Cost, Paid], ...}
  var extracted = {};
  var evented = {};
  for (var row=11; row<200; row+=1) {
    var enr = entries[row];
    var who = GetValue(enr, "gsx$regatta", "");
    if (!who) break;
    
    var names = who.split(" ");
    
    var events = "";
    for (var i=1; i<count; i+=1) {
      var ev = "gsx$event"+i;
      if (GetValue(enr, ev, "")) {
        if (events) {
          events += "; ";
        }
        events += GetValue(en0, ev, "");
        
        if (i in evented) {
          evented[i] += ", " + names[1];
        } else {
          evented[i] = names[1];
        }
      }
    }
    if (events) {
      extracted[who] = [events, GetValue(enr, "gsx$totals", "0"), GetValueX(enr, "gsx$paid", "0"), GetValue(enr, "gsx$note", "")];
    }
  }
  return [extracted,evented];
}

function FieldValue(field)
{
  // Math.ceil(parseFloat(field.substring(1).replace(/,/g,'')));
  if (field[0] == "$") {
    return parseFloat(field.substring(1));
  } else {
    return parseFloat(field);
  }
}

// https://squareup.com/receipt/preview/vfQrQI0V4hy2AkKKASJrKtMF
function AddAthlete(who, data, regattaName)
{
  var total = "<tr>";
  total += "    <td data-label=Name class=\"athletes\">" + who + "</td>\n";
  total += "    <td data-label=Events class=\"athletes\">" + data[0] + "</td>\n";
  var d1 = data[1];
  var amountUp = MakeSureD(FieldValue(d1));

  // console.log("ComparE " + data[1] + " and " + data[2]);
  // console.log("Compare " + FieldValue(data[1]) + " and " + FieldValue(data[2]));

  if (FieldValue(data[1]) > FieldValue(data[2])) {

    var whoAdjusted = who.replace(/ /g, '%20');
    var linkToPay = "https://argonaut-rowing-club.myshopify.com/cart/12624166387814:" + amountUp + "?note=" + whoAdjusted + "-for-Regattas-" + regattaName;

    total += "    <td class=\"alert\" data-label=Fees>";
    total += "<a target=\"_blank\" href=\"" + linkToPay + "\">";
    total += MakeSureD(data[1]);
    total += "</a>";
    total += "    </td>\n";
    total += "    <td data-label=Paid>" + MakeSureD(data[2]) + "</td>\n";
  } else {
    total += "    <td class=\"gone\" data-label=Fees>" + MakeSureD(data[1]) + "</td>\n";
    if (data[3].length > 16) {
      total += "    <td class=\"square\" data-label=Paid>";
      total += "<a target=\"_blank\" href=\"" + MakeSureD(data[3]) + "\">";
      total += data[2];
      total += "</a>";
      total += "    </td>\n";
    } else {
      total += "    <td data-label=Paid>" + MakeSureD(data[2]) + "</td>\n";
    }
  }
  
  return total;
}

function AllAthletes(extracted, regattaName)
{
  console.log("Calling AllAthletes");

  var athletes = "If you have fees outstanding, please pay by clicking on the amount in the \"Fees\" column.  If you have paid, you can get the receipt by clicking on the amount in the \"Paid\" column."
  athletes += "<table>\n";
  athletes += "  <thead>\n";
  athletes += "    <tr>\n";
  athletes += "      <th class=\"athletes\">Name</th>\n";
  athletes += "      <th class=\"athletes\">Events</th>\n";
  athletes += "      <th>Fees</th>\n";
  athletes += "      <th>Paid</th>\n";
  athletes += "    </tr>\n";
  athletes += "  </thead>\n";
  athletes += "  <tbody>\n";
  
  var keys = Object.keys(extracted);
  keys.sort();
  for (var i=0; i<keys.length; i+=1) {
    one = keys[i];
    athletes += AddAthlete(one, extracted[one], regattaName);
  }
  
  return athletes;
}

function RegattasCallback(jsonIn)
{
  console.log("CALLING regattas.js.RegattasCallback");
  //console.log(JSON.stringify(jsonIn));
  var eventCount = CountEvents(jsonIn.feed.entry);
  //console.log("Event count " + eventCount);
  var extracted = ExtractAthletes(jsonIn.feed.entry, eventCount);
  //console.log("Extracted count " + extracted.length);
  //console.log("Extracted 1");
  //console.log(JSON.stringify(extracted[0]));
  //console.log("Extracted 2");
  //console.log(JSON.stringify(extracted[1]));
  var eventCountAndDetails = AllDetails(jsonIn.feed.entry, extracted[1]);
  var el;
  el = document.getElementById("summary");
  if (el) {
    el.innerHTML = AllSummary(jsonIn.feed.entry, Object.keys(extracted[0]).length);
  }
  el = document.getElementById("details");
  if (el) {
    el.innerHTML = eventCountAndDetails[1];
  }
  el = document.getElementById("athletes");
  if (el) {
    console.log("Setting inner on athletes");
    el.innerHTML = AllAthletes(extracted[0],
                               encodeURIComponent(GetValue(jsonIn.feed.entry[0], "gsx$regatta", "")));
  }
  el = document.getElementById("boats");
  if (el) {
    el.innerHTML = BoatsFromSet(eventCountAndDetails[2]);
  }
}
