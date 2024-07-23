function FIXED_RESERVATIONS()
{
  let reservations = GET_RESERVATIONS();
  let blocked = DATA_FILTER(GET_BLOCKED(), [4, "eci|lco", (a, b) => { return typeof a == 'string' ? !!a.toLowerCase().match(b) : false }])

  let ecis = DATA_FILTER(blocked, [4, "eci", (a, b) => {return !!a.toLowerCase().match(b) }]);
  let lcos = DATA_FILTER(blocked, [4, "lco", (a, b) => {return !!a.toLowerCase().match(b) }]);

  let arr = []
  for(let i in reservations)
  {
    if(reservations[i][0] == "GA04I") 
      Logger.log("")

    let eci = DATA_FILTER(ecis, [2, reservations[i][1], DATE_EQUAL], [3, reservations[i][4]]);
    let lco = DATA_FILTER(lcos, [1, reservations[i][2], DATE_EQUAL], [3, reservations[i][4]]);

    arr.push([
      reservations[i][0], reservations[i][1], reservations[i][2],
      reservations[i][3], reservations[i][4],
      eci.length > 0 ? eci[0][4] : null,
      lco.length > 0 ? lco[0][4] : null
    ]);
  }

  return arr;
}

function GET_RESERVATIONS() {
  let dataCI = StaysAPI.BOOKING_RETRIEVE_RESERVATIONS(START_DATE, END_DATE, StaysAPI.DATE_TYPE["CHECK_IN" ]);
  let dataCO = StaysAPI.BOOKING_RETRIEVE_RESERVATIONS(START_DATE, END_DATE, StaysAPI.DATE_TYPE["CHECK_OUT"]);

  let arr = [];
  for(let i in dataCI) 
    arr.push([dataCI[i]["id"], new Date(dataCI[i]["checkInDate"]+'T00:00:00-03:00'), new Date(dataCI[i]["checkOutDate"]+'T00:00:00-03:00'),
      dataCI[i]["client"]["name"], dataCI[i]["listing"]["internalName"]])

  for(let i in dataCO) 
    if(!arr.some(row => row.includes(dataCO[i]["id"])))
      arr.push([dataCO[i]["id"], new Date(dataCO[i]["checkInDate"]+'T00:00:00-03:00'), new Date(dataCO[i]["checkOutDate"]+'T00:00:00-03:00'),
        dataCO[i]["client"]["name"], dataCO[i]["listing"]["internalName"]])

  return arr;
}

function GET_BLOCKED() {
  let dataCI = StaysAPI.BOOKING_RETRIEVE_RESERVATIONS(START_DATE, END_DATE, StaysAPI.DATE_TYPE["CHECK_IN" ], null, StaysAPI.RESERVATION_TYPE["BLOCKED"], null);
  let dataCO = StaysAPI.BOOKING_RETRIEVE_RESERVATIONS(START_DATE, END_DATE, StaysAPI.DATE_TYPE["CHECK_OUT"], null, StaysAPI.RESERVATION_TYPE["BLOCKED"], null);

  let arr = [];

  for(let i in dataCI) 
    arr.push([dataCI[i]["_id"], new Date(dataCI[i]["checkInDate"]+'T00:00:00-03:00'), new Date(dataCI[i]["checkOutDate"]+'T00:00:00-03:00'),
      dataCI[i]["listing"]["internalName"], dataCI[i]["observation"]]);

  for(let i in dataCO) 
    if(!arr.some(row => row.includes(dataCO[i]["_id"])))
      arr.push([dataCO[i]["_id"], new Date(dataCO[i]["checkInDate"]+'T00:00:00-03:00'), new Date(dataCO[i]["checkOutDate"]+'T00:00:00-03:00'),
      dataCO[i]["listing"]["internalName"], dataCO[i]["observation"]]);
  
  return arr;
}

function GET_LISTING_TITLES()
{
  let data = DATA_SHEET.getDataRange().getValues();
  let dict = {};

  for(let i = 1; i < data.length; i++)
    dict[data[i][1]] = data[i][0];

  return dict;
}

























