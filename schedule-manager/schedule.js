function GET_DATA(start, end, type)
{
  let data  = StaysAPI.BOOKING_RETRIEVE_RESERVATIONS(start, end, type);
  let block = GET_BLOCKED(start, end, type, StaysAPI.RESERVATION_TYPE["BLOCKED"]);
  let maint = GET_BLOCKED(start, end, type, StaysAPI.RESERVATION_TYPE["MAINTENANCE"]);

  let arr = [];
  for(let i in data)
    arr.push([new Date(data[i]['checkInDate']+'T00:00:00-03:00'), new Date(data[i]['checkOutDate']+'T00:00:00-03:00'), 
    data[i]["listing"]["internalName"], data[i]["client"]["name"], data[i]['guestTotalCount'], ""]);
  for(let i in block)
    arr.push([new Date(block[i]['checkInDate']+'T00:00:00-03:00'), new Date(block[i]['checkOutDate']+'T00:00:00-03:00'), 
    block[i]["listing"]["internalName"], "", "", block[i]['observation']])
  for(let i in maint)
    arr.push([new Date(maint[i]['checkInDate']+'T00:00:00-03:00'), new Date(maint[i]['checkOutDate']+'T00:00:00-03:00'), 
    maint[i]["listing"]["internalName"], "", "", maint[i]['observation']])

  return arr.sort((a, b) => { 
    let i = type == StaysAPI.DATE_TYPE["CHECK_OUT"] ? 1 : 0; 
    if(a[i].getTime() < b[i].getTime()) return -1;
    if(a[i].getTime() > b[i].getTime()) return  1;
    else {
      if(a[2] < b[2]) return -1;
      if(a[2] > b[2]) return  1;
                      return  0;  
    }
  });
}

function GET_SCHEDULE_DATA()
{
  let dataCO = GET_DATA(SCHEDULE_START, SCHEDULE_END, StaysAPI.DATE_TYPE["CHECK_OUT"]);
  let dataCI = GET_DATA(SCHEDULE_START, SCHEDULE_END, StaysAPI.DATE_TYPE["CHECK_IN" ]);

  WIPE_SHEET(SCHEDULE_CO_SHEET, 1);
  WIPE_SHEET(SCHEDULE_CI_SHEET, 1);

  APPEND_ARRAY(SCHEDULE_CO_SHEET, [2, 1], dataCO);
  APPEND_ARRAY(SCHEDULE_CI_SHEET, [2, 1], dataCI);

  ADD_ROWS(SCHEDULE_CO_SHEET);
  ADD_ROWS(SCHEDULE_CI_SHEET);
}
