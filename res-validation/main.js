function t()
{
  let sheet = SpreadsheetApp.openById("1wLzoy2kagWt8axemV0_e7sSEuWtUtHnEOmHWshIqglE").getSheetByName("ABBCOMMISSION");

  let res = getDBReservations();
  let list = []

  let apts = ['FrancOt132/804', 'BaraoDaTorre120/101B', 'AlmGuilhem332/1208']

  for(let i in res)
  {
    if(!apts.includes(res[i].apartment)) continue;

    let id = res[i].id;
    let cur = StaysAPI.BOOKING_RETRIEVE_RESERVATION(id);

    if(!!cur["message"]) continue;

    let totalPrice = cur["price"]["_f_total"];
    let commission = (!cur["partner"] || cur["partner"]["name"] === "Website") ? 0 : cur["partner"]["commission"]["_mcval"]["BRL"];
    let resCode = cur["partnerCode"];
    let cDate = cur["creationDate"];

    let obj = 
    {
      apt: res[i].apartment,
      name: res[i].guestName,
      creation: cDate,
      ci: res[i].checkIn,
      co: res[i].checkOut,
      tot: totalPrice,
      com: commission,
      liq: parseFloat((totalPrice - commission).toFixed(2)),
      code: resCode,
      _id: id
    };

    list.push([res[i].apartment,
      res[i].guestName,
      cDate,
      res[i].checkIn,
      res[i].checkOut,
      totalPrice,
      commission,
      commission/totalPrice,
      parseFloat((totalPrice - commission).toFixed(2)),
      resCode,
      id]);
  }

  APPEND_ARRAY(sheet, [2,1], list);
}