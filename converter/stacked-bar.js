var fs = require("fs");
const readline = require('readline');
var fileName = "../resources/csv/Indicators.csv";
var dataArr = [], csvObjArr = [], jsonObjArr = [];
var asianCountryCode = ['AFG', 'ARM', 'AZE', 'BHR', 'BGD', 'BTN', 'BRN', 'KHM', 'CHN', 'CXR', 'CCK', 'IOT', 'GEO', 'HKG', 'IND', 'IDN', 'IRN', 'IRQ',
                   'ISR', 'JPN', 'JOR', 'KAZ', 'KWT', 'KGZ', 'LAO', 'LBN', 'MAC', 'MYS', 'MDV', 'MNG', 'MMR', 'NPL', 'PRK', 'OMN', 'PAK', 'PSE', 'PHL',
                   'QAT', 'SAU', 'SGP', 'KOR', 'LKA', 'SYR', 'TWN', 'TJK', 'THA', 'TUR', 'TKM', 'ARE', 'UZB', 'VNM', 'YEM'];
var indicatorCode1 = ['SP.DYN.LE00.FE.IN', 'SP.DYN.LE00.MA.IN'];

function CSVObj(countryName, countryCode, indicatorName, indicatorCode, year, values) {
  this.countryName = countryName;
  this.countryCode = countryCode;
  this.indicatorName = indicatorName;
  this.indicatorCode = indicatorCode;
  this.year = year;
  this.values = values;
};
function JSONObj(countryName, maleAveVal, femaleAveVal) {
  this.countryName = countryName;
  this.male = maleAveVal;
  this.female = femaleAveVal;
}

const rl = readline.createInterface({
  input: fs.createReadStream(fileName),
  output: process.stdout,
  terminal: false
});
var counter = 0, counterF, counterM, sumM, sumF, averageF = 0; averageM = 0, countryName = '';
rl.on('line', function(line) {
  if(counter === 0){
    dataArr = line;
  }else {
    for(var j=0; j < indicatorCode1.length; j++) {
      if(line.indexOf(indicatorCode1[j]) !==-1) {
        for(var i = 0; i < asianCountryCode.length; i++) {
          if(line.indexOf(asianCountryCode[i]) !==-1) {
            var texts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            var obj = new CSVObj(texts[0], texts[1], texts[2], texts[3], texts[4], texts[5]);
            csvObjArr.push(obj);
          }
        }
      }
    }
  }
  //console.log(line[0]);
  counter++;
});
function findAverage(sumM, counterM, sumF, counterF) {
    averageM = sumM/counterM;
    averageF = sumF/counterF
    //console.log('Sum::'+sum);
}
function createJSONObject(countryName) {
    //console.log(sum+'==>'+indicator+'==>'+countryName);
    var obj = new JSONObj(countryName, averageM, averageF);
    jsonObjArr.push(obj);
}
rl.on('close', function() {

    for(var x=0; x < asianCountryCode.length; x++) {
      counterF = 0;
      counterM = 0;
      sumF = 0;
      sumM = 0;
      averageM = 0;
      averageF = 0;
      for(var z=0; z < csvObjArr.length; z++) {
        if(csvObjArr[z].countryCode === asianCountryCode[x]) {
          if (csvObjArr[z].indicatorCode === 'SP.DYN.LE00.FE.IN') {
            counterF++;
            sumF = sumF + Number.parseFloat(csvObjArr[z].values);
            countryName = csvObjArr[z].countryName;
          } else if(csvObjArr[z].indicatorCode === 'SP.DYN.LE00.MA.IN') {
            counterM++;
            sumM = sumM + Number.parseFloat(csvObjArr[z].values);
            countryName = csvObjArr[z].countryName;
          }
        }
      }
      if((sumM !== 0 && sumM !== undefined) && (sumF !== 0 && sumF !== undefined) && (counterF !== 0 && counterF !== undefined) && (counterM !== 0 && counterM !== undefined)){
        findAverage(sumM, counterM, sumF, counterF);
      }
      if((countryName !== null && countryName !== undefined) && (averageM !== 0 && averageM !== undefined) && (averageF !== 0 && averageF !== undefined)) {
        createJSONObject(countryName);
      }
    }

  var json = JSON.stringify(jsonObjArr);
  fs.writeFile('../resources/json/stacked-chart.json', json, 'utf-8');

});
