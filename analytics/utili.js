const TODAY = new Date(new Date().setHours(0, 0, 0, 0));
const WEEKDAY = ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];
const MONTH = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez" ];

var COMPANY_START = DATE(2022, 5);
var REPORT_MONTH = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
var CURRENT_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
var ANALYSIS_LAST_MONTH = new Date(new Date().getFullYear(), new Date().getMonth() + 5, 1);

//Report sheets and folders [DELETE THIS]
var testSheet = SpreadsheetApp.openById("1NAZIRPdZtZVhmFl_icJphhN4QubpgUYHxpEFwn008yQ").getSheetByName("data");
var rSheet = SpreadsheetApp.openById("1NAZIRPdZtZVhmFl_icJphhN4QubpgUYHxpEFwn008yQ").getSheetByName("report");

var REPORT_TEMPLATE_SHEET = SpreadsheetApp.openById("1JcZ0GB3a-XNWw4yndAK0zh9prvcLyjZQYAdEboPACg0");
var REPORT_SPREADSHEETS_FOLDER = DriveApp.getFolderById("1MDOL-GGmYyYYW3GUhkKk7Kvqr-StagMp");
var REPORT_PDF_FOLDER = DriveApp.getFolderById("1cND9Fkxl8S1vqnoCCz9fyqSvynxVbXnL");

//Data filtering
/**
 * Generic data filter for 2D arrays.
 * @param {any[]} arr
 * @param {((string | number)[] | (number | Date | ((a: any, b: any) => boolean))[])[]} args
 */
function dataFilter(arr, ...args) // [index, data] or [index, data, function]
{
  return arr.filter((row) => { 
      for (let i in args)
        if((args[i].length > 2) ? 
            !args[i][2](row[args[i][0]], args[i][1]) : 
            row[args[i][0]] != args[i][1]) 
            return false; 
      return true;
    }
  );
}

function LAST_ROW(sheet_) {return sheet_.getDataRange().getValues().length; }
function LAST_COL(sheet_) {return sheet_.getDataRange().getValues()[0].length; }
function GET_DIMENSIONS(sheet_)
{
  let lc = LAST_COL(sheet_), lr = LAST_ROW(sheet_);
  let width = 0, height = 0;

  for(let i = 1; i <= lc; i++) width += sheet_.getColumnWidth(i);
  for(let i = 1; i <= lr; i++) height += sheet_.getRowHeight(i);

  width /= 96;
  height /= 96;

  return [width, height * 0.81];
}

function APPEND_ARRAY(targetSheet, coord, array) { targetSheet.getRange(coord[0], coord[1], array.length, array[0].length).setValues(array); }
function WIPE_SHEET(sheet, start_at)
{
  if(sheet.getLastRow() == 1) return;

  let begin = 3;

  let amount = sheet.getLastRow() - begin + start_at;

  sheet.deleteRows(begin, amount);
}
function ADD_ROWS(sheet) {
  let maxRow  = sheet.getMaxRows();
  let lastRow = sheet.getLastRow();

  if (maxRow - lastRow < 500) {
    sheet.insertRowsAfter(maxRow, 500);
  }
}

//Dates

