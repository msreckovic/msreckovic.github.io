// "gsx$timestamp"
// "gsx$emailaddress"
// "gsx$name"
// "gsx$phonenumber"
// "gsx$preferredcontactmethod"
// "gsx$coxie"
// "gsx$scull"
// "gsx$sweep"
// "gsx$mondays"
// "gsx$tuesdays"
// "gsx$wednesdays"
// "gsx$thursdays"
// "gsx$fridays"
// "gsx$saturdays"
// "gsx$sundays"

// Hash:
// name, email, phone, contact
// coxie, scull, bow, port, starboard

var CONTACTMETHOD = ["E-Mail", "Text", "Phone"];
var COX = ["Yes", "No"]
var SCULL = ["Yes, including bowing", "Yes, but no bowing", "No"];
var SWEEP = ["Yes, port only", "Yes, starboard only", "Yes, port or starboard", "No"];
var WEEKDAYAM = ["5:30-7:30am", "7:30-9:30am"];
var WEEKDAYPM = ["6:30-8:30pm"];
var WEEKENDAM = ["6-8am", "8-10am", "10am-noon"];
var WEEKENDPM = ["Noon-2pm"];

var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function GetValue(where, what, instead)
{
  if (where && what in where) {
    return where[what].$t;
  }
  return instead;
}

function GetValues(where, what)
{
  var values = GetValue(where, what, "");
  if (values != "") {
    return values.split(',');
  }
  return [];
}

function SetHTML(id, total)
{
  var el = document.getElementById(id);
  if (el) {
    el.innerHTML = total;
  }
}

function SetCox(hash, entry)
{
  hash["cox"] = ("Yes" == GetValue(entry, "gsx$coxie", "No"));
}

function SetScull(hash, entry)
{
  var value = GetValue(entry, "gsx$scull", "No");
  if ("Yes, including bowing" == value) {
    hash["scull"] = true;
    hash["bow"] = true;
  } else if ("Yes, but no bowing" == value) {
    hash["scull"] = true;
    hash["bow"] = false;
  } else {
    hash["scull"] = false;
    hash["bow"] = false;
  }
}

function SetSweep(hash, entry)
{
  var value = GetValue(entry, "gsx$sweep", "No");
  if ("Yes, port or starboard" == value) {
    hash["port"] = true;
    hash["starboard"] = true;
  } else if ("Yes, port only" == value) {
    hash["port"] = true;
    hash["starboard"] = false;
  } else if ("Yes, starboard only" == value) {
    hash["port"] = false;
    hash["starboard"] = true;
  } else {
    hash["port"] = false;
    hash["starboard"] = false;
  }
}

function SetDay(hash, entry, day, tag)
{
  var values = GetValues(entry, tag);
  if (values.length > 0) {
    for (var i = 0; i < values.length; i++) {
      values[i] = values[i].trim();
    }
    hash[day] = values;
  }
}

function Collect(entries)
{
  var collected = {};
  for (var i = 0; i < entries.length; i++) {
    var name = GetValue(entries[i], "gsx$name", "");
    if (name == "") {
      continue;
    }
    collected[name] = {};
    collected[name]["email"] = GetValue(entries[i], "gsx$emailaddress", "");
    collected[name]["phone"] = GetValue(entries[i], "gsx$phonenumber", "");
    collected[name]["contact"] = GetValue(entries[i], "gsx$preferredcontactmethod", "");

    SetCox(collected[name], entries[i]);
    SetScull(collected[name], entries[i]);
    SetSweep(collected[name], entries[i]);

    SetDay(collected[name], entries[i], "Monday", "gsx$mondays");
    SetDay(collected[name], entries[i], "Tuesday", "gsx$tuesdays");
    SetDay(collected[name], entries[i], "Wednesday", "gsx$wednesdays");
    SetDay(collected[name], entries[i], "Thursday", "gsx$thursdays");
    SetDay(collected[name], entries[i], "Friday", "gsx$fridays");
    SetDay(collected[name], entries[i], "Saturday", "gsx$saturdays");
    SetDay(collected[name], entries[i], "Sunday", "gsx$sundays");
  }
  return collected;
}

function CollectMatchWeekday(collected, day, filter, items)
{
  // TODO
  console.log("PROCESS Weekday " + day);
  for (name in collected) {
    console.log("Look at " + name + " for " + JSON.stringify(collected[name]));
    console.log("Filtered " + filter(collected[name]));
    if (filter(collected[name])) {
      if (! (day in collected[name])) continue;

      var daytimes = collected[name][day];
      for (var i = 0; i < daytimes.length; i++) {
        if (! (day in items)) {
          items[day] = {};
        }

        var t = daytimes[i];
        if (! (t in items[day])) {
          items[day][t] = [];
        }

        var one = {};
        one["name"] = name;
        one["contact"] = collected[name]["contact"];
        one["email"] = collected[name]["email"];
        one["phone"] = collected[name]["phone"];
        items[day][t].push(one);
      }
    }
  }
}

function CollectMatchWeekend(collected, day, filter, items)
{
  // TODO
  for (name in collected) {
  }
}

function CollectCox(collected)
{
  var cox = {};
  for (var i = 0; i < 5; i++) {
    CollectMatchWeekday(collected, DAYS[i], function(el) { return el["cox"]; }, cox);
  }
  for (var i = 5; i < 7; i++) {
    CollectMatchWeekend(collected, DAYS[i], function(el) { return el["cox"]; }, cox);
  }
  return cox;
}

function CollectScull(collected)
{
  var scull = {};
  for (var i = 0; i < 5; i++) {
    CollectMatchWeekday(collected, DAYS[i], function(el) { return el["scull"]; }, scull);
  }
  for (var i = 5; i < 7; i++) {
    CollectMatchWeekend(collected, DAYS[i], function(el) { return el["scull"]; }, scull);
  }
  return scull;
}

