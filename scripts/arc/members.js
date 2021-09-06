var map = {
  "first" : "gsx$firstname",
  "last" : "gsx$lastname",
  "email" : "gsx$email",
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

function SetClass(elementId, cValue, pValue)
{
  var el = document.getElementById(elementId);
  if (el) {
    el.className = cValue;
    var who = document.createAttribute("who");
    who.value = pValue;
    el.attributes.setNamedItem(who);
    // el.attributes.getNamedItem("who").value;
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
      explanation += "<li>Registered " + email + " as an active email.</li>";
    } else {
      explanation += "<li>No valid email registered with the club.</li>";
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
      // explanation += "<li>No private boat rack.</li>";
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
  "PerRow" : 4,
  "Lots" : [[1, 9], [11, 23], [25, 41], [43, 53]]
};
var MENS = {
  "Max" : 30,
  "Step" : 2,
  "PerRow" : 3,
  "Lots" : [[1, 11], [13, 29], [31, 43], [45, 49], [51, 63], [65, 69]]
};

function DefaultLockers(filter, title, settings)
{
  var i, j;
  var text = "";

  text += "<h3>" + title + "</h3>";
  text += "<table><tr>";
  var counter = settings.PerRow;
  for (i = 0; i < settings.Lots.length; i++) {
    if (counter <= 0) {
      text += "</tr><tr>";
      counter = settings.PerRow;
    }

    text += '<td valign="top">';
    text += '<ul>';
    for (j = settings.Lots[i][0]; j <= settings.Lots[i][1]; j += settings.Step) {
      text += '<li id="' + filter + j + '">' + j + '</li>';
    }

    text += "</ul>";
    text += "</td>";

    counter --;
  }
  text += "</tr></table>";
  text += '<span id="' + filter + 'comment"></span>';
  return text;
}

function ReserveLockers(filter, settings, entries, full_details)
{
  var i, j;
  var count = 0;

  for (i = 1; i < entries.length; i++) {
    var lockerName = entries[i][map.locker].$t;
    if (lockerName.search(filter) == 0) {
      var first = entries[i][map.first].$t;
      var last = entries[i][map.last].$t;
      if (full_details) {
        SetElement(lockerName, lockerName.slice(filter.length) + ': ' + first + ' ' + last);
      } else {
        SetElement(lockerName, lockerName.slice(filter.length) + ': reserved');
      }
      count ++;
    }
  }
  SetElement(filter + "comment", "Reserved: " + count + ". Available: " + (settings.Max - count) + ".");
}

function WomensLockers(settings)
{
  var text = `
<table class="tg">
  <tr>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-clickable tg-camb"><span id="W1">1</span></td>
    <td class="tg-clickable tg-camb"><span id="W3">3</span></td>
    <td class="tg-clickable tg-camb"><span id="W5">5</span></td>
    <td class="tg-clickable tg-camb"><span id="W7">7</span></td>
    <td class="tg-clickable tg-camb"><span id="W9">9</span></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
  </tr>
  <tr>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-clickable tg-oxfd-p"><span id="W2">2</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W4">4</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W6">6</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W8">8</span></td>
    <td class="tg-clickable tg-oxfd-p"><span id="W10">10</span></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
  </tr>
  <tr>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
  </tr>
  <tr>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-text" id="Wshow" rowspan="2" colspan="8"></td>
    <td class="tg-blanks"></td>
    <td class="tg-clickable tg-oxfd-p"><span id="W12">12</span></td>
    <td class="tg-clickable tg-camb"><span id="W11">11</span></td>
  </tr>
  <tr>
    <td class="tg-clickable tg-camb"><span id="W53">53</span></td>
    <td class="tg-clickable tg-oxfd-p"><span id="W54">54</span></td>
    <td class="tg-blanks"></td>
    <td class="tg-clickable tg-oxfd"><span id="W14">14</span></td>
    <td class="tg-clickable tg-camb"><span id="W13">13</span></td>
  </tr>
  <tr>
    <td class="tg-clickable tg-camb"><span id="W51">51</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W52">52</span></td>
    <td class="tg-blanks"></td>
    <td class="tg-text" colspan="7" rowspan="3">WOMEN'S<br>CHANGEROOM<br><span class="locker-comment" id="Wcomment"></span></td>
    <td class="tg-blanks"></td>
    <td class="tg-clickable tg-oxfd"><span id="W16">16</span></td>
    <td class="tg-clickable tg-camb"><span id="W15">15</span></td>
  </tr>
  <tr>
    <td class="tg-clickable tg-camb"><span id="W49">49</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W50">50</span></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-clickable tg-oxfd"><span id="W18">18</span></td>
    <td class="tg-clickable tg-camb"><span id="W17">17</span></td>
  </tr>
  <tr>
    <td class="tg-clickable tg-camb"><span id="W47">47</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W48">48</span></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-clickable tg-oxfd"><span id="W20">20</span></td>
    <td class="tg-clickable tg-camb"><span id="W19">19</span></td>
  </tr>
  <tr>
    <td class="tg-clickable tg-camb"><span id="W45">45</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W46">46</span></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-clickable tg-oxfd"><span id="W22">22</span></td>
    <td class="tg-clickable tg-camb"><span id="W21">21</span></td>
  </tr>
  <tr>
    <td class="tg-clickable tg-camb"><span id="W43">43</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W44">44</span></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-clickable tg-oxfd"><span id="W24">24</span></td>
    <td class="tg-clickable tg-camb"><span id="W23">23</span></td>
  </tr>
  <tr>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-clickable tg-oxfd"><span id="W42">42</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W40">40</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W38">38</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W36">36</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W34">34</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W32">32</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W30">30</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W28">28</span></td>
    <td class="tg-clickable tg-oxfd"><span id="W26">26</span></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
  </tr>
  <tr>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
    <td class="tg-clickable tg-camb"><span id="W41">41</span></td>
    <td class="tg-clickable tg-camb"><span id="W39">39</span></td>
    <td class="tg-clickable tg-camb"><span id="W37">37</span></td>
    <td class="tg-clickable tg-camb"><span id="W35">35</span></td>
    <td class="tg-clickable tg-camb"><span id="W33">33</span></td>
    <td class="tg-clickable tg-camb"><span id="W31">31</span></td>
    <td class="tg-clickable tg-camb"><span id="W29">29</span></td>
    <td class="tg-clickable tg-camb"><span id="W27">27</span></td>
    <td class="tg-clickable tg-camb"><span id="W25">25</span></td>
    <td class="tg-blanks"></td>
    <td class="tg-blanks"></td>
  </tr>
</table>`;
  return text;
}

function MensLockers(settings)
{
  var text = `
<table class="tg"><tbody>
<tr>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-camb"><span id="M13">13</span></td>
<td class="tg-clickable tg-camb"><span id="M15">15</span></td>
<td class="tg-clickable tg-camb"><span id="M17">17</span></td>
<td class="tg-clickable tg-camb"><span id="M19">19</span></td>
<td class="tg-clickable tg-camb"><span id="M21">21</span></td>
<td class="tg-clickable tg-camb"><span id="M23">23</span></td>
<td class="tg-clickable tg-camb"><span id="M25">25</span></td>
<td class="tg-clickable tg-camb"><span id="M27">27</span></td>
<td class="tg-clickable tg-camb"><span id="M29">29</span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
</tr>
<tr>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-oxfd"><span id="M14">14</span></td>
<td class="tg-clickable tg-oxfd"><span id="M16">16</span></td>
<td class="tg-clickable tg-oxfd"><span id="M18">18</span></td>
<td class="tg-clickable tg-oxfd"><span id="M20">20</span></td>
<td class="tg-clickable tg-oxfd"><span id="M22">22</span></td>
<td class="tg-clickable tg-oxfd"><span id="M24">24</span></td>
<td class="tg-clickable tg-oxfd"><span id="M26">26</span></td>
<td class="tg-clickable tg-oxfd"><span id="M28">28</span></td>
<td class="tg-clickable tg-oxfd"><span id="M30">30</span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
</tr>
<tr>
<td class="tg-clickable tg-camb"><span id="M11">11</span></td>
<td class="tg-clickable tg-oxfd"><span id="M12">12</span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-oxfd"><span id="M32">32</span></td>
<td class="tg-clickable tg-camb"><span id="M31">31</span></td>
</tr>
<tr>
<td class="tg-clickable tg-camb"><span id="M9">9</span></td>
<td class="tg-clickable tg-oxfd"><span id="M10">10</span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-text" id="Mshow" rowspan="2" colspan="8"></td>
<td class="tg-clickable tg-oxfd"><span id="M34">34</span></td>
<td class="tg-clickable tg-camb"><span id="M33">33</span></td>
</tr>
<tr>
<td class="tg-clickable tg-camb"><span id="M7">7</span></td>
<td class="tg-clickable tg-oxfd"><span id="M8">8</span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-oxfd"><span id="M36">36</span></td>
<td class="tg-clickable tg-camb"><span id="M35">35</span></td>
</tr>
<tr>
<td class="tg-clickable tg-camb"><span id="M5">5</span></td>
<td class="tg-clickable tg-oxfd"><span id="M6">6</span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-oxfd"><span id="M38">38</span></td>
<td class="tg-clickable tg-camb"><span id="M37">37</span></td>
</tr>
<tr>
<td class="tg-clickable tg-camb"><span id="M3">3</span></td>
<td class="tg-clickable tg-oxfd"><span id="M4">4</span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-text" colspan="7" rowspan="3">MEN'S<br>CHANGEROOM<br><span class="locker-comment" id="Mcomment"></span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-oxfd"><span id="M40">40</span></td>
<td class="tg-clickable tg-camb"><span id="M39">39</span></td>
</tr>
<tr>
<td class="tg-clickable tg-camb"><span id="M1">1</span></td>
<td class="tg-clickable tg-oxfd-p"><span id="M2">2</span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-oxfd"><span id="M42">42</span></td>
<td class="tg-clickable tg-camb"><span id="M41">41</span></td>
</tr>
<tr>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-oxfd-p"><span id="M44">44</span></td>
<td class="tg-clickable tg-camb"><span id="M43">43</span></td>
</tr>
<tr>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
</tr>
<tr>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-camb"><span id="M69">69</span></td>
<td class="tg-clickable tg-oxfd-p"><span id="M70">70</span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-oxfd-p"><span id="M46">46</span></td>
<td class="tg-clickable tg-camb"><span id="M45">45</span></td>
</tr>
<tr>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-camb"><span id="M67">67</span></td>
<td class="tg-clickable tg-oxfd"><span id="M68">68</span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-oxfd"><span id="M48">48</span></td>
<td class="tg-clickable tg-camb"><span id="M47">47</span></td>
</tr>
<tr>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-camb"><span id="M65">65</span></td>
<td class="tg-clickable tg-oxfd"><span id="M66">66</span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-oxfd"><span id="M50">50</span></td>
<td class="tg-clickable tg-camb"><span id="M49">49</span></td>
</tr>
<tr>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-oxfd"><span id="M64">64</span></td>
<td class="tg-clickable tg-oxfd"><span id="M62">62</span></td>
<td class="tg-clickable tg-oxfd"><span id="M60">60</span></td>
<td class="tg-clickable tg-oxfd"><span id="M58">58</span></td>
<td class="tg-clickable tg-oxfd"><span id="M56">56</span></td>
<td class="tg-clickable tg-oxfd"><span id="M54">54</span></td>
<td class="tg-clickable tg-oxfd"><span id="M52">52</span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
</tr>
<tr>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-clickable tg-camb"><span id="M63">63</span></td>
<td class="tg-clickable tg-camb"><span id="M61">61</span></td>
<td class="tg-clickable tg-camb"><span id="M59">59</span></td>
<td class="tg-clickable tg-camb"><span id="M57">57</span></td>
<td class="tg-clickable tg-camb"><span id="M55">55</span></td>
<td class="tg-clickable tg-camb"><span id="M53">53</span></td>
<td class="tg-clickable tg-camb"><span id="M51">51</span></td>
<td class="tg-blanks">&nbsp;</td>
<td class="tg-blanks">&nbsp;</td>
</tr>
</tbody>
</table>
`;
  return text;
}

function ReserveTableLockers(filter, settings, entries, full_details)
{
  var i, j;
  var count = 0;

  for (i = 1; i < entries.length; i++) {
    var lockerName = entries[i][map.locker].$t;
    if (lockerName.search(filter) == 0) {
      var first = entries[i][map.first].$t;
      var last = entries[i][map.last].$t;
      SetClass(lockerName, "cross-it", `${first} ${last}`);
      count ++;
    }
  }
  SetElement(filter + "comment", "" + (settings.Max - count) + " of " + settings.Max + " reserved lockers available");
}

function LockerLegend()
{
  var result = "<br>";
  result += `
<table class="tg"><tr>
<td class="tg-oxfd-p">Lower (Para<br>Reservable)</td>
<td class="tg-oxfd">Lower (Daily<br>Use)</td>
<td class="tg-camb">Upper<br>(Available)</td>
<td class="tg-camb-r">Upper<br>(Reserved)</td>
</tr></table>
  `;
  result += "<br>";
  return result;
}

function ShowAllLockers(elementId, entries, full_details)
{
  var element = document.getElementById(elementId);
  if (element) {
    if (full_details) {
      element.innerHTML = DefaultLockers("W", "Women's Changeroom", WOMENS) +
        LockerLegend() + DefaultLockers("M", "Men's Changeroom", MENS);
      ReserveLockers("W", WOMENS, entries, full_details);
      ReserveLockers("M", MENS, entries, full_details);
    } else {
      element.innerHTML = "" + WomensLockers(WOMENS) +
        LockerLegend() + MensLockers(MENS) + "";
      ReserveTableLockers("W", WOMENS, entries);
      ReserveTableLockers("M", MENS, entries);
    }
  }
}

function DrillToTarget(event)
{
  var id = event.target.id;
  if (id) {
    return event.target;
  }

  var children = event.target.children;
  for (var i = 0; i < children.length; i++) {
    if (children[i].id) {
      return children[i];
    }
  }

  return null;
}

function ClickedOnClickable(target)
{
  if (!target) return;
  var who = target.attributes.getNamedItem("who");
  var filter = target.id[0];
  var number = target.id.slice(1);

  if (who) {
    SetElement(filter + "show", `${number}. ${who.value}`);
  } else if (target.closest(".tg-oxfd-p")) {
    SetElement(filter + "show", `${number}. --reserved for para--`);
  } else if (target.closest(".tg-oxfd")) {
    SetElement(filter + "show", `${number}. **daily use**`);
  } else if (target.closest(".tg-camb")) {
    SetElement(filter + "show", `${number}. ++available++`);
  } else {
    SetElement(filter + "show", `${number}. ++available++`);
  }
}

function SetupCallbacks()
{
  var box = document.querySelector(".tg-clickable");

  // Detect all clicks on the document
  document.addEventListener("click", function(event) {
	  // If user clicks inside the element, do nothing
	  if (event.target.closest(".tg-clickable")) {
      var target = DrillToTarget(event);
      ClickedOnClickable(target);
    } else {
      SetElement("Wshow", "");
      SetElement("Mshow", "");
    }
	  // If user clicks outside the element, hide it!
	  // box.classList.add("js-is-hidden");
  });
}

function LockersCallback(jsonIn, qp)
{
  var full_details = qp && qp.details == "full";
  ShowAllLockers("lockers", jsonIn.feed.entry, full_details);
  SetupCallbacks();
}

function LockersCallbackOverview(jsonIn)
{
  LockersCallback(jsonIn, null);
}
