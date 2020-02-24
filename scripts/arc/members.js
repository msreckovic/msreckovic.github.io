var map = {
  "first" : "gsx$firstname",
  "last" : "gsx$lastname",
  "email" : "gsx$e-mail",
  "timestamp" : "gsx$timestamp",
  "affiliation" : "gsx$affiliation",
  "rca" : "gsx$rca",
  "rc" : "gsx$rc",
  "locker" : "gsx$locker",
  "boatrack" : "gsx$boatrack",
  "status" : "gsx$status"
};

function SetElement(elementId, value)
{
  var el = document.getElementById(elementId);
  if (el) {
    el.innerHTML = value;
  }
}

function Capitalize(name)
{
  return name.replace(/\b\w/g, function(a) { return a.toUpperCase(); });
}

function EmailLink(to, cc, subject, text, yahoo)
{
  // Apparently, this may work Yahoo!Mail:
  // http://compose.mail.yahoo.com/?to=TO&subject=SUBJECTMap&body=BODY
  var result = "<a href=\"";
  if (yahoo) {
    result += "http://compose.mail.yahoo.com/?to=" + to;
    if (cc) {
      result += "&cc=" + cc;
    }
    result += "&subject=" + subject;
    result += "&body=" + TemplateEmailBody();
  } else {
    result += "mailto:" + to  + "?";
    if (cc) {
      result += "cc=" + cc + "&";
    }
    // result += "subject=" + subject + "\" target=\"_blank\">";
    result += "subject=" + subject;
  }
  result += "\">";
  result += text;
  result += "</a>";
  return result;
}


function AsLink(first, last, note, memberlink)
{
  if (!memberlink) {
    return first + " " + last + note;
  }
  return '<a href="http://argonautrowingclub.com/member/?who=' +
    first + "_" + last + '" target="_blank">' + first + " " + last + note +
    '</a>';
}

function Categorized(entries, onlygood, category, header, getlinks, memberlink)
{
  var counting = 0;
  var everybody = {};
  var emails = "";
  for (var i=0; i<entries.length; i+=1) {
    var status = entries[i][map.status].$t;
    if (status.search("bad:") == 0) {
      if (onlygood) continue;
    } else {
      if (!onlygood) continue;
    }
    
    var note = "";
    if (!onlygood) {
      if (status.substring(4,5) != category) continue;
      // note = "(<span style=\"color:red;\">!</span>)";
    }
    
    counting ++;
    var first = entries[i][map.first].$t;
    var last = entries[i][map.last].$t;
    var ltr = Capitalize(last[0]);
    if (!(ltr in everybody)) {
      everybody[ltr] = AsLink(first, last, note, memberlink);
    } else {
      everybody[ltr] += ", " + AsLink(first, last, note, memberlink);
    }
    if (getlinks) {
      var email = entries[i][map.email].$t;
      if (email) {
        if (emails) {
          emails += ", ";
        }
        emails += email;
      }
    }
  }
  
  if (counting == 0) {
    return "";
  }
  
  var keys = Object.keys(everybody);
  keys.sort();
  
  var total = "";
  for (var i=0; i<keys.length; i+=1) {
    one = keys[i];
    total += "<h3>" + one + "</h3>";
    total += "<div>" + everybody[one] + "</div>";
  }
  
  note = "";
  
  if (emails) {
    counting = EmailLink(emails, "membership@argonautrowingclub.com",
                         "Missing Argonaut Rowing Club registration step",
                         counting, false);
  }
  
  if (!onlygood) {
    note = "For insurance reasons, the club boats access is restricted to members registered with Rowing Canada. If you are on this list, you cannot use club boats until you register. <a target=\"_blank\" href=\"https://membership.rowingcanada.org/JoinProgram?id=220\">Click here and login to Rowing Canada to properly register.</a>";
  }
  total = "<hr><h2>" + header + " <span style=\"color:#ccaaaa;\">(" + counting + ")</span></h2>" + note + total;
  return total;
}

function MembersEverything(entries, getLinks, memberLink)
{
  var yess = Categorized(entries, true, "yes", "Registered Members", getLinks, memberLink);
  SetElement("racing", yess);
  
  var norca = Categorized(entries, false, 1, "Members missing the RCA registration", getLinks, memberLink);
  SetElement("norca", norca);
  
  var timestamp = "Updated on " + entries[0][map.timestamp].$t;
  console.log("THE timestamp is " + timestamp);
  SetElement("timestamp", timestamp);
}

