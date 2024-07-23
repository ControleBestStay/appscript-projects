var label          = GmailApp.getUserLabelByName("Reservas BestStay - Cancelled"            );
var archiveLabel   = GmailApp.getUserLabelByName("Reservas BestStay - Cancelled - Archive"  );

var ss             = SpreadsheetApp.openById("1wLzoy2kagWt8axemV0_e7sSEuWtUtHnEOmHWshIqglE");
var dataBaseSheet  =                                       ss.getSheetByName("BaseReservas"); 

var validationLabel = GmailApp.getUserLabelByName("Problematic Cancellations");


function parseEmail() {
  var threads = label.getThreads();
  handleData(threads);

  let range = dataBaseSheet.getRange(2, 1, dataBaseSheet.getLastRow() - 1, dataBaseSheet.getLastColumn());
  range.sort([{column: 1, ascending: true}, {column: 7, ascending: true}]);
}
