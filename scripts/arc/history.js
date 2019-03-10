var CountingUsage = {};

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

function CreateHeader(where)
{
  var total = "<table width=\"100%\"><tr>";
  
  total += "<td width=\"30%\"><a title=\"Argonaut Rowing Club\" href=\"http://www.argonautrowingclub.com\"><h2 id=\"logo\">Argonault Rowing Club</h2></a></td>";
  total += "<td>&nbsp;</td>";
  
  total += "<td width=\"25%\"/>";
  
  total += "<td width=\"25%\" class=\"email\">";
  total += "<table width=\"100%\" id=\"legend\"><tr>";
  
  total += "<td width\"40%\">";
  
  total += "<input type=\"checkbox\" id=\"checkLTR\" checked onchange=\"pressingLTR(this)\">Learn to row</input><br>";
  total += "<input type=\"checkbox\" id=\"checkSW\" checked onchange=\"pressingSW(this)\">Sr/Lwt Women</input><br>";
  total += "<input type=\"checkbox\" id=\"checkSM\" checked onchange=\"pressingSM(this)\">Sr/Lwt Men</input><br>";
  total += "<input type=\"checkbox\" id=\"checkJ\" checked onchange=\"pressingJ(this)\">Juniors</input>";
  
  total += "</td><td width\"40%\">";
  
  total += "<input type=\"checkbox\" id=\"checkREC\" checked onchange=\"pressingREC(this)\">Rec./Dev.</input><br>";
  total += "<input type=\"checkbox\" id=\"checkMW\" checked onchange=\"pressingMW(this)\">Masters Women</input><br>";
  total += "<input type=\"checkbox\" id=\"checkMM\" checked onchange=\"pressingMM(this)\">Masters Men</input><br>&nbsp;";
  
  total += "</td><td width\"20%\">";
  total += "<input type=\"checkbox\" id=\"check8\" checked onchange=\"pressing8(this)\">8+</input><br>";
  total += "<input type=\"checkbox\" id=\"check4\" checked onchange=\"pressing4(this)\">4x, 4-, 4+</input><br>";
  total += "<input type=\"checkbox\" id=\"check2\" checked onchange=\"pressing2(this)\">2x, 2-</input><br>";
  total += "<input type=\"checkbox\" id=\"check1\" checked onchange=\"pressing1(this)\">1x</input><br>";
  total += "</td>";
  total += "</tr></table>";
  // total += "<span class=\"redClassARC\">Conflicts (if any) in red.</span>";
  total += "</td>";
  
  total += "</tr></table>";
  
  document.getElementById(where).innerHTML = total;
}

function CreateTable(where)
{
  var total = "<table width=\"100%\">";
  var hw = 10;
  var width = 90;
  hw = 10;
  width = (100 - 10) / AllTheData.fWeekdays.length;
  
  var i, j;
  
  total += "<tr><th width=\""+ hw + "%\">&nbsp;</th>";
  // THIS IS ALL DAYS ACROSS
  for (i = 0; i < AllTheData.fWeekdays.length; i+=1) {
    total += "<th width=\"" + width + "%\">" + AllTheData.fWeekdays[i] + "</th>";
  }
  total += "</tr><tr>";
  
  for (j = 0; j < AllTheData.fTimesDays.length; j+=1) {
    total += "<th>" + AllTheData.fTimesDays[j] + "</th>";
    for (i = 0; i < AllTheData.fWeekdays.length; i+=1) {
      var id = AllTheData.fWeekdays[i] + " " + AllTheData.fTimesDays[j];
      total += "<td><section class=\"totals\">(<span id=\"R" + id + "\">0</span> crew(s), <span id=\"C" + id + "\">0</span> rowers)</section><ul id=\"" + id + "99\"></ul><ul id=\"" + id + "8\"></ul><ul id=\"" + id + "4\"></ul><ul id=\"" + id + "2\"></ul><ul id=\"" + id + "1\"></ul></td>";
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
      var id = AllTheData.fWeekends[i] + " " + AllTheData.fTimesEnds[j];
      total += "<td><section class=\"totals\">(<span id=\"R" + id + "\">0</span> crew(s), <span id=\"C" + id + "\">0</span> rowers)</section><ul id=\"" + id + "99\"></ul><ul id=\"" + id + "8\"></ul><ul id=\"" + id + "4\"></ul></td>";
      total += "<td><section class=\"totals\"><ul id=\"" + id + "2\"></ul><ul id=\"" + id + "1\"></ul></td>";
      if (i == 0) {
        total += "<th>&nbsp;</th>";
      }
    }
    total += "<th>&nbsp;</th></tr><tr>";
  }
  total += "</tr>";
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
      "REC" : true,
      "LTR" : true,
      "J" : true,
      "SW" : true,
      "MW" : true,
      "SM" : true,
      "MM" : true,
      "8" : true,
      "4" : true,
      "2" : true,
      "1" : true
    };

