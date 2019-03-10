// gsx$crewnameid
// gsx$category
// gsx$boattype
// gsx$time
// gsx$distancem
// gsx$speedms
// gsx$splits500m

function GetValue(where, what)
{
  if (where && what in where) {
    return where[what].$t;
  }
  return "";
}

function GetSummary(entries)
{
  var total = "<table>\n";
  total += "  <thead>\n";
  total += "    <tr>\n";
  total += "      <th class=\"total\">Crew</th>\n";
  total += "      <th>Time</th>\n";
  total += "      <th>Avg-Speed</th>\n";
  total += "      <th>Avg-Split</th>\n";
  total += "    </tr>\n";
  total += "  </thead>\n";
  total += "  <tbody>\n";
  
  var locked = false;
  
  var i;
  for (i=0; i<entries.length; i++) {
    var en = entries[i];
    var crew = GetValue(en, "gsx$crewnameid");
    if (crew == "Results") break;
    if (crew == "Final Results") {
      locked = true;
    }
    
    var category = GetValue(en, "gsx$category");
    var boat = GetValue(en, "gsx$boattype");
    var time = GetValue(en, "gsx$time");
    var speed = GetValue(en, "gsx$speedms");
    var split = GetValue(en, "gsx$splits500m");
    
    if (speed == "-") {
      speed = "&nbsp;";
    } else {
      speed += " m/s";
    }
    
    if (split == "-") {
      split = "&nbsp;";
    } else {
      split += " / 500m";
    }
    
    total += "<tr>";
    total += "<td data-label=\"Crew\">" + crew + " (" + category + " " + boat + ")</td>";
    total += "<td data-label=\"Time\">" + time + "</td>";
    total += "<td data-label=\"Avg-Speed\">" + speed + "</td>";
    total += "<td data-label=\"Avg-Split\">" + split + "</td>";
    total += "</tr>";
  }
  
  total += "  </tbody></table>\n";
  
  return total;
}

function JsonCallback(jsonIn)
{
  document.getElementById("crews").innerHTML = GetSummary(jsonIn.feed.entry);
}
