function dailyRate(apartment, month) 
{
  let revenue = 0;
  let data = splitRes(apartment, month);

  if(data.length == 0) return 0;

  for(let i in data) { revenue += data[i][3]; }

  return revenue/data.length;
}

function COMPANY_DAILY_RATE(month=DATE(2023, 10))
{
  let apartments = dataFilter(Util.MAIN_APT_DATABASE, [0, "", (a, b) => a !== b && a !== Util.MAIN_APT_DATABASE[0][0]],
                                     [7, "", (a, b) => a !== b && (dateInMonth(a, month) || a.getTime() < month.getTime())],
                                     [8, "", (a, b) => a === b || DATE(a.getFullYear(), a.getMonth() + 1).getTime() >= DATE(month.getFullYear(), month.getMonth() + 1).getTime()]);

  let total = 0;
  apartments.forEach(x => total += dailyRate(x[0], month));

  return total/apartments.length;
}