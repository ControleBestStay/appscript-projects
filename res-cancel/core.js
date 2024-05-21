function sendEmailWarning(subject, message = "")
{
  let recipient = "reservas-aaaajixt25vshdcvizfr56w4rm@beststayrio.slack.com";

  MailApp.sendEmail(recipient, subject, message);
}

function handleData (threads) {
  for (let i = 0; i < threads.length; i++) {
    let message = threads[i].getMessages()[0];

    parseCancelMessage(message);

    threads[i].addLabel(archiveLabel).removeLabel(label);
  }
}

function parseCancelMessage(message)
{
  let isValid = !!message.getPlainBody().match(/(?<=\*)[^* ]*/);

  if (!isValid) return null;

  let emailData = { body: "NULL",guestName: "NULL", numDays: "NULL", resID: "NULL" }

  emailData.body         =                                                  message.getPlainBody();
  emailData.guestName    =                     emailData.body.match(/(?<=Nome do Hóspede: ).*/)[0];
  emailData.numDays      =          parseInt(emailData.body.match(/(?<=Número de Noites: ).*/)[0]);
  emailData.numberGuests =           emailData.body.match(/(?<=Número de Hóspedes: ).*/)[0].trim();
  emailData.resID        =                      emailData.body.match(/(?<=A Reserva ).*?(?= )/)[0];

  let totalAmount = emailData.body.match(/(?<=Valor Total da Reserva: R\$ ).*/)[0];
  let commission = emailData.body.match(/(?<=Comissão do Canal:R\$ ).*/)[0];

  let arr_ = totalAmount.split(",");
  arr_[0] = arr_[0].replace('.', '')
  let total = parseFloat(arr_[0]) + (parseInt(arr_[1]) / 100);

  arr_ = commission.split(",");
  arr_[0] = arr_[0].replace('.', '')
  let com = parseFloat(arr_[0]) + (parseInt(arr_[1]) / 100);

  total -= com;


  let arr = (emailData.body.match(/(?<=Período da Estadia: ).*/)[0].replace("de ", "")).split(" a ");
  let arrIn = arr[0].split(" "); let arrOut = arr[1].split(" ");

  let months = {};
  months["jan"] =  1; months["fev"] =  2; months["mar"] =  3;
  months["abr"] =  4; months["mai"] =  5; months["jun"] =  6;
  months["jul"] =  7; months["ago"] =  8; months["set"] =  9;
  months["out"] = 10; months["nov"] = 11; months["dez"] = 12;

  emailData.dateIn  = Utilities.formatDate(new Date(parseInt(arrIn [2]), months[arrIn [1]] - 1, parseInt(arrIn [0])), "GMT-3", "dd/MM/yyyy");
  emailData.dateOut = Utilities.formatDate(new Date(parseInt(arrOut[2]), months[arrOut[1]] - 1, parseInt(arrOut[0])), "GMT-3", "dd/MM/yyyy");

  purgeRes(emailData.resID, total);

  sendEmailWarning("Reserva cancelada com êxito - " + emailData.guestName, emailData.body);
}

function purgeRes(resID, total)
{
  let data = dataBaseSheet.getDataRange().getValues();


  for(let i = 1; i < data.length; i++)
  {
    if(data[i][12] == resID)
    {
      if (total > 0) 
      {
        dataBaseSheet.getRange(i + 1, 4).setValue(total);
        dataBaseSheet.getRange(i + 1, 5).setValue(total);
        dataBaseSheet.getRange(i + 1, 14).setValue(true);
        break;
      }
      else
      {
        dataBaseSheet.deleteRow(i + 1);
        break;
      }
    }
  }
}

















