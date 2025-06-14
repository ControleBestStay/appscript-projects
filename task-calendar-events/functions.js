function calendarEvent(e) {
  var range = e.range;
  var data = calendarSheet.getDataRange().getValues();

  let user = Session.getActiveUser().getEmail();
  let row = range.getRow() - 1;
  let col = range.getColumn() - 1;

  Logger.log(data[7][col + 1]);

  let date = (new Date(data[7][col + 1].getTime() - (1000 * 60 * data[7][col + 1].getTimezoneOffset())).getTime() / 1000 / 86400) + 25569,
      task = data[row][col + 1],
      apt  = data[row][col + 2],
      obs  = data[row][col + 3].split(' |')[0];
  Logger.log(obs)

  let tag = task + "." + apt + "." + obs + "." + date;

  logSheet.appendRow([new Date(), user, e.oldValue == "TRUE" ? "Realizada" : "Pendente", e.value == "TRUE" ? "Realizada" : "Pendente", tag]);

  changeTaskStatus(tag, e.value);
  sortSheet(logSheet, 1, 2, 1);
  //range.setNote('Last modified: ' + new Date());
}

function inhouseEvent(e)
{
  var range = e.range;
  var data = inhouseSheet.getDataRange().getDisplayValues();

  Logger.log(data)

  let row = range.getRow() - 1;
  let col = range.getColumn() - 1;

  if((col-1) % 5 != 0 && row < 4) return;

  let apt   = data[row][col + 3],
      guest = data[row][col + 4];

  Logger.log("Grabbing from: R " + row + " and C " + col + " the data " + apt + " - " + guest)

  let helper = apt + "." + guest;

  inhouseHistorySheet.appendRow([new Date(), helper, apt, guest, e.value]);
  sortSheet(inhouseHistorySheet);
}

function sortSheet(sheet, column_ = 1, row=3, column=1, ascending_ = false) {
  let range = sheet.getRange(row, column, sheet.getLastRow() - 1, sheet.getLastColumn());
  range.sort({column: column_, ascending: ascending_});
}