// Needs to be called with <script id="rca" data-year="2020" data-type="adult" src="..."></script> to work
// Default year is 2020
// type is: adult, train, para, junior, coxie
// Needs the store items like adult-membership, junior-membership, coxie-membership, etc.
// For example:
// <span id="arcextra"></span><script id="rca" data-id="arcextra" data-year="2020" data-type="adult" src="https://msreckovic.github.io/scripts/arc/rca.js"></script>


function FixLink(url) {
  var all = document.getElementsByTagName("a");
  for (var i=0; i<all.length; i++) {
    var el = all[i];
    if (el.innerHTML.includes("Pay Online Now") || el.innerHTML.includes("Payez maintenant")) {
      if (el.hasAttributes()) {
        var attrs = el.attributes;
        for (var j=0; j<attrs.length; j++) {
          if (attrs[j].name.includes("href")) {
            attrs[j].value = url;
          }
        }
      }
    }
  }
}

function ShortText(membership_type, year)
{
  var text;
  if (membership_type == "adult") {
    text = `
<b>Club</b> - Club (recreational) crews typically row 2 or 3 times per week in sculling or sweep boats. Club rowing program is led by volunteer coordinators, who help athletes find rowing opportunities to increase fitness level and rowing proficiency. The crews participate in Summer and Fall regattas.<br>
<b>Masters</b> - This program is for rowers over 21 years of age.  Typically, these crews are interested in competitive regattas and train more than 3 times a week. The objective is to get compatible crews in terms of technical competency, physical ability and age.<br>
`;
  } else if (membership_type == "university") {
    text = `
<b>University/U23</b> - This program is for athletes who are at least 19 years old and interested mostly in competitive rowing opportunities. The program includes a wide range of athletes, from those in their first year of competitive rowing to those pushing for provincial and national team opportunities. The program involves an intensive training schedule.
`;
  } else if (membership_type == "junior") {
    text = `
<b>Junior Program (Boys and Girls)</b> - The Junior Competitive program is open to all junior rowers with rowing experience. Non-experienced athletes are directed to enter the sport through either our Learn-To-Row program and Camp Argo or the Junior Development program. This is a program where Junior athletes learn how to compete. The training is dedicated to the sports of rowing and continuous squad and boat selection occurs. Athletes develop their sports psychology and mental hardness in order to arrive at their best for competition.<br>
<b>High School Program</b> - The Argonaut Rowing Club provides expertise coaching and equipment to allow many of the local high schools students to learn to row and to compete. Each year the students compete at Canadian Secondary School Rowing Association Championships. This regatta allows athletes to compete against schools from all across Canada. The High School Rowing Program is a great way to get involved in the sport, build your endurance and meet many new friends.
`;
  } else if (membership_type == "para") {
    text = `
This program is suited to those Para Athletes who wish to learn/improve/develop their stroke. You will have access to suitable rowing equipment and be supervised by coaches and volunteers.
`;
  } else if (membership_type == "train") {
    text = `
This is the first full year Club program, for those who have completed our learn to row program.
`;
  }
  return text;
}

function HeaderText(membership_type, year, is_bold)
{
  var text = "";
  if (is_bold) {
    text = "<h2>ARC ";
  }
  text += year + " ";
  if (membership_type == "adult") {
    text += "Club and Masters Programs Membership";
  } else if (membership_type == "university") {
    text += "University/U23 Program Membership";
  } else if (membership_type == "junior") {
    text += "Junior (High School) Program Membership";
  } else if (membership_type == "para") {
    text += "Para Program Membership";
  } else if (membership_type == "train") {
    text += "Learn to Train Membership Program Membership";
  }
  if (is_bold) {
   text += "</h2>";
  }
  return text;
}

