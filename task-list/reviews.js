var label = GmailApp.getUserLabelByName("Reviews BestStay");
var archiveLabel = GmailApp.getUserLabelByName("Reviews BestStay - Archive");

function parseEmails() {
  let threads = label.getThreads();
  handleData(threads);
}

function handleData(threads)
{
  let arr = [];
  let indices = [];
  for (let i = 0; i < threads.length; i++) {
    let message = threads[i].getMessages()[0];

    let dataList = parseReview(message, message.getDate());

    if(!!dataList)
      arr.push(dataList);

    indices.push(i);
  }

  if(arr.length > 0)
    APPEND_ARRAY(REVIEW_SHEET, [REVIEW_SHEET.getLastRow() + 1, 1], arr);

  sortReviewSheet();

  for(let i in indices)
    threads[indices[i]].addLabel(archiveLabel).removeLabel(label);
}

function parseReview(message, date)
{
  let msg = message.getPlainBody();
  let test = msg.match(/(?<=FEEDBACK SOBRE A ESTADIA)([\r\n]+([^\r\n]+)){3}/)[0].split('\n');

  let title = test[2].trim();

  let dates = test[4].trim().split(' – ');
  let ci = dates[0], co = dates[1];
    
  let co_month = co.match(/\w+\./)[0];
  let ci_month = !ci.match(/\w+\./) ? co_month : ci.match(/\w+\./)[0];
    
  let co_dayYear = co.match(/\d+/g);
  let ci_dayYear = ci.match(/\d+/g);
    
  co = [Number(co_dayYear[0]), MONTHS[co_month], Number(co_dayYear[1])]
  ci = [Number(ci_dayYear[0]), MONTHS[ci_month], Number((!ci_dayYear[1] ? co_dayYear[1] : ci_dayYear[1]))]

  let co_date = DATE(co[2], co[1], co[0]);
  let ci_date = DATE(ci[2], ci[1], ci[0]);

  let rating = Number(message.getPlainBody().match(/(?<=AVALIAÇÃO GERAL).*/)[0].trim());
  let apartment = LISTING_TITLES[title];
  if(apartment === undefined)
  {
    Logger.log(title);
    return null;
  }

  return [apartment, ci_date, co_date, date, rating];
}

function reviewExists(res)
{
  let reveiewData = DATA_FILTER(REVIEW_DATA, [0, res[4]]);

  for(let i in reveiewData)
  {
    let current = reveiewData[i];
    if(DATE_EQUAL(current[1], res[1]) 
    && DATE_EQUAL(current[2], res[2]))
      return true;
  }

  return false;
}

function sortReviewSheet()
{
  let range = REVIEW_SHEET.getRange(2, 1, REVIEW_SHEET.getLastRow() - 1, REVIEW_SHEET.getLastColumn());
  range.sort([{column: 4, ascending: false}]);
}