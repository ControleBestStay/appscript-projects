function handleValidationData () {
  let threads = validationLabel.getThreads();
  let log = [];

  for (let i = 0; i < threads.length; i++) {
    let messages = threads[i].getMessages();
    let message = "";

    for(let j = 0; j < messages.length; j++)
    {
      let valid = !!messages[j].getPlainBody().match(/cancelado/);

      if(valid) 
      { 
        message = messages[j];
        break;
      }
    }
    parse(message, log);
  }

  validate(log);
}

function parse(message, log)
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

  log.push([emailData.apartment, emailData.guestName, emailData.numberGuests, emailData.total, emailData.dateIn, emailData.dateOut, emailData.creationDate, emailData.website, emailData.resID]);
}

function validate(log) 
{
  let data = dataFilter(dataBaseSheet.getDataRange().getValues(), [13, true]);
  let logsheet = ss.getSheetByName("LogCancelamentos");

  for (let i in data)
  {
    for (let j in log)
    {
      if(data[i][12] === log[j][8])
      {
        if(data[i][3] !== log[j][3])
        {
          logsheet.appendRow([
            data[i][0],
            data[i][1],
            data[i][2],
            data[i][3],
            data[i][6],
            data[i][7],
            data[i][9],
            data[i][11],
            data[i][12],
            ]);
          logsheet.appendRow(log[j]);
        }
      }
    }
  }
}




























