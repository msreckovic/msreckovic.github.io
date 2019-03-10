// gsx$when
// gsx$who
// gsx$amount
// gsx$note
// gsx$link

function ForDonations(when, who, amount)
{
  var summary = "";
  if (amount) {
    summary = "<tr>";
    summary += "    <td data-label=Date>" + when + "</td>\n";
    summary += "    <td data-label=Who>" + who + "</td>\n";
    summary += "    <td data-label=Amount>$" + amount + "</td>\n";
    summary += "</tr>";
  }
  return summary;
}

function ForNotes(when, who, amount, note)
{
  var summary = "<tr>";
  summary += "    <td data-label=Date>";
  summary += "<i>\"" + note + "\"</i><br>" + who + ", " + when;
  summary += "</td>\n";
  return summary;
}

function GetValue(where, what, instead)
{
  if (where && what in where) {
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

function GetEverything(entries)
{
  var donations = "<table>\n";
  var notes = "<table>\n";
  var people = [];
  /*
    notes += "  <thead>\n";
    notes += "    <tr>\n";
    notes += "      <th>When</th>\n";
    notes += "      <th>Note</th>\n";
    notes += "    </tr>\n";
    notes += "  </thead>\n";
  */
  notes += "  <tbody>\n";
  donations += "  <tbody>\n";
  
  var totals = GetValue(entries[0], "gsx$amount", "");
  
  var i;
  for (i=1; i<entries.length; i++) {
    var when = GetValue(entries[i], "gsx$when", "");
    var who = GetValue(entries[i], "gsx$who", "");
    var amount = GetValue(entries[i], "gsx$amount", "");
    var note = GetValue(entries[i], "gsx$note", "");
    if (note) {
      notes += ForNotes(when, who, amount, note);
    }
    donations += ForDonations(when, who, amount);
    if (amount) {
      people.push(who);
    }
  }
  notes += "  </tbody>\n";
  donations += "  </tbody>\n";
  notes += "</table>\n";
  notes += "<h3>Total donations in Martha's name to the ARC Junior Program: $" + totals + "</h3>";
  notes += "<span class=\"tiny\">(" + people.sort().join(", ") + ")</span>";
  
  donations += "</table>\n";
  return [notes, donations];
}

function JsonCallback(jsonIn)
{
  var stuff = GetEverything(jsonIn.feed.entry);
  var el = document.getElementById("notes");
  if (el) {
    el.innerHTML = stuff[0];
  }
  el = document.getElementById("donations");
  if (el) {
    el.innerHTML = stuff[1];
  }
}
