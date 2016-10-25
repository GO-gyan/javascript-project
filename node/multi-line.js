var fs = require("fs");
const readline = require('readline');
var fileName = "../resources/csv/Indicators.csv";

var dataArr = [], csvObjArr = [], jsonObjArr = [];
function CSVObj(countryName, countryCode, indicatorName, indicatorCode, year, values) {
  this.countryName = countryName;
  this.countryCode = countryCode;
  this.indicatorName = indicatorName;
  this.indicatorCode = indicatorCode;
  this.year = year;
  this.values = values;
};

function JSONObj(year, indicator, averageValue) {
  this.year = year;
  this.indicator = indicator;
  this.averageValue = averageValue;
}

var indicatorCode1 = ['SP.DYN.CBRT.IN', 'SP.DYN.CDRT.IN'];

const rl = readline.createInterface({
  input: fs.createReadStream(fileName),
  output: process.stdout,
  terminal: false
});

function findAverage(sum, count) {
    average = sum/count;
    //console.log(average+'::'+sum+'::'+count);
}
function createJSONObject(yer, indicator, average) {
    var obj = new JSONObj(year, indicator, average);
    jsonObjArr.push(obj);
}

var counter = 0, count, sum, average = 0, indicator = '', year = '';
rl.on('line', function(line) {
  if(counter === 0){
    dataArr = line;
  }else {
    if(line.indexOf('IND') !==-1) {
      for(var i = 0; i < indicatorCode1.length; i++) {
        if(line.indexOf(indicatorCode1[i]) !==-1) {
          var texts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
          var obj = new CSVObj(texts[0], texts[1], texts[2], texts[3], texts[4], texts[5]);
          csvObjArr.push(obj);
        }
      }
    }
  }
  counter++;
});

rl.on('close', function() {

  for(var y=0; y < indicatorCode1.length; y++){
    for(var x=1960; x < 2015; x++) {
      count = 0;
      sum = 0;
      for(var z=0; z < csvObjArr.length; z++) {
        if((csvObjArr[z].year == x) && (csvObjArr[z].indicatorCode === indicatorCode1[y])) {
          count++;
          sum = sum + Number.parseInt(csvObjArr[z].values);
          year = csvObjArr[z].year;
        }
      }
      if((sum !== 0 && sum !== undefined) && (count !== 0 && count !== undefined)){
        findAverage(sum, count);
      }
      if((year !== null && year !== undefined) && (indicatorCode1[y] !== null && indicatorCode1[y] !== undefined) && (average !== 0 && average !== undefined) && (sum !== 0 && sum !== undefined) && (count !== 0 && count !== undefined)) {
        createJSONObject(year, indicatorCode1[y], average);
      }
    }

  }

  var json = JSON.stringify(jsonObjArr);
  fs.writeFile('../resources/json/multi-line.json', json, 'utf-8');
});
