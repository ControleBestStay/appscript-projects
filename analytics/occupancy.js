function occupancy(apartment, month)
{
  let data = splitRes(apartment, month);
  return data.length/daysInMonth(month, apartment);
}

function COMPANY_OCCUPANCY(month=DATE(2023, 12))
{
  let apartments = dataFilter(Util.MAIN_APT_DATABASE, [0, "", (a, b) => a !== b && a !== Util.MAIN_APT_DATABASE[0][0]],
                                     [7, "", (a, b) => a !== b && (dateInMonth(a, month) || a.getTime() < month.getTime())],
                                     [8, "", (a, b) => a === b || DATE(a.getFullYear(), a.getMonth() + 1).getTime() >= DATE(month.getFullYear(), month.getMonth() + 1).getTime()]);

  let total = 0;
  apartments.forEach(x => total += occupancy(x[0], month));

  return total/apartments.length;
}