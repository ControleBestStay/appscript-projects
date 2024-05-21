var SCHEDULE_SPREADSHEET = SpreadsheetApp.openById("1OYjIII2HKJdbEsxgdR6MYGoctUAaLstD6u2yeipLqrk");
var INHOUSE_SHEET = SCHEDULE_SPREADSHEET.getSheetByName("dados_inh");
var LAUNDRY_DATA_SHEET = SCHEDULE_SPREADSHEET.getSheetByName("dados_lav");
var SCHEDULE_CO_SHEET = SCHEDULE_SPREADSHEET.getSheetByName("DCO");
var SCHEDULE_CI_SHEET = SCHEDULE_SPREADSHEET.getSheetByName("DCI");
var SCHEDULE_AUTO_SHEET = SCHEDULE_SPREADSHEET.getSheetByName("formulas_cg_auto");

const TODAY = new Date(new Date().setHours(0, 0, 0, 0));
const WEEKDAY = ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];

const SCHEDULE_START = INCREMENT_DATE(TODAY, -(7 - 5 + TODAY.getDay()) % 7 + 1);
const SCHEDULE_END = INCREMENT_DATE(SCHEDULE_START, 9);

function DATE_EQUAL (a, b) { return a.getTime() == b.getTime(); }
function DATE_TO_NUM(date) { return (new Date(date.getTime() - (1000 * 60 * date.getTimezoneOffset())).getTime() / 1000 / 86400) + 25569; }
function INCREMENT_DATE(date, amount = 1)
{
  let newDate = new Date(new Date(date).getTime());
  newDate.setDate(new Date(date).getDate() + amount);
	
	return newDate;
}
function DATE_DIF(a, b) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.abs(Math.floor((utc2 - utc1) / _MS_PER_DAY));
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

function APPEND_ARRAY(targetSheet, coord, array) { targetSheet.getRange(coord[0], coord[1], array.length, array[0].length).setValues(array); }

function WIPE_SHEET(sheet, start_at)
{
  if(sheet.getLastRow() == 1) return;

  let begin = 2;

  let amount = sheet.getLastRow() - begin + start_at;

  sheet.deleteRows(begin, amount);
}

function SORT(array, index)
{
  return array.sort((a, b) => {
    if(a[index] < b[index]) return -1;
    if(a[index] > b[index]) return  1;
    return 0;
  });
}

function ADD_ROWS(sheet) {
  let maxRow  = sheet.getMaxRows();
  let lastRow = sheet.getLastRow();

  if (maxRow - lastRow < 500) {
    sheet.insertRowsAfter(maxRow, 500);
  }
}