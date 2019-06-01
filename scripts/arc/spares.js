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

var AMPM = ["AM", "PM"];
var DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var TAGS = ["gsx$mondays", "gsx$tuesdays", "gsx$wednesdays", "gsx$thursdays", "gsx$fridays", "gsx$saturdays", "gsx$sundays"];

var CONTACTMETHOD = ["E-Mail", "Text", "Phone"];
var COX = ["Yes", "No"]
var SCULL = ["Yes, including bowing", "Yes, but no bowing", "No"];
var SWEEP = ["Yes, port only", "Yes, starboard only", "Yes, port or starboard", "No"];

var WEEKDAY = {};
WEEKDAY["AM"] = ["5:30-7:30am", "7:30-9:30am"];
WEEKDAY["PM"] = ["6:30-8:30pm"];
var WEEKEND = {};
WEEKEND["AM"] = ["6-8am", "8-10am", "10am-noon"];
WEEKEND["PM"] = ["Noon-2pm"];

function consolelog(what)
{
  if (false) {
    console.log(what);
  }
}

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
  consolelog("VALUES FOR " + tag + " ARE " + values);
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
    consolelog("ENTRY " + JSON.stringify(entries[i]));

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

    for (var d = 0 ; d < DAYS.length; d++) {
      SetDay(collected[name], entries[i], DAYS[d], TAGS[d]);
    }
  }
  return collected;
}

function CollectMatch(items, collected, day, filter, funcnote)
{
  for (name in collected) {
    consolelog("On " + day + " look at " + name + " for " + JSON.stringify(collected[name]));
    if (filter(collected[name])) {
      consolelog("FILTER LETS US IN");
      if (! (day in collected[name])) continue;

      var daytimes = collected[name][day];
      consolelog("DAYTIMES " + daytimes);
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

        var note = funcnote(collected[name]);
        if (note != "") {
          one["note"] = note;
        }
        items[day][t].push(one);
      }
    }
  }
  consolelog("AT THIS POINT " + JSON.stringify(items));
}

function CollectCox(collected)
{
  var cox = {};
  for (var i = 0; i < 7; i++) {
    CollectMatch(cox, collected, DAYS[i],
                 function(el) { return el["cox"]; },
                 function(el) { return false; });
  }
  return cox;
}

function CollectScull(collected)
{
  var scull = {};
  for (var i = 0; i < 7; i++) {
    CollectMatch(scull, collected, DAYS[i],
                 function(el) { return el["scull"]; },
                 function(el) {
                   if (el["bow"]) {
                     return "ok to bow";
                   }
                   return "";
                 });
  }
  return scull;
}

function CollectSweep(collected)
{
  var sweep = {};
  for (var i = 0; i < 7; i++) {
    CollectMatch(sweep, collected, DAYS[i],
                 function(el) { return el["starboard"] || el["port"]; },
                 function(el) {
                   if (!el["port"]) {
                     return "starboard only";
                   } else if (!el["starboard"]) {
                     return "port only";
                   }
                   return "";
                 });
  }
  return sweep;
}

function FillDivPlace(what)
{
  return '<td><div id=' + what + '>No spares. ' + LinkLink("https://docs.google.com/forms/d/e/1FAIpQLSc652x3Fil9G-A5EDL8WUUQLTz1JOcmlOJiFLkXt0HaaQ_GXg/viewform", "Click to sign up!") + '</div></td>';
}

function FillBlankRow(howmany, colspan)
{
  var total = "";
  for (var i = 0; i < howmany; i++) {
    total += '<tr><td colspan="' + colspan + '">&nbsp;</td></tr>';
  }
  return total;
}

function FillDayPart(day, part)
{
  consolelog("FILLING FILLING " + day + " " + part);

  var total = ""
  total += '<tr>';
  total += '<td colspan="3" width="50%"><strong>' + day + ' ' + part + '</strong></td>';
  total += '</tr>';

  var cox = day + '-' + part + '-cox';
  var scull = day + '-' + part + '-scull';
  var sweep = day + '-' + part + '-sweep';

  total += '<tr>';
  total += '<td width="32%" id="' + cox + '-header' + '">Cox</td>';
  total += '<td width="34%" id="' + scull + '-header' + '">Scull</td>';
  total += '<td width="34%" id="' + sweep + '-header' + '">Sweep</td>';
  total += '</tr>';

  total += '<tr>';
  total += FillDivPlace(cox);
  total += FillDivPlace(scull);
  total += FillDivPlace(sweep);
  total += '</tr>';

  return total;
}
function FillDay(day)
{
  return FillDayPart(day, 'AM') + FillDayPart(day, 'PM');
}

function FillPage(id)
{
  var total = '';

  for (var d = 0; d < 7; d++) {
    total += '<table width="100%">';
    total += FillDay(DAYS[d]);
    total += '</table>';
    total += '<br>';
  }
  SetHTML(id, total);
}

function LinkLink(url, text)
{
  return '<a href="' + url + '">' + text + '</a>';
}

