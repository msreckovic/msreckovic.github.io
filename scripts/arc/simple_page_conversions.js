function V4_OriginalDataURL(sheet_string)
{
  var url = "https://sheets.googleapis.com/v4/spreadsheets/" +
    sheet_string +
    "?includeGridData=true&key=AIzaSyBMyls_WuzEgk2MVmL0N_ksjOfJ_TjEtvk";
  //console.log("URL " + url);
  return url;
}

function V4_GV(where, what) {
  var t = "";
  if (where && what in where) {
    t = where[what];
  }
  return t;
}

function V4_GetBestValue(v)
{
  if (!v) return "";
  v = v["effectiveValue"];
  if (!v) return "";
  if (v["stringValue"] && v["stringValue"] != "") return v["stringValue"];
  //console.log("No string value " + JSON.stringify(v));
  if (v["numberValue"] && v["numberValue"] != "") return v["numberValue"];
  return "";
}

function V4_MapV4ToV3(first_row)
{
  var result = [];
  var i;
  for (i = 0; i < first_row.length; i++) {
    //console.log("FIRST " + i + " IS " + JSON.stringify(first_row[i]));
    //console.log("FROM " + JSON.stringify(first_row[i]));
    var v = V4_GetBestValue(first_row[i]);
    // console.log("FIRST ROW AT " + i + " IS " + JSON.stringify(first_row[i]));
    if (v == "") break;
    //console.log("VALUE IS " + v);
    result.push("" + (""+v).replace(/[^A-Z0-9]/ig, "").toLowerCase());
  }
  return result;
}

function V4_ConvertV4ToV3(sheet_data)
{
  var map = V4_MapV4ToV3(sheet_data[0]["values"]);
  console.log("MAP " + map);

  var result = [];
  var i, j;

  for (i = 1; i < sheet_data.length; i++) {
    var single = {};
    //console/log("Processing " + i);
    //console.log(JSON.stringify(sheet_data[i]["values"]));
    for (j = 0; j < map.length; j++) {
      //console.log("   sub " + j);
      //console.log("   " + JSON.stringify(sheet_data[i]["values"][j]));
      var v = V4_GetBestValue(sheet_data[i]["values"][j]);
      //console.log("   Picked up " + v);
      if (v == "" && j == 0) break;
	single[map[j]] = v;
    }

    if (single[map[0]] && single[map[0]] != "") {
      //console.log(JSON.stringify(single));
      result.push(single);
    } else {
      break;
    }
  }

  return {"feed" : { "updated" : "tbd", "entry" : result }};
}

function V4_FinalCallbackName(f, whole_thing_str, sheet_name)
{
  if (whole_thing_str == "") {
     return;
  }
  var whole_thing = JSON.parse(whole_thing_str);
  for (var i = 0; i < whole_thing["sheets"].length; i++) {
    if (whole_thing["sheets"][i]["properties"]["title"] == sheet_name) {
      var converted = V4_ConvertV4ToV3(whole_thing["sheets"][i]["data"][0]["rowData"]);
      f(converted);
      return;
    }
  }
}

function V4_FinalCallback(f, whole_thing_str, sheet_index)
{
  if (whole_thing_str == "") {
    return;
  }
  // console.log("___________________________________");
  // console.log(whole_thing_str);
  var whole_thing = JSON.parse(whole_thing_str);
  // console.log("WHOLE THING");
  // console.log(whole_thing["sheets"][sheet_index]["data"][0]["rowData"]);
  var converted = V4_ConvertV4ToV3(whole_thing["sheets"][sheet_index]["data"][0]["rowData"]);
  f(converted);
}

function V4_FinalCallbackList(f_list, whole_thing_str, sheet_index_list)
{
  var whole_thing = JSON.parse(whole_thing_str);
  // console.log("WHOLE THING");
  // console.log(whole_thing["sheets"][sheet_index]["data"][0]["rowData"]);
  var i;
  for (i = 0; i < f_list.length; i++) {
    var converted = V4_ConvertV4ToV3(whole_thing["sheets"][sheet_index_list[i]]["data"][0]["rowData"]);
    f_list[i](converted);
  }
}

function V4_GetOriginalDataName(f, sheet_string, sheet_name)
{
  if (sheet_name == "") return;

  var url = V4_OriginalDataURL(sheet_string);

  const Http = new XMLHttpRequest();
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = (e) => {
    V4_FinalCallbackName(f, Http.responseText, sheet_name);
  }
}

function V4_GetOriginalData(f, sheet_string, sheet_index)
{
  var url = V4_OriginalDataURL(sheet_string);

  const Http = new XMLHttpRequest();
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = (e) => {
    V4_FinalCallback(f, Http.responseText, sheet_index);
  }
}

function V4_GetOriginalDataList(f_list, sheet_string, sheet_index_list)
{
  var url = V4_OriginalDataURL(sheet_string);

  const Http = new XMLHttpRequest();
  Http.open("GET", url);
  Http.send();

  Http.onreadystatechange = (e) => {
    V4_FinalCallbackList(f_list, Http.responseText, sheet_index_list);
  }
}
