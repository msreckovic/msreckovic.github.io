var map = {
  "question" :    {"label" : "Q",
                "item" : "gsx$question"},
  "answer" :     {"label" : "A",
                "item" : "gsx$answer"},
};

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
  var q = GetValue(entry, map.question.item, "");
  var a = GetValue(entry, map.answer.item, "");

  var total = "<tr>\n";
  total += "    <td data-label=" + map.question.label +">" + q  + "</td>\n";
  total += "    <td data-label=" + map.answer.label + ">" + a  + "</td>\n";
  total += "</tr>\n";

  return total;
}

function FillSheet(jsonIn, where)
{
  var entries = jsonIn.feed.entry;

  var details = "<table>\n";
  details += "  <thead>\n";
  details += "    <tr>\n";
  details += "      <th>" + map.question.label + "</th>\n";
  details += "      <th>" + map.answer.label + "</th>\n";
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
