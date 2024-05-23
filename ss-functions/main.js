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
 * Returns occupancy rate for a specific apartment between today and the end of a specified month.
 * @param {string} apartment Name of the apartment.
 * @param {object} month The specific month used to calculate occupancy.
 * @customfunction
 */
function OCCUPANCYEOM(apartment=null, month=null)
{
  let occupiedDays = 0;

  let launchDate = dataFilter(aptData, [0, apartment])[0][2];
  let monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  let remainingDays = (launchDate.getTime() > TODAY.getTime() ? dateDif(launchDate, monthEnd) : dateDif(TODAY, monthEnd)) + 1;

  let reservations = splitRes(apartment, month);
  reservations.forEach(x => {
    if(x[4].getTime() >= TODAY.getTime()) occupiedDays++;
    });

  return occupiedDays/remainingDays;
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