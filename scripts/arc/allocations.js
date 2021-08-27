var jsonSchedule =
    {"fDate" : "September 30, 2015, 06:39PM",
     "fWeekdays" : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
     "fWeekends" : ["Saturday", "Sunday"],
     "fTimesDays" : ["5:30am-6:45am", "6:45am-8am", "8am-9:15am", "9:15am-10:30am", "10:30am-11:45am", "11:45am-1pm", "1pm-2:15pm", "2:15pm-3:30pm", "3:30pm-4:45pm", "4:45pm-6pm", "6pm-7:15pm", "7:15pm-8:30pm"],
     "fTimesEnds" : ["5:30am-6:45am", "6:45am-8am", "8am-9:15am", "9:15am-10:30am", "10:30am-11:45am", "11:45am-1pm", "1pm-2:15pm", "2:15pm-3:30pm", "3:30pm-4:45pm", "4:45pm-6pm", "6pm-7:15pm", "7:15pm-8:30pm"],
     
     "fSchedule" : [
       {
         "fDay" : "Monday",
         "fTime" : "5:30am-6:45am",
         "fProgram" : "Program",
         "fWho" : "John Smith <jsmith@email.com>",
         "fType" : "type",
         "fName" : "name",
         "fRecurrence" : "",
       },
     ]};

function SafeT(where)
{
  if (where) return where.$t;
  return "";
}

function ParseEmail(entry)
{
  var email = "";
  var name = "";
  
  if (entry) {
    var hasangle = entry.search("<");
    var hasat =  entry.search("@");
    if (hasangle >= 0 && hasat >= 0 && hasat > hasangle) {
      name = entry.substring(0, hasangle-1);
      email = entry.substring(hasangle+1,entry.length-1);
    } else if (hasat) {
      email = entry;
    } else {
      name = entry;
    }
  }
  
  return [name,email];
}

function Allocate(entry)
{
  // console.log("Allocating " + JSON.stringify(entry));
  var email = "";
  if ("gsx$e-mail" in entry) {
    email = ParseEmail(SafeT(entry["gsx$e-mail"]));
  }
  if ("gsx$email" in entry) {
    email = ParseEmail(SafeT(entry["gsx$email"]));
  }
  var total = {
    "fDay" : SafeT(entry.gsx$day),
    "fTime" : SafeT(entry.gsx$time),
    "fProgram" : SafeT(entry.gsx$crew),
    "fWho" : email,
    "fType" : SafeT(entry.gsx$type),
    "fName" : SafeT(entry.gsx$boat),
    "fRecurrence" : SafeT(entry.gsx$recurrence),
  };

  //console.log("TOTAL " + JSON.stringify(total));
  return total;
}

function DefaultSummary(stamp,wdays,wends)
{
  console.log("Weekdays " + wdays);
  console.log("Weekends " + wends);
  var summary = 
      {"fDate" : stamp,
       "fWeekdays" : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
       "fWeekends" : ["Saturday", "Sunday"],
       "fTimesDays" : wdays.split(","),
       "fTimesEnds" : wends.split(","),
      };
  return summary;
}

function ProcessJson(jsonIn)
{
  var map = ["gsx$day", "gsx$time", "gsx$type", "gsx$boat", "gsx$crew", "gsx$_ckd7g"];
  
  var summary;
  var schedule = [];
  if ("entry" in jsonIn.feed) {
    var entries = jsonIn.feed.entry;
    console.log("THERE ARE " + entries.length + " ENTRIES");
    if (false && entries.length >= 2) {
      summary = DefaultSummary(SafeT(jsonIn.feed.updated),
                               SafeT(entries[0][map[5]]),
                               SafeT(entries[1][map[5]]));
    } else {
      summary = DefaultSummary(SafeT(jsonIn.feed.updated),
                               "5:30am-6:45am,6:45am-8am,8am-9:15am,9:15am-10:30am,10:30am-11:45am,11:45am-1pm,1pm-2:15pm,2:15pm-3:30pm,3:30pm-4:45pm,4:45pm-6:30pm,6:30pm-7:45pm",
                               "5:30am-6:45am,6:45am-8am,8am-9:15am,9:15am-10:30am,10:30am-11:45am,11:45am-1pm,1pm-2:15pm,2:15pm-3:30pm,3:30pm-4:45pm,4:45pm-6:30pm,6:30pm-7:45pm");
    }
    for (var i=0; i<entries.length; i+=1) {
      schedule.push(Allocate(entries[i]));
    }
    
    summary.fSchedule = schedule;
    jsonSchedule = summary;
  }
}
