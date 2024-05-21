function getCommission(apartment)
{
  let apartmentSheet = Util.MAIN_APT_DATABASE;

  for(let i in apartmentSheet.length)
    if(apartmentSheet[i][0] === apartment) 
    return apartmentSheet[i][4] === "" ? 0 : apartmentSheet[i][4];
  return 0;
}

function getAirbnbPayment(reservationSheet, date)
{
  let total = 0;

  for(let i = 1; i < reservationSheet.length; i++)
  {
    let current = reservationSheet[i];
    let checkIn = current[5];
    let paymentDate = incrementDate(checkIn, 1);

    if(!dateEqual(paymentDate, date)) continue;
  
    let totalAmount = current[2];
    total += totalAmount;
  }

  return total;
}

function getBookingPayment(reservationSheet, date)
{
  let total = 0;

  for(let i = 1; i < reservationSheet.length; i++)
  {
    let current = reservationSheet[i];
    
    let checkInMonth = current[9];
    let paymentDate = new Date(checkInMonth.getFullYear(), checkInMonth.getMonth() + 1, 1);

    if(!dateEqual(paymentDate, date)) continue;
  
    let totalAmount = current[2];
    total += totalAmount;
  }
}

function getPlatformPayment(platform, date)
{
  let reservationSheet = Util.MAIN_RES_DATABASE;
  let total = 0;

  switch(platform)
  {
    case "Airbnb": total += getAirbnbPayment(reservationSheet, date); break;
    case "Booking": total += getBookingPayment(reservationSheet, date); break;
    default: break;
  }

  return total;
}