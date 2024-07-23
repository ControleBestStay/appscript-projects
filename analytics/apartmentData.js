function getApartmentIDs() 
{
  let ids = {};
  let data = Util.MAIN_APT_DATABASE;

  for(let i = 1; i < data.length; i++)
    if(data[i][10] !== "" && data[i][8] === "")
      ids[data[i][0]] = data[i][10];

  return ids;
}

function getApartmentStaysData()
{
  let apartmentIDs = getApartmentIDs();
  let apartmentData = {};

  for(let i in apartmentIDs)
  {
    let data = StaysAPI.LISTING_RETRIEVE_LISTING(apartmentIDs[i]);
    let object = 
    {
      staysID : data["_id"],
      shortID : data["id"],
      listingTitle : data["_mstitle"]["pt_BR"],
      maxGuests : data["_i_maxGuests"],
      rooms : data["_i_rooms"],
      beds : data["_i_beds"],
      baths : data["_f_bathrooms"]
    }

    apartmentData[i] = object;
  }

  return apartmentData;
}

function printStaysApartmentData()
{
  let data = Util.MAIN_APD_DATABASE;
  let arr = [];

  let aptData = getApartmentStaysData();

  for(let i = 2; i < data.length; i++)
  {
    let current = data[i];
    if(!aptData[current[0]] || current[6] !== "")
    {
      arr.push(blankRow(7, ""));
      continue;
    }

    let object = aptData[current[0]];
    arr.push([
      object.staysID, object.shortID, object.listingTitle,
      object.maxGuests, object.rooms, object.beds, 
      object.baths
    ])
  }

  APPEND_ARRAY(Util.MAIN_APD_SHEET, [3, 9], arr);
}