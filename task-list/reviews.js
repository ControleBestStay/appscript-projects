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

  let dates = test[4].trim().split('–');
  let ci = dates[0].split('de');
  let co = dates[1].split('de');

  let co_day = Number(co[0].trim());
  let co_month = MONTHS[co[1].trim()];
  let co_year = Number(co[2].trim());

  let ci_day = !!ci[0] ? Number(ci[0].trim()) : Number(ci.trim());
  let ci_month = !!ci[1] ? MONTHS[ci[1].trim()] : co_month;
  let ci_year = !!ci[2] ? Number(ci[2].trim()) : co_year;

  let co_date = DATE(co_year, co_month, co_day);
  let ci_date = DATE(ci_year, ci_month, ci_day);

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