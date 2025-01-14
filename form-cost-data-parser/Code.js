var ss = SpreadsheetApp.openById("1EGmmD_Y1wk-W4gBUiYxQYFGASDb7_tCSknXHep5Gh8Q");
var formSheet = ss.getSheetByName("Respostas");
var parseSheet = ss.getSheetByName("Parsed")

let data = filterParsed(formSheet.getDataRange().getValues());

function main() 
{
  data = filterParsed(data);
  let parsedArr = []
  for(let i in data)
  {
    parsedArr.push(...parseRow(data[i]));
  }
  let lastRowIndex = parseSheet.getLastRow();//parseSheet.getDataRange().getValues().length + 1;
  parseSheet.getRange("A" + (lastRowIndex + 1).toString() + ":J" + (lastRowIndex + parsedArr.length).toString()).setValues(parsedArr);
  lastRowIndex = formSheet.getDataRange().getValues().length;
  formSheet.getRange("K2:K" + lastRowIndex.toString()).setValue(true);
}

function filterParsed(arr)
{
  let filtered = [];
  
  for(let i = 0; i < arr.length; i++)
  {
    if(!arr[i][10])
       filtered.push(arr[i]);
  }

  return filtered;
}

/*
apt -> 7 A
desc -> 3 B
val -> 4 C
date -> 2 D 
"CartãoCredito" E
"BestStay" F
cat -> 9 G
date -> mm/yyyy H
receipt -> 8 I
*/ 

function parseRow(row)
{
  let data = [];

  let apt = row[7].trim().split(','),
      desc = row[3],
      val = formatValue(row[4].toString()),
      date = row[2],
      pmnt = "CartãoCredito",
      res = "BestStay",
      cat = "",
      month = "=D:D - DAY(D:D) + 1",
      receipt = row[8].replace(/,/g, '.'),
      link = row[9].replace(/,/g, '.')

  for(let i = 0; i < apt.length; i++)
  {
    if(apt[i] == "") break;
    let arr = [apt[i], desc, val/apt.length, date, pmnt, res, cat, month, receipt, link];
    data.push(arr);
  }

  return data;
}

function formatValue(value)
{
  if(!!value.match(/\./)) return parseFloat(value);
  if(!!value.match(/,/)) return parseFloat(value.replace(',', '.'));
  return (parseInt(value)/100) < 1 ? parseInt(value) : (parseInt(value)/100);
}