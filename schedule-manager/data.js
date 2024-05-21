function PARSE_LAUNDRY_DATA()
{
  let start = INCREMENT_DATE(TODAY, -30);
  let end   = INCREMENT_DATE(TODAY,  30);

  let dataCO = StaysAPI.BOOKING_RETRIEVE_RESERVATIONS(start, end, StaysAPI.DATE_TYPE["CHECK_OUT"]);
  let dataCI = StaysAPI.BOOKING_RETRIEVE_RESERVATIONS(start, end, StaysAPI.DATE_TYPE["CHECK_IN" ]);

  let lavCO = [], lavCI = [];

  for (let i in dataCO)
    lavCO.push([new Date(dataCO[i]['checkInDate']+'T00:00:00-03:00'), new Date(dataCO[i]['checkOutDate']+'T00:00:00-03:00'), dataCO[i]["listing"]["internalName"]]);

  for (let i in dataCI)
    lavCI.push([new Date(dataCI[i]['checkInDate']+'T00:00:00-03:00'), dataCI[i]["listing"]["internalName"]]);

  lavCO = SORT(lavCO, 1);
  lavCI = SORT(lavCI, 0);

  WIPE_SHEET(LAUNDRY_DATA_SHEET, 2);

  APPEND_ARRAY(LAUNDRY_DATA_SHEET, [2, 1], lavCO);
  APPEND_ARRAY(LAUNDRY_DATA_SHEET, [2, 4], lavCI);

  ADD_ROWS(LAUNDRY_DATA_SHEET);
}

function PARSE_INHOUSE_DATA()
{
  let start = INCREMENT_DATE(TODAY, -30);
  let end   = INCREMENT_DATE(TODAY,  30);

  let dataCO = StaysAPI.BOOKING_RETRIEVE_RESERVATIONS(start, end, StaysAPI.DATE_TYPE["CHECK_OUT"]);
  let dataCI = StaysAPI.BOOKING_RETRIEVE_RESERVATIONS(start, end, StaysAPI.DATE_TYPE["CHECK_IN" ]);

  let inhCO = [], inhCI = [];

  for (let i in dataCO)
    inhCO.push([new Date(dataCO[i]['checkInDate']+'T00:00:00-03:00'), new Date(dataCO[i]['checkOutDate']+'T00:00:00-03:00'), 
    dataCO[i]["listing"]["internalName"], dataCO[i]["client"]["name"]]);

  for (let i in dataCI)
    inhCI.push([new Date(dataCI[i]['checkInDate']+'T00:00:00-03:00'), new Date(dataCI[i]['checkOutDate']+'T00:00:00-03:00'), 
    dataCI[i]["listing"]["internalName"], dataCI[i]["client"]["name"]]);

  WIPE_SHEET(INHOUSE_SHEET, 1);

  APPEND_ARRAY(INHOUSE_SHEET, [3, 1], inhCO);
  APPEND_ARRAY(INHOUSE_SHEET, [3, 5], inhCI);

  ADD_ROWS(INHOUSE_SHEET);
}

function GET_BLOCKED(start, end, dateType, blockType = StaysAPI.RESERVATION_TYPE["BLOCKED"])
{
  return StaysAPI.BOOKING_RETRIEVE_RESERVATIONS(start, end, dateType, null, blockType, null);
}