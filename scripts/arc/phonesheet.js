var gGroups = null;
var gTrip = null;
var gTotal = null;
var gTemplate = null;
var gCurrency = null;

var gSummaryWhat = "";
var gSummaryAmount = "";
var gSummaryCurrencyUsed = null;
var gSummaryPaidBy = "";
var gSummaryGuests = null;

function ParseJSON(value)
{
  try {
    var parsed = JSON.parse(value);
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  }
  catch (e) { }
  return "";
}

function GetCurrencyName(c)
{
  var a = c.split(',');
  return a[0];
}

function GetCurrencyFactor(c)
{
  var a = c.split(',');
  return parseFloat(a[1].replace(/,/g,''));
}

function UpdateGuests()
{
  gSummaryGuests = new Set();
  
  for (var i=0; i<gGroups.length; i++) {
    var who = gGroups[i].who;
    for (var j in who) {
      var el = document.getElementById("CB_"+j);
      if (el && el.checked) {
        gSummaryGuests.add(j.toLowerCase());
      }
    }
  }
}

function EmailBody(what, amount, currencyUsed, paygroup, groupshares)
{
  var body = {};
  var result = gTemplate.slice();
  result[0] = what + " (" + GetCurrencyName(currencyUsed) + ")";
  result[1] = amount * GetCurrencyFactor(currencyUsed);
  if (paygroup >= 0) {
    result[gGroups[paygroup].index[1]] = gTotal;
  }
  for (var i=0; i<gGroups.length; i++) {
    if (groupshares[i] > 0) {
      result[gGroups[i].index[0]] = groupshares[i];
    }
  }
  
  body["paidby"] = (paygroup >= 0);
  body["result"] = result;
  return body;
}

function PaygroupFromPayer(paidby)
{
  if (!paidby) {
    return -1;
  }
  
  paidby = paidby.toLowerCase();
  for (var i=0; i<gGroups.length; i++) {
    for (var j in gGroups[i].who) {
      if (paidby == j.toLowerCase()) {
        return i;
      }
    }
    for (var j=0; j<gGroups[i].email.length; j++) {
      if (paidby == gGroups[i].email[j].toLowerCase()) {
        return i;
      }
    }
  }
  
  return -1;
}

function SharesFromGuests(guestlist)
{
  var groupshares = [];
  for (var i=0; i<gGroups.length; i++) {
    var sum = 0.0;
    for (var j in gGroups[i].who) {
      var who = j.toLowerCase();
      if (guestlist.has(who)) {
        sum += parseFloat(gGroups[i].who[j].replace(/,/g,''));
      }
    }
    groupshares.push(sum);
  }
  return groupshares;
}

function EmailHTML(what, amount, currencyUsed, paidby, guests)
{
  var paygroup = PaygroupFromPayer(paidby);
  var groupshares = SharesFromGuests(guests);
  
  var toperson = encodeURI("msr3ckovic@gmail.com");
  var subject = "RACUN " + gTrip;
  var body = EmailBody(what, amount, currencyUsed,
                       paygroup, groupshares);
  
  var total = "<a id=\"femail\" target=\"_blank\" href=\"mailto:" + toperson;
  total += "?subject=" + subject;
  total += "&amp;body=" + encodeURIComponent(JSON.stringify(body));
  total += "\">That sounds good - submit it</a>";
  return total;
}

function IsThereEnoughInput()
{
  return gSummaryWhat && gSummaryAmount && gSummaryPaidBy && gSummaryGuests;
}

function CallbackCurrency(cntrl)
{
  gSummaryCurrencyUsed = cntrl.value;
  if (IsThereEnoughInput()) {
    var el = document.getElementById("done");
    el.setAttribute('style', 'display:block');
  }
}

function CallbackWhat(cntrl)
{
  gSummaryWhat = cntrl.value;
  
  if (IsThereEnoughInput()) {
    var el = document.getElementById("done");
    el.setAttribute('style', 'display:block');
  }
}

function CallbackAmount(cntrl)
{
  gSummaryAmount = parseFloat(cntrl.value.replace(/,/g,''));
  if (IsThereEnoughInput()) {
    var el = document.getElementById("done");
    el.setAttribute('style', 'display:block');
  }
}

function CallbackPaidBy(cntrl)
{
  gSummaryPaidBy = cntrl.value;
  if (IsThereEnoughInput()) {
    var el = document.getElementById("done");
    el.setAttribute('style', 'display:block');
  }
}

function BuildControlsGuests(into)
{
  var across = 3;
  var count = 0;
  
  // var total = "<br><span id=\"tguests\">Guests</span>";
  var total = "<hr>";
  
  total += "<table width=\"100%\" id=\"fguests\">";
  for (var i=0; i<gGroups.length; i++) {
    var who = gGroups[i].who;
    for (var j in who) {
      if (count % across == 0) {
        total += "<tr>";
      }
      total += "<td><input checked id=\"CB_" + j + "\" type=\"checkbox\" value=\"" + j + "," + who[j] + "\">" + j + "</input></td>";
      count ++;
      if (count % across == 0) {
        total += "</tr>";
      }
    }
  }
  total += "</table>";
  return total;
}

