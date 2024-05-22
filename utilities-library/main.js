//TEST 2

//Main sheet
var MAIN_SPREADSHEET = SpreadsheetApp.openById("1wLzoy2kagWt8axemV0_e7sSEuWtUtHnEOmHWshIqglE");

var MAIN_RES_SHEET = MAIN_SPREADSHEET.getSheetByName("BaseReservas"); //res
var MAIN_RESVAL_SHEET = MAIN_SPREADSHEET.getSheetByName("ValidaçãoReservas");
var MAIN_RESADJ_SHEET = MAIN_SPREADSHEET.getSheetByName("AjustesReceita")
var MAIN_PAY_SHEET = MAIN_SPREADSHEET.getSheetByName("BasePagamentos"); //pay
var MAIN_EXP_SHEET = MAIN_SPREADSHEET.getSheetByName("BaseCustos"); //cost
var MAIN_CAT_SHEET = MAIN_SPREADSHEET.getSheetByName("CategoriasCustos"); //cat
var MAIN_BIL_SHEET = MAIN_SPREADSHEET.getSheetByName("PgtosContas"); //bill
var MAIN_APT_SHEET = MAIN_SPREADSHEET.getSheetByName("Apartamentos"); //apt
var MAIN_APD_SHEET = MAIN_SPREADSHEET.getSheetByName("DadosApts"); //aptData
var MAIN_ANL_SHEET = MAIN_SPREADSHEET.getSheetByName("DadosAnalise");
var MAIN_APTANL_SHEET = MAIN_SPREADSHEET.getSheetByName("DadosAnaliseApts");

var MAIN_RES_DATABASE = MAIN_RES_SHEET.getDataRange().getValues(); //resDB
var MAIN_PAY_DATABASE = MAIN_PAY_SHEET.getDataRange().getValues(); //payDB
var MAIN_EXP_DATABASE = MAIN_EXP_SHEET.getDataRange().getValues(); //costDB
var MAIN_CAT_DATABASE = MAIN_CAT_SHEET.getDataRange().getValues(); //catDB
var MAIN_BIL_DATABASE = MAIN_BIL_SHEET.getDataRange().getValues(); //billDB
var MAIN_APT_DATABASE = MAIN_APT_SHEET.getDataRange().getValues(); //aptDB
var MAIN_APD_DATABASE = MAIN_APD_SHEET.getDataRange().getValues(); //aptDataDB

//Schedule sheet
var SCHEDULE_SPREADSHEET = SpreadsheetApp.openById("1OYjIII2HKJdbEsxgdR6MYGoctUAaLstD6u2yeipLqrk");

var SCHEDULE_INHOUSE_SHEET = SCHEDULE_SPREADSHEET.getSheetByName("dados_inh");
var SCHEDULE_LAUNDRY_DATA_SHEET = SCHEDULE_SPREADSHEET.getSheetByName("dados_lav");
var SCHEDULE_CO_SHEET = SCHEDULE_SPREADSHEET.getSheetByName("DCO");
var SCHEDULE_CI_SHEET = SCHEDULE_SPREADSHEET.getSheetByName("DCI");

//Const globals
const TODAY = new Date(new Date().setHours(0, 0, 0, 0));
const WEEKDAY = ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];
const MONTH = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez" ];

var COMPANY_START = DATE(2022, 5);
var CURRENT_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

//Report sheets and folders [DELETE THIS]
var testSheet = SpreadsheetApp.openById("1NAZIRPdZtZVhmFl_icJphhN4QubpgUYHxpEFwn008yQ").getSheetByName("data");
var rSheet = SpreadsheetApp.openById("1NAZIRPdZtZVhmFl_icJphhN4QubpgUYHxpEFwn008yQ").getSheetByName("report");

var REPORT_TEMPLATE_SHEET = SpreadsheetApp.openById("1JcZ0GB3a-XNWw4yndAK0zh9prvcLyjZQYAdEboPACg0");
var REPORT_SPREADSHEETS_FOLDER = DriveApp.getFolderById("1MDOL-GGmYyYYW3GUhkKk7Kvqr-StagMp");
var REPORT_PDF_FOLDER = DriveApp.getFolderById("1cND9Fkxl8S1vqnoCCz9fyqSvynxVbXnL");

function RESDB_COLUMN_INDICES()
{
  let dict = {};

  for(let i = 3; i < MAIN_CAT_DATABASE.length; i++)
  {
    let current = MAIN_CAT_DATABASE[i];

    if(current[11] === "") break;

    if(!dict[current[12]]) dict[current[12]] = current[13];
  }

  return dict;
}

//Data filtering
/**
 * Generic data filter for 2D arrays.
 * @param {any[]} arr
 * @param {((string | number)[] | (number | Date | ((a: any, b: any) => boolean))[])[]} args
 */
function DATA_FILTER(arr, ...args) // [index, data] or [index, data, function]
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

//Sheets

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
function DATE_EQUAL (a, b) 
{
  if(a === undefined || b === undefined) return false;
  return a.getTime() === b.getTime(); 
}
function DATE_BETWEEN (a, b, c) { return b.getTime() > a.getTime() && b.getTime() < c.getTime(); }
function DATE_WITHIN (a, b, c) { return b.getTime() >= a.getTime() && b.getTime() <= c.getTime(); }
function DATE_IN_MONTH (a, b) { return a.getFullYear() == b.getFullYear() && a.getMonth() == b.getMonth(); }
function INCREMENT_DATE(date, amount = 0)
{
	let newDate = new Date(new Date(date).getTime());

  newDate.setDate(new Date(date).getDate() + amount);;
	
	return newDate;
}