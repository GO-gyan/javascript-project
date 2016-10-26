var fs = require("fs");
const readline = require('readline');
var fileName = "../resources/csv/Indicators.csv";

var dataArr = [], csvObjArr = [], jsonObjArr = [], code = new Set();
function CSVObj(countryName, countryCode, indicatorName, indicatorCode, year, values) {
  this.countryName = countryName;
  this.countryCode = countryCode;
  this.indicatorName = indicatorName;
  this.indicatorCode = indicatorCode;
  this.year = year;
  this.values = values;
};

function JSONObj(year, birthRate, deathRate) {
  this.year = year;
  this.birthRate = birthRate;
  this.deathRate = deathRate;
}

var indicatorCode1 = ['SP.DYN.CBRT.IN', 'SP.DYN.CDRT.IN'];

const rl = readline.createInterface({
  input: fs.createReadStream(fileName),
  output: process.stdout,
  terminal: false
});

function findAverage(sumB, countB, sumD, countD) {
    averageB = sumB/countB;
    averageD = sumD/countD;
    //console.log(average+'::'+sum+'::'+count);
}
function createJSONObject(year) {
    var obj = new JSONObj(year, averageB, averageD);
    jsonObjArr.push(obj);
    code.add(year);
}

var counter = 0, countB, countD, sumB, sumD, averageB, averageD, year;
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
      countB = 0;
      countD = 0;
      sumB = 0;
      sumD = 0;
      averageB = 0;
      averageD = 0;
      for(var z=0; z < csvObjArr.length; z++) {
        if((csvObjArr[z].year == x) && !(code.has(csvObjArr[z].year))) {
          if(csvObjArr[z].indicatorCode === 'SP.DYN.CBRT.IN') {
            countB++;
            sumB = sumD + Number.parseInt(csvObjArr[z].values);
            year = csvObjArr[z].year;
          }else if (csvObjArr[z].indicatorCode === 'SP.DYN.CDRT.IN') {
            countD++;
            sumD = sumD + Number.parseInt(csvObjArr[z].values);
            year = csvObjArr[z].year;
          }
        }
      }
      if((sumB !== 0 && sumB !== undefined) && (countB !== 0 && countB !== undefined) && (sumD !== 0 && sumD !== undefined) && (countD !== 0 && countD !== undefined)){
        findAverage(sumB, countB, sumD, countD);
      }
      if((year !== null && year !== undefined) && (averageD !== 0 && averageD !== undefined) && (averageB !== 0 && averageB !== undefined)) {
        createJSONObject(year);
      }
    }

  }

  var json = JSON.stringify(jsonObjArr);
  fs.writeFile('../resources/json/multi-line.json', json, 'utf-8');
});
