let today = numberOfDays(Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy"));

function incrementDate(date, amount)
{
  dateArr = date.split("/");
  fDate = dateArr[1] + "/" + dateArr[0] + "/" + dateArr[2];

  let nDate  = new Date(new Date(fDate).getTime());

  nDate.setDate(new Date(fDate).getDate() +          amount);
  nDate = Utilities.formatDate(nDate, "GMT-3", "dd/MM/yyyy");

  return nDate;
}

function parseRawData(body, string, indexBegin, indexEnd, isDate = false, isRate = false) {
  rString = "";

  begin = body.indexOf(string) + indexBegin;
  end   = body.indexOf(string) +   indexEnd;

  if(!isDate) {
    if(isRate) return filterRate(body.substring(begin, end).trim());
    return body.substring(begin, end).trim();
  }
  return dateExtensiveToStandard((body.substring(begin, end).trim()).replace(/['"\u200c]/g, ""));
}

function dateExtensiveToStandard(extDate) {
  let arr = extDate.split(" ");

  if(arr.length - 2 > 3) arr.splice(0, 1);
  arr[0] = arr[0].trim();

  arr = arr.filter(item => item !== "de");

  let map = {};
  map["janeiro"  ] = "01";
  map["fevereiro"] = "02";
  map["março"    ] = "03";
  map["abril"    ] = "04";
  map["maio"     ] = "05";
  map["junho"    ] = "06";
  map["julho"    ] = "07";
  map["agosto"   ] = "08";
  map["setembro" ] = "09";
  map["outubro"  ] = "10";
  map["novembro" ] = "11";
  map["dezembro" ] = "12";

  if (parseInt(arr[0]) < 10) arr[0] = "0" + arr[0];
  arr[1] = map[arr[1]];

  return (arr[0] + "/" + arr[1] + "/" + arr[2]);
}

function filterRate(string) {
  let begin = string.indexOf("$") + 1;
  let end   = string.indexOf(",") + 3;

  return string.substring(begin, end).trim();
}

function numberOfDays(date = "") {
  var arr = date.split('/');

  return parseInt(arr[0]) + (parseInt(arr[1]) * 30) + (parseInt(arr[2]) * 12 * 30);
}

function addRowsIfShort(sheet) {
  let maxRow  = sheet.getMaxRows();
  let lastRow = sheet.getLastRow();

  if (maxRow - lastRow < 100) {
    sheet.insertRowsAfter(maxRow, 100);
  }
}

function sortSheet(sheet, column_ = 1, ascending_ = true) {
  let range = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn());
  range.sort({column: column_, ascending: ascending_});
}

function wipeSheet(sheet)
{
  if(sheet.getLastRow() == 1) return;

  let begin = 2;

  let amount = sheet.getLastRow() - begin + 1;

  sheet.deleteRows(begin, amount);
}