var labels = ["Q", "A"];
var items = ["question", "answer"];

// data-labels, data-items

function GetParameters()
{
  var script_tag = document.getElementById('sheet')
  if (script_tag) {
    var arglabels = script_tag.getAttribute("data-labels");
    if (arglabels) {
      var splitlabels = arglabels.split(',');
      console.log("Setting sheet.js.labels from data-labels to " + splitlabels)
      labels = splitlabels;
    }
    
    var argitems = script_tag.getAttribute("data-items");
    if (argitems) {
      var splititems = argitems.split(',');
      console.log("Setting sheet.js.items from data-items to " + splititems)
      items = splititems;
    }

  }
}

function GetValue(where, what, instead)
{
  if (what in where) {
    if (where[what].$t) {
      return where[what].$t;
    }
  }
  return instead;
}

function ForSingleOne(entry, td_style)
{
  var total = "<tr>\n";
  for (var i = 0; i < labels.length; i++) {
    var value = GetValue(entry, "gsx$" + items[i], "");
    value = value.replaceAll("\n", "<br>");
    total += "    <td " + td_style + " data-label=" + labels[i] +">" + value + "</td>\n";
  }
  total += "</tr>\n";
  return total;
}

function FillSheet(jsonIn, where, td_style)
{
  if (!td_style) {
    td_style = "";
  }

  GetParameters();

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

  for (var i = 0; i < entries.length; i++) {
    details += ForSingleOne(entries[i], td_style);
  }
  details += "  </tbody>\n";
  details += "</table>\n";

  document.getElementById(where).innerHTML = details;
}
