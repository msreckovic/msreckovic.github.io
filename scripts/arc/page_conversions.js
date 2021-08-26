function V4V3_OriginalDataURL(sheet_string)
{
  return "https://sheets.googleapis.com/v4/spreadsheets/" +
    sheet_string +
    "?includeGridData=true&key=AIzaSyBMyls_WuzEgk2MVmL0N_ksjOfJ_TjEtvk";
}

function V4V3_MapV4ToV3(first_row)
{
  var result = [];
  var i;
  for (i = 0; i < first_row.length; i++) {
    var v = first_row[i]["effectiveValue"]["stringValue"];
    result.push("gsx$" + v.replace(/[^A-Z0-9]/ig, "").toLowerCase());
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
    for (j = 0; j < map.length; j++) {
      var v = sheet_data[i]["values"][j]["effectiveValue"];
      if (v) {
        single[map[j]] = {"$t" : v["stringValue"]}
      } else {
        single[map[j]] = {"$t" : ""}
      }
    }

    if (single[map[0]]["$t"] && single[map[0]]["$t"] != "") {
      result.push(single);
    } else {
      break;
    }
  }

  return {"feed" : { "entry" : result }};
}

function V4V3_FinalCallback(f, whole_thing_str, sheet_index)
{
  var whole_thing = JSON.parse(whole_thing_str);
  var converted = V4V3_ConvertV4ToV3(whole_thing["sheets"][sheet_index]["data"][0]["rowData"]);
  f(converted);
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
