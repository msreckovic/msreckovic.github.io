var map = {
  "first" : "gsx$firstname",
  "last" : "gsx$lastname",
  "status" : "gsx$status",
  "email" : "gsx$e-mail",
  "timestamp" : "gsx$timestamp"
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
    note = "See <a target=\"_blank\" href=\"http://www.argonautrowingclub.com/new-member-followup/\">the registration follow-up page</a> for details how to fix this problem.";
  }
  total = "<hr><h2>" + header + " <span style=\"color:#ccaaaa;\">(" + counting + ")</span></h2>" + note + total;
  return total;
}

function Everything(entries, getLinks, memberLink)
{
  var yess = Categorized(entries, true, "yes", "Registered Members", getLinks, memberLink);
  document.getElementById("racing").innerHTML = yess;
  
  var norca = Categorized(entries, false, 1, "Members missing the RCA registration", getLinks, memberLink);
  document.getElementById("norca").innerHTML = norca;
  
  var timestamp = entries[0][map.timestamp].$t;
  console.log("THE timestamp is " + timestamp);
  document.getElementById("timestamp").innerHTML = timestamp;
}

function JsonCallbackD(jsonIn)
{
  Everything(jsonIn.feed.entry, false, true);
}

function JsonCallbackL(jsonIn)
{
  Everything(jsonIn.feed.entry, true, false);
}

function JsonCallback(jsonIn)
{
  Everything(jsonIn.feed.entry, false, false);
}
