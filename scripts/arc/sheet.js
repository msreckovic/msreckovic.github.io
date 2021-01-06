var labels = ["Q", "A"];
var items = ["question", "answer"];

function GetValue(where, what, instead)
{
  if (what in where) {
    if (where[what].$t) {
      return where[what].$t;
    }
  }
  return instead;
}

function ForSingleOne(entry)
{
  var total = "<tr>\n";
  for (var i = 0; i < labels.length; i++) {
    total += "    <td data-label=" + labels[i] +">" + GetValue(entry, "gsx$" + items[i], "") + "</td>\n";
  }
  total += "</tr>\n";
  return total;
}

function FillSheet(jsonIn, where)
{
  var entries = jsonIn.feed.entry;

  var details = "<table>\n";
  details += "  <thead>\n";
  details += "    <tr>\n";
  for (var i = 0; i < labels.length; i++) {
    details += "      <th>" + labels[i] + "</th>\n";
  }
  details += "    </tr>\n";
  details += "  </thead>\n";
  details += "  <tbody>\n";

  for (var i=entries.length-1; i>=0; i-=1) {
    details += ForSingleOne(entries[i]);
  }
  details += "  </tbody>\n";
  details += "</table>\n";

  document.getElementById(where).innerHTML = details;
}
