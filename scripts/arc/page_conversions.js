function ConsoleLog(str)
{
  if (false) console.log(str);
}

function V4V3_OriginalDataURL(sheet_string)
{
  var url = "https://sheets.googleapis.com/v4/spreadsheets/" +
    sheet_string +
    "?includeGridData=true&key=AIzaSyBMyls_WuzEgk2MVmL0N_ksjOfJ_TjEtvk";
  ConsoleLog("URL " + url);
  return url;
}

function GetBestValue(v)
{
  if (!v) return "";
  v = v["effectiveValue"];
  if (!v) return "";
  if (v["stringValue"] && v["stringValue"] != "") return v["stringValue"];
  ConsoleLog("No string value " + JSON.stringify(v));
  if (v["numberValue"] && v["numberValue"] != "") return v["numberValue"];
  return "";
}

function V4V3_MapV4ToV3(first_row)
{
  var result = [];
  var i;
  for (i = 0; i < first_row.length; i++) {
    ConsoleLog("FIRST " + i + " IS " + JSON.stringify(first_row[i]));
    ConsoleLog("FROM " + JSON.stringify(first_row[i]));
    var v = GetBestValue(first_row[i]);
    // ConsoleLog("FIRST ROW AT " + i + " IS " + JSON.stringify(first_row[i]));
    if (v == "") break;
    ConsoleLog("VALUE IS " + v);
    result.push("gsx$" + (""+v).replace(/[^A-Z0-9]/ig, "").toLowerCase());
  }
  return result;
}

function V4V3_ConvertV4ToV3(sheet_data)
{
  var map = V4V3_MapV4ToV3(sheet_data[0]["values"]);
  console.log("MAP " + map);

  var result = [];
  var i, j;

  for (i = 1; i < sheet_data.length; i++) {
    var single = {};
    ConsoleLog("Processing " + i);
    ConsoleLog(JSON.stringify(sheet_data[i]["values"]));
    for (j = 0; j < map.length; j++) {
      ConsoleLog("   sub " + j);
      ConsoleLog("   " + JSON.stringify(sheet_data[i]["values"][j]));
      var v = GetBestValue(sheet_data[i]["values"][j]);
      ConsoleLog("   Picked up " + v);
      if (v == "" && j == 0) break;
      single[map[j]] = {"$t" : v};
    }

    if (single[map[0]] && single[map[0]]["$t"] && single[map[0]]["$t"] != "") {
      ConsoleLog(JSON.stringify(single));
      result.push(single);
    } else {
      break;
    }
  }

  return {"feed" : { "updated" : "tbd", "entry" : result }};
}

function V4V3_FinalCallbackName(f, whole_thing_str, sheet_name)
{
  if (whole_thing_str == "") {
     return;
  }
  var whole_thing = JSON.parse(whole_thing_str);
  for (var i = 0; i < whole_thing["sheets"].length; i++) {
    if (whole_thing["sheets"][i]["properties"]["title"] == sheet_name) {
      var converted = V4V3_ConvertV4ToV3(whole_thing["sheets"][i]["data"][0]["rowData"]);
      f(converted);
      return;
    }
  }
}

function V4V3_FinalCallback(f, whole_thing_str, sheet_index)
{
  // if (whole_thing_str == "") {
  //   return;
  // }
  // console.log("___________________________________");
  // console.log(whole_thing_str);
  var whole_thing = JSON.parse(whole_thing_str);
  // ConsoleLog("WHOLE THING");
  // ConsoleLog(whole_thing["sheets"][sheet_index]["data"][0]["rowData"]);
  var converted = V4V3_ConvertV4ToV3(whole_thing["sheets"][sheet_index]["data"][0]["rowData"]);
  f(converted);
}

function V4V3_FinalCallbackList(f_list, whole_thing_str, sheet_index_list)
{
  var whole_thing = JSON.parse(whole_thing_str);
  // ConsoleLog("WHOLE THING");
  // ConsoleLog(whole_thing["sheets"][sheet_index]["data"][0]["rowData"]);
  var i;
  for (i = 0; i < f_list.length; i++) {
    var converted = V4V3_ConvertV4ToV3(whole_thing["sheets"][sheet_index_list[i]]["data"][0]["rowData"]);
    f_list[i](converted);
  }
}

function V4V3_GetOriginalDataName(f, sheet_string, sheet_name)
{
  if (sheet_name == "") return;

  var url = V4V3_OriginalDataURL(sheet_string);

  const Http = new XMLHttpRequest();
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = (e) => {
    V4V3_FinalCallbackName(f, Http.responseText, sheet_name);
  }
}

function V4V3_GetOriginalData(f, sheet_string, sheet_index)
{
  var url = V4V3_OriginalDataURL(sheet_string);

  const Http = new XMLHttpRequest();
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = (e) => {
    V4V3_FinalCallback(f, Http.responseText, sheet_index);
  }
}

function V4V3_GetOriginalDataList(f_list, sheet_string, sheet_index_list)
{
  var url = V4V3_OriginalDataURL(sheet_string);

  const Http = new XMLHttpRequest();
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = (e) => {
    V4V3_FinalCallbackList(f_list, Http.responseText, sheet_index_list);
  }
}
