const getPennyFormat = (val) => {
  const str = parseFloat(val).toFixed(2);
  const array = str.split('.');
  let result = "";
  if (array[0] === '0') {
    result = array[1];
    if (result[0] === '0') {
      result = result[1] + result[0];
    }
  } else {
    result = array[0] + array[1];
  }
  return result;
};

module.exports = {
  getPennyFormat
};