function CollectSweep(collected)
{
  return {};
}

function FillDivPlace(what)
{
  return '<td><div id=' + what + '>No spares</div></td>';
}

function FillBlankRow(howmany, colspan)
{
  var total = "";
  for (var i = 0; i < howmany; i++) {
    total += '<tr><td colspan="' + colspan + '">&nbsp;</td></tr>';
  }
  return total;
}

function FillDay(day)
{
  var total = ""
  total += '<tr>';
  total += '<th colspan="3" width="50%">' + day + ' AM</th>';
  total += '<th colspan="3" width="50%">' + day + ' PM</th>';
  total += '</tr>';

  total += '<tr>';
  total += '<th width="16%">Cox</th>';
  total += '<th width="17%">Scull</th>';
  total += '<th width="17%">Sweep</th>';
  total += '<th width="16%">Cox</th>';
  total += '<th width="17%">Scull</th>';
  total += '<th width="17%">Sweep</th>';
  total += '</tr>';

  total += '<tr>';
  total += FillDivPlace(day + '-am-cox');
  total += FillDivPlace(day + '-am-scull');
  total += FillDivPlace(day + '-am-sweep');

  total += FillDivPlace(day + '-pm-cox');
  total += FillDivPlace(day + '-pm-scull');
  total += FillDivPlace(day + '-pm-sweep');
  total += '</tr>';

  return total;
}

function FillPage(id)
{
  var total = '';

  total += '<table border="1" width="100%">';
  for (var d = 0; d < 5; d++) {
    total += FillDay(DAYS[d]);
    total += FillBlankRow(2, 6);
  }
  total += FillBlankRow(2, 6);

  total += FillDay(DAYS[5]);
  total += FillBlankRow(2, 6);
  total += FillDay(DAYS[6]);
  total += '</table>';

  SetHTML(id, total);
}

function EmailLink(person, to, subject)
{
  return person + ': <a href="' + 'mailto:' + to  + '?' + 'subject=' + subject + '">' + to + '</a>';
}

function SmsLink(person, to)
{
  return person + ': <a href="sms:' + to + '">' + to + '</a>';
}

function PhoneLink(person, to)
{
  return person + ': ' + to;
}

function ContactLink(person, hash)
{
  console.log("CONTACT for " + person + " IS " + hash["contact"]);
  var total = "";
  if (hash["contact"] == "E-Mail") {
    var to = hash["email"];
    var subject = "Argonaut Rowing Club: Can you spare?";
    total += EmailLink(person, to, subject);
  } else if (hash["contact"] == "Text") {
    total += SmsLink(person, hash["phone"]);
  } else {
    total += PhoneLink(person, hash["phone"]);
  }
  return total;
}

function FillList(day, group, times)
{
  console.log("CALLING FILL LIST " + day + " TIMES " + times);
  console.log("GROUP IS " + group);

  var items = [];
  if (! (day in group)) {
    console.log("QUICK RETURN");
    return items;
  }

  var subgroup = group[day];

  // [name] = {"contact", "email", "phone"}
  for (var i = 0; i < times.length; i++) {
    if (times[i] in subgroup) {
      console.log("EXAMINE FOR " + times[i]);
      for (var k in subgroup[times[i]]) {
        var one = subgroup[times[i]][k];
        console.log("PROBING FOR " + one["name"] + " WHERE " + JSON.stringify(one));
        items.push(ContactLink(one["name"], one));
      }
    }
  }
  return items;
}

function FillDivs(id, day, group, times)
{
  console.log("CALLING FILL DIVS " + day + " TIMES " + times);
  var list = FillList(day, group, times);
  console.log("GOT THE LIST BACK " + list);
  if (list.length > 0) {
    var total = "<ul>";
    for (var i = 0; i < list.length; i++) {
      total += "<li>" + list[i] + "</li>";
    }
    total += "</ul>";
    SetHTML(id, total);
  }
}

function SparesCallback(jsonIn)
{
  var collected = Collect(jsonIn.feed.entry);
  console.log("COLLECTED");
  console.log(collected);

  var cox = CollectCox(collected);
  console.log("COX");
  console.log(cox);
  var scull = CollectScull(collected);
  var sweep = CollectSweep(collected);

  FillPage("spares");

  for (var i = 0; i < 5; i++) {
    FillDivs(DAYS[i] + '-am-cox', DAYS[i], cox, WEEKDAYAM);
    FillDivs(DAYS[i] + '-am-scull', DAYS[i], scull, WEEKDAYAM);
    FillDivs(DAYS[i] + '-am-sweep', DAYS[i], sweep, WEEKDAYAM);
    FillDivs(DAYS[i] + '-pm-cox', DAYS[i], cox, WEEKDAYPM);
    FillDivs(DAYS[i] + '-pm-scull', DAYS[i], scull, WEEKDAYPM);
    FillDivs(DAYS[i] + '-pm-sweep', DAYS[i], sweep, WEEKDAYPM);
  }

  for (var i = 5; i < 7; i++) {
    FillDivs(DAYS[i] + '-am-cox', DAYS[i], cox, WEEKENDAM);
    FillDivs(DAYS[i] + '-am-scull', DAYS[i], scull, WEEKENDAM);
    FillDivs(DAYS[i] + '-am-sweep', DAYS[i], sweep, WEEKENDAM);
    FillDivs(DAYS[i] + '-pm-cox', DAYS[i], cox, WEEKENDPM);
    FillDivs(DAYS[i] + '-pm-scull', DAYS[i], scull, WEEKENDPM);
    FillDivs(DAYS[i] + '-pm-sweep', DAYS[i], sweep, WEEKENDPM);
  }
}  
