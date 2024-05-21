//convert to standard form

function revenue(apartment, month) //calculate extra pmnt based on new ss
{
  let revenue = 0;
  let data = splitRes(apartment, month, true);

  for(let i in data) { revenue += data[i][3]; }

  return revenue;
}

function companyRevenue(month = DATE(2024, 1))
{
  let apartments = dataFilter(Util.MAIN_APT_DATABASE, [0, "", (a, b) => a !== b && a !== Util.MAIN_APT_DATABASE[0][0]]);
  let rev = 0;

  apartments.forEach(x => rev += revenue(x[0], month));
  return rev;
}

function adjustedRevenue(month = DATE(2024, 1))
{
  let commissionApartments = dataFilter(Util.MAIN_APT_DATABASE, [4, "", (a, b) => a !== b]);
  let rentedApartments = dataFilter(Util.MAIN_APT_DATABASE, [4, "", (a, b) => a === b]);

  let commissionedRevenue = 0, rentedRevenue = 0;

  commissionApartments.forEach(x => { if(typeof x[4] === 'number') commissionedRevenue += revenue(x[0], month) * x[4];} );
  rentedApartments.forEach(x => { if(x[0] !== '') rentedRevenue += revenue(x[0], month);} )

  return commissionedRevenue + rentedRevenue;
}