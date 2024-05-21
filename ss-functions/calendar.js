function formatResCalendar(apt, month)
{
  let data = splitRes(apt, month);
  let cdata = getReservations(apt, month);
  let days = daysInMonth(month);

  let c_arr = [];
  let arr = [];
  
  arr.push(["Data", "Dia", "Hóspede", "Hóspedes", "Diária", "Descrição"]);

  c_arr.push(["Reservas Canceladas", "", "", "", "", ""]);
  c_arr.push(blankRow(6));
  c_arr.push(["Data", "Hóspede", "", "", "Valor", ""]);
  let c_len = c_arr.length;

  let index = 0;
  for(let i = 0; i < days; i++) 
  {
    let day = incrementDate(month, i);

    if(data.length > 0 && dateEqual(day, data[index][4]))
    {
      arr.push([day, WEEKDAY[day.getDay()], data[index][1], data[index][2], data[index][3], data[index][5]]); 
      if(index < data.length - 1) index++;
      continue;
    }

    arr.push([day, WEEKDAY[day.getDay()], "", "", "", ""]); 
  }
  arr.push(blankRow(6));

  for(let i in cdata)
  {
    if(!cdata[i][8] || cdata[i][6].getTime() < month.getTime()) continue;
    c_arr.push([cdata[i][6], cdata[i][1], "", "", cdata[i][3], ""]);
  }

  if(c_arr.length > c_len)
  {
    c_arr.push(blankRow(6));
    arr = arr.concat(c_arr);
  }

  return arr;
}

function blankRow(n) { let arr = []; for(let i = 0; i < n; i++) arr.push(""); return arr; }