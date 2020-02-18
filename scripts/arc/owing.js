// gsx$who
// gsx$total
// gsx$paid
// gsx$owing

function ToStore(who, amount)
{
  var whomod = who.replace(/ /g, "%20");
  var rounded = Math.ceil(amount);
  return "<a href=\"https://argonaut-rowing-club.myshopify.com/cart/12624166387814:" + rounded +
    "?note=" + whomod + "-for-Regattas-Summary\" target=\"_blank\">$" + amount.toFixed(2) + "</a>";        
}

function ForTickets(entry, h3s, h3e)
{
  var summary = "";
  summary += "<tr>";
  for (i=0; i<(entry.length-1); i++) {
    if (i > 0) {
      summary += "</td>\n";
    }
    summary += "    <td data-label=Who"+i+">" + h3s + entry[i] + h3e;
  }
  if (entry[entry.length-1]) {
    summary += "<span class=\"tiny\"> (" + entry[entry.length-1] + ")</span>"
  }
  summary += "</td>\n";
  summary += "</tr>";
  return summary;
}

function GetValue(where, what, instead)
{
  if (where && what in where) {
    return where[what].$t;
  }
  return instead;
}

function GetOwing(entries, full)
{
  return GetOwingHelperHeader("", entries, full, "");
}

function GetOwingHelper(entries, full, person)
{
  return GetOwingHelperHeader("", entries, full, person);
}

function GetOwingHelperHeader(header, entries, full, person)
{
  if (person && person != "") {
    return GetOwingHelperPerson(header, entries, person);
  }
  return GetOwingHelperAll(header, entries);
}

function GetOwingHelperAll(header, entries)
{
  var people = [];
  var i, owing, who, amount, paid, arrears;
  for (i=1; i<entries.length; i++) {
    who = GetValue(entries[i], "gsx$who", "");
    owing = parseFloat(GetValue(entries[i], "gsx$owing", ""));
    if (owing > 2) {
      participation = GetValue(entries[i], "gsx$participation", "");
      amount = GetValue(entries[i], "gsx$total", "");
      paid = GetValue(entries[i], "gsx$paid", "");
      arrears = GetValue(entries[i], "gsx$arrears", "");
      linked = "<a href=\"http://www.argonautrowingclub.com/member/?who=" + who + "\">" + who + "</a>";
      if (amount) {
        people.push([linked, participation, "$" + amount, "$" + paid,
                     ToStore(who, owing), arrears]);
      }
    }
  }
  
  // people = people.sort(); // Probably don't need to, but OK
  
  var tickets = "<table>\n";
  tickets += "  <thead>\n";
  tickets += ForTickets(["Who", "Regattas", "Fees", "Paid", "Outstanding", ""], "<h5>", "</h5>");
  tickets += "  </thead>\n";
  
  tickets += "  <tbody>\n";
  for (i=0; i<people.length; i++) {
    tickets += ForTickets(people[i], "", "");
  }
  tickets += "  </tbody>\n";
  tickets += "</table>\n";
  return tickets;
}

function GetOwingHelperPerson(header, entries, person)
{
  var people;
  var details;
  var i, owing, who, amount, paid, arrears, linked;
  for (i=1; i<entries.length; i++) {
    who = GetValue(entries[i], "gsx$who", "");
    if (who != person) {
      continue;
    }
    owing = parseFloat(GetValue(entries[i], "gsx$owing", ""));
    
    details = JSON.parse(GetValue(entries[i], "gsx$details", "{}"));
    participation = GetValue(entries[i], "gsx$participation", "");
    amount = GetValue(entries[i], "gsx$total", "");
    paid = GetValue(entries[i], "gsx$paid", "");
    linked = "<a href=\"http://www.argonautrowingclub.com/member/?who=" + who + "\">" + who + "</a>";
    linked = who;
    people = ["<h5>Summary</h5>", amount, paid, ToStore(who, owing), ""];
    // console.log("GOT " + JSON.stringify(details));
    break;
  }

  var tickets = "";
  if (!linked) {
    return tickets;
  }

  tickets += "<h3>" + linked + " (" + header + " Regattas)</h3>";
  
  if (people == "") {
    return tickets;
  }
  
  tickets += "<table>\n";
  tickets += "  <thead>\n";
  tickets += ForTickets(["Regattas", "Fees", "Paid", "Outstanding", ""], "<h5>", "</h5>");
  tickets += "  </thead>\n";
  
  tickets += "  <tbody>\n";
  for (i=0; i<details.regattas.length; i++) {
    tickets += ForTickets([details.regattas[i].link,
                           "$" + (details.regattas[i].fees/100).toFixed(2),
                           "$" + (details.regattas[i].paid/100).toFixed(2),
                           "$" + ((details.regattas[i].fees - details.regattas[i].paid)/100).toFixed(2),                               
                           ""], "", "");
  }
  tickets += ForTickets(people, "", "");
  tickets += "  </tbody>\n";
  tickets += "</table>\n"; 
  
  return tickets;
}

function GetPerson(qpar)
{
  if (!qpar) {
    return ["", ""];
  }

  var r = qpar.replace(/_/g, " ").replace(/%20/g, " ");
  var s = r.split(' ');
  var id = "";
  if (s.length > 1 && !isNaN(s[s.length-1])) {
    id = s.splice(-1, 1)[0];
  }
  return [s.join(' '), id];
}
