function getStaysReservations(start, end) 
{
  let reservations = StaysAPI.BOOKING_RETRIEVE_RESERVATIONS(start, end, StaysAPI.DATE_TYPE["CHECK_IN" ]);
  let dictionary = {};

  for(let i in reservations)
  {
    let current = reservations[i];
    let id = reservations[i]["id"];

    let res = StaysAPI.BOOKING_RETRIEVE_RESERVATION(id);

    let totalPrice = res["price"]["_f_total"];
    let commission = !!res["partner"] ? res["partner"]["commission"]["_mcval"]["BRL"] : 0;

    let reservation = 
    {
      apartment: current["listing"]["internalName"].replace('v2', ''), 
      guestName: current["client"]["name"], 
      guestCount: current["guestTotalCount"], 
      totalPrice: parseFloat((totalPrice - commission).toFixed(2)), 
      checkIn:  new Date(current["checkInDate"]+'T00:00:00-03:00'),
      checkOut:  new Date(current["checkOutDate"]+'T00:00:00-03:00'),
      creationDate:  new Date(current["creationDate"]+'T00:00:00-03:00'),
      website: !!current["partnerName"] ? current["partnerName"] : "Stays",
      id: id
    }

    if(!dictionary[id]) dictionary[id] = reservation;
    else Logger.log("Reservation already exists. " + id);
  }

  return dictionary;
}

function getDBReservations()
{
  let reservations = Util.MAIN_RES_DATABASE;

  let arr = [];

  for(let i = 1; i < reservations.length; i++)
  {
    let current = reservations[i];

    let id = current[12];
    let website = current[11];
    switch(website)
    {
      case "Airbnb": website = "API airbnb"; break;
      case "Booking": website = "API booking.com"; break;
      default: break;
    }

    let reservation = 
    {
      apartment: current[0], 
      guestName: current[1], 
      guestCount: current[2], 
      totalPrice: parseFloat(current[3].toFixed(2)), 
      checkIn: current[6],
      checkOut: current[7],
      creationDate: current[9],
      website: website,
      id: id
    }

    arr.push(reservation);
  }

  return arr;
}

function columnIndices()
{
  let categoryDatabase = Util.MAIN_CAT_DATABASE;

  let dict = {};

  for(let i = 3; i < categoryDatabase.length; i++)
  {
    let current = categoryDatabase[i];

    if(current[11] === "") break;

    if(!dict[current[12]]) dict[current[12]] = current[13];
  }

  return dict;
}
