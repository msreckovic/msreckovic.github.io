function ParseJSON(value)
{
  try {
    var parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  }
  catch (e) { }
  return "";
}

function ForPeople(who, spent, paid)
{
  var summary = "";
  summary += "    <td data-label=Who>" + who + "</td>\n";
  summary += "    <td data-label=Spent>" + spent + "</td>\n";
  summary += "    <td data-label=Paid>" + paid + "</td>\n";
  return summary;
}

function ForAmount(amount)
{
  var summary = "    <td data-label=Verdict>";

  var asInt = parseInt(amount, 10);
  if (asInt < 0) {
    summary += amount + " (due)</td>\n";
  } else if (asInt > 0) {
    summary += amount + " (owes)</td>\n";
  } else {
	  summary += amount + "&nbsp;</td>\n";
  }
  return summary;
}

function GetValue(where, what, instead)
{
  if (what in where) {
    return where[what].$t;
  }
  return instead;
}

function DivSummary(map, entries)
{
  var summary = "";
  summary += "<h4>Last updated " + entries[3].gsx$body.$t + "</h4>";
  summary += "<table>\n";
  summary += "  <thead>\n";
  summary += "    <tr>\n";
  summary += "      <th>Who</th>\n";
  summary += "      <th>Spent</th>\n";
  summary += "      <th>Paid</th>\n";
  summary += "      <th>Verdict</th>\n";
  summary += "    </tr>\n";
  summary += "  </thead>\n";

  summary += "  <tbody>\n";
  for (j in map) {
    summary += "   <tr>";
    summary += ForPeople(map[j].who,
                         entries[1][map[j].cut].$t,
                         entries[1][map[j].paid].$t);
    summary += ForAmount(entries[2][map[j].paid].$t);
    summary += "   </tr>\n";
  }

  summary += "  </tbody>\n";
  summary += "</table>\n";
  return summary;
}

function DivDetails(map, entries)
{
  var details = "<table>\n";
  details += "  <thead>\n";
  details += "    <tr>\n";
  details += "      <th>When</th>\n";
  details += "      <th>What</th>\n";
  details += "      <th>Amount</th>\n";
  details += "      <th>Paid-By</th>\n";
  for (var j in map) {
    details += "      <th>" + map[j].label + "</th>\n";
  }
  details += "      <th>Per-Person</th>\n";
  details += "    </tr>\n";
  details += "  </thead>\n";
  details += "  <tbody>\n";

  for (var i=entries.length-1; i>=4 ; i--) {
    var doit = false;
    var amount = 0;
    var who = "";
    var cur = "$";

    var what = entries[i].gsx$what.$t;
    var when = entries[i].gsx$when.$t;
    var perperson = entries[i].gsx$perperson.$t;

    var people = [];
    var cuts = [];
    var labels = [];

    for (j in map) {
      var pp = GetValue(entries[i], map[j].people, 0);
      var cc = GetValue(entries[i], map[j].cut, "&nbsp;");
      var ll = map[j].label;
      people.push(pp);
      cuts.push(cc);
      labels.push(ll);

      var pd = GetValue(entries[i], map[j].paid, 0);
      if (pd) {
        var val = entries[i][map[j].paid].$t;
        var am = parseFloat(val.substring(1).replace(/,/g,''));
        if (am > 0) {
          cur = val[0];
          amount += am;
          doit = true;
          who = map[j].who;
        }
      }
    }

    if (doit) {
      details += "    <tr>";
      details += "    <td data-label=When>" + when  + "</td>\n";
      details += "    <td data-label=What>" + what  + "</td>\n";
      details += "    <td data-label=Amount>" + cur + amount.toFixed(2) + "</td>\n";
      details += "    <td data-label=Paid-By>" + who  + "</td>\n";
      for (j=0; j<people.length; j+=1) {
        if (people[j] == 1) {
          details += "    <td data-label=" + labels[j] + ">" + cuts[j] + "</td>\n";
        } else if (people[j] && people[j] != 0) {
          details += "    <td data-label=" + labels[j] + ">" + cuts[j] + " (" + people[j] + ")</td>\n";
        } else {
          details += "    <td data-label=" + labels[j] + ">" + cuts[j] + "</td>\n";
        }
      }
      details += "    <td data-label=Per-Person>" + perperson  + "</td>\n";
      details += "    </tr>";
    }
  }

  details += "  </tbody>\n";
  details += "</table>\n";
  return details;
}

function JsonCallback(jsonIn)
{
  var entries = jsonIn.feed.entry;
  var map = ParseJSON(entries[2].gsx$body.$t);

  document.getElementById("summary").innerHTML = DivSummary(map, entries);
  document.getElementById("details").innerHTML = DivDetails(map, entries);
  document.getElementById("appsetup").innerHTML = entries[1].gsx$body.$t;
}
