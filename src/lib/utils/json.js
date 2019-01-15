const charCodeDot = '0x2e'; // . Dec 46
const charCodeDollar = '0x24'; // $ Dec 36 
/**
 * A JSON parse reviver function to replace '.' and '$' characters
 * in JSON keys with their charCode (0x2e and 0x24); 
 * required to store objects in a Nedb Datasource
 * @param {*} k 
 * @param {*} v 
 */
function keyNameReviver(k, v) { // Important!: must not use arrow function
  if (/[\.\$]/.test(k)) {
    this[k.replace(/\./g, charCodeDot).replace(/\$/g, charCodeDollar)] = v;
    delete this[k];
    return;
  }
  return v;
};

module.exports = { keyNameReviver }
