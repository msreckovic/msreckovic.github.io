// var LinkRCAForgotPassword = "https://membership.rowingcanada.org/Account/ForgotPassword";

// As the questions get checked, remove the ability to uncheck them.  That way
// as you get to the next question, you can't mess with the flags and
// stop seeing enough things.  Perhaps it's a button, not a checkbox.

// Once they go through all that, show them the choices.
// In order, left most is the one we want them to take.  For juniors and
// university where they have an option to take the early one instead
// put the early one to the side.
// We can have just full, full + early, just late for each of those.
// We can have a button next to each one, as today, and just have them
// click one.
// Do we ask them for their name at any point?  Yes, when doing the
// safety test.
// We can show all the prices beforehand, they just can't pick them until
// they pass all the tests and check off all the boxes.


// "gsx$category"
// "gsx$earlyseasonroninlink"
// "gsx$earlyseasonprice"
// "gsx$fullseasonroninlink"
// "gsx$fullseasonprice"
// "gsx$lateseasonroninlink"
// "gsx$lateseasonprice"
// "gsx$fullseasonpaymentplanroninlink"
// "gsx$description"

// This is the global that takes care of things
var CatAndQues = [[], [], []];
var Acknowledged = 0;
var Buttons = [];

var NUMBER_OF_COLUMNS = 4;

var CAT = 0;
var ESR = 1;
var ESP = 2;
var FSR = 3;
var FSP = 4;
var FPR = 5;
var FPP = 6;
var LSR = 7;
var LSP = 8;
var DESC = 9;
var LABELS = ["",
              "Join Now", "Single Payment: ",
              "Join Now", "Single Payment: ",
              "Payment Plan", "Payment Plan: ",
              "Join Now", "Late Season Only:"];

var AnsweredQuestions = {};

function CheckRonin(what)
{
  if (what.toUpperCase().search("NO") == 0) {
    return "";
  }
  return what;
}

function CategoriesAndQuestions(entries)
{
  var categories = [];
  var questions = [];
  var extras = [];
  var pickingCategories = true;
  var pickingExtras = false;
  for (var i=0; i<entries.length; i+=1) {
    var vcat = entries[i].gsx$category.$t;
    if (vcat == "Registration") {
      pickingCategories = false;
      pickingExtras = false;
      continue;
    } else if (vcat == "Extras") {
      pickingCategories = false;
      pickingExtras = true;
      continue;
    }
    var vdesc = entries[i].gsx$description.$t;
    var vesr = CheckRonin(entries[i].gsx$earlyseasonroninlink.$t);
    if (pickingCategories) {
      var vesp = entries[i].gsx$earlyseasonprice.$t;
      var vfsr = CheckRonin(entries[i].gsx$fullseasonroninlink.$t);
      var vfsp = entries[i].gsx$fullseasonprice.$t;
      var vfpr = CheckRonin(entries[i].gsx$fullseasonpaymentplanroninlink.$t);
      var vfpp = entries[i].gsx$fullseasonpaymentplanprice.$t;
      var vlsr = CheckRonin(entries[i].gsx$lateseasonroninlink.$t);
      var vlsp = entries[i].gsx$lateseasonprice.$t;
      categories.push([vcat, vesr, vesp, vfsr, vfsp, vfpr, vfpp, vlsr, vlsp, vdesc]);
    } else if (pickingExtras) {
      var vesp = entries[i].gsx$earlyseasonprice.$t;
      var vfsr = CheckRonin(entries[i].gsx$fullseasonroninlink.$t);
      var vfsp = entries[i].gsx$fullseasonprice.$t;
      var vfpr = CheckRonin(entries[i].gsx$fullseasonpaymentplanroninlink.$t);
      var vfpp = entries[i].gsx$fullseasonpaymentplanprice.$t;
      var vlsr = CheckRonin(entries[i].gsx$lateseasonroninlink.$t);
      var vlsp = entries[i].gsx$lateseasonprice.$t;
      extras.push([vcat, vesr, vesp, vfsr, vfsp, vfpr, vfpp, vlsr, vlsp, vdesc]);
    } else {
      questions.push([vcat, vesr, vdesc]);
    }
  }
  return [categories, questions, extras];
}

function SinglePrice(cc, index)
{
  var one = "";
  if (cc[index]) {
    one += "<p><em>" + LABELS[index];
    one += cc[index];
    one += "</em></p>\n";
  }
  return one;
}
function SingleRonin(cc, prefix, i, buttons, display, index, idprefix, label)
{
  var one = ""
  if (cc[index]) {
    id = idprefix + prefix + i;
    buttons.push(id);
    one += "<div style='display:" + display + "' id='" + id + "'>";
    one += "<a target='_blank' href='";
    one += cc[index];
    if (label) {
      one += "' class='btn small-btn'>" + label + "</a>";
    } else {
      one += "' class='btn small-btn'>" + LABELS[index] + "</a>";
    }
    one += "</div>";
  }
  return one;
}

