function LISTING_RETRIEVE_LISTING(id)
{
  let params = { 
                /*listingId: id*/
              };

  return JSON.parse(
                  CORE_HANDLE_DATA(
                                    SECTIONS.CONTENT,
                                    "listings/" + id,
                                    REQUEST_METHOD.GET,
                                    {'Authorization': USER_AUTH, 'Content-Type': 'application/json'}
                                  )
                  );
}

function LISTING_RETRIEVE_CALENDAR(id, dateFrom, dateTo, ignorePriceGroup=false, ignoreCloneGroup=false)
{
  let path = ROOT_ADDRESS + "external/v1/calendar/listing/" + id + "?from=" + dateFrom +"&to=" + dateTo;
  let params = 
  {
    method: REQUEST_METHOD.GET,
    headers: {
                'accept':'application/json',
                'Authorization': USER_AUTH,
                'Content-Type': 'application/json'
              },
    payload: { 
                /*"from": typeof dateFrom == 'object' ? Utilities.formatDat(dateFrom, "GMT-3", "yyyy-MM-dd") : dateFrom,
                "to":   typeof dateTo   == 'object' ? Utilities.formatDat(dateTo  , "GMT-3", "yyyy-MM-dd") : dateTo,
                "ignorePriceGroupUnits": ignorePriceGroup,
                "ignoreCloneGroupUnits": ignoreCloneGroup*/
               },
    'muteHttpExceptions':true
  }


  return UrlFetchApp.fetch(path, params);

    /*return JSON.parse(
                  CORE_HANDLE_DATA(
                                    SECTIONS.CALENDAR,
                                    "listing/" + id,
                                    REQUEST_METHOD.GET,
                                    {'Authorization': USER_AUTH, 'Content-Type': 'application/json'},
                                    JSON.stringify(params)
                                  )
                  );*/
}
