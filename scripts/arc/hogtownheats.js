// gsx$regatta
// gsx$event1
// ...
// gsx$eventN
// gsx$note

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
  summary += "    <td data-label=Entry-Fees>" + entry + "</td>\n";
  summary += "    <td data-label=Trailer-Fees>" + trailer + "</td>\n";
  summary += "    <td data-label=Event-Total>" + total + "</td>\n";
  return summary;
}

function GetValue(where, what, instead)
{
  if (what in where) {
    return where[what].$t;
  }
  return instead;
}

function GetValueX(where, what, instead)
{
  if (what in where) {
    var val = where[what].$t;
    if (!val) val = instead;
    return val;
  }
  return instead;
}

function CountThings(entries)
{
  var en0 = entries[0];
  var events = [];
  var lanes = [];
  for (var i=1; i<=200; i+=1) {
    if (!("gsx$event"+i in en0)) break;
    events.push(GetValue(en0, "gsx$event"+i, ""));
  }
  
  for (var r=2; i<=200; r+=1) {
    var enr = entries[r];
    var v = GetValue(enr, "gsx$regatta", "");
    if (v == "" || v == "Results") break;
    lanes.push(v);
  }
  
  return [events,lanes];
}

function GetField(str, field)
{
  var isthere = str.search(field);
  if (isthere >= 0) {
    return str.substring(isthere+field.length, str.length);
  }
  return "";
}

function FormatCrew(crew)
{
  var split = crew.split(",");
  var crew = split[0];
  var boat = "";
  var coxie = "";
  if (split.length > 1) {
    boat = GetField(split[1], "Boat:");
    coxie = GetField(split[1], "Coxwain:");
  }
  if (split.length > 2) {
    if (!boat) boat = GetField(split[2], "Boat:");
    if (!coxie) coxie = GetField(split[2], "Boat:");
  }
  var formatted = "<span class=\"crew\">" + crew.trim() + "</span>";
  if (coxie) {
    formatted += "<span class=\"coxie\"> / " + coxie.trim() + "</span>";
  }
  if (boat) {
    formatted += "<span class=\"boat\"> / " + boat.trim() + "</span>";
  }
  return formatted;
}

function ExtractDraw(entries, events, lanes)
{
  var draw = "<table>\n";
  draw += "  <thead>\n";
  draw += "    <tr>\n";
  draw += "      <th class=\"athletes\">Event</th>\n";
  draw += "      <th>Lane 1</th>\n";
  draw += "      <th>Lane 2</th>\n";
  draw += "      <th>Lane 3</th>\n";
  draw += "    </tr>\n";
  draw += "  </thead>\n";
  
  draw += "  <tbody>\n";
  
  for (var i=0; i<events.length; i+=1) {
    draw += "<tr>";
    draw += "<td data-label=Event>" + events[i] + "</td>\n";
    
    for (var lane=0; lane<lanes.length; lane+=1) {
      var enr = entries[lane+2];
      var crew = GetValue(enr, "gsx$event"+(i+1), "&nbsp;");
      draw += "<td data-label=\"Lane " + (i+1) + "\">" + FormatCrew(crew) + "</td>\n";
    }
    
    draw += "</tr>\n";
  }
  
  draw += "  </tbody>\n";
  draw += "</table>\n";
  return draw;
}

function ExtractResults(entries, events, start)
{
  var results = "";
  for (var medal=0; medal<3; medal+=1) {
    var enr = entries[2 + start.length + 1 + medal];
    var r = GetValue(enr, "gsx$regatta", "");
    if (r == "Summary" || r == "") break;
    
    results += "<h4>there is " + r + "</h4>";
  }
  return results;
}

function JsonCallback(jsonIn)
{
  // events and lanes
  var eal = CountThings(jsonIn.feed.entry);
  
  var draw = ExtractDraw(jsonIn.feed.entry, eal[0], eal[1]);
  var results = ExtractResults(jsonIn.feed.entry, eal[0], eal[1]);
  
  document.getElementById("draw").innerHTML = draw;
  //  document.getElementById("results").innerHTML = results;
}