function EmailLink(person, to, subject)
{
  return person + ': <a href="' + 'mailto:' + to  + '?' + 'subject=' + subject + '">' + to + '</a>';
}

function SmsLink(person, to)
{
  return person + ': Text <a href="sms:' + to + '">' + to + '</a>';
}

function PhoneLink(person, to)
{
  return person + ': Call ' + to;
}

function ContactLink(person, hash)
{
  consolelog("CONTACT for " + person + " IS " + hash["contact"]);
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
  consolelog("CALLING FILL LIST " + day + " TIMES " + times);
  consolelog("GROUP IS " + JSON.stringify(group));

  if (! (day in group)) {
    consolelog("QUICK RETURN");
    return [[], []];
  }

  var items = new Set([]);
  var emails = new Set([]);
  var subgroup = group[day];

  // [name] = {"contact", "email", "phone"}
  for (var i = 0; i < times.length; i++) {
    if (times[i] in subgroup) {
      consolelog("EXAMINE FOR " + times[i]);
      for (var k in subgroup[times[i]]) {
        var one = subgroup[times[i]][k];
        consolelog("PROBING FOR " + one["name"] + " WHERE " + JSON.stringify(one));

        var val = ContactLink(one["name"], one);
        if ("note" in one) {
          val += ' <span><small>(' + one["note"] + ')</small></span>';
        }
        consolelog("ITEMS IS " + items);
        consolelog("WANT TO ADD " + val);

        items.add(val);
        if(one["contact"] == "E-Mail") {
          emails.add(one["email"]);
        }
        consolelog("ITEMS IS NOW " + items);
      }
    }
  }
  return [Array.from(items), Array.from(emails)];
}

function FillDivs(id, day, group, times)
{
  consolelog("CALLING FILL DIVS " + id + " FOR " + day + " TIMES " + times);
  var listandemails = FillList(day, group, times);
  consolelog("GOT THE LIST AND EMAILS BACK " + listandemails);

  var list = listandemails[0];
  if (list.length > 0) {
    var total = "<ul>";
    for (var i = 0; i < list.length; i++) {
      total += "<li>" + list[i] + "</li>";
    }
    total += "</ul>";
    SetHTML(id, total);
  }
  return listandemails[1];
}

function FillEmails(id, what, emails)
{
  if (emails.length < 1) return;
  var all = emails.join(',');
  var subject = "Argonaut Rowing Club: Can you spare?";
  SetHTML(id, '<a href="' + 'mailto:' + all  + '?' + 'subject=' + subject + '">' + what + '</a>');
}

function SparesCallback(jsonIn)
{
  var collected = Collect(jsonIn.feed.entry);
  consolelog("COLLECTED");
  consolelog(collected);

  var cox = CollectCox(collected);
  consolelog("COX");
  consolelog(JSON.stringify(cox));
  var scull = CollectScull(collected);
  consolelog("SCULL");
  consolelog(JSON.stringify(scull));
  var sweep = CollectSweep(collected);
  consolelog("SWEEP");
  consolelog(JSON.stringify(sweep));

  FillPage("spares");
  var emails;

  for (var ampm = 0; ampm < AMPM.length; ampm++) {

    for (var i = 0; i < 5; i++) {
      emails = FillDivs(DAYS[i] + '-' + AMPM[ampm] + '-cox', DAYS[i], cox, WEEKDAY[AMPM[ampm]]);
      FillEmails(DAYS[i] + '-' + AMPM[ampm] + '-cox-header', "Cox", emails);

      emails = FillDivs(DAYS[i] + '-' + AMPM[ampm] + '-scull', DAYS[i], scull, WEEKDAY[AMPM[ampm]]);
      FillEmails(DAYS[i] + '-' + AMPM[ampm] + '-scull-header', "Scull", emails);

      emails = FillDivs(DAYS[i] + '-' + AMPM[ampm] + '-sweep', DAYS[i], sweep, WEEKDAY[AMPM[ampm]]);
      FillEmails(DAYS[i] + '-' + AMPM[ampm] + '-sweep-header', "Sweep", emails);
    }

    for (var i = 5; i < 7; i++) {
      emails = FillDivs(DAYS[i] + '-' + AMPM[ampm] + '-cox', DAYS[i], cox, WEEKEND[AMPM[ampm]]);
      FillEmails(DAYS[i] + '-' + AMPM[ampm] + '-cox-header', "Cox", emails);

      emails = FillDivs(DAYS[i] + '-' + AMPM[ampm] + '-scull', DAYS[i], scull, WEEKEND[AMPM[ampm]]);
      FillEmails(DAYS[i] + '-' + AMPM[ampm] + '-scull-header', "Scull", emails);

      emails = FillDivs(DAYS[i] + '-' + AMPM[ampm] + '-sweep', DAYS[i], sweep, WEEKEND[AMPM[ampm]]);
      FillEmails(DAYS[i] + '-' + AMPM[ampm] + '-sweep-header', "Sweep", emails);
    }
  }
}  