function AgreeText(membership_type, nextyear)
{
  var text = `
  <h3>Membership Application and Membership Agreement</h3><br>
  <h4>To the President and Directors of the Argonaut Rowing Club:</h4><br>
  <ul>
    <li>I hereby confirm that I have read and understood and that I
agree to abide by this Membership Agreement, the Club Code of Conduct,
all Rules, the By-laws and Policies of the Argonaut Rowing Club
including, but not limited to, the ARC Harassment Policy, the Safety
Policy of the ARC, the Regulations of the Canadian Coast Guard and the
Regulations of Transport Canada. To review all club rules, by-laws and
policies, please click here.</li>

    <li>I understand and accept that it is my responsibility (as per
Coast Guard regulations) to have the following required safety
equipment either in my shell or in a coach boat accompanying my shell,
failing which I will pay any fines issued for failure to adhere to the
safety rules and guidelines: one life jacket for each rower or cox;
one tow rope; one bailer; a whistle or sounding horn; and one
navigation light (flashlight). I agree that a violation of the safety
rules and guidelines may result in the suspension or termination of my
membership and privileges with the Argonaut Rowing Club.</li> 

    <li>I understand and accept that it is my responsibility to ensure
all my fees have been paid in full and all information has been
received by the ARC prior to deadlines for membership and regatta
registrations. I understand that membership may be denied until prior
year debts have been settled.</li> 

    <li>I understand and consent that certain of my personal
information will be made available to Rowing Canada Aviron (RCA) and
ROWONTARIO.</li> 

    <li>I agree to participate fully on a committee as explained above.</li>

    <li>I acknowledge that my membership fees and all other fees paid
to the ARC are non-refundable.</li> 

    <li>I agree and acknowledge that I undertake any activity,
including rowing, weight and fitness training entirely at my own risk,
and that I am medically fit to undertake such activity.</li> 

    <li>I agree and acknowledge that rowing is a competitive sport and
that if I choose to compete for a space in one of the competitive
crews, I will do so with the understanding and full acceptance that
the Argonaut Rowing Club does not guarantee that I will succeed in
being selected for a competitive program or by the coach of my
preferred crew.</li> 

    <li>I agree that the ARC is not responsible for any personal
injury sustained by myself or any other person, or for the loss or
damage to any property which I have brought to the premises including
but not limited to privately owned boats, racks or oars, personal
items or other equipment, whether caused by theft, during
transportation or by any other cause, including negligence of the ARC
or any of its members, coaches, servants, agents or contractors.</li> 

    </ul>

    By clicking Accept below, I hereby apply for membership in Argonaut Rowing Club under terms that expire on March 31, `
      + nextyear +
   `. In doing so, I agree to the above terms and conditions.<br><br>

    <h3>Argonaut Rowing Club Photo Release</h3>

    I grant to the Argonaut Rowing Club (ARC), its representatives and
employees the right to take photographs of me and my property in
connection with ARC, Regattas and the Western Beaches. I authorize the
Argonaut Rowing Club, its assigns and transferees to copyright, use
and publish the same in print and/or electronically.<br> 
    I agree that the Argonaut Rowing Club may use such photographs of
me with or without my name and for any lawful purpose, including for
example such purposes as publicity, illustration, advertising, and Web
content.<br><br><br>

    <h2>Please click the Accept button at bottom left, and follow the payment instructions.</h2> 
  `
  return text;
}

function Everything() {
  var year = "2020";
  var nextyear = "2021";
  var membership_type = "adult";
  var id_tag = "arcextra";
  var script_tag = document.getElementById('rca')
  if (script_tag) {
    var argyear = script_tag.getAttribute("data-year");
    if (argyear) {
      year = argyear;
      nextyear = parseInt(year) + 1;
    }
    var argtype = script_tag.getAttribute("data-type");
    if (argtype) {
      membership_type = argtype;
    }
    var argid = script_tag.getAttribute("data-id");
    if (argid) {
      id_tag = argid;
    }
  }

  if (window.location.href.includes("Agree")) {
    document.getElementById(id_tag).innerHTML = HeaderText(membership_type, year, true) + "<br><br>" + ShortText(membership_type, year);
  } else if (window.location.href.includes("Complete")) {
    var text = "Click here to open the Argo store and complete the payment";
    var url = "https://argonaut-rowing-club.myshopify.com/products/" + membership_type + "-membership";
    var el = document.getElementById("HeadLoginName");
    if (el) {
      //url = "https://argonaut-rowing-club.myshopify.com/cart/16140123537510:1?note=" +
      //  el.innerHTML + "-for-Membership-" + year + "-" + membership_type + "-membership";
    }

    document.getElementById(id_tag).innerHTML =
      "<a href=\"" + url + "\"><h2>" + text + "</h2></a>";

    FixLink(url);
  } else {
    document.getElementById(id_tag).innerHTML = HeaderText(membership_type, year, false);
  }
}

document.addEventListener('DOMContentLoaded', Everything, false);
