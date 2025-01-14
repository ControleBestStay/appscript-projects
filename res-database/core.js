function sendEmailWarning(emailData, subj = "Nova reserva para os próximos 10 dias - ")
{
  let recipient = "controlebeststay@gmail.com";
  let subject = subj + emailData.guestName;
  let body = emailData.body;

  MailApp.sendEmail(recipient, subject, body);
}

function handleData (threads) {
  for (let i = 0; i < threads.length; i++) {
    let message = threads[i].getMessages()[0];

    let dataList = parseMessageStays(message);
    if (!!dataList)
      printData (dataList,  dataBaseSheet);

    threads[i].addLabel(archiveLabel).removeLabel(label);
  }
}

function parseMessageStays(message)
{
  let isValid = !!message.getPlainBody().match(/(?<=\*)[^* ]*/);

  if (!isValid) return null;

  let emailData = { body:   "NULL", apartment: "NULL",    guestName: "NULL",
                    rate:   "NULL",   numDays: "NULL", numberGuests: "NULL",
                    dateIn: "NULL",   dateOut: "NULL",      website: "NULL",
                    resID:  "NULL", creationDate: "NULL", total: "NULL" }

  emailData.body         =                                                  message.getPlainBody();
  emailData.guestName    =                     emailData.body.match(/(?<=Nome do Hóspede: ).*/)[0];
  emailData.numDays      =          parseInt(emailData.body.match(/(?<=Número de Noites: ).*/)[0]);
  emailData.numberGuests =           emailData.body.match(/(?<=Número de Hóspedes: ).*/)[0].trim();
  emailData.apartment    =                          emailData.body.match(/(?<=Acomodação: ).*/)[0].replace("v2", "");
  emailData.website      =                      emailData.body.match(/(?<=Canal de Venda: ).*/)[0];
  emailData.resID        =                      emailData.body.match(/(?<=A Reserva ).*?(?= )/)[0];
  emailData.creationDate = new Date(message.getDate().setHours(0, 0, 0, 0));

  if(emailData.guestName.slice(-1)==" ") emailData.guestName = emailData.guestName.slice(0, -1);

  switch(emailData.website)
  {
    case "API airbnb": emailData.website = "Airbnb"; break;
    case "API booking.com": emailData.website = "Booking"; break;
    default: emailData.website = "Stays"; break;
  }

  let comValid = !!emailData.body.match(/(?<=Comissão do Canal:R\$ ).*/);

  let totalAmount = emailData.body.match(/(?<=Valor Total da Reserva: R\$ ).*/)[0];
  let commission = comValid ? emailData.body.match(/(?<=Comissão do Canal:R\$ ).*/)[0] : 0;

  let arr_ = totalAmount.split(",");
  arr_[0] = arr_[0].replace('.', '')
  let total = parseFloat(arr_[0]) + (parseInt(arr_[1]) / 100);

  if(comValid)
  {
    arr_ = commission.split(",");
    arr_[0] = arr_[0].replace('.', '')
  }
  let com = comValid ? parseFloat(arr_[0]) + (parseInt(arr_[1]) / 100) : 0;
  total -= com
  emailData.total = total;

  emailData.rate = (total / emailData.numDays).toLocaleString("pt-BR", {minimumFractionDigits: 3, maximumFractionDigits: 3});

  let arr = (emailData.body.match(/(?<=Período da Estadia: ).*/)[0].replace("de ", "")).split(" a ");
  let arrIn = arr[0].split(" "); let arrOut = arr[1].split(" ");

  let months = {};
  months["jan"] =  1; months["fev"] =  2; months["mar"] =  3;
  months["abr"] =  4; months["mai"] =  5; months["jun"] =  6;
  months["jul"] =  7; months["ago"] =  8; months["set"] =  9;
  months["out"] = 10; months["nov"] = 11; months["dez"] = 12;

  emailData.dateIn  = Utilities.formatDate(new Date(parseInt(arrIn [2]), months[arrIn [1]] - 1, parseInt(arrIn [0])), "GMT-3", "dd/MM/yyyy");
  emailData.dateOut = Utilities.formatDate(new Date(parseInt(arrOut[2]), months[arrOut[1]] - 1, parseInt(arrOut[0])), "GMT-3", "dd/MM/yyyy");

  let resGap = numberOfDays(emailData.dateIn) - today;

  switch(true)
  {
    //case resGap >= 2 && resGap <= 10: sendEmailWarning(emailData); break;
    case resGap == 1: sendEmailWarning(emailData, "!IMPORTANTE! Nova reserva para AMANHÃ - "); break;
    case resGap == 0: sendEmailWarning(emailData, "!IMPORTANTE! Nova reserva para HOJE - "); break;
  }

  return [emailData.apartment, emailData.guestName, emailData.numberGuests, emailData.total, "=D:D/I:I",
          "=sum(ifna(filter(BasePagamentos!C:C; BasePagamentos!A:A=indirect(address(row();1)); BasePagamentos!B:B=indirect(address(row();2)); (BasePagamentos!E:E<>BasePagamentos!$L$2) * (BasePagamentos!E:E<>BasePagamentos!$L$3) * (BasePagamentos!E:E<>BasePagamentos!$L$4))))", emailData.dateIn, emailData.dateOut, "=DATEDIF(G:G; H:H; \"d\")", emailData.creationDate,
          "=G:G - DAY(G:G) + 1", emailData.website, emailData.resID, ""];
}

function printData(data, sheet)
{
  sheet.appendRow(data);
}