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
  var email = "";
  if ("gsx$e-mail" in entry) {
    email = ParseEmail(entry["gsx$e-mail"].$t);
  }
  var total = {
    "fDay" : entry.gsx$day.$t,
    "fTime" : entry.gsx$time.$t,
    "fProgram" : entry.gsx$crew.$t,
    "fWho" : email,
    "fType" : entry.gsx$type.$t,
    "fName" : entry.gsx$boat.$t,
    "fRecurrence" : entry.gsx$recurrence.$t,
  };
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
  
  var summary/* = 
                {"fDate" : jsonIn.feed.updated.$t,
                "fWeekdays" : ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                "fWeekends" : ["Saturday", "Sunday"],
                "fTimesDays" : ["5:30-7:30am", "7:30-9:30am", "9:30-11:30am", "11:30am-4:30pm", "4:30-6:30pm", "6:30-8:30pm"],
                "fTimesEnds" : ["6-8am", "8-10am", "10-12pm", "2-4pm", "4-6pm"],
                }*/;
  
  var schedule = [];
  if ("entry" in jsonIn.feed) {
    var entries = jsonIn.feed.entry;
    console.log("THERE ARE " + entries.length + " ENTRIES");
    if (entries.length >= 2) {
      summary = DefaultSummary(jsonIn.feed.updated.$t,
                               entries[0][map[5]].$t,
                               entries[1][map[5]].$t);
    }
    for (var i=0; i<entries.length; i+=1) {
      schedule.push(Allocate(entries[i]));
    }
    
    summary.fSchedule = schedule;
    jsonSchedule = summary;
  }
}
