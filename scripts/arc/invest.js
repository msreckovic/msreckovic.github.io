function ShowCurrency(amount)
{
  return "$" + amount.toLocaleString('en-US');
}

function PayoutsSeriesA(investment)
{
  var interest = 0.06;
  var principal = investment;
  var interest = [0.042857, 0.029918, 0.030247, 0.029835, 0.0030330, 0.029835, 0.030330,
                  0.017308, 0.009396, 0.025755, 0.013068, 0.006247, 0.018164, 0.008654,
                  0.003132, 0.010673, 0.004327];

  var result =
    [{"date": "15-Apr-2019", "action": "Bond Series A Purchase", "amount": principal},
     {"date": "31-Dec-2019", "action": "Interest Payout", "amount": principal * interest[0]},
     {"date": "30-Jun-2020", "action": "Interest Payout", "amount": principal * interest[1]},
     {"date": "31-Dec-2020", "action": "Interest Payout", "amount": principal * interest[2]},
     {"date": "30-Jun-2021", "action": "Interest Payout", "amount": principal * interest[3]},
     {"date": "31-Dec-2021", "action": "Interest Payout", "amount": principal * interest[4]},
     {"date": "30-Jun-2022", "action": "Interest Payout", "amount": principal * interest[5]},
     {"date": "31-Dec-2022", "action": "Interest Payout", "amount": principal * interest[6]},
     {"date": "15-Apr-2023", "action": "Interest + Principal Payout", "amount": principal * 0.25 + principal * interest[7]}, 
     {"date": "30-Jun-2023", "action": "Interest Payout", "amount": principal * interest[8]},
     {"date": "31-Dec-2023", "action": "Interest Payout", "amount": principal * interest[9]},
     {"date": "15-Apr-2024", "action": "Interest + Principal Payout", "amount": principal * 0.25 + principal * interest[10]}, 
     {"date": "30-Jun-2024", "action": "Interest Payout", "amount": principal * interest[11]},
     {"date": "31-Dec-2024", "action": "Interest Payout", "amount": principal * interest[12]},
     {"date": "15-Apr-2025", "action": "Interest + Principal Payout", "amount": principal * 0.25 + principal * interest[13]},
     {"date": "30-Jun-2025", "action": "Interest Payout", "amount": principal * interest[14]},
     {"date": "31-Dec-2025", "action": "Interest Payout", "amount": principal * interest[15]},
     {"date": "15-Apr-2026", "action": "Final Interest + Principal Payout", "amount": principal * 0.25 + principal * interest[16]}];
  return result;
}

function ShowSeriesA(cb)
{
  var investment = cb.value * 10000;
  console.log("Chart for the investment $" + investment)

  var payouts = PayoutsSeriesA(investment);

  var total = "";
  total += "Note that the amounts and dates are for illustration purposes only.";
  total += "<h4>Initial Bond Series A Investment of " + ShowCurrency(investment) + " made on April 15, 2019</h4>";
  total += "<table>";
  total += "  <tr>";
  total += "    <th>Date</th>"; 
  total += "    <th>Action</th>"; 
  total += "    <th>Amount</th>"; 
  total += "  </tr>";

  for (var i=0; i<payouts.length; i++) {
    total += "  <tr>";
    total += "    <td>" + payouts[i].date + "</td>"; 
    total += "    <td>" + payouts[i].action + "</td>";
    total += "    <td>" + ShowCurrency(payouts[i].amount) + "</td>"; 
    total += "  </tr>";
  }

  total += "</table>";
  console.log(total);
  document.getElementById("detailsA").innerHTML = total;
}
