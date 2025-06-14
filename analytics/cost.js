function reportExpCategories(importAll, ...args) 
{
  let categories = Util.MAIN_CAT_DATABASE;

  let arr = [];
  for(let i = 3; i < categories.length; i++)
    if(args.includes(categories[i][0]) || args.includes(i - 2) || importAll)
      arr.push(categories[i][0]);
  return arr;
}

function expenses(apartment, month, excludeCategories=reportExpCategories(false, 13, 20), excludeBills=false, excludeExp=false)
{
  let bill = dataFilter(Util.MAIN_BIL_DATABASE, [0, apartment], [7, month, dateEqual]);
  let exp = dataFilter(Util.MAIN_EXP_DATABASE, [0, apartment], [6, month, dateEqual], [5, excludeCategories, (a, b) => { return !b.includes(a) } ]);

  let billTotal = 0, expTotal = 0;

  if(!excludeBills) bill.forEach(x => billTotal += x[2]);
  if(!excludeExp) exp.forEach(x => expTotal += x[2]);

  return billTotal + expTotal;
}

function getExpenses(apartment, month) { return dataFilter(Util.MAIN_EXP_DATABASE, [0, apartment], [6, month, dateEqual]); }

function companyExpenses(month = DATE(2024, 4), excluded=[])
{
  let apartments = dataFilter(Util.MAIN_APT_DATABASE, [0, "", (a, b) => a !== b && a !== Util.MAIN_APT_DATABASE[0][0]]);
  let exp = 0;

  apartments.forEach(x => exp += expenses(x[0], month, reportExpCategories(false, 13, 20), false, excluded.includes(x[0])));
  exp += expenses('Empresa', month, reportExpCategories(false, 12, 13, 20));

  return exp;
}

function adjustedExpenses(month=DATE(2024, 1), excluded=[])
{
  let commissionApartments = dataFilter(Util.MAIN_APT_DATABASE, [4, "", (a, b) => a !== b]);
  let rentedApartments = dataFilter(Util.MAIN_APT_DATABASE, [4, "", (a, b) => a === b]);

  let commissionedExpenses = 0, rentedExpenses = 0, companyExpenses = 0;

  commissionApartments.forEach(x => { if(typeof x[4] === 'number') commissionedExpenses += expenses(x[0], month, reportExpCategories(false, 1, 3, 8, 12, 13), true);} );
  rentedApartments.forEach(x => { if(x[0] !== '') rentedExpenses += expenses(x[0], month, reportExpCategories(false, 13, 20), false, excluded.includes(x[0]));} )
  companyExpenses = expenses("Empresa", month, reportExpCategories(false, 12, 13, 20));

  let naExp = expenses("N/A", month, reportExpCategories(false, 12, 13, 20));

  return commissionedExpenses + rentedExpenses + companyExpenses + naExp; //<! REMOVE !>
}

function expensesByCategory(month=DATE(2024, 1), excludedApts=[])
{
  let arr = [];
  let categories = reportExpCategories(true);
  let excluded = ["Dividendo BestStay", "Impostos", "Investimento"];

  let total = 0;
  for(let i in categories)
  {
    let catTotal = 0;
    let exp = dataFilter(Util.MAIN_EXP_DATABASE, [5, categories[i]], [6, month, dateEqual], [0, excludedApts, (a, b) => !b.includes(a)]);
    
    if(categories[i] == "Contas")
    {
      let bill = dataFilter(Util.MAIN_BIL_DATABASE, [0, "", (a, b) => a !== b && a !== Util.MAIN_BIL_DATABASE[0][0]], [6, month, dateEqual]);
      bill.forEach(x => catTotal += x[2]);
    }

    exp.forEach(x => { if(typeof x[2] === "number") catTotal += x[2]; } );
    arr.push(catTotal);

    if(excluded.includes(categories[i])) continue;
    total += catTotal;
  }

  arr.push(total);

  return arr;
}

function companyExpensesByCategory(month=DATE(2024, 3))
{
  let arr = [];
  let categories = reportExpCategories(true);

  let excluded = ["Dividendo BestStay", "Impostos", "Investimento"];

  let total = 0;
  for(let i in categories)
  {
    let catTotal = 0;
    let exp = dataFilter(Util.MAIN_EXP_DATABASE, [0, "Empresa"], [5, categories[i]], [6, month, dateEqual]);
    
    if(categories[i] == "Contas")
    {
      let bill = dataFilter(Util.MAIN_BIL_DATABASE, [0, "Empresa"], [6, month, dateEqual]);
      bill.forEach(x => catTotal += x[2]);
    }

    exp.forEach(x => { if(typeof x[2] === "number") catTotal += x[2]; } );
    arr.push(catTotal);

    if(excluded.includes(categories[i])) continue;
    total += catTotal;
  }

  arr.push(total);

  return arr;
}

function operationalExpenses(month=DATE(2024, 1))
{
  let categories = reportExpCategories(false, "Brindes", "Manutenção", "Produtos Limpeza", "Pessoal Limpeza", "Pessoal BestStay", "Transporte", "Lavanderia", "Marketing", "Estoque", "Assinaturas");

  let expenseDatabase = Util.MAIN_EXP_DATABASE;
  expenseDatabase.shift();

  let total = 0;
  for(let i in categories)
  {
    let catTotal = 0;
    let exp = dataFilter(expenseDatabase, [5, categories[i]], [6, month, dateEqual]);
    
    exp.forEach(x => { if(typeof x[2] === "number") catTotal += x[2]; } );
    total += catTotal;
  }

  return total;
}