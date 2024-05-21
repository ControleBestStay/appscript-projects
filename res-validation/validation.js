function compareReservation(resObjA, resObjB)
{
  return {
      apartment: resObjA.apartment === resObjB.apartment,
      guestName: resObjA.guestName === resObjB.guestName, 
      guestCount: resObjA.guestCount === resObjB.guestCount, 
      totalPrice: resObjA.totalPrice === resObjB.totalPrice, 
      checkIn: dateEqual(resObjA.checkIn, resObjB.checkIn),
      checkOut: dateEqual(resObjA.checkOut, resObjB.checkOut),
      creationDate: dateEqual(resObjA.creationDate, resObjB.creationDate),
      website: resObjA.website === resObjB.website
    }
}

function validateReservations() {
  let start = CURRENT_MONTH;
  let end = END_MONTH;

  let staysReservations = getStaysReservations(start, end);
  let databaseReservations = getDBReservations();

  let mismatchArr = [];
  let mismatchDict = {};

  for(let i in databaseReservations)
  {
    let currentRes = databaseReservations[i];
    if(currentRes[13]) continue;

    if(!staysReservations[currentRes.id]) continue; //<!Ignore reservations without an id/id not in stays list for now>
    let currentStays = staysReservations[currentRes.id];

    let reservationTest = compareReservation(currentRes, currentStays);
    for(let j in reservationTest)
    {
      if(!reservationTest[j])
      {
        mismatchArr.push([new Date(), currentRes.id, j, currentRes[j], currentStays[j]]);

        let object = {
          timestamp: new Date(), 
          id: currentRes.id, 
          category: j, 
          oldValue: currentRes[j], 
          newValue: currentStays[j]
        };

        if(!mismatchDict[currentRes.id]) mismatchDict[currentRes.id] = [object];
        else mismatchDict[currentRes.id].push(object);
      }
    }
  }

  updateValues(mismatchDict, mismatchArr);
}

function applyChanges(cells, adjustments, mismatchArr)
{
  if(cells.length === 0) return;

  let reservationSheet = Util.MAIN_RES_SHEET;

  for(let i = 0; i < cells.length; i++)
  {
    Logger.log(cells[i]);
    reservationSheet.getRange(cells[i][0], cells[i][1]).setValue(cells[i][2]);
  }

  if(!!mismatchArr && !!mismatchArr[0]) APPEND_ARRAY(Util.MAIN_RESVAL_SHEET, [Util.MAIN_RESVAL_SHEET.getLastRow() + 1, 1], mismatchArr);
  if(!!adjustments && !!adjustments[0]) APPEND_ARRAY(Util.MAIN_RESADJ_SHEET, [Util.MAIN_RESADJ_SHEET.getLastRow() + 1, 1], adjustments);
}

//Adjustment formula (nightsFirst/nightsLast) * value | Res adjustment formula (revDif)*[(nightsStart/nightsEnd) + 1]
function updateValues(mismatchDict, mismatchArr)
{
  let adjustments = [];
  let cells = [];

  let reservations = Util.MAIN_RES_DATABASE;

  let categoryIndices = columnIndices();

  for(let i = 1; i < reservations.length; i++)
  {
    let current = reservations[i];
    let currentID = current[12];

    if(!mismatchDict[currentID]) continue;
    let mismatchArray = mismatchDict[currentID];

    for(let j in mismatchArray)
    {
      let object = mismatchArray[j];
      let column = categoryIndices[object.category] + 1;

      if(object.category === "totalPrice" &&
         current[14].getTime() > current[10].getTime())
         adjustments.push([object.timestamp, object.id]);

      cells.push([i + 1, column, object.newValue]);
    }
  }

  applyChanges(cells, adjustments, mismatchArr);
}

