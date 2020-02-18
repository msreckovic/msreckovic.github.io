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
  document.getElementById("racing").innerHTML = yess;
  
  var norca = Categorized(entries, false, 1, "Members missing the RCA registration", getLinks, memberLink);
  document.getElementById("norca").innerHTML = norca;
  
  var timestamp = "Updated on " + entries[0][map.timestamp].$t;
  console.log("THE timestamp is " + timestamp);
  document.getElementById("timestamp").innerHTML = timestamp;
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
      explanation += "<li>You are fully insured and registered for competition. ";
      explanation += "Your Rowing Canada number is #" + rca + ".</li>";
    } else if (status.search("bad:1") >= 0) {
      explanation += "<li>You are missing Rowing Canada registration, are not insured and cannot compete.</li>";
    } else if (status.search("error:2") >= 0) {
      explanation += "<li>There is an error in your registration.</li>";
    } else if (status.search("warning:1") >= 0) {
      explanation += "<li>Your Rowing Canada registration is incomplete.</li>";
    }

    var email = entries[i][map.email].$t;
    if (email) {
      explanation += "<li>You have registered " + email + " as an active e-mail.</li>";
    } else {
      explanation += "<li>Please registered a valid e-mail with the club.</li>";
    }

    var locker = entries[i][map.locker].$t;
    if (locker) {
      explanation += "<li>You are assigned locker " + locker + ".</li>";
    } else {
      explanation += "<li>You can use daily lockers.</li>";
    }

    var boatrack = entries[i][map.boatrack].$t;
    if (boatrack) {
      explanation += "<li>Your private boat rack is " + boatrack + ".</li>";
    } else {
      explanation += "<li>You do not have a private boat rack.</li>";
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
  document.getElementById(elementId).innerHTML = explanation;
}