function pressingREC(cb) { FilterVariable["REC"] = cb.checked; ScheduleFill(); };
function pressingLTR(cb) { FilterVariable["LTR"] = cb.checked; ScheduleFill(); };
function pressingUJ(cb) { FilterVariable["J"] = cb.checked; ScheduleFill(); };
function pressingSW(cb) { FilterVariable["SW"] = cb.checked; ScheduleFill(); };
function pressingMW(cb) { FilterVariable["MW"] = cb.checked; ScheduleFill(); };
function pressingSM(cb) { FilterVariable["SM"] = cb.checked; ScheduleFill(); };
function pressingMM(cb) { FilterVariable["MM"] = cb.checked; ScheduleFill(); };

function pressing8(cb) { FilterVariable["8"] = cb.checked; ScheduleFill(); };
function pressing4(cb) { FilterVariable["4"] = cb.checked; ScheduleFill(); };
function pressing2(cb) { FilterVariable["2"] = cb.checked; ScheduleFill(); };
function pressing1(cb) { FilterVariable["1"] = cb.checked; ScheduleFill(); };

function FilterShow(data)
{
  var fromType;
  if ("fType" in data) {
    fromType = ValFromType(data.fType);
  } else {
    fromType = ValFromType(data.fName);
  }
  
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
  
  if (!("fProgram" in data)) {
    return false;
  }
  
  if (data.fProgram.toUpperCase().search("REC") >= 0) {
    return boatType && FilterVariable["REC"];
  } else if (data.fProgram.toUpperCase().search("NOVICE") >= 0) {
    return boatType && FilterVariable["REC"];
  } else if (data.fProgram.toUpperCase().search("JUNIOR") >= 0) {
    return boatType && FilterVariable["J"];
  } else if ((data.fProgram.toUpperCase().search("LTR") >= 0) ||
             (data.fProgram.toUpperCase().search("LEARN") >= 0)) {
    return boatType && FilterVariable["LTR"];
  } else if ((data.fProgram.toUpperCase().search("MW") >= 0) ||
             (data.fProgram.toUpperCase().search("MASTERS W") >= 0)) {
    return boatType && FilterVariable["MW"];
  } else if ((data.fProgram.toUpperCase().search("SW") >= 0) ||
             (data.fProgram.toUpperCase().search("WOMEN") >= 0) ||
             (data.fProgram.toUpperCase().search("SENIOR W") >= 0)) {
    return boatType && FilterVariable["SW"];
  } else if ((data.fProgram.toUpperCase().search("MM") >= 0) ||
             (data.fProgram.toUpperCase().search("MASTERS M") >= 0)) {
    return boatType && FilterVariable["MM"];
  } else if ((data.fProgram.toUpperCase().search("SM") >= 0) ||
             (data.fProgram.toUpperCase().search("MEN") >= 0) ||
             (data.fProgram.toUpperCase().search("SENIOR M") >= 0)) {
    return boatType && FilterVariable["SM"];
  }
  return false;
}

function FilterShowAll(data) { return true; }

function ValFromType(whatType)
{
  var value = 100;
  for (var i=30; i>0; i-=1) {
    if (whatType.search(i) >= 0) {
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
function ScheduleSet(stats)
{
  LocationStats = stats;
};

function ScheduleFill()
{
  ResetTable();
  ScheduleFillFrom(AllTheData.fSchedule, LocationStats);
};

function ScheduleFillFrom(data, stats)
{
  var filtered = 0;
  
  for (var i=0; i<data.length; i+=1) {
    var program = data[i].fProgram;
    if (!FilterShow(data[i])) {
      filtered += 1;
      console.log("SKIP " + program + " at " + data[i].fDay + " " + data[i].fTime + " " + data[i].fName);
      continue;
    }
    var id = data[i].fDay + " " + data[i].fTime;
    var type;
    if ("fType" in data) {
      type = data[i].fType;
    } else {
      type = data[i].fName;
    }
    
    var count = ValFromType(type);
    var el = document.getElementById(id + count);
    if (!el) {
      el = document.getElementById(id+"99");
    }
    var name = data[i].fName.toUpperCase();
    
    if (!(name in CountingUsage)) {
      CountingUsage[name] = 0;
    }
    CountingUsage[name] += 1;
    
    var item = type + " " + name + " - " + data[i].fProgram;
    if (data[i].fWho) {
      item += " (" + data[i].fWho + ")";
    }
    
    var tag;
    if (el.innerHTML.search(name) < 0) {
      if (program.toUpperCase().search("ONCE") > 0) {
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
    document.getElementById(stats).innerHTML = "<p>Not showing " + filtered + " rows.</p>";
  } else {
    document.getElementById(stats).innerHTML = "";
  }
};

var jsonBoats = [];

function FillFleet(boats)
{
  var boatType = [8,4,2,1];
  var total = "<br><br><hr> <table>";
  total += "<tr><th>8+</th><th>4x/4-/4+</th><th>2x/2-</th><th>1x</th></tr>";
  
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
  
  total += "<tr><td><ul>";
  total += collect8;
  total += "</ul></td>";
  
  total += "<td><ul>";
  total += collect4;
  total += "</ul></td>";
  
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
