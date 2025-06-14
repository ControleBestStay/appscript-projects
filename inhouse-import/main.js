//testing full backup script

var iHss = SpreadsheetApp.openById("1pYWD6zoghpNBj_hkma3Mju5fLwrqD7s7yW0dyoadSb8");
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