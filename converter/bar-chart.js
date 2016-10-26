var fs = require("fs");
const readline = require('readline');
var fileName = "../resources/csv/Indicators.csv";

var dataArr = [], csvObjArr = [], jsonObjArr = [], code = new Set();
var count, sum, average, countryName, codeOfCountry;
function CSVObj(countryName, countryCode, indicatorName, indicatorCode, year, values) {
  this.countryName = countryName;
  this.countryCode = countryCode;
  this.indicatorName = indicatorName;
  this.indicatorCode = indicatorCode;
  this.year = year;
  this.values = values;
};

function JSONObj(countryName, averageValue) {
  this.countryName = countryName;
  this.averageValue = averageValue;
}

const rl = readline.createInterface({
  input: fs.createReadStream(fileName),
  output: process.stdout,
  terminal: false
});

var counter = 0;
rl.on('line', function(line) {
  if(counter === 0){
    dataArr = line;
  }else {
    if(line.indexOf('SP.DYN.LE00.IN') !==-1) {
      var texts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
      var obj = new CSVObj(texts[0], texts[1], texts[2], texts[3], texts[4], texts[5]);
      csvObjArr.push(obj);
    }
  }
  counter++;
});

function findAverage(sum, count) {
    average = sum/count;
    //console.log('Count::'+count+'\n');
}
function createJSONObject(countryName, average, codeOfCountry) {
    //console.log(sum+'==>'+average);
    var obj = new JSONObj(countryName, average);
    jsonObjArr.push(obj);
    code.add(codeOfCountry);
}
rl.on('close', function () {

  for(var i = 0; i < csvObjArr.length; i++) {
    count = 0;
    sum = 0;
    for(var j = 1; j < csvObjArr.length; j++) {
      if((csvObjArr[i].countryCode === csvObjArr[j].countryCode) && !(code.has(csvObjArr[j].countryCode))) {
        count++;
        sum = sum + Number.parseFloat(csvObjArr[j].values);
        countryName = csvObjArr[j].countryName;
        codeOfCountry = csvObjArr[j].countryCode;
      }
    }
    if((sum !== 0 && sum !== undefined) && (count !== 0 && count !== undefined)){
      findAverage(sum, count);
    }
    if((countryName !== undefined && countryName !== null) && (average !== undefined && average !== 0) && (sum !== undefined && sum !== 0) && (count !== undefined && count !== 0) && (codeOfCountry !== undefined && codeOfCountry !== null)) {
      createJSONObject(countryName, average, codeOfCountry);
    }

  }
  jsonObjArr.sort(function(a, b) {
    var value1 = a['averageValue'];
    var value2 = b['averageValue'];
    return value2-value1;
  });
  var finalObject = jsonObjArr.slice(0, 5);
  var json = JSON.stringify(finalObject);
  fs.writeFile('../resources/json/bar-chart.json', json, 'utf-8');
});
