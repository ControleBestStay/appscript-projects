//testing full backup script

var iHss = SpreadsheetApp.openById("1qYe3cZKblbw4kMLLHr5wXm_KN2atOW6ZdSQx-VvUvv4");
var sDss = SpreadsheetApp.openById("1OYjIII2HKJdbEsxgdR6MYGoctUAaLstD6u2yeipLqrk");

var inhouseSheet = iHss.getSheetByName("Inhouse");
var inhouseHistorySheet = iHss.getSheetByName("HistInhouse");
var inhouseSDSheet = sDss.getSheetByName("inH&ci");

var issueDict = {};

function main()
{
  importR();
  fillDict();
  updateCheckBoxes();
}


