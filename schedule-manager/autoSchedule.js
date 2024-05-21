function pivotTasks() 
{
  let indices = SCHEDULE_AUTO_SHEET.getRange(3, 1, 1, 3).getValues()[0];

  let column = indices[1];
  let length = indices[2];
  let rows = SCHEDULE_AUTO_SHEET.getDataRange().getValues().length;

  let data = DATA_FILTER(SCHEDULE_AUTO_SHEET.getRange(3, column, rows, length).getValues(), [0, "", (a, b) => a !==b ]);
  let array = [];

  for(let i = 0; i < data.length; i++)
  {
    let current = data[i];
    array.push({
      maids: current[0], duration: current[1], date: current[2], apartment: current[4], guests: current[5], start: 0, end: 0
    });
  }

  return array;
}

function freeTasks() 
{
  let indices = SCHEDULE_AUTO_SHEET.getRange(4, 1, 1, 3).getValues()[0];

  let column = indices[1];
  let length = indices[2];
  let rows = SCHEDULE_AUTO_SHEET.getDataRange().getValues().length;

  let data = DATA_FILTER(SCHEDULE_AUTO_SHEET.getRange(3, column, rows, length).getValues(), [0, "", (a, b) => a !==b ]);
  let array = [];

  for(let i = 0; i < data.length; i++)
  {
    let current = data[i];
    array.push({
      maids: current[0], duration: current[1], date: current[2], apartment: current[4], guests: current[5], start: 0, end: 0
    });
  }

  return data;
}

function lateTasks() 
{
  let indices = SCHEDULE_AUTO_SHEET.getRange(5, 1, 1, 3).getValues()[0];

  let column = indices[1];
  let length = indices[2];
  let rows = SCHEDULE_AUTO_SHEET.getDataRange().getValues().length;

  let data = DATA_FILTER(SCHEDULE_AUTO_SHEET.getRange(3, column, rows, length).getValues(), [0, "", (a, b) => a !==b ]);
  let array = [];

  for(let i = 0; i < data.length; i++)
  {
    let current = data[i];
    let postpone = current[7];

    array.push({
      maids: current[0], duration: current[1], date: postpone ? current[6] : current[2],
      apartment: current[4], guests: current[5], postponed: current[7], start: 0, end: 0
    });
  }

  return data;
}

function createGroups(pivots)
{
  let groups = [];

  for(let i = 0; i < pivots.length; i++)
  {
    let current = pivots[i];

    current.start = 11;
    current.end = current.start + current.duration;

    groups.push([current]);
  }

  return groups;
}

function allocateFreeTasks(freeTasks, groups)
{
  for(let i in groups)
  { 
    
  }
}

function schedule()
{
  let pivots = pivotTasks();
  let free = freeTasks();
  let late = lateTasks();

  let groups = createGroups(pivots);

  Logger.log(groups);
 
}