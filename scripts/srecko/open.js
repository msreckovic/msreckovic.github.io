var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Call like this:
// ItemsVisibility("some-id", "some-other-id",
//                 [[13*60 + 0, 21*60 + 30],  // Sunday
//                  [-1, -1],                 // Monday
//                  [16*60 + 0, 21*60 + 0],   // Tuesday
//                  [16*60 + 0, 21*60 + 0],   // Wednesday
//                  [16*60 + 0, 21*60 + 0],   // Thursday
//                  [13*60 + 0, 21*60 + 30],  // Friday
//                  [13*60 + 0, 21*60 + 30]]) // Saturday

function ItemsVisibility(vis_id, msg_id, opening_hours)
{
  var n = new Date();
  var status = ItemsStatus(n.getDay(), n.getHours(), n.getMinutes(), opening_hours);
  var vis = status[0];
  var msg = status[1];

  var e = document.getElementById(vis_id);
  if (e) {
    if (vis) {
      e.style.display = "block";
    } else {
      e.style.display = "none";
    }
  }

  e = document.getElementById(msg_id);
  if (e) {
    e.innerHTML = msg;
  }
}
  
function ItemsStatus(day, hour, minute, opening_hours)
{
  var msg = 'Open';
  var vis = true;
  var t = hour*60 + minute;

  var tomorrow = NextDay(day);

  // Open
  if (opening_hours[day][0] >= 0 && opening_hours[day][1] >= 0 &&
      t >= opening_hours[day][0] && t <= opening_hours[day][1]) {
    vis = true;
    msg = 'Open'
    return [vis, msg];
  }

  // Closed.  Opening later in the day
  if (opening_hours[day][0] >= 0 && t < opening_hours[day][0]) {
    vis = false;
    msg = 'Open later today';
    return [vis, msg];
  }

  if (opening_hours[tomorrow][0] >= 0) {
    vis = false;
    msg = 'Open tomorrow';
    return [vis, msg];
  }

  tomorrow = NextDay(tomorrow);
  if (opening_hours[tomorrow][0] >= 0) {
    vis = false;
    msg = 'Open ' + DAYS[tomorrow];
    return [vis, msg];
  }

  tomorrow = NextDay(tomorrow);
  if (opening_hours[tomorrow][0] >= 0) {
    vis = false;
    msg = 'Open ' + DAYS[tomorrow];
    return [vis, msg];
  }

  return [vis, msg];
}

function NextDay(today)
{
  var tomorrow = today + 1;
  while (tomorrow >= 7) {
    tomorrow -= 7;
  }
  return tomorrow;
}