function BuildControlsWhat(into)
{
  var lefty = "Where?";
  
  var righty = "<input type=\"text\" onchange=\"CallbackWhat(this)\" id=\"famount\">";
  righty += "</input>";
  
  into.push([lefty, righty]);
}

function BuildControlsAmount(into)
{
  var lefty = "How much?";
  
  var righty = "<input type=\"number\" onchange=\"CallbackAmount(this)\" id=\"famount\">";
  righty += "</input>&nbsp;";
  
  righty += "<select onchange=\"CallbackCurrency(this)\" id=\"fcurrency\">";
  for (var i in gCurrency) {
    if (gCurrency[i] == 1) {
      righty += "<option selected value=\"" + i + "," + gCurrency[i] + "\">" + i + "</option>";
    } else {
      righty += "<option value=\"" + i + "," + gCurrency[i] + "\">" + i + "</option>";
    }
  }
  righty += "</select>";
  
  into.push([lefty, righty]);
}

function BuildControlsPaidBy(into)
{
  var lefty = "Who paid?";
  
  var righty = "<select onchange=\"CallbackPaidBy(this)\" id=\"fpaidby\">";
  righty += "<option value=\"sender\" selected=\"selected\">I did</option>";
  for (var i=0; i<gGroups.length; i++) {
    var who = gGroups[i].who;
    for (var j in who) {
      if (who[j] >= 1) {
        righty += "<option value=\"" + j + "\">" + j + "</option>";
      }
    }
  }
  righty += "</select>";
  
  return into.push([lefty, righty]);
}

function BuildTable(into)
{
  var total = "<table width=\"100%\">\n";
  for (var i=0; i<into.length; i++) {
    total += "<tr>";
    total += "<td class=\"lefty\" width=\"30%\">" + into[i][0] + "</td>";
    total += "<td class=\"righty\" width=\"70%\">" + into[i][1] + "</td>";
    total += "</tr>\n";
  }
  total += "</table>\n";
  return total;
}

function BuildControls()
{
  document.getElementById("trip").innerHTML = gTrip;
  
  var into = [];
  
  BuildControlsWhat(into);
  BuildControlsAmount(into);
  BuildControlsPaidBy(into);
  document.getElementById("controls").innerHTML =
    BuildTable(into) + BuildControlsGuests();
}

function BuildSummary()
{
  UpdateGuests();
  
  var total = "";
  for (let i of gSummaryGuests) {
    if (total) {
      total += ", ";
    }
    total += i[0].toUpperCase() + i.substring(1);
  }
  
  total += " went to " + gSummaryWhat + ".  Then, ";
  total += gSummaryPaidBy + " paid " + gSummaryAmount;
  total += " (" + GetCurrencyName(gSummaryCurrencyUsed) + ") for those " + gSummaryGuests.size + " people.";
  return total;
}

function BuildEmail()
{
  UpdateGuests();
  return EmailHTML(gSummaryWhat, gSummaryAmount, gSummaryCurrencyUsed,
                   gSummaryPaidBy, gSummaryGuests);
}

function DoDone()
{
  var el;
  BuildSummary();
  
  el = document.getElementById("done");
  el.setAttribute('style', 'display:none');
  
  el = document.getElementById("controls");
  el.setAttribute('style', 'display:none');
  
  el = document.getElementById("summary");
  el.innerHTML = BuildSummary();
  el.setAttribute('style', 'display:block');
  
  el = document.getElementById("submit");
  el.innerHTML = BuildEmail();
  el.setAttribute('style', 'display:block');
  
  el = document.getElementById("reset");
  el.setAttribute('style', 'display:block');
}

function DoReset()
{
  var el;
  
  el = document.getElementById("submit");
  el.setAttribute('style', 'display:none');
  
  el = document.getElementById("reset");
  el.setAttribute('reset', 'display:none');
  
  el = document.getElementById("controls");
  el.setAttribute('style', 'display:block');
  
  el = document.getElementById("summary");
  el.setAttribute('style', 'display:none');
  
  el = document.getElementById("done");
  el.setAttribute('style', 'display:block');
}

function SetupDefaults()
{
  gSummaryPaidBy = "sender";
  gSummaryGuests = new Set();
  
  for (var i=0; i<gGroups.length; i++) {
    var who = gGroups[i].who;
    for (var j in who) {
      gSummaryGuests.add(j.toLowerCase());
    }
  }
  
  gSummaryCurrencyUsed = "CAD,1";
  for (var i in gCurrency) {
    if (gCurrency[i] == 1) {
      gSummaryCurrencyUsed = "" + i + ",1";
    }
  }
}

function ScriptCallback(jsonIn)
{
  // Need the gsx$body for template and currency and total, and
  // need the gsx$what for groups
  var entries = jsonIn.feed.entry;
  var body = ParseJSON(entries[0].gsx$body.$t);
  gTrip = body.trip;
  gTotal = body.total;
  gTemplate = body.template;
  gCurrency = body.currency;
  
  var what = ParseJSON(entries[0].gsx$what.$t);
  gGroups = what.groups;
  
  BuildControls();
  SetupDefaults();
}