function MembersPersonal(elementId, entries, whoisthis)
{
  console.log("MembersPersonal with " + whoisthis);
  if (!whoisthis) return;
  var member = whoisthis[0];
  var rcaid = whoisthis[1];

  console.log("Calling MembersPersonal for " + member + " and " + rcaid);

  if (!member) {
    return;
  }

  console.log("Looking for MembersPersonal for " + member + " and " + rcaid);
  var explanation = "<h3>" + member + " (Member Information)</h3>";
  var found = false;

  var who = member.toLowerCase();
  for (i=1; i<entries.length; i++) {
    var person = GetValue(entries[i], "gsx$firstname", "") + " " +
        GetValue(entries[i], "gsx$lastname", "");
    if (person.toLowerCase() != who) {
      continue;
    }

    console.log("Found MembersPersonal for " + person + " and " + rcaid);
    var rca = entries[i]["gsx$rca"].$t;
    if (rca != rcaid) {
//      console.log("Not matching RCA id for " + person + " with " + rca + " vs. " + rcaid);
//      return;
    }

    // console.log("Matched entry " + JSON.stringify(entries[i]));

    explanation += "The registration details for " + person + " are below. ";
    explanation += "Please report any incorrect or incomplete information to the captain. ";
    explanation += "<ul>";

    var status = entries[i][map.status].$t;
    if (status.search("ok:1") >= 0) {
      explanation += "<li>Fully insured and registered for competition. ";
      explanation += "Rowing Canada number #" + rca + ".</li>";
    } else if (status.search("bad:1") >= 0) {
      explanation += "<li>Missing Rowing Canada registration, not insured and cannot compete.</li>";
    } else if (status.search("error:2") >= 0) {
      explanation += "<li>There is an error in the registration.</li>";
    } else if (status.search("warning:1") >= 0) {
      explanation += "<li>Rowing Canada registration is incomplete.</li>";
    }

    var email = entries[i][map.email].$t;
    if (email) {
      explanation += "<li>Registered " + email + " as an active e-mail.</li>";
    } else {
      explanation += "<li>No valid e-mail registered with the club.</li>";
    }

    var locker = entries[i][map.locker].$t;
    if (locker) {
      explanation += "<li>Purchased locker " + locker + ".</li>";
    } else {
      explanation += "<li>Can use daily lockers only.</li>";
    }

    var boatrack = entries[i][map.boatrack].$t;
    if (boatrack) {
      explanation += "<li>Private boat rack " + boatrack + ".</li>";
    } else {
      explanation += "<li>No private boat rack.</li>";
    }
    explanation += "</ul>";

    found = true;
    break;
  }

  if (!found) {
    explanation += "" + member + " is currently not a registered club member. ";
  }

  explanation += "<h3>Regatta Fees</h3>";
  explanation += "This is the summary of the regatta fees for " + member + " since 2016. ";
  explanation += "As there is a manual step involved in processing the payments, " ;
  explanation += "the information may be slightly out of date. Click on the regattas ";
  explanation += "you participated in to see the details. If you have overpaid, or believe ";
  explanation += "the information is incorrect, please email captain@argonautrowingclub.com. ";
  explanation += "You can pay the outstanding fees in the Argo store or directly by clicking ";
  explanation += "on the summary amount in the Outstanding column.";

  // console.log("The explanation for " + member + " is " + explanation);
  SetElement(elementId, explanation);
}

var WOMENS = {
  "Max" : 22,
  "Step" : 2,
  "Lots" : [[1, 9], [11, 23], [25, 41], [43, 53]]
};
var MENS = {
  "Max" : 30,
  "Step" : 2,
  "Lots" : [[1, 11], [13, 29], [31, 43], [45, 49], [51, 63], [65, 69]]
};

function DefaultLockers(filter, title, settings)
{
  var i, j;
  var text = "";

  text += "<h3>" + title + "</h3>";
  text += "<table><tr>";
  for (i = 0; i < settings.Lots.length; i++) {
    text += '<td valign="top">';
    text += '<ul>';
    for (j = settings.Lots[i][0]; j <= settings.Lots[i][1]; j += settings.Step) {
      text += '<li id="' + filter + j + '">' + j + '</li>';
    }

    text += "</ul>";
    text += "</td>";
  }
  text += "</tr></table>";
  text += '<span id="' + filter + 'comment"></span>';
  return text;
}

function ReserveLockers(filter, settings, entries)
{
  var i, j;
  var count = 0;

  for (i = 1; i < entries.length; i++) {
    var lockerName = entries[i][map.locker].$t;
    if (lockerName.search(filter) == 0) {
      var first = entries[i][map.first].$t;
      var last = entries[i][map.last].$t;

      SetElement(lockerName, lockerName.slice(filter.length) + ': ' + first + ' ' + last);
      count ++;
    }
  }
  SetElement(filter + "comment", "Reserved: " + count + ". Available: " + (settings.Max - count) + ".");
}

function ShowAllLockers(elementId, entries)
{
  var element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = DefaultLockers("W", "Women's Changeroom", WOMENS) +
      "<br><hr><br>" + DefaultLockers("M", "Men's Changeroom", MENS);
    ReserveLockers("W", WOMENS, entries);
    ReserveLockers("M", MENS, entries);
  }
}

function LockersCallback(jsonIn)
{
  ShowAllLockers("lockers", jsonIn.feed.entry);
}
