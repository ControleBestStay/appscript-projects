var ss = SpreadsheetApp.openById("1qYe3cZKblbw4kMLLHr5wXm_KN2atOW6ZdSQx-VvUvv4");
var calendarSheet = ss.getSheetByName("CalendarioTarefas");
var inhouseSheet = ss.getSheetByName("Inhouse");
var inhouseHistorySheet = ss.getSheetByName("HistInhouse");
var taskSheet = ss.getSheetByName("TarefasDoDia");
var logSheet = ss.getSheetByName("Log");

let data = taskSheet.getDataRange().getValues();

function onMyEdit(e) //optimize this sloth
{
  switch(e.source.getActiveSheet().getName())
  {
    case "CalendarioTarefas": calendarEvent(e); break;
    case "Inhouse": inhouseEvent(e); break;
    default: return;
  }
}

function changeTaskStatus(tag, value)
{
  let rng = fetchTaskStatusRange(tag);
  taskSheet.getRange(rng[0], rng[1]).setValue(value == "TRUE" ? "Realizada" : "Pendente");
}

function fetchTaskStatusRange(tag)
{
  for(let i = 0; i < data.length; i++) 
  {
    if(data[i][8] == tag) return [i + 1, 6];
  }
}



















