function EBITDA(apartment, month)
{
  return revenue(apartment, month) - expenses(apartment, month);
}

function companyEBITDA(month = DATE(2024, 1))
{
  let revenue = companyRevenue(month);
  let expenses = companyExpenses(month);

  return revenue - expenses;
}

function adjustedEBITDA(month=DATE(2024, 1))
{
  let revenue = adjustedRevenue(month);
  let expenses = adjustedExpenses(month);

  return revenue - expenses;
}