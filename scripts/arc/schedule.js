var CountingUsage = {};
var CountingCaptains = {};
var CountingNames = {};
var CountingEmails = {};

// POLYFILL
// Production steps of ECMA-262, Edition 6, 22.1.2.1
// Reference: https://people.mozilla.org/~jorendorff/es6-draft.html#sec-array.from
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) { return 0; }
      if (number === 0 || !isFinite(number)) { return number; }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };
    
    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;
      
      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);
      
      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError("Array.from requires an array-like object - not null or undefined");
      }
      
      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError('Array.from: when provided, the second argument must be a function');
        }
        
        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }
      
      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);
      
      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);
      
      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}
// POLYFILL


var AllTheData;
function DataSet(data)
{
  AllTheData = data;
}

String.prototype.splitCSV = function(sep) {
  for (var foo = this.split(sep = sep || ","), x = foo.length - 1, tl; x >= 0; x--) {
    if (foo[x].replace(/"\s+$/, '"').charAt(foo[x].length - 1) == '"') {
      if ((tl = foo[x].replace(/^\s+"/, '"')).length > 1 && tl.charAt(0) == '"') {
        foo[x] = foo[x].replace(/^\s*"|"\s*$/g, '').replace(/""/g, '"');
      } else if (x) {
        foo.splice(x - 1, 2, [foo[x - 1], foo[x]].join(sep));
      } else foo = foo.shift().split(sep).concat(foo);
    } else foo[x].replace(/""/g, '"');
  } return foo;
};

function getWidth() {
  if (self.innerHeight) {
    return self.innerWidth;
  }
  
  if (document.documentElement && document.documentElement.clientHeight) {
    return document.documentElement.clientWidth;
  }
  
  if (document.body) {
    return document.body.clientWidth;
  }
}

function FillRegattas(regattas)
{
  var res = "<ul>";
  var i, j;
  for (i=0; i<regattas.length; i+=1) {
    res += "<li>";
    if (regattas[i].fFrom || regattas[i].fTo) {
      res += "<b class=\"redClassARC\">" + regattas[i].fFrom + " - " + regattas[i].fTo + "</b>, " + regattas[i].fWhat + ": ";
    }
    for (j=0; j<regattas[i].fBoats.length; j+=1) {
      if (j > 0) {
        res += ", ";
      }
      res += regattas[i].fBoats[j].fType + " " + regattas[i].fBoats[j].fName;
    }
    res += "</li>";
  }
  res += "</ul>";
  return res;
}

function TemplateEmailBody()
{
  var total = "";
  total += "";
  total += "Please list which boat(s) and time(s) you are requesting.\n\n\n";
  return total;
}

function EmailLink(to, cc, subject, text, yahoo)
{
  // Apparently, this may work Yahoo!Mail:
  // http://compose.mail.yahoo.com/?to=TO&subject=SUBJECTMap&body=BODY
  var result = "<a target=\"_blank\" href=\"";
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
    result += "subject=" + encodeURI(subject);
    result += "&body=" + encodeURI(TemplateEmailBody());
  }
  result += "\">";
  result += text;
  result += "</a>";
  return result;
}

function CreateHeader(across, where, regattas, yahoo)
{
  var total = "<table width=\"100%\"><tr>";
  
  if (across) {
    total += "<td>";
    total += FillRegattas(regattas);
    total += "</td>";
  }
  
  total += "<td width=\"25%\" class=\"email\">";
  total += "<a target=\"_blank\" href=\"http://www.argonautrowingclub.com/pre-approved-boat-allocations/\">Click here to request a boat allocation</a>";
  total += "</td>";
  if (!across) {
    total += "</tr><tr>";
    total += "<td>";
    total += FillRegattas(regattas);
    total += "</td>";
    total += "</tr><tr>";
  }
  
  total += "<td width=\"40%\" class=\"email\">";
  total += "<table width=\"100%\" id=\"legend\"><tr>";
  
  total += "<td width\"25%\">";
  
  total += "<input type=\"checkbox\" id=\"checkLTR\" checked onchange=\"pressingLTR(this)\">Learn to row</input><br>";
  total += "<input type=\"checkbox\" id=\"checkSM\" checked onchange=\"pressingSM(this)\">Seniors</input>";
  total += "</td><td width\"25%\">";

  total += "<input type=\"checkbox\" id=\"checkJ\" checked onchange=\"pressingJ(this)\">Juniors</input><br>";
  total += "<input type=\"checkbox\" id=\"checkCLUB\" checked onchange=\"pressingCLUB(this)\">Club + Masters</input>";
  total += "</td><td width\"25%\">";

  total += "<input type=\"checkbox\" id=\"check8\" checked onchange=\"pressing8(this)\">8+</input><br>";
  total += "<input type=\"checkbox\" id=\"check4\" checked onchange=\"pressing4(this)\">4x, 4-, 4+</input>";
  total += "</td><td width\"25%\">";

  total += "<input type=\"checkbox\" id=\"check2\" checked onchange=\"pressing2(this)\">2x, 2-</input><br>";
  total += "<input type=\"checkbox\" id=\"check1\" checked onchange=\"pressing1(this)\">1x</input>";
  total += "</td>";

  total += "</tr></table>";
  // total += "<span class=\"redClassARC\">Conflicts (if any) in red.</span>";
  total += "</td>";
  
  total += "</tr></table>";
  
  document.getElementById(where).innerHTML = total;
}

function CreateTable(across, where, what)
{
  var total = "<table width=\"100%\">";
  var hw = 10;
  var width = 90;
  if (across) {
    hw = 10;
    width = (100 - 10) / AllTheData.fWeekdays.length;
  }
  
  var i, j, jr;
  
  if (across) {
    total += "<tr><th width=\""+ hw + "%\">&nbsp;</th>";
    // THIS IS ALL DAYS ACROSS
    for (i = 0; i < AllTheData.fWeekdays.length; i+=1) {
      total += "<th width=\"" + width + "%\">" + AllTheData.fWeekdays[i] + "</th>";
    }
    total += "</tr><tr>";
    
    for (j = 0; j < AllTheData.fTimesDays.length; j+=1) {
      total += "<th>" + AllTheData.fTimesDays[j] + "</th>";
      for (i = 0; i < AllTheData.fWeekdays.length; i+=1) {
        jr = ""; // if (j == 4) { jr = "<ul><li>" + what + "Juniors</li></ul>"; }
        var id = AllTheData.fWeekdays[i] + " " + AllTheData.fTimesDays[j];
        total += "<td><section class=\"totals\">(<span id=\"R" + id + "\">0</span> crew(s), <span id=\"C" + id + "\">0</span> rowers)</section>" + jr + "<ul id=\"" + id + "99\"></ul><ul id=\"" + id + "8\"></ul><ul id=\"" + id + "4\"></ul><ul id=\"" + id + "2\"></ul><ul id=\"" + id + "1\"></ul></td>";
      }
      total += "</tr><tr>";
    }
    
    // This is the break between weekdays and weekends
    total += "</tr><tr><td colspan=\"6\">&nbsp;<br>&nbsp;</td></tr><tr>";
    
    total += "<th>&nbsp;</th>";
    for (i = 0; i < AllTheData.fWeekends.length; i+=1) {
      total += "<th colspan=\"2\" width=\"" + width + "%\">" + AllTheData.fWeekends[i] + "</th>";
      if (i == 0) {
        total += "<th>&nbsp;</th>";
      }
    }
    total += "</tr><tr>";
    
    for (j = 0; j < AllTheData.fTimesEnds.length; j+=1) {
      total += "<th>" + AllTheData.fTimesEnds[j] + "</th>";
      for (i = 0; i < AllTheData.fWeekends.length; i+=1) {
        jr = ""; if (i == 0 && j == 2) { jr = "<ul><li>" + what + "Juniors</li></ul>"; }
        var id = AllTheData.fWeekends[i] + " " + AllTheData.fTimesEnds[j];
        total += "<td><section class=\"totals\">(<span id=\"R" + id + "\">0</span> crew(s), <span id=\"C" + id + "\">0</span> rowers)</section>" + jr + "<ul id=\"" + id + "99\"></ul><ul id=\"" + id + "8\"></ul><ul id=\"" + id + "4\"></ul></td>";
        total += "<td><section class=\"totals\"><ul id=\"" + id + "2\"></ul><ul id=\"" + id + "1\"></ul></td>";
        if (i == 0) {
          total += "<th>&nbsp;</th>";
        }
      }
      total += "<th>&nbsp;</th></tr><tr>";
    }
    total += "</tr>";
  } else { // not across
    // THIS IS ONE DAY PER ROW
    for (i = 0; i < AllTheData.fWeekdays.length; i+=1) {
      total += "<tr><th width=\""+ hw + "%\">&nbsp;</th>";
      total += "<th width=\"" + width + "%\">" + AllTheData.fWeekdays[i] + "</th></tr>";
      
      for (j = 0; j < AllTheData.fTimesDays.length; j+=1) {
        total += "<tr><th>" + AllTheData.fTimesDays[j] + "</th>";
        var id = AllTheData.fWeekdays[i] + " " + AllTheData.fTimesDays[j];
        total += "<td><section class=\"totals\">(<span id=\"R" + id + "\">0</span> crew(s), <span id=\"C" + id + "\">0</span> rowers)</section><ul id=\"" + id + "99\"></ul><ul id=\"" + id + "8\"></ul><ul id=\"" + id + "4\"></ul><ul id=\"" + id + "2\"></ul><ul id=\"" + id + "1\"></ul></td></tr>";
      }
    }
    for (i = 0; i < AllTheData.fWeekends.length; i+=1) {
      total += "<tr><th width=\""+ hw + "%\">&nbsp;</th>";
      total += "<th width=\"" + width + "%\">" + AllTheData.fWeekends[i] + "</th></tr>";
      
      for (j = 0; j < AllTheData.fTimesEnds.length; j+=1) {
        total += "<tr><th>" + AllTheData.fTimesEnds[j] + "</th>";
        var id = AllTheData.fWeekends[i] + " " + AllTheData.fTimesEnds[j];
        total += "<td><section class=\"totals\">(<span id=\"R" + id + "\">0</span> crew(s), <span id=\"C" + id + "\">0</span> rowers)</section><ul id=\"" + id + "99\"></ul><ul id=\"" + id + "8\"></ul><ul id=\"" + id + "4\"></ul><ul id=\"" + id + "2\"></ul><ul id=\"" + id + "1\"></ul></td></tr>";
      }
    }
  }
  total += "</table>";
  document.getElementById(where).innerHTML = total;
};

function ResetTable()
{
  for (j = 0; j < AllTheData.fTimesDays.length; j+=1) {
    for (i = 0; i < AllTheData.fWeekdays.length; i+=1) {
      var id = AllTheData.fWeekdays[i] + " " + AllTheData.fTimesDays[j];
      document.getElementById("R"+id).innerHTML = "0";
      document.getElementById("C"+id).innerHTML = "0";
      document.getElementById(id+"99").innerHTML = "";
      document.getElementById(id+"8").innerHTML = "";
      document.getElementById(id+"4").innerHTML = "";
      document.getElementById(id+"2").innerHTML = "";
      document.getElementById(id+"1").innerHTML = "";
    }
  }
  
  for (j = 0; j < AllTheData.fTimesEnds.length; j+=1) {
    for (i = 0; i < AllTheData.fWeekends.length; i+=1) {
      var id = AllTheData.fWeekends[i] + " " + AllTheData.fTimesEnds[j];
      document.getElementById("R"+id).innerHTML = "0";
      document.getElementById("C"+id).innerHTML = "0";
      document.getElementById(id+"99").innerHTML = "";
      document.getElementById(id+"8").innerHTML = "";
      document.getElementById(id+"4").innerHTML = "";
      document.getElementById(id+"2").innerHTML = "";
      document.getElementById(id+"1").innerHTML = "";
    }
  }
};

var FilterVariable =
    {
      "CLUB" : true,
      "LTR" : true,
      "J" : true,
      "SM" : true,
      "8" : true,
      "4" : true,
      "2" : true,
      "1" : true
    };

var FilterCaptains = {};

function pressingCaptain(cb)
{
  var asid = cb.id.replace(/check/, "");
  FilterCaptains[asid] = cb.checked;
  CaptainsFill();
}

function pressingCLUB(cb) { FilterVariable["CLUB"] = cb.checked; AutoFill(); };
function pressingLTR(cb) { FilterVariable["LTR"] = cb.checked; AutoFill(); };
function pressingJ(cb) { FilterVariable["J"] = cb.checked; AutoFill(); };
function pressingSM(cb) { FilterVariable["SM"] = cb.checked; AutoFill(); };

function pressing8(cb) { FilterVariable["8"] = cb.checked; AutoFill(); };
function pressing4(cb) { FilterVariable["4"] = cb.checked; AutoFill(); };
function pressing2(cb) { FilterVariable["2"] = cb.checked; AutoFill(); };
function pressing1(cb) { FilterVariable["1"] = cb.checked; AutoFill(); };

function FilterShow(data, checkCaptains)
{
  var fromType = ValFromType(data.fType);
  
  var boatType = true;
  if (fromType == 99) {
    boatType = true;
  } else if (fromType == 8) {
    boatType = FilterVariable["8"];
  } else if (fromType == 4) {
    boatType = FilterVariable["4"];
  } else if (fromType == 2) {
    boatType = FilterVariable["2"];
  } else if (fromType == 1) {
    boatType = FilterVariable["1"];
  }
  
  if (checkCaptains && data.fWho[0]) {
    var captain = data.fWho[0].replace(/ /g,"_");
    if (captain in FilterCaptains) {
      if (!FilterCaptains[captain]) {
        return false;
      }
    }
  }
  
  if (data.fProgram.toUpperCase().search("REC") >= 0) {
    return boatType && FilterVariable["CLUB"];
  } else if (data.fProgram.toUpperCase().search("DEV") >= 0) {
    return boatType && FilterVariable["CLUB"];
  } else if (data.fProgram.toUpperCase().search("CLUB") >= 0) {
    return boatType && FilterVariable["CLUB"];
  } else if (data.fProgram.toUpperCase().search("CAMP ARGO") >= 0) {
    return boatType && FilterVariable["CLUB"];
  } else if (data.fProgram.toUpperCase().search("JUNIOR") >= 0) {
    return boatType && FilterVariable["J"];
  } else if (data.fProgram.toUpperCase().search("NOVICE") >= 0) {
    return boatType && FilterVariable["CLUB"];
  } else if ((data.fProgram.toUpperCase().search("LTR") >= 0) ||
             (data.fProgram.toUpperCase().search("LEARN") >= 0)) {
    return boatType && FilterVariable["LTR"];
  } else if ((data.fProgram.toUpperCase().search("MW") >= 0) ||
             (data.fProgram.toUpperCase().search("MM") >= 0) ||
             (data.fProgram.toUpperCase().search("MASTERS") >= 0)) {
    return boatType && FilterVariable["CLUB"];
  } else if ((data.fProgram.toUpperCase().search("SW") >= 0) ||
             (data.fProgram.toUpperCase().search("SM") >= 0) ||
             (data.fProgram.toUpperCase().search("WOMEN") >= 0) ||
             (data.fProgram.toUpperCase().search("MEN") >= 0) ||
             (data.fProgram.toUpperCase().search("SENIOR") >= 0)) {
    return boatType && FilterVariable["SM"];
  }
  return false;
}

function FilterShowAll(data) { return true; }

function ValFromType(type)
{
  var value = 100;
  for (var i=30; i>0; i-=1) {
    if (type.search(i) >= 0) {
      value = i;
      break;
    }
  }
  if (value == 100) {
    value = 1;
  }
  return value;
};

var LocationStats;
var LocationCaptains;
function ScheduleSet(stats, captains)
{
  LocationStats = stats;
  LocationCaptains = captains;
};

var DoingCaptains = -1;

function AutoFill()
{
  if (DoingCaptains == 1) {
    CaptainsFill();
  } else {
    ScheduleFill();
  }
}

function ScheduleFill()
{
  DoingCaptains = 0;
  ResetTable();
  ScheduleFillFrom(AllTheData.fSchedule, LocationStats, false);
};

function CaptainsFill()
{
  DoingCaptains = 1;
  ResetTable();
  ScheduleFillFrom(AllTheData.fSchedule, LocationStats, true);
}

function CaptainsFillFrom(data, stats, captains, yahoo)
{
  DoingCaptains = 1;
  ScheduleFillFrom(data, stats, true);
  FillCaptains(captains, yahoo);
}

function WhatAvailable(boats, id)
{
  var result = "";
  var keys = Object.keys(boats);
  keys.sort();
  for (var i=keys.length-1; i>=0; i--) {
    var one = keys[i];
    var boat = boats[one];
    if (id in boat) continue;
    result += "<li>" + one + "</li>";
  }
  return result;
}

function AvailableFillFrom(data)
{
  var SomeBoatsOut = {};
  var BoatUsed = {};
  
  for (var i=0; i<data.length; i+=1) {
    var id = data[i].fDay + " " + data[i].fTime;
    var type = data[i].fType;
    if (ValFromType(type) < 2) continue;
    
    SomeBoatsOut[id] = true;
    
    var name = data[i].fName.toUpperCase();
    var tag = type + " " + name;
    if (!(tag in BoatUsed)) {
      BoatUsed[tag] = {};
    }
    BoatUsed[tag][id] = true;
  }
  
  for (j = 0; j < AllTheData.fTimesDays.length; j+=1) {
    if (j == 4) continue;
    for (i = 0; i < AllTheData.fWeekdays.length; i+=1) {
      var id = AllTheData.fWeekdays[i] + " " + AllTheData.fTimesDays[j];
      var content = "<li class=\"blue\">All boats available</li>";
      if ((id in SomeBoatsOut) && SomeBoatsOut[id]) {
        content = WhatAvailable(BoatUsed,id);
      }
      var el = document.getElementById(id+"99");
      el.innerHTML = content;
    }
  }
  
  for (j = 0; j < AllTheData.fTimesEnds.length; j+=1) {
    for (i = 0; i < AllTheData.fWeekends.length; i+=1) {
      var id = AllTheData.fWeekends[i] + " " + AllTheData.fTimesEnds[j];
      var content = "<li class=\"blue\">All boats available</li>";
      if ((id in SomeBoatsOut) && SomeBoatsOut[id]) {
        content = WhatAvailable(BoatUsed,id);
      }
      var el = document.getElementById(id+"99");
      el.innerHTML += "<li>" + content + "</li>";
    }
  }
}

function ElementClearOf(innerHTML, name, recurrence)
{
  if (innerHTML.search(name) < 0) {
    return true;
  }
  if (innerHTML.search(name + recurrence) < 0) {
    return true;
  }
  return false;
}


function ScheduleFillFrom(data, stats, showcaptains)
{
  var filtered = 0;
  
  var checkCaptains = Object.keys(FilterCaptains).length > 0;
  
  for (var i=0; i<data.length; i+=1) {
    
    var program = data[i].fProgram;
    var recurrence = data[i].fRecurrence;

    if (!FilterShow(data[i], checkCaptains)) {
      filtered += 1;
      console.log("SKIP " + program + " at " + data[i].fDay + " " + data[i].fTime + " " + data[i].fName);
      continue;
    }
    var id = data[i].fDay + " " + data[i].fTime;
    var type = data[i].fType;
    var count = ValFromType(type);
    var el = document.getElementById(id + count);
    if (!el) {
      console.log("Failed to find " + id + count);
      el = document.getElementById(id+"99");
      if (!el) {
        console.log("Also failed to find " + id + "99");
        console.log("SKIP " + program + " at " + data[i].fDay + " " + data[i].fTime + " " + data[i].fName);
        continue;
      } else {
        //    console.log("Found " + id + "99");
      }
    } else {
      //      console.log("Found " + id + count);
    }
    var name = data[i].fName.toUpperCase();
    if (!(name in CountingUsage)) {
      CountingUsage[name] = 0;
    }
    CountingUsage[name] += 1;
    
    var who = data[i].fWho;
    if (who && who.length > 1 && who[0] && who[1]) {
      if (!(who[0] in CountingCaptains)) {
        CountingCaptains[who[0]] = new Set();
        CountingEmails[who[0]] = who[1];
      }
      CountingCaptains[who[0]].add(type + " " + name);
      
      var tagit = type + " " + name;
      if (!(tagit in CountingNames)) {
        CountingNames[tagit] = new Set();
      }
      CountingNames[tagit].add(who[0]);
    } else if (showcaptains) {
      console.log("Skipping " + who);
    }
    
    var item = type + " " + name + recurrence + " - " + program;
    if (showcaptains) {
      if (who && who.length > 1 && who[0] && who[1]) {
        item += " <span>(" + who[0] + ")</span>";
      } else {
        item += " <span class=\"blue\">(captain?)</span>";
      }
    } else {
      if (who && who.length > 1 && who[0] && who[1]) {
        item += " <span>(" + who[0].split(" ")[0] + ")</span>";
      }
    }
    
    var tag;
    if (ElementClearOf(el.innerHTML, name, recurrence)) {
      if (recurrence.toUpperCase().search("ONCE") > 0) {
        tag = "<li class=\"blue\">";
      } else if (name.toUpperCase().search("DAMAGED") > 0) {
        tag = "<li class=\"yellow\">";
      } else if (name.toUpperCase().search("REGATTA") > 0) {
        tag = "<li class=\"yellow\">";
      } else {
        tag = "<li>";
      }
    } else {
      tag = "<li class=\"redClassARC\">";
    }
    el.innerHTML += tag + item + "</li>";
    
    el = document.getElementById("C"+id);
    el.innerHTML = parseInt(el.innerHTML) + count;
    
    el = document.getElementById("R"+id);
    el.innerHTML = parseInt(el.innerHTML) + 1;
  }
  
  if (filtered > 0) {
    document.getElementById(stats).innerHTML = "<p>Not showing " + filtered + " allocations.</p>";
  } else {
    document.getElementById(stats).innerHTML = "";
  }
}

function FillCaptains(captains, yahoo)
{
  var allemails = "";
  
  var body = "<tr>\n";
  body += "<td>\n";
  
  body += "<ul>\n";
  for (one in CountingCaptains) {
    var asid = one.replace(/ /g,"_");
    
    var email = CountingEmails[one];
    if (allemails) {
      allemails += ",";
    }
    allemails += email;
    var asarr = Array.from(CountingCaptains[one]);
    var allboats = "";
    //    console.log("Going through " + CountingCaptains[one].values() + " and " + Array.from(CountingCaptains[one]));
    for (var j=0; j<asarr.length; j+=1) {
      if (allboats) {
        allboats += ", ";
      }
      allboats += asarr[j];
    }
    
    body += "<li>\n";
    body += "<input type=\"checkbox\" id=\"check" + asid + "\" checked onchange=\"pressingCaptain(this)\">&nbsp;</input>";
    body += EmailLink(email,
                      "captain@argonautrowingclub.com",
                      "Re: ARC boats: " + allboats,
                      one,
                      yahoo);
    body += ": " + allboats;
    body += "</li>\n";
  }
  body += "</ul>\n";
  body += "</td>\n";
  
  body += "<td><ul>\n";
  for (one in CountingNames) {
    var justone = "";
    var emails = "";
    var asarr = Array.from(CountingNames[one]);
    for (var j=0; j<asarr.length; j+=1) {
      var item = asarr[j];
      if (justone) {
        justone += ", ";
      }
      justone += item;
      
      if (emails) {
        emails += ",";
      }
      emails += CountingEmails[item];
    }
    body += "<li>" + EmailLink(emails,
                               "captain@argonautrowingclub.com",
                               "Re: " + one + " allocation",
                               one,
                               yahoo) + ": " + justone + "</li>";
  }
  body += "</ul></td>\n";
  
  body += "</tr>";
  
  var header = "<tr>\n";
  header += "<th>" + EmailLink(allemails,
                               "captain@argonautrowingclub.com",
                               "To all crew captains",
                               "Captains",
                               yahoo) + "</th><th>Boats</th>\n";
  header += "</tr>\n";
  
  var total = "";
  /*
    total += "<pre>\n";
    total += "Make each thing a checkbox\n so that we can filter per boat\n or per person\n";
    total += "\n\n";
    total += "</pre>\n";
  */
  total += "<br><hr><table width=\"100%\" id=\"captains\">\n";
  total += header + body;
  total += "</table>\n";
  document.getElementById(captains).innerHTML = total;
}

var jsonBoats = [];
function FillFleet(boats, across)
{
  var boatType = [8,4,2,1];
  
  var collect8 = "";
  var collect4 = "";
  var collect2 = "";
  var collect1 = "";
  
  // console.log(CountingUsage);
  
  var i, j;
  for (i=0; i<jsonBoats.length; i+=1){
    var name = jsonBoats[i][0];
    var upper = name.toUpperCase();
    var type = jsonBoats[i][1];
    if (ValFromType(type) == 8) {
      if (upper in CountingUsage) {
        collect8 += "<li>" + name + " (" + CountingUsage[upper] + ")</li>";
      } else {
        collect8 += "<li>" + name + "</li>";
      }
    } else if (ValFromType(type) == 4) {
      if (upper in CountingUsage) {
        collect4 += "<li>" + name + " (" + CountingUsage[upper] + ")</li>";
      } else {
        collect4 += "<li>" + name + "</li>";
      }
    } else if (ValFromType(type) == 2) {
      if (upper in CountingUsage) {
        collect2 += "<li>" + name + " (" + CountingUsage[upper] + ")</li>";
      } else {
        collect2 += "<li>" + name + "</li>";
      }
    } else if (ValFromType(type) == 1) {
      if (upper in CountingUsage) {
        collect1 += "<li>" + name + " (" + CountingUsage[upper] + ")</li>";
      } else {
        collect1 += "<li>" + name + "</li>";
      }
    } else {
      console.log("There is a problem with " + jsonBoats[0]);
    }
  }
  
  var total = "<br><hr><table width=\"100%\">";
  total += "<tr><th>8+</th><th>4x/4-/4+</th>";
  if (across) {
    total += "<th>2x/2-</th><th>1x</th></tr>";
  } else {
    total += "</tr><tr>";
  }
  
  total += "<tr><td><ul>";
  total += collect8;
  total += "</ul></td>";
  
  total += "<td><ul>";
  total += collect4;
  total += "</ul></td>";
  
  if (!across) {
    total += "</tr><tr>";
    total += "<th>2x/2-</th><th>1x</th></tr>";
  }
  
  total += "<td><ul>";
  total += collect2;
  total += "</ul></td>";
  
  total += "<td><ul>";
  total += collect1;
  total += "</ul></td>";
  
  total += "</tr></table>";
  document.getElementById(boats).innerHTML = total;
}

function AssignedBoats(jsonIn)
{
  var entries = jsonIn.feed.entry;
  for (var i=0; i<entries.length; i+=1) {
    var boat = entries[i].gsx$boats.$t;
    var type = entries[i].gsx$type.$t;
    jsonBoats.push([boat, type]);
  }
}
