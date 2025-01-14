var pStartingDate = new Date(new Date().setHours(0, 0, 0, 0));
var pDayRange = 182;
var pEndDate = incrementDate(pStartingDate, pDayRange);

function pGetCalendarPricingData(id, start=pStartingDate.toISOString().replace(/T.*/, ''),
end=pEndDate.toISOString().replace(/T.*/, ''))
{
  return StaysAPI.LISTING_RETRIEVE_CALENDAR(id, start, end);
}

function pParseApartmentCalendar(apt="NascSilva4A/1404", id="YD01H")
{
  let calendar = pGetCalendarPricingData(id);
  let arr = [];

  arr.push([apt + '.' + 'Disp.']); //0
  arr.push([apt + '.' + 'T1']);    //1
  arr.push([apt + '.' + 'T2']);    //2
  arr.push([apt + '.' + 'T3']);    //3
  arr.push([apt + '.' + 'T4']);    //4
  arr.push([apt + '.' + 'T5']);    //5

  for(let i in calendar)
  {
    let current = calendar[i];
    let priceSet = !!current['prices'];

    arr[0].push(current['avail']);
    for(let j = 0; j < (/*priceSet ? current['prices'].length :*/ 5); j++)
    {
      if(!current['prices'] || j > current['prices'].length - 1) //
      {
        arr[j + 1].push("<!>");
        continue;
      }//
      arr[j + 1].push(priceSet ? current['prices'][j]['_mcval']['BRL'] : "<!>");
    }
  }

  return arr;
}

function pGenerateFullCalendar() {
  let list = getApartmentIDs();
  let arr = [];

  for(var apt in list)
  {
    let calendar = pParseApartmentCalendar(apt, list[apt]);
    arr.push(...calendar);
  }

  APPEND_ARRAY(Util.MAIN_PRCDATA_SHEET, [3, 1], arr);
}
