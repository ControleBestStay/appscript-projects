function dailyRate(apartment, month) 
{
  let revenue = 0;
  let data = splitRes(apartment, month);

  for(let i in data) { revenue += data[i][3]; }

  return revenue/data.length;
}

function COMPANY_DAILY_RATE(month=DATE(2024, 1))
{
  let apartments = dataFilter(Util.MAIN_APT_DATABASE, [0, "", (a, b) => a !== b && a !== Util.MAIN_APT_DATABASE[0][0]],
                                     [7, "", (a, b) => a !== b && (dateInMonth(a, month) || a.getTime() < month.getTime())],
                                     [8, "", (a, b) => a === b]);

  let total = 0;
  apartments.forEach(x => total += dailyRate(x[0], month));

  return total/apartments.length;
}