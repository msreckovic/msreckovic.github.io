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
      // labels = splitlabels;
    }
    
    var argitems = script_tag.getAttribute("data-items");
    if (argitems) {
      var splititems = argitems.split(',');
      console.log("Setting sheet.js.items from data-items to " + splititems)
      // items = splititems;
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

  for (var i=entries.length-1; i>=0; i-=1) {
    details += ForSingleOne(entries[i]);
  }
  details += "  </tbody>\n";
  details += "</table>\n";

  document.getElementById(where).innerHTML = details;
}
