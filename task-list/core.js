function GET_TASKS()
{
  let data = TASK_SHEET.getDataRange().getValues();

  for(let i = 1; i < data.length; i++)
    if(data[i][5] == TASK_STATUS.COMPLETED)
      ADD_TASK(data[i][0], MAKE_TASK(data[i][2], data[i][3], data[i][4], null, null, data[i][1]), data[i][5], data[i][8]);
}

/**
 * @param {string} apartment Apartment.
 * @param {string} guest Guest name.
 * @param {object} date Date.
 * @param {string} eci ECI text (optional).
 * @param {string} lco LCO text (optional).
 * @param {string} observation Observation (optional).
 */
function MAKE_TASK(apartment, guest, date, eci=null, lco=null, observation=null)
{
  let obs;
  if(!!observation) obs = observation;
  else  obs = guest + (!!eci ? " | " + eci : "") + (!!lco ? " | " + lco : ""); 

  return [obs, apartment, guest, date]
}

function ADD_TASK(type, taskData, status=TASK_STATUS.PENDING, tag=null)
{
  let _tag = !tag ? type + "." + taskData[1] + "." + taskData[2] + "." + DATE_TO_NUM(taskData[3]) : tag;

  if(!TASK_LIST[_tag]) TASK_LIST[_tag] = [type, ...taskData, status, "BestStay", TASK_CATEGORY.OPS, "=A:A&\".\"&C:C&\".\"&IF(D:D=\"\";B:B;D:D)&\".\"&FLOOR(E:E)"]
}

function GENERATE_STATIC_TASKS()
{
  let current = new Date(START_DATE);

  while(!DATE_EQUAL(current, END_DATE))
  {
    let task = MAKE_TASK("Planilha", "", current, null, null, "ECIs " + WEEKDAY[INCREMENT_DATE(current).getDay()]);

    ADD_TASK(TASK_TYPE.VER, task);

    current = INCREMENT_DATE(current);
  }
}

function GENERATE_TASKS()
{
  let res = FIXED_RESERVATIONS();

  for(let i in res)
  {
    if(res[i][1].getTime() >= START_DATE.getTime()) //Check-in 
    {
      let mod = !res[i][5] ? -1 : -2;

      ADD_TASK(TASK_TYPE.LCI, MAKE_TASK(res[i][4], res[i][3], INCREMENT_DATE(res[i][1],  -1), res[i][5], res[i][6]));
      ADD_TASK(TASK_TYPE.CIN, MAKE_TASK(res[i][4], res[i][3], INCREMENT_DATE(res[i][1],   0), res[i][5], res[i][6]));
      ADD_TASK(TASK_TYPE.POS, MAKE_TASK(res[i][4], res[i][3], INCREMENT_DATE(res[i][1],   1),      null,      null));
    }
    if(res[i][2].getTime() <= END_DATE.getTime() && res[i][2].getTime() > START_DATE.getTime()) //Check-out
    {
      ADD_TASK(TASK_TYPE.COT, MAKE_TASK(res[i][4], res[i][3], INCREMENT_DATE(res[i][2],  0), res[i][5], res[i][6]));
      ADD_TASK(TASK_TYPE.GRV, MAKE_TASK(res[i][4], res[i][3], INCREMENT_DATE(res[i][2],  0),      null,      null));
      if(!reviewExists(res[i])) ADD_TASK(TASK_TYPE.RVW, MAKE_TASK(res[i][4], res[i][3], INCREMENT_DATE(res[i][2],  2),      null,      null));
    }
  }
}

function PRINT_TASKS()
{
  let arr = [];

  for(let i in TASK_LIST)
    arr.push(TASK_LIST[i]);

  TASK_SHEET.getRange(2, 1, arr.length, arr[0].length).setValues(arr);
}

function UPDATE_CHECKBOXES(calendarSheet, taskTags)
{
  let data = calendarSheet.getDataRange().getValues();
  let checkBoxValues = {}

  for(let i = 9; i < data.length; i++) //Y
    for(let j = 2; j < data[i].length; j++) //X
      if((j - 2) == 0 || (j - 2) % 4 == 0)
      {
        let date = DATE_TO_NUM(data[7][j + 1]),
            task = data[i][j + 1],
            apt  = data[i][j + 2],
            obs  = data[i][j + 3].split(' |')[0];
        let tag = task + "." + apt + "." + obs + "." + date;

        if(!!checkBoxValues[j]) checkBoxValues[j].push([!(!taskTags[tag]) ? taskTags[tag][5] == "Realizada" : false]);
        else checkBoxValues[j] = [[!(!taskTags[tag]) ? taskTags[tag][5] == "Realizada" : false]];
      }
  for (let k = 2; k < data[0].length; k++)
    if((k - 2) == 0 || (k - 2) % 4 == 0)
    {
      let range = calendarSheet.getRange(10, k + 1, checkBoxValues[k].length);
      range.setValues(checkBoxValues[k]);
    }
}
