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