function FormatCategories(categories, prefix, display, label)
{
  var i, one, id;
  var total = "";
  var buttons = [];
  
  total += "<div class='clearfix'>\n";
  
  var eachColumn = Math.ceil(categories.length / NUMBER_OF_COLUMNS);
  
  for (i=0; i<categories.length; i++) {
    var cc = categories[i];
    if (i % eachColumn == 0) {
      if (categories.length - i <= eachColumn) {
        total += "<div class='fourth last'>\n";
      } else {
        total += "<div class='fourth'>\n";
      }
      total += "<ul class='toggle'>\n";
    }
    
    one = "<li><a href='#cbid" + prefix + i + "' class='toggle-btn'><strong>";
    one += cc[CAT];
    one += "</strong></a>";
    one += "<div class='toggle-content'>\n";
    
    one += SinglePrice(cc, FSP);
    one += SinglePrice(cc, ESP);
    one += SinglePrice(cc, LSP);
    one += SinglePrice(cc, FPP);
    
    one += "<p>" + cc[DESC] + "</p>\n"
    one += "</div></li>\n";
    
    one += SingleRonin(cc, prefix, i, buttons, display, FSR, "rbf", label);
    one += SingleRonin(cc, prefix, i, buttons, display, ESR, "rbe", "");
    one += SingleRonin(cc, prefix, i, buttons, display, LSR, "rbl", "");
    one += SingleRonin(cc, prefix, i, buttons, display, FPR, "rbp", "");
    
    one += "<p>&nbsp;</p>\n";
    total += one;
    
    if (i % eachColumn == (eachColumn-1)) {
      total += "</ul>\n";
      total += "</div>\n";
    }
  }
  
  total += "</div>\n";
  return [total, buttons];
}

function FormatQuestions(questions, countAgreed)
{
  var total = "";
  var i;
  var countChecked = 0;
  for (i=0; i<questions.length; i++) {
    if (countChecked > countAgreed) continue;
    var what = questions[i][0];
    var check = questions[i][1];
    var desc = questions[i][2];
    
    if (what == "LEAD") {
      total += "<p class='lead'>" + desc + "</p>\n";
      continue;
    }
    
    if (check) {
      countChecked ++;
    }
    
    total += "<div class='price-table'>";
    total += "<div class='price-row'>\n";
    total += "<div class='price-cell feature'>\n";
    if (check) {
      if (countChecked <= countAgreed) {
        // total += "<img src='http://cliparts.co/cliparts/pT7/8X8/pT78X8jT9.jpg'>";
        total += "";
      } else {
        total += "<h3>Please read<span> <span>click on the right to proceed</span></span></h3>";
      }
    }
    total += "  </div><!-- price-cell feature -->\n";
    
    total += "  <div class='price-cell'>\n";
    total += "    <h3>" + what + "</h3>\n";
    total += "    <p style=\"text-align: left;\">" + desc + "</p>\n";
    total += "  </div><!-- price-cell -->\n";
    
    total += "  <div class='price-cell last'>\n";
    if (check && countChecked == countAgreed+1) {
      total += "   <p><a class='btn' href='";
      total += "javascript:IncrementAgreed();";
      total += "'>" + check + "</a></p>\n";
    } else {
      total += "&nbsp;";
    }
    total += "  </div><!-- price-cell last -->\n";
    total += " </div><!-- price-row -->\n";
    total += "</div><!-- price-table -->\n";
  }
  return [total, countChecked];
}

function IncrementAgreed()
{
  Acknowledged ++;
  FormatEverything(Acknowledged);
}

function FormatEverything(countAgreed)
{
  if (CatAndQues.length < 2) return;
  var qe = document.getElementById("questions");
  var fq = FormatQuestions(CatAndQues[1], countAgreed);
  if (qe) {
    qe.innerHTML = fq[0];
  }
  
  if (countAgreed == 0) {
    var extras = FormatCategories(CatAndQues[2], "ex", "block", "Purchase");
    var ex = document.getElementById("extras");
    if (ex) {
      ex.innerHTML = extras[0];
    }
    
    var categories = FormatCategories(CatAndQues[0], "", "none", "");
    Buttons = categories[1];
    var ce = document.getElementById("categories");
    if (ce) {
      ce.innerHTML = categories[0];
    }
  } else if (countAgreed >= fq[1]) {
    var i;
    for (i=0; i<Buttons.length; i++) {
      var el = document.getElementById(Buttons[i]);
      if (el) {
        el.style.display = "block";
      }
    }
  }
}

function PreRegistration(jsonIn)
{
  CatAndQues = CategoriesAndQuestions(jsonIn.feed.entry);
  FormatEverything(0);
}

function FillHeaderAndDescription(entries)
{
  var total = "";
  for (var i=0; i<entries.length; i+=1) {
    var vheader = entries[i].gsx$header.$t;
    var vdescription = entries[i].gsx$description.$t;
    total += "<h2>" + vheader + "</h2>";
    total += vdescription + "\n\n";
  }
  return total;
}

function PostRegistration(jsonIn)
{
  var el = document.getElementById("followup");
  if (el) {
    el.innerHTML = FillHeaderAndDescription(jsonIn.feed.entry);
  }
}
