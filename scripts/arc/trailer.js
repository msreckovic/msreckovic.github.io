function GetValue(where, what)
{
  if (where[what]) {
    return where[what].$t;
  }
  return "";
}

function FillCell(v, right)
{
  if (v) {
    var s = v.split(" / ");
    if (s.length > 1) {
      v = "<div class=\"trailersmall\"><p>" + s[0] + "</p></div>" +
        "<div class=\"trailersmall\"><p>" + s[1] + "</p></div>";
    } else {
      v = "<div class=\"trailertop\"><p>" + v + "</p></div>";
    }
  }
  if (right) {
    return "<td class=\"trailercellright\" align=\"center\">" + v + "</td>";
  }
  return "<td class=\"trailercell\" align=\"center\">" + v + "</td>";
}

function FillTrailer(entries)
{
  if (entries.length < 1) return "";

  var total = "<table style=\"all: revert\" class=\"trailertable\">";
  for(var i = 0; i < entries.length; i++) {
    total += "<tr>";
    total += FillCell(GetValue(entries[i], "gsx$outsideleft"), false);
    total += FillCell(GetValue(entries[i], "gsx$centreleft"), true);
    total += FillCell(GetValue(entries[i], "gsx$centreright"), false);
    total += FillCell(GetValue(entries[i], "gsx$outsideright"), false);
    total += "</tr>";
  }
  total += "</table>";
  return total;
}

function ShowTrailer(elementid, jsonIn)
{
  var entries = jsonIn.feed.entry;
  var el = document.getElementById(elementid);
  if (el) {
    el.innerHTML = FillTrailer(entries);
  }
}
  
