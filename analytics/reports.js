//EXPENSES================================================================================
function formatExpenses(month, ...args)
{
  let expenseTable = [];
  let aptProfits = {};

  for(let i in args)
  {
    let apartment = args[i];

    let bill = getApartmentBills(apartment, month);
    let exp = getApartmentExpenses(apartment, month, reportExpCategories(false, 1, 3, 6, 7), bill.length);

    let arr = []
    if(args.length > 1) 
    { 
      arr.push([getApartmentData(apartment)[1], "", "", "", "", ""]);
      arr.push(blankRow(6))
    }
    arr.push(["Item", "Categoria", "Descrição", "","", "Valor"]);

    let rev = revenue(apartment, month);
    arr.push([".", "Receita", "Total Recebido", "","",rev]); 

    arr = arr.concat(bill, exp);

    let total = 0;
    for (let j = arr.length - (bill.length + exp.length); j < arr.length; j++) total += arr[j][5];

    let profit = rev - total;
    aptProfits[getApartmentData(apartment)[1]] = profit;

    arr.push([".", "Total", "Depósito Proprietário", "","",profit]); 

    arr.push(blankRow(6))

    expenseTable = expenseTable.concat(arr);
  }

  if(args.length > 1)
  {
    expenseTable.push(["Resumo", "", "","","", ""]);
    expenseTable.push(blankRow(6));
    expenseTable.push(["Item", "Categoria", "Apartamento","","", "Valor"]);

    let total = 0;
    let index = 1;

    for (const [key, value] of Object.entries(aptProfits))
    { expenseTable.push([index, "Lucro", key, "","",value]); index++; total += value; }

    expenseTable.push([".", "Lucro ", "Total", "","",total]);
    expenseTable.push(blankRow(6));
  }

  return expenseTable;
}

function getApartmentExpenses(apartment, month, categories, expIndex = 0)
{
  let exp = dataFilter(Util.MAIN_EXP_DATABASE, [0, apartment], [6, month, dateEqual], [5, categories, (a, b) => { return b.includes(a) } ]);
  let arr = []

  for (let i = 0; i < exp.length; i++) arr.push([expIndex + (i + 1), "Despesa", exp[i][1],"","", exp[i][2]]);

  return arr;
}

function getApartmentBills(apartment, month)
{
  Logger.log(apartment)
  Logger.log(month)
  let exp = dataFilter(Util.MAIN_BIL_DATABASE, [0, apartment], [3, month, dateInMonth]); //or 3, month, dateInMonth for date of payment

  let arr = []

  for (let i = 0; i < exp.length; i++) arr.push([i + 1, "Despesa Fixa", exp[i][1] + " - " + exp[i][5],"","", exp[i][2]]);
  let commissionPercentage = getApartmentData(apartment)[4];
  let commission = revenue(apartment, month) * commissionPercentage;

  arr.push([exp.length + 1, "Despesa Fixa", "Comissão - " + (commissionPercentage * 100).toFixed(2) + "%","","", commission]);

  return arr;
}

//SUMMARY=================================================================================
function getApartmentReviews(apartment)
{
  let revList = Util.MAIN_REVIEW_DATABASE;
  for(let i = 0; i < revList.length; i++)
    if(revList[i][0]===apartment) return {reviews:revList[i][1], rating:revList[i][2]};
}

function getApartmentSummary(apartment, month, header = true)
{
  let summary = [];
  if(header) summary.push(["Unidade",	"Receita", "Ocupação", "Diária", "Avaliações", "Nota"]);

  let reviewData = getApartmentReviews(apartment);
  let data = getApartmentData(apartment);
  summary.push([data[0].match(/\d+[A-Z]?(?=\D*$)/)[0], 
                            revenue(apartment, month).toLocaleString("pt-BR", {minimumFractionDigits: 2, maximumFractionDigits: 2}),
                            ((occupancy(apartment, month) * 100).toFixed(2) + "%").replace('.', ','),
                            dailyRate(apartment, month).toLocaleString("pt-BR", {minimumFractionDigits: 2, maximumFractionDigits: 2}), 
                            "'" + reviewData.reviews, 
                            reviewData.rating + "/5.0"]);
  summary.push(blankRow(6));

  return summary;
}

