/** 
 * Returns occupancy rate for a specific apartment and month.
 * @param {string} apartment Name of the apartment.
 * @param {object} month The specific month used to calculate occupancy.
 * @customfunction
 */
function OCCUPANCY(apartment=null, month=date())
{
  let data = splitRes(apartment, month);
  return data.length/daysInMonth(month, apartment);
}

/**
 * @customfunction
 */
function DRATE(apartment=null, month=null) //take new ss into account; implement company wide calculation
{
  let revenue = 0;
  let data = splitRes(apartment, month);

  for(let i in data) { revenue += data[i][3]; }

  return revenue/data.length;
}

/**
 * @customfunction
 */
function CALENDAR(apartment=null, month=null) //take new ss into account; implement company wide calculation
{

  return formatResCalendar(apartment, month);
}

/**
 * @customfunction
 */
function REVENUE(apartment="Prud302/304", month=date(2024,2)) //take new ss into account; implement company wide calculation
{
  let revenue = 0;
  let data = splitRes(apartment, month, true);

  for(let i in data) { revenue += data[i][3]; }

  return revenue;
}