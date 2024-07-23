var sheet = SpreadsheetApp.openById("1wLzoy2kagWt8axemV0_e7sSEuWtUtHnEOmHWshIqglE");

var testSheet = SpreadsheetApp.openById("1NAZIRPdZtZVhmFl_icJphhN4QubpgUYHxpEFwn008yQ").getSheetByName("data");
var rSheet = SpreadsheetApp.openById("1NAZIRPdZtZVhmFl_icJphhN4QubpgUYHxpEFwn008yQ").getSheetByName("report");

var templateSheet = SpreadsheetApp.openById("1JcZ0GB3a-XNWw4yndAK0zh9prvcLyjZQYAdEboPACg0");

var sheetFolder = DriveApp.getFolderById("19Egi0HVCAMohlGNQP1HfzLpu1HkUr-oX");
var pdfFolder = DriveApp.getFolderById("1cND9Fkxl8S1vqnoCCz9fyqSvynxVbXnL");

function t()
{
}

function generateReports()
{ 
  let month = CURRENT_MONTH;
  let apts = dataFilter(Util.MAIN_APT_DATABASE, [3, "", (a, b) => (a !== b && a !== "Proprietário" )], 
                               [6, "", (a, b) => (a !== b && a !== "Mês de Início")], 
                               [8, "", (a, b) => a === b ]);

  let props = {};
  for(let i in apts) 
  {
    if(!props[apts[i][3]]) props[apts[i][3]] = [apts[i][0]];
    else props[apts[i][3]].push(apts[i][0]);
  }

  for (const [key, value] of Object.entries(props))
  {
    let unitsString = value.join(", ");
    let sheetName = "Demonstrativo - " + unitsString + " - " + MONTH[month.getMonth() - 1] + "/" + month.getFullYear();

    let newSheetID = templateCopy(templateSheet, sheetName, sheetFolder);
    let newSheet = SpreadsheetApp.openById(newSheetID);
    createSheet(newSheet, value, REPORT_MONTH);
  }
}

function createPDFs()
{
  let files = sheetFolder.getFiles();

  while(files.hasNext())
  {
    let file = files.next();
    if(folderHasFile(pdfFolder, file.getName())) continue;

    let rs = SpreadsheetApp.openById(file.getId()).getSheetByName("report");

    formatSections(rs);

    createPDF(file.getId(), rs, file.getName());
  }
}

