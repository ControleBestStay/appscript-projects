function apartmentCount(month=DATE(2024, 1))
{
  let apartments = dataFilter(Util.MAIN_APD_DATABASE, [0, "", (a, b) => a !== b && a !== Util.MAIN_APD_DATABASE[0][0] && a !== "Empresa"]); 

  let count = 0;
  for(let i in apartments)
  {
    let current = apartments[i];

    let startMonth = current[3], endMonth = current[5];
    let validStart =  startMonth == "" ? false : month.getTime() >= startMonth.getTime();
    let validEnd = endMonth == "" ? true : month.getTime() < endMonth.getTime();

    if(validStart && validEnd) count++;
  }

  return count;
}

function averageStayLength(month=DATE(2024, 1))
{
  let apartments = dataFilter(Util.MAIN_APD_DATABASE, [0, "", (a, b) => a !== b && a !== Util.MAIN_APD_DATABASE[0][0] && a !== "Empresa"]); 
  let validApartments = [];

  for(let i in apartments)
  {
    let current = apartments[i];

    let startMonth = current[3], endMonth = current[5];
    let validStart =  startMonth == "" ? false : month.getTime() >= startMonth.getTime();
    let validEnd = endMonth == "" ? true : month.getTime() < endMonth.getTime();

    if(validStart && validEnd) validApartments.push(current);
  }

  let totalAverageLength = 0;
  for(let i in validApartments)
  {
    let current = validApartments[i];

    let daysOccupied = splitRes(current[0], month);
    let reservationCount = 0;

    for(let j = 0; j < daysOccupied.length; j++)
    {
      let currentRes = daysOccupied[j];

      if(j == 0 || currentRes[1] !== daysOccupied[j - 1][1])
        reservationCount++;
    }

    let averageLength = daysOccupied.length/reservationCount;
    totalAverageLength += averageLength;
  }

  let averageLength = totalAverageLength/validApartments.length;

  return averageLength;
}