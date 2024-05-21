var sheet = SpreadsheetApp.getActiveSpreadsheet();
var res = sheet.getSheetByName("BaseReservas");
var apt = sheet.getSheetByName("DadosApts");
var pay = sheet.getSheetByName("BasePagamentos")

var resData = res.getDataRange().getValues();
var aptData = apt.getDataRange().getValues();
var payDB = pay.getDataRange().getValues();

const TODAY = new Date(new Date().setHours(0, 0, 0, 0));
const WEEKDAY = ["Dom.", "Seg.", "Ter.", "Qua.", "Qui.", "Sex.", "Sáb."];
const MONTH = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez" ];

//Data filtering
/**
 * Generic data filter
 * @param {any[]} arr
 * @param {((string | number)[] | (number | Date | ((a: any, b: any) => boolean))[])[]} args
 */
function dataFilter(arr, ...args) // [index, data] or [index, data, function]
{
  return arr.filter((reservation) => { 
      for (let i in args)
        if((args[i].length > 2) ? 
            !args[i][2](reservation[args[i][0]], args[i][1]) : 
            reservation[args[i][0]] != args[i][1]) 
            return false; 
      return true;
    }
  );
}

/**
 * Filters data from reservation database and payment database and returns array in day by day format
 * NOTE: Use generic data filtering as both sheets are different (0 for apartment)
 * [apt, guest, guests, dailyRate, date]
 */
function splitRes(apartment, month, cancelled=false)
{
  let resData = getReservations(apartment, month);
  let paySheet = payDB;
  let payData = dataFilter(paySheet, [0, apartment]);
  
  let payCategories = [paySheet[1][11], paySheet[2][11], paySheet[3][11]];

  let arr = [];
  //resDB
  for(let i = 0; i < resData.length; i++)
  {
    let apt  = resData[i][0], guest   = resData[i][1], guests   = resData[i][2],
        rate = resData[i][4], checkin = resData[i][6], checkout = resData[i][7], 
        nights = DATE_DIF(checkin, checkout), isCancelled = resData[i][8],
        totalAmount = resData[i][3];

    let totalAdjustment = 0;
    for(let j = 0; j < payData.length; j++)
    {
      let current = payData[j];
      if(!payCategories.includes(current[4]) &&
          current[1] === guest)
        totalAdjustment += current[2];
    }

    rate = (totalAmount + totalAdjustment) / nights; //new DR if adjusted

    for(let j = 0; j < nights; j++)
    {
      let currentDate = incrementDate(checkin, j);
      if(dateInMonth(currentDate, month)) {

        if(isCancelled)
        {
          if(!cancelled) break;
          arr.push([apt, guest, guests, totalAmount, currentDate, "CANCELADO"])
          break;
        }
        arr.push([apt, guest, guests, rate, currentDate, "Reserva"]);
      } 
    }
  }

  //payDB
  for(let i = 0; i < payData.length; i++)
  {
    let type = payData[i][4];
    if(!payCategories.includes(type)) continue;
    switch(type)
    {
      case "ECI": type = "Entrada Antecipada"; break;
      case "LCO": type = "Saída Tardia"; break;
      default: break;
    }

    let apt  = payData[i][ 0], guest   = payData[i][1], guests   = payData[i][8],
        rate = payData[i][10], checkin = payData[i][6], checkout = payData[i][7], 
        nights = DATE_DIF(checkin, checkout);
    for(let j = 0; j < nights; j++)
    {
      let currentDate = incrementDate(checkin, j);
      if(dateInMonth(currentDate, month)) arr.push([apt, guest, guests, rate, currentDate, type]);
    }
  }

  arr = arr.sort((a, b) => {
      if(a[4] < b[4]) return -1;
      else if( a[4] > b[4]) return 1;
      return 0;
    });

  return arr;
}

function getReservations(apartment, month)
{
  let reservations = dataFilter(resData, [0, apartment]);

  let reservationsMonth = [];

  for (let i in reservations)
    if(dateEqual(reservations[i][10], month) ||
       dateEqual(reservations[i][14], month) ||
       dateInBetween(reservations[i][10], month, reservations[i][14]))
    {
      reservationsMonth.push([
        reservations[i][0], reservations[i][1], reservations[i][2], reservations[i][3],
        reservations[i][4], reservations[i][5], reservations[i][6], reservations[i][7],
        reservations[i][13] == "" ? false : reservations[i][13]
        ]);
    }

  return reservationsMonth;
}