function DATE (y = new Date().getFullYear(), m = 1, d = 1) { return new Date(y, m - 1, d); }
function DATE_DIF(a, b) 
{
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
function dateEqual (a, b) 
{
  if(a === undefined || b === undefined) return false;
  return a.getTime() === b.getTime(); 
}
function dateBetween (a, b, c) { return b.getTime() > a.getTime() && b.getTime() < c.getTime(); }
function dateWithin (a, b, c) { return b.getTime() >= a.getTime() && b.getTime() <= c.getTime(); }
function dateInMonth (a, b) { 
  if(typeof a === "string") 
    Logger.log("");
 return a.getFullYear() == b.getFullYear() && a.getMonth() == b.getMonth(); }
function incrementDate(date, amount = 0)
{
	let newDate = new Date(new Date(date).getTime());

  newDate.setDate(new Date(date).getDate() + amount);;
	
	return newDate;
}

function test()
{
  let ress = splitRes("Visc379/104", DATE(2025, 5));
  for(let i in ress) Logger.log(ress[i]);
}

/**
 * Filters data from reservation database and payment database and returns array in day by day format
 * NOTE: Use generic data filtering as both sheets are different (0 for apartment)
 * [apt, guest, guests, dailyRate, date]
 */
function splitRes(apartment, month, cancelled=false)
{
  let resData = getReservations(apartment, month);
  let paySheet = Util.MAIN_PAY_DATABASE;
  let aptSheet = Util.MAIN_APT_DATABASE;
  let payData = dataFilter(paySheet, [0, apartment]);
  
  let feePayout = dataFilter(aptSheet, [0, apartment])[0][11];
  let cleaningFee = dataFilter(aptSheet, [0, apartment])[0][9];

  let payCategories = [paySheet[1][11], paySheet[2][11], paySheet[3][11]];

  let arr = [];
  //resDB
  for(let i = 0; i < resData.length; i++)
  {
    let apt  = resData[i][0], guest   = resData[i][1], guests   = resData[i][2],
        checkin = resData[i][6], checkout = resData[i][7], 
        nights = DATE_DIF(checkin, checkout), isCancelled = resData[i][8],
        totalAmount = feePayout ? resData[i][3] : resData[i][3] - cleaningFee,
        rate = totalAmount/nights;

    let totalAdjustment = 0;
    for(let j = 0; j < payData.length; j++)
    {
      let current = payData[j];
      if(!payCategories.includes(current[4]) &&
          current[1] === guest)
        totalAdjustment += current[2];
    }

    rate = (totalAmount + totalAdjustment) / nights; //new DR if adjusted

    for(let j = 0; j < nights; j++)
    {
      let currentDate = incrementDate(checkin, j);
      if(dateInMonth(currentDate, month)) {

        if(isCancelled)
        {
          if(!cancelled) break;
          arr.push([apt, guest, guests, totalAmount, currentDate, "CANCELADO"])
          break;
        }
        arr.push([apt, guest, guests, rate, currentDate, "Reserva"]);
      }
    }
  }

  //payDB
  for(let i = 0; i < payData.length; i++)
  {
    let type = payData[i][4];
    if(!payCategories.includes(type)) continue;
    switch(type)
    {
      case "ECI": type = "Entrada Antecipada"; break;
      case "LCO": type = "Saída Tardia"; break;
      default: break;
    }

    let apt  = payData[i][ 0], guest   = payData[i][1], guests   = payData[i][8],
        rate = payData[i][10], checkin = payData[i][6], checkout = payData[i][7], 
        nights = DATE_DIF(checkin, checkout);
    for(let j = 0; j < nights; j++)
    {
      let currentDate = incrementDate(checkin, j);
      if(dateInMonth(currentDate, month)) arr.push([apt, guest, guests, rate, currentDate, type]);
    }
  }

  arr = arr.sort((a, b) => {
      if(a[4] < b[4]) return -1;
      else if( a[4] > b[4]) return 1;
      return 0;
    });

  return arr;
}

function getCancelledRevenue(apartment, month)
{
  let resData = getReservations(apartment, month);
  let total = 0;

  for(let i in resData)
    if(resData[i][8]) total += resData[i][3];

  return total;
}

function getApartmentData(apartment) { return dataFilter(Util.MAIN_APT_DATABASE, [0, apartment])[0]; }


//Printing

function blankRow(n, char = ".") { let arr = []; for(let i = 0; i < n; i++) arr.push(char); return arr; }

//Dates
function daysInMonth (date, apartment=null)
{
  let firstMonth = dataFilter(Util.MAIN_APD_DATABASE, [0, apartment])[0];

  if(!!apartment && dateEqual(date, firstMonth[3])) 
    return firstMonth[4];

  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  return new Date(year, month, 0).getDate();
}