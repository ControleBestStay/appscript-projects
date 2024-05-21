function GET_RESERVATIONS(start, end, type)
{
  let dateType = type == StaysAPI.DATE_TYPE["CHECK_OUT"] ? 'checkOutDate' : 'checkInDate';

  let data = StaysAPI.BOOKING_RETRIEVE_RESERVATIONS(start, end, type);

  let arr = [];

  for (let i in data) 
  {
    let date = new Date(data[i][dateType]+'T00:00:00-03:00');

    arr.push([date, data[i]["listing"]["internalName"], data[i]['guestTotalCount'], 
      DATE_TO_NUM(date) + data[i]["listing"]["internalName"]]);
  }

  return arr;
}

function HAS_CHECKIN(co, dataCI)
{
  return dataCI.some(row => row[3] === co[3]);
}

function NUMBER_GUESTS(co, dataCI)
{
  for(let i in dataCI)
  {
    if(dataCI[i][0].getDate() < co[0].getDate ||
      dataCI[i][1] != co[1])
        continue;

    return dataCI[i][2];
  }
  return 0;
}

function GAP(co, dataCI)
{
  for(let i in dataCI)
  {
    if(dataCI[i][0].getDate() <= co[0].getDate ||
      dataCI[i][1] != co[1])
        continue;

    return DATE_DIF(co[0], dataCI[i][0]);
  }
  return 99;
}

function TASK(date, apartment, start, end, guests, gap, nMaids)
{
  this.date = date;
  this.apartment = apartment;
  this.start = start;
  this.end = end;
  this.guests = guests;
  this.gap = gap;
  this.nMaids = nMaids;
}

function BUILD_TASKS()  //UNFINISHED
{
  let start = SCHEDULE_START, end = SCHEDULE_END; //temporary

  let dataCO = GET_RESERVATIONS(start, end, StaysAPI.DATE_TYPE["CHECK_OUT"]);
  let dataCI = SORT(GET_RESERVATIONS(start, end, StaysAPI.DATE_TYPE["CHECK_IN"]), 3);

  let defTasks = [];
  let undTasks = [];

  for(let i = 0; i < dataCO.length; i++)
  {
    let current = dataCO[i];
    let task = new TASK(current[0], current[1], null, null, NUMBER_GUESTS(current, dataCI), GAP(current, dataCI), 1);

    if(HAS_CHECKIN(current, dataCI))
    {
      task.start = 11; 
      task.end = task.start + 4; //TODO: get cleaning duration of specific apt.
      task.gap = 0;

      defTasks.push(task);
      continue;
    } 

    undTasks.push(task);
  }

  defTasks = defTasks.sort((a, b) => { 
    if(a.date.getDate() < b.date.getDate()) return -1;
    if(a.date.getDate() > b.date.getDate()) return  1;
    else {
      if(a.gap < b.gap) return -1;
      if(a.gap > b.gap) return  1;
                        return  0;  
    }
  });

  undTasks = undTasks.sort((a, b) => { 
    if(a.date.getDate() < b.date.getDate()) return -1;
    if(a.date.getDate() > b.date.getDate()) return  1;
    else {
      if(a.gap < b.gap) return  1;
      if(a.gap > b.gap) return -1;
                        return  0; }
  });

  return [defTasks, undTasks];
}

function ASSIGN_DEFINED_GROUPS(defTasks, undTasks, cleaningTasks) //UNFINISHED
{
  let taskGroup = [];
  for(let i = 0; i < defTasks.length; i++)
  {
    let current = defTasks[i];
    taskGroup.push(current);

    let index = 1;
    for(let j = 0; j < undTasks.length; j++)
    {
      if(index == current.nMaids + 1) { index = 1; break; }
      if(!DATE_EQUAL(current.date, undTasks[j].date)) continue;

      undTasks[j].start = current.end + 1;
      undTasks[j].end = undTasks[j].start + 4; //TODO: get cleaning duration of specific apt.
      taskGroup.push(undTasks[j]);
      index++;

      undTasks.splice(j, 1);
    }

    let key = current.date.getDate() + WEEKDAY[current.date.getDay()];
    if(!cleaningTasks[key]) cleaningTasks[key] = [taskGroup];
    else cleaningTasks[key].push(taskGroup);

    taskGroup = [];
  }
}

function ASSIGN_UNDEFINED_GROUPS(undTasks, cleaningTasks) //UNFINISHED
{
  let undAmount = {};
  for(let i in undTasks) 
    undAmount[undTasks[i].date.getDate()] = (!undAmount[undTasks[i].date.getDate()]) ? 1 
    : ++undAmount[undTasks[i].date.getDate()];

  let taskGroup = [];
  let index = 1;
  for(let i = 0; i < undTasks.length; i++)
  {
    let current = undTasks[i];
    let key = current.date.getDate() + WEEKDAY[current.date.getDay()];
    if(index <= Math.ceil(undAmount[current.date.getDay()]/2)) 
    {
      current.start = 11; current.end = current.start + 4;
      taskGroup.push(current);

      if(!cleaningTasks[key]) cleaningTasks[key] = [taskGroup];
      else cleaningTasks[key].push(taskGroup);

      taskGroup = [];
      index++;
    }
  }

  Logger.log("Stop")
}

function BUILD_GROUPS() //UNFINISHED
{
  let tasks = BUILD_TASKS();
  
  let defTasks = tasks[0];
  let undTasks = tasks[1];

  let cleaningTasks = {};

  ASSIGN_DEFINED_GROUPS(defTasks, undTasks, cleaningTasks);
  ASSIGN_UNDEFINED_GROUPS(undTasks, cleaningTasks);

//  return cleaningTasks;
}