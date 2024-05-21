var DATE_TYPE = {
  CHECK_IN: "arrival",
  CHECK_OUT: "departure",
  CREATION: "creation",
  INCLUDED: "included"
};

var RESERVATION_TYPE = {
  PRE_RESERVATION: "reserved",
  RESERVATION: "booked",
  CONTRACT: "contract",
  BLOCKED: "blocked",
  MAINTENANCE: "maintenance"
};

/**
 * Retrieves all reservations that satisfy the criteria based on the values provided.
 * @param {string | object} dateFrom Start date in YYYY-MM-DD format.
 * @param {string | object} dateTo End date in YYYY-MM-DD format.
 * @param {string} dateType Date range criteria (e.g. Check-in, Check-out, Creation, etc.). Check-in by default.
 * @param {string} listingId Listing identifier.
 * @param {string} type Reservation typed (also includes blocked days and maintenance).
 * @param {string} clientId Client identifier, for getting reservations from a specific client (likely useless).
 * @return {object} Returns a JSON object containing reservations that match the given criteria.
 */
function BOOKING_RETRIEVE_RESERVATIONS(dateFrom, dateTo, dateType=DATE_TYPE.CHECK_IN, listingId=null, type=null, clientId=null)
{
  let params = { 
                 "from": typeof dateFrom == 'object' ? Utilities.formatDate(dateFrom, "GMT-3", "yyyy-MM-dd") : dateFrom,
                 "to":   typeof dateTo   == 'object' ? Utilities.formatDate(dateTo  , "GMT-3", "yyyy-MM-dd") : dateTo,
                 "dateType": dateType 
                };

  if(!!listingId) params["listingId"] = listingId;
  if(!!type)      params["type"     ] =      type;
  if(!!clientId)  params["_idclient"] =  clientId;

  return JSON.parse(
                    CORE_HANDLE_DATA(
                                      SECTIONS.BOOKING,
                                      "reservations-export",
                                      REQUEST_METHOD.POST,
                                      {'accept':'application/json', 'Authorization': USER_AUTH, 'Content-Type': 'application/json'},
                                      JSON.stringify(params)
                                    )
                  );
}

function BOOKING_RETRIEVE_RESERVATION(reservationID)
{
  let params = 
  {
    method: REQUEST_METHOD.GET,
    headers: DEFAULT_HEADER,
    'muteHttpExceptions':true
  }

  return JSON.parse(
                    UrlFetchApp.fetch(ROOT_ADDRESS + "external/v1/" + SECTIONS.BOOKING + "reservations/" + reservationID, params)
                  );
}