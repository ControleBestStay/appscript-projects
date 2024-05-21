function createBackup() 
{
  let today = Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy");
  let destFolder = DriveApp.getFolderById("1GD7NmR14QFt-Ib8wQtaGn-Y124HERWRm");

  let ss = SpreadsheetApp.openById("1wLzoy2kagWt8axemV0_e7sSEuWtUtHnEOmHWshIqglE");
  let ns = SpreadsheetApp.create(ss.getName() + " : " + today);

  ns.getSheets()[0].setName("~~~");
  ss.getSheets().forEach(sh => {
    sh.copyTo(ns).setName(sh.getName());
    });
  ns.deleteSheet(ns.getSheetByName("~~~"));

  Drive.Files.update({"parents": [{"id": destFolder.getId()}]}, ns.getId())
}