//Occupancy


//Dates
function date (y = new Date().getFullYear(), m = 1, d = 1) { return new Date(y, m - 1, d); }
function dateDif(a, b) {
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
function DATE_DIF(a, b) 
{
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  // Discard the time and time-zone information.
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
}
function dateEqual (a, b) { return a.getTime() === b.getTime(); }
function dateInBetween (a, b, c) { return b.getTime() > a.getTime() && b.getTime() < c.getTime(); }
function dateWithin (a, b, c) { return b.getTime() >= a.getTime() && b.getTime() <= c.getTime(); }
function dateInMonth (a, b) { return a.getFullYear() == b.getFullYear() && a.getMonth() == b.getMonth(); }
function daysInMonth (date, apartment=null)
{
  let firstMonth = dataFilter(aptData, [0, apartment])[0];

  if(!!apartment && dateEqual(date, firstMonth[3])) 
    return firstMonth[4];

  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  return new Date(year, month, 0).getDate();
}
function incrementDate(date, amount = 0)
{
	let newDate = new Date(new Date(date).getTime());

  newDate.setDate(new Date(date).getDate() + amount);;
	
	return newDate;
}

function getMonth(numMonth)
{
  let months = {}

  months[0] = "Jan"; months[1] = "Fev"; months[2] = "Mar"; 
  months[3] = "Abr"; months[4] = "Mai"; months[5] = "Jun"; 
  months[6] = "Jul"; months[7] = "Ago"; months[8] = "Set"; 
  months[9] = "Out"; months[10] = "Nov"; months[11] = "Dez"; 

  return months[numMonth];
}

function getDayWeek(numDay) 
{
  let days = {}

  days[0] = "Dom."; days[1] = "Seg."; days[2] = "Ter.";
  days[3] = "Qua."; days[4] = "Qui."; days[5] = "Sex.";
  days[6] = "Sáb.";

  return days[numDay];
}

//Memory
/*
function memorySizeOf(obj, rawBytes=false) {
  var bytes = 0;

  function sizeOf(obj) {
    if (obj !== null && obj !== undefined) {
      switch (typeof obj) {
        case "number":
          bytes += 8;
          break;
        case "string":
          bytes += obj.length * 2;
          break;
        case "boolean":
          bytes += 4;
          break;
        case "object":
          var objClass = Object.prototype.toString.call(obj).slice(8, -1);
          if (objClass === "Object" || objClass === "Array") {
            for (var key in obj) {
              if (!obj.hasOwnProperty(key)) continue;
              sizeOf(obj[key]);
            }
          } else bytes += obj.toString().length * 2;
          break;
      }
    }
    return bytes;
  }

  if(rawBytes) return sizeOf(obj);

  function formatByteSize(bytes) {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + " KiB";
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + " MiB";
    else return (bytes / 1073741824).toFixed(3) + " GiB";
  }

  return formatByteSize(sizeOf(obj));
}*/
/*
function cacheData(key, data) //only works with this specific case
{
  let batch = [];

  let batchIndex = 0;

  for(let i = 1; i < data.length; i++)
  {
    if((memorySizeOf(batch, true) + memorySizeOf(data[i], true)) <= 102400) batch.push(data[i]);
    else
    {
      cache.put(key + batchIndex, JSON.stringify(batch));

      Logger.log("Size of batch #" + batchIndex + ": " + memorySizeOf(batch));

      batch = [];
      batchIndex++;

      batch.push(data[i]);
    }

    if(i == data.length-1)
    {
      cache.put(key + batchIndex, JSON.stringify(batch));
      Logger.log("Size of batch #" + batchIndex + ": " + memorySizeOf(batch));
    }
  }
}

function getCachedData(key) //only works with this specific case
{
  let arr = [];

  let index = 0;
  while(!!cache.get(key + index))
  {
    arr = arr.concat(JSON.parse(cache.get(key + index)));
    index++;
  }

  return arr;
}
*/