//RESERVATIONS============================================================================
function formatResCalendar(apt, month)
{
  let data = splitRes(apt, month);
  let cdata = getReservations(apt, month);
  let days = daysInMonth(month);

  let c_arr = [];
  let arr = [];

  arr = arr.concat(getApartmentSummary(apt, month, true));
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
      arr.push([day, WEEKDAY[day.getDay()], data[index][1], "'" + data[index][2], data[index][3], data[index][5]]); 
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

function getReservations(apartment, month)
{
  let reservations = dataFilter(Util.MAIN_RES_DATABASE, [0, apartment]);

  let reservationsMonth = [];

  for (let i = 0; i < reservations.length; i++)
  {
    if(dateEqual(reservations[i][10], month) ||
       dateEqual(reservations[i][14], month)  ||
       dateBetween(reservations[i][10], month, reservations[i][14]))
    {
      reservationsMonth.push([
        reservations[i][0], reservations[i][1], reservations[i][2], reservations[i][3],
        reservations[i][4], reservations[i][5], reservations[i][6], reservations[i][7],
        reservations[i][13] == "" ? false : reservations[i][13]
        ]);
    }
  }

  return reservationsMonth;
}

//Drive

function folderHasFile(folder, name)
{
  let files = folder.getFiles();
  while(files.hasNext())
  {
    let file = files.next();
    if(file.getName() == name) return true;
  }
  return false;
}

function templateCopy(ts, name, folder)
{
  let tsID = DriveApp.getFileById(ts.getId());
  let copy = tsID.makeCopy(name, folder);
  return copy.getId();
}

function createSheet(sheet_, apartment, month)
{
  let ds = sheet_.getSheetByName("data");

  let indexProp = ds.getRange(1, 2).getValue();
  let indexRes = ds.getRange(2, 2).getValue();
  let indexExp = ds.getRange(3, 2).getValue();
  let indexNRes = ds.getRange(4, 2).getValue();

  let addresses = [];
  for(let i in apartment)
  {
    addresses.push(getApartmentData(apartment[i])[1]);
  }

  let prop = [[getApartmentData(apartment[0])[3], month, addresses.join(", ")]];

  let res = []
  for (let i in apartment) res = res.concat(formatResCalendar(apartment[i], month))
  Logger.log(apartment);
  let exp = formatExpenses(month, ...apartment);

  let nres = []
  for (let i in apartment) nres = nres.concat(formatResCalendar(apartment[i], CURRENT_MONTH));

  APPEND_ARRAY(ds, [2, indexProp], prop);
  APPEND_ARRAY(ds, [3, indexRes], res);
  APPEND_ARRAY(ds, [3, indexExp], exp);
  APPEND_ARRAY(ds, [3, indexNRes], nres);
}

/**
 * Creates a PDF for the customer given sheet.
 * @param {string} ssId - Id of the Google Spreadsheet
 * @param {object} sheet - Sheet to be converted as PDF
 * @param {string} pdfName - File name of the PDF being created
 * @return {file object} PDF file as a blob
 */
function createPDF(ssId, sheet_, pdfName) {
  const fr = 1, fc = 1, lc = 7, lr = sheet_.getDataRange().getLastRow() - 1;
  const height = GET_DIMENSIONS(sheet_)[1];

  const url = "https://docs.google.com/spreadsheets/d/" + ssId + "/export" +
    "?format=pdf&" +
      "size=5.5x" + height + "&" +
        "fzr=true&" +
          "portrait=true&" +
            "fitw=true&" +
              "gridlines=false&" +
                "printtitle=false&" +
                  "top_margin=0.1&" +
                    "bottom_margin=0.1&" +
                      "left_margin=0.1&" +
                        "right_margin=0.1&" +
                          "sheetnames=false&" +
                            "pagenum=UNDEFINED&" +
                              "attachment=true&" +
                                "gid=" + sheet_.getSheetId() + '&' +
                                  "r1=" + fr + "&c1=" + fc + "&r2=" + lr + "&c2=" + lc;

  const params = { method: "GET", headers: { "authorization": "Bearer " + ScriptApp.getOAuthToken() } };
  const blob = UrlFetchApp.fetch(url, params).getBlob().setName(pdfName + '.pdf');

  // Gets the folder in Drive where the PDFs are stored.
  const folder = DriveApp.getFolderById("1cND9Fkxl8S1vqnoCCz9fyqSvynxVbXnL");

  const pdfFile = folder.createFile(blob);
  return pdfFile;
}

function formatSections(sheet_)
{
  let data = sheet_.getRange(1, 2, sheet.getDataRange().getLastRow(), 6).getValues();

  let titles = ["Desempenho", "Melhorias e Manutenções", "Resultado Final do Período", "Próximo Mês"];

  for(let i = 0; i < data.length; i++)
  {
    if(titles.some(x => data[i].includes(x)))
    {
      sheet_.getRange(i + 1, 2, 1, data[i].length).setFontSize(24) //Section title row
                                                  .setBorder(false, false, true, false, false, false, null, SpreadsheetApp.BorderStyle.SOLID_MEDIUM)
                                                  .setHorizontalAlignment("left");
      sheet_.getRange(i + 1, 2).setHorizontalAlignment("center");   //Icon cell
    }

    if(i > 0 && (data[i][0] === "Unidade" || data[i - 1][0] === "Unidade"))
    {
      for(let j = 0; j < data[i].length; j++) sheet_.getRange(i + 1, 2 + j).setHorizontalAlignment("center");
    }

    if(data[i][0] === "Data" || WEEKDAY.includes(data[i][1]))
    {
      for(let j = 0; j < data[i].length; j++) sheet_.getRange(i + 1, 2 + j).setHorizontalAlignment("center");
      if(WEEKDAY.includes(data[i][1])) sheet_.getRange(i + 1, 4).setHorizontalAlignment("left");
    }
  }
}

















