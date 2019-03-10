var DaysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function GetValue(where, what)
{
  var instead = "*";
  if (what in where) {
    return where[what].$t;
  }
  return instead;
}

function DayIndex(day)
{
  for (var i=0; i<7; i+=1) {
    if (day == DaysOfWeek[i]) {
      return i;
    }
  }
  if (day == "SKIP" || day == "") {
    return -2;
  }
  return -1;
}

function GetWeeks(entries)
{
  var weeks = [];
  var weekCount = 0;
  
  for (var i=0; i<entries.length; i++) {
    var date = GetValue(entries[i], "gsx$date");
    var day = GetValue(entries[i], "gsx$day");
    var dubl = GetValue(entries[i], "gsx$double");
    var four = GetValue(entries[i], "gsx$coxedfour");
    var pickup = GetValue(entries[i], "gsx$pickup");
    var dropoff = GetValue(entries[i], "gsx$dropoff");
    var workout = GetValue(entries[i], "gsx$workout");
    var time = GetValue(entries[i], "gsx$time");
    
    var di = DayIndex(day);
    if (di == -2) continue;
    if (di < 0) break;
    if (di == 0) {
      weekCount++;
      if (weeks.length < weekCount) {
        weeks.push( [[], [], [], [], [], [], [], date] );
      }
    }
    
    if (weekCount > 0) {
      weeks[weekCount-1][di] = [time, workout, dubl, four, pickup, dropoff];
    }
  }
  return weeks;
}
