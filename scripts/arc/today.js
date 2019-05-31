var AllTheData;
function DataSet(data)
{
  AllTheData = data;
}

function HasDay(day, data)
{
  for (var i = 0; i < data.length; i++) {
    if (data[i].fDay == day) return true;
  }
  return false;
}

function HasTime(atime, data)
{
  for (var i = 0; i < data.length; i++) {
    if (data[i].fTime == atime) return true;
  }
  return false;
}

function CreateTable(where, data)
{
  var total = "<table>";
  
  var i, j, jr;
  
  for (i = 0; i < AllTheData.fWeekdays.length; i+=1) {
    if (!HasDay(AllTheData.fWeekdays[i], data)) continue;

    total += "<tr><th>&nbsp;</th>";
    total += "<th>" + AllTheData.fWeekdays[i] + "</th></tr>";
      
    for (j = 0; j < AllTheData.fTimesDays.length; j+=1) {
      if (!HasTime(AllTheData.fTimesDays[j], data)) continue;

      total += "<tr><th>" + AllTheData.fTimesDays[j] + "</th>";
      var id = AllTheData.fWeekdays[i] + " " + AllTheData.fTimesDays[j];
      total += "<td><section class=\"totals\">(<span id=\"R" + id + "\">0</span> crew(s), <span id=\"C" + id + "\">0</span> rowers)</section><ul id=\"" + id + "99\"></ul><ul id=\"" + id + "8\"></ul><ul id=\"" + id + "4\"></ul><ul id=\"" + id + "2\"></ul><ul id=\"" + id + "1\"></ul></td></tr>";
    }
  }
  for (i = 0; i < AllTheData.fWeekends.length; i+=1) {
    if (!HasDay(AllTheData.fWeekends[i], data)) continue;

    total += "<tr><th>&nbsp;</th>";
    total += "<th>" + AllTheData.fWeekends[i] + "</th></tr>";
      
    for (j = 0; j < AllTheData.fTimesEnds.length; j+=1) {
//      if (!HasTime(AllTheData.fTimesEnds[i], data)) continue;

      total += "<tr><th>" + AllTheData.fTimesEnds[j] + "</th>";
      var id = AllTheData.fWeekends[i] + " " + AllTheData.fTimesEnds[j];
      total += "<td><section class=\"totals\">(<span id=\"R" + id + "\">0</span> crew(s), <span id=\"C" + id + "\">0</span> rowers)</section><ul id=\"" + id + "99\"></ul><ul id=\"" + id + "8\"></ul><ul id=\"" + id + "4\"></ul><ul id=\"" + id + "2\"></ul><ul id=\"" + id + "1\"></ul></td></tr>";
    }
  }

  total += "</table>";
  document.getElementById(where).innerHTML = total;
};

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
function AutoFill()
{
  ScheduleFill();
}

function ScheduleFill()
{
  ScheduleFillFrom(AllTheData.fSchedule, LocationStats);
};

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

function ScheduleFillFrom(data, stats)
{
  for (var i=0; i<data.length; i+=1) {
    
    var program = data[i].fProgram;
    var recurrence = data[i].fRecurrence;

    var id = data[i].fDay + " " + data[i].fTime;
    var type = data[i].fType;
    var count = ValFromType(type);
    var el = document.getElementById(id + count);
    if (!el) {
      console.log("Failed to find " + id + count);
      // TODO: Nasty hack for LTR
      if (data[i].fTime == "9:30-11:30am") {
        id = data[i].fDay + " 10-12pm";
      }
    }
    var name = data[i].fName.toUpperCase();
    var who = data[i].fWho;
    var item = type + " " + name + recurrence + " - " + program;
    if (who && who.length > 1 && who[0] && who[1]) {
      item += " <span>(" + who[0].split(" ")[0] + ")</span>";
    }
    
    var tag;
    if (ElementClearOf(el.innerHTML, name, recurrence)) {
      tag = "<li>";
    } else {
      tag = "<li class=\"redClassARC\">";
    }
    el.innerHTML += tag + item + "</li>";
    
    el = document.getElementById("C"+id);
    el.innerHTML = parseInt(el.innerHTML) + count;
    
    el = document.getElementById("R"+id);
    el.innerHTML = parseInt(el.innerHTML) + 1;
  }
}
