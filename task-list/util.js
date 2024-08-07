var CALENDAR_SPREADSHEET = SpreadsheetApp.openById("1qYe3cZKblbw4kMLLHr5wXm_KN2atOW6ZdSQx-VvUvv4");
var TASK_SHEET = CALENDAR_SPREADSHEET.getSheetByName("TarefasDoDia");
var CALENDAR_SHEET = CALENDAR_SPREADSHEET.getSheetByName("CalendarioTarefas");
var DATA_SHEET = CALENDAR_SPREADSHEET.getSheetByName("Dados");
var REVIEW_SHEET = CALENDAR_SPREADSHEET.getSheetByName("Reviews");
var REVIEW_DATA = REVIEW_SHEET.getDataRange().getValues();

var TASK_LIST = {};

const TODAY = new Date(new Date().setHours(0, 0, 0, 0));
const START_DATE = INCREMENT_DATE(TODAY, -7);
const END_DATE = INCREMENT_DATE(TODAY, 11);

const WEEKDAY = ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];

const TASK_CATEGORY = {
	OPS: "Operações",
	LIM: "Limpeza",
	LAV: "Lavanderia"
}

const TASK_TYPE = {
	PRE: "Pré check-in",
  CIN: "Check-in",
  LCI: "Lib. Check-in",
  POS: "Pós check-in",
  COT: "Check-out",
  RVW: "Pd. Review",
  GRV: "Rvw. Hospede",
  LAV: "Lavanderia",
  LIM: "Limpeza",
  VER: "Verificação"
}

let LISTING_TITLES = GET_LISTING_TITLES();

let MONTHS = {};
MONTHS["jan."] =  1; MONTHS["fev."] =  2; MONTHS["mar."] =  3;
MONTHS["abr."] =  4; MONTHS["mai."] =  5; MONTHS["jun."] =  6;
MONTHS["jul."] =  7; MONTHS["ago."] =  8; MONTHS["set."] =  9;
MONTHS["out."] = 10; MONTHS["nov."] = 11; MONTHS["dez."] = 12;

const TASK_STATUS = {
  PENDING: "Pendente",
  COMPLETED: "Realizada"
};

function DATE_EQUAL (a, b) { return a.getTime() === b.getTime(); }
function DATE_TO_NUM(date) { return (new Date(date.getTime() - (1000 * 60 * date.getTimezoneOffset())).getTime() / 1000 / 86400) + 25569; }
function INCREMENT_DATE(date, amount = 1)
{
  let newDate = new Date(new Date(date).getTime());
  newDate.setDate(new Date(date).getDate() + amount);
	
	return newDate;
}

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

function SORT_SHEET(sheet, column_ = 1, ascending_ = true) {
  let range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
  range.sort({column: column_, ascending: ascending_});
}

function ADD_ROWS(sheet) {
  let maxRow  = sheet.getMaxRows();
  let lastRow = sheet.getLastRow();

  if (maxRow - lastRow < 100) {
    sheet.insertRowsAfter(maxRow, 1000);
  }
}

function WIPE_SHEET(sheet)
{
  if(sheet.getLastRow() == 1) return;

  let begin = 3;

  let amount = sheet.getLastRow() - begin + 1;

  sheet.deleteRows(begin, amount);
}

function DATE (y = new Date().getFullYear(), m = 1, d = 1) { return new Date(y, m - 1, d); }