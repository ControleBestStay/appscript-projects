function sectionRow(month, ...args)
{
  let arr = {};

  arr["DATE"] = new Date(month);
  for(let i = 0; i < args.length; i++)
  {
    if(typeof args[i] === 'function') arr[args[i].name] = args[i](month);
    else if(typeof args[i] === 'object') arr['fn' + i] = args[i][0](arr);
  }

  return arr;
}

function sectionApartment()
{
  let month = new Date(COMPANY_START);

  let months = []
  while(!dateEqual(month, ANALYSIS_LAST_MONTH))
  {
    months.push(new Date(month));
    month.setMonth(month.getMonth() + 1);
  }

  let apartments = dataFilter(Util.MAIN_APT_DATABASE, [0, "", (a, b) => a !== b && a !== Util.MAIN_APT_DATABASE[0][0]]); 
  let categories = [occupancy, dailyRate, revenue, expenses, EBITDA];

  let categoryFunctionNames = {};
  categoryFunctionNames[occupancy] = "Ocupação", categoryFunctionNames[dailyRate] = "Ticket Médio", 
  categoryFunctionNames[revenue] = "Receita", categoryFunctionNames[expenses] = "Despesas", 
  categoryFunctionNames[EBITDA] = "EBITDA";

  let rows = [];

  for(let i in apartments)
    for(let j in categories)
      rows.push([apartments[i][0], categories[j], ""]);

  let aptData = Util.MAIN_APD_DATABASE;
  for(let i in rows)
  {
    let inner = []
    for(let j in months)
    {
      let apartmentData = dataFilter(aptData, [0, rows[i][0]])[0];

      let firstMonth = apartmentData[1];
      let monthDeactivated = apartmentData[5]; 

      let hasNotLaunched = firstMonth == "" ? false : firstMonth.getTime() > months[j].getTime();
      let wasDeactivated = monthDeactivated == "" ? false : monthDeactivated.getTime() < months[j].getTime();

      if(apartmentData[2] == "" || hasNotLaunched || wasDeactivated) { inner.push(""); continue; }

      inner.push(rows[i][1](rows[i][0], months[j]));
    }
    rows[i].push(...inner);
    rows[i][1] = categoryFunctionNames[rows[i][1]];
    rows[i][2] = rows[i][0] + rows[i][1];
  }

  APPEND_ARRAY(Util.MAIN_APTANL_SHEET, [1, 4], [months]);
  APPEND_ARRAY(Util.MAIN_APTANL_SHEET, [3, 1], rows);
}

function sectionCompany()
{
  let arr = [];
  let month = new Date(COMPANY_START);

  let ac = {}
  ac[companyRevenue.name] = 0;
  ac[companyExpenses.name] = 0;
  ac[companyEBITDA.name] = 0;
  ac[adjustedRevenue.name] = 0;
  ac[adjustedExpenses.name] = 0;
  ac[adjustedEBITDA.name] = 0;

  while(!dateEqual(month, CURRENT_MONTH))
  {
    let inner = []

    let row = sectionRow(month,
    COMPANY_OCCUPANCY, COMPANY_DAILY_RATE, 
    companyRevenue, adjustedRevenue, 
    companyExpenses, adjustedExpenses, 
    companyEBITDA, [(x) => x[companyEBITDA.name]/x[companyRevenue.name]], 
    adjustedEBITDA,[(x) => x[adjustedEBITDA.name]/x[adjustedRevenue.name]]
    )

    for(let i in row) inner.push(row[i]);
    for(let i in ac) { ac[i] += row[i]; inner.push(ac[i])}

    let operationalMargin = operationalExpenses(month)/row[companyRevenue.name];
    let operationalMarginAdjusted = operationalExpenses(month)/row[adjustedRevenue.name];

    inner = (inner.concat(expensesByCategory(month))).concat(companyExpensesByCategory(month));
    inner.push(operationalExpenses(month));
    inner.push(operationalMargin)
    inner.push(operationalMarginAdjusted);
    inner.push(apartmentCount(month));
    inner.push(averageStayLength(month));

    arr.push(inner);

    month.setMonth(month.getMonth() + 1);
  }

  APPEND_ARRAY(Util.MAIN_ANL_SHEET, [3, 1], arr);
}