function importR()
{
  let data = inhouseSDSheet.getDataRange().getValues();

  let iData = [[],[],[]]
  for(let i = 0; i < data.length; i++)
  {
    let rowArrs = [[], [], []];
    for(let j = 0; j < data[0].length; j++)
    {
      if(j <= 3) rowArrs[0].push(data[i][j]);
      else if(j > 3 && j <=  7) rowArrs[1].push(data[i][j]);
      else if(j > 7 && j <= 11) rowArrs[2].push(data[i][j]);
    }
    iData[0].push(rowArrs[0]);
    iData[1].push(rowArrs[1]);
    iData[2].push(rowArrs[2]);
  }

  for(let i = 0; i < iData.length; i++)
  {
    let range = inhouseSheet.getRange(3, 3 + 5 * i, iData[i].length, 4);
    range.setValues(iData[i]);
  }
}

function fillDict() 
{
  let data = inhouseHistorySheet.getDataRange().getValues();

  for(let i = data.length - 1; i > 1; i--)
  {
    if(data[i][1] == "") continue;
    issueDict[data[i][1]] = [data[i][4]];
  }
}

function updateCheckBoxes()
{
  let data = inhouseSheet.getDataRange().getDisplayValues();

  let boxArrs = [];
  for(let i = 0; i < data[0].length; i++) { if((i - 1) % 5 == 0) boxArrs.push([]); }
  
  for(let i = 4; i < data.length; i++) //Y
    for(j = 1; j < data[i].length; j++) //X
      if((j - 1) % 5 == 0) {
        let apt   = data[i][j + 3],
            guest = data[i][j + 4];
        let tag = apt + "." + guest;
        
        if(!!issueDict[tag]) boxArrs[(j - 1)/5].push([issueDict[tag]]);
        else boxArrs[(j - 1)/5].push([""]); 
      }
  for(let k = 1; k < data[0].length; k++)
    if((k - 1) % 5 == 0)
    {
      let range = inhouseSheet.getRange(5, k + 1, boxArrs[(k - 1)/5].length);
      range.setValues(boxArrs[(k - 1)/5]);
    }
}