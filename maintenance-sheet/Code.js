var sheet = SpreadsheetApp.getActiveSpreadsheet();
var calendarSheet = sheet.getSheetByName("Calendario");
var taskSheet = sheet.getSheetByName("ListaTarefas");

function onEdit(e) 
{
  var sheetName = e.source.getActiveSheet().getName();
  switch(sheetName)
  {
    case "Calendario": checkBoxEvent(e); break;
    case "ListaTarefas": udpateCheckBoxes(e); break;
    default:break;
  }
}

function checkBoxEvent(e)
{
  var range = e.range;

  let row = range.getRow() - 1;
  let col = range.getColumn() - 1;

  if(row < 5) return;
  var data = calendarSheet.getDataRange().getValues();

  Logger.log(data[7][col + 1]);

  let apt = data[row][col + 1],
      cat = data[row][col + 2],
      date1 = standardDate(data[row][col + 3]),
      date2 = standardDate(data[row][col + 4]),
      date3 = standardDate(data[row][col + 5])

  let tag = apt + ";" + cat + ";" + date1 + ";" + date2 + ";" + date3;

  changeTaskStatus(tag, e.value);
}

function changeTaskStatus(tag, value)
{
  let rng = fetchTaskStatusRange(tag);
  taskSheet.getRange(rng[0], rng[1]).setValue(value == "TRUE" ? "Realizada" : "Pendente");
}

function fetchTaskStatusRange(tag)
{
  var data = taskSheet.getDataRange().getValues();

  for(let i = 1; i < data.length; i++) 
  {
    if(data[i][8] == tag) return [i + 1, 8];
  }
}

function standardDate(date)
{
  if(date === "") return "";
  return (new Date(date.getTime() - (1000 * 60 * date.getTimezoneOffset())).getTime() / 1000 / 86400) + 25569;
}

function udpateCheckBoxes(e = null)
{
  if(!!e) 
  {
    var range = e.range;

    let row = range.getRow() - 1;
    let col = range.getColumn() - 1;

    if(row == 0 || col != 7) return;
  }

  let taskTags = {};
  let taskData = taskSheet.getDataRange().getValues();
  for(let i = 1; i < taskData.length; i++)
  {
    if(taskData[i][1] == "") break;
    taskTags[taskData[i][8]] = taskData[i][7] === "" ? false : taskData[i][7];
  }

  let data = calendarSheet.getDataRange().getValues();
  let checkBoxValues = {}

  for(let i = 5; i < data.length; i++) //Y
    for(let j = 0; j < data[i].length; j++) //X
      if(j == 0 || j % 7 == 0)
      {
        if(data[i][j + 1] === "") continue;

        let apt = data[i][j + 1],
            cat = data[i][j + 2],
            date1 = standardDate(data[i][j + 3]),
            date2 = standardDate(data[i][j + 4]),
            date3 = standardDate(data[i][j + 5])

        let tag = apt + ";" + cat + ";" + date1 + ";" + date2 + ";" + date3;

        if(!!checkBoxValues[j]) checkBoxValues[j].push([!(!taskTags[tag]) ? taskTags[tag] == "Realizada" : false]);
        else checkBoxValues[j] = [[!(!taskTags[tag]) ? taskTags[tag] == "Realizada" : false]];
      }
  for (let k = 0; k < data[0].length; k++)
    if(k == 0 || k % 7 == 0)
    {
      if(!checkBoxValues[k]) continue;

      let range = calendarSheet.getRange(6, k + 1, checkBoxValues[k].length);
      range.setValues(checkBoxValues[k]);
    }
}