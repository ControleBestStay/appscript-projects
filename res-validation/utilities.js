var CURRENT_MONTH = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
var END_MONTH = new Date(new Date().getFullYear(), new Date().getMonth() + 3, 1);

function date(y = new Date().getFullYear(), m = 1, d = 1) { return new Date(y, m - 1, d); }
function dateEqual(a, b) { return a.getTime() === b.getTime(); }

function APPEND_ARRAY(targetSheet, coord, array) { targetSheet.getRange(coord[0], coord[1], array.length, array[0].length).setValues(array); }

//Data filtering
/**
 * Generic data filter for 2D arrays.
 * @param {any[]} arr
 * @param {((string | number)[] | (number | Date | ((a: any, b: any) => boolean))[])[]} args
 */
function dataFilter(arr, ...args) // [index, data] or [index, data, function]
{
  return arr.filter((row) => { 
      for (let i in args)
        if((args[i].length > 2) ? 
            !args[i][2](row[args[i][0]], args[i][1]) : 
            row[args[i][0]] != args[i][1]) 
            return false; 
      return true;
    }
  );
}