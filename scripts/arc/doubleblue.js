// gsx$count
// gsx$who
// gsx$amount
// gsx$paid
// gsx$vegetarian

function ForTickets(entry, h3s, h3e)
{
  var count = entry[1];
  var who = entry[0];
  var amount = entry[2];
  
  var paid = "";
  if (entry.length > 3) {
    paid = entry[3];
    if (paid.length > 16) {
      paid = "<a target=\"_blank\" href=\"https://squareup.com/receipt/preview/" + paid + "\">Online</a>";
    } 
  }
  if (entry.length > 4) {
    var veg = entry[4];
    if (veg > 0) {
      count += " (" + veg + " vegetarian)";
    }
  }
  var summary = "";
  if (amount) {
    summary = "<tr>";
    summary += "    <td data-label=Who>" + h3s + who + h3e + "</td>\n";
    summary += "    <td data-label=Count>" + h3s + count + h3e + "</td>\n";
    summary += "    <td data-label=Amount>" + h3s + amount + h3e + "</td>\n";
    summary += "    <td data-label=Paid>" + h3s + paid + h3e + "</td>\n";
    summary += "</tr>";
  }
  return summary;
}

function GetValue(where, what, instead)
{
  if (where && what in where) {
    return where[what].$t;
  }
  return instead;
}

function GetTickets(entries)
{
  var people = [];
  
  var i, count, who, amount, paid;
  for (i=1; i<entries.length; i++) {
    count = GetValue(entries[i], "gsx$count", "");
    who = GetValue(entries[i], "gsx$who", "");
    amount = "$" + GetValue(entries[i], "gsx$amount", "");
    paid = GetValue(entries[i], "gsx$paid", "");
    veg = parseInt(GetValue(entries[i], "gsx$vegetarian", "0"));
    people.push([who, count, amount, paid, veg]);
  }
  people = people.sort();
  
  var tickets = "<table>\n";
  tickets += "  <thead>\n";
  tickets += ForTickets(["MEMBERS", "# TICKETS", "AMOUNT", "METHOD"], "<h3>", "</h3>");
  tickets += "  </thead>\n";
  
  tickets += "  <tbody>\n";
  
  for (i=0; i<people.length; i++) {
    tickets += ForTickets(people[i], "", "");
  }
  count = GetValue(entries[0], "gsx$count", "");
  amount = "$" + GetValue(entries[0], "gsx$amount", "");
  tickets += ForTickets(["SUMMARY", count, amount], "<h4>", "</h4>");
  
  tickets += "</table>\n";
  return tickets;
}

function JsonCallback(jsonIn)
{
  var tickets = GetTickets(jsonIn.feed.entry);
  el = document.getElementById("tickets");
  if (el) {
    el.innerHTML = tickets;
  }
}
