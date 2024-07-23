const CLIENT_ID = PropertiesService.getScriptProperties().getProperty('id');
const CLIENT_PW = PropertiesService.getScriptProperties().getProperty('pw');
const CLIENT_AUTH64 = Utilities.base64Encode(CLIENT_ID + ":" + CLIENT_PW)

const USER_AUTH = "Basic " + CLIENT_AUTH64;
const ROOT_ADDRESS = "https://tfda.stays.com.br/";

const DEFAULT_HEADER = {'Authorization': USER_AUTH, 'Content-Type': 'application/json'};

const SECTIONS = {
  BOOKING: "booking/",
  FINANCE: "finance/",
  LISTING_CALENDAR: "calendar/listing/",
  PRICES: "parr/",
  CONTENT: "content/",
  GLOBAL: "settings/global/",
  APP_SETTINGS: "settings/app/",
  LISTING_SETTINGS: "settings/listing/",
  CALENDAR: "calendar/"
};

const REQUEST_METHOD = {
  GET: "get",
  POST: "post"
};


function test()
{
  let a = LISTING_RETRIEVE_CALENDAR("63cac2c15db21d72dcf97203", '2024-07-22', '2024-08-22');
  //a.forEach(x=>Logger.log(x))
  Logger.log(a)
  Logger.log(typeof a)
}

function CORE_HANDLE_DATA(section, subSection, requestMethod, header = null, bodyParameters)
{
  let params = 
  {
    method: requestMethod,
    headers: !header ? DEFAULT_HEADER : header,
    payload: bodyParameters,
    'muteHttpExceptions':true
  }

  return UrlFetchApp.fetch(ROOT_ADDRESS + "external/v1/" + section + subSection, params);
}