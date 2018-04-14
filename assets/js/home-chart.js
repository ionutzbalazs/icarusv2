const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var PANEL_MODELS = {
  "P1" : {
      power: 250,
      size: 1.63
  }
};

const PANEL_EFFICIENCY_AVG = 0.153;
const DC_TO_AC_EFFICIENCY = 0.85;

function computePotentialOnDemand(lat, long) {
  var lastYearValues = [];
  var last5YearsAvgValues = [];
  var timeAxisValues = [];

  d3.csv("/data/ClujCenter_5y_Daily.csv", function(data) {
    addEnergyPotential(data);

    var values = [];
    d3.nest().key(function(d) {
        return d.ObservationMonth;
    })
    .rollup(function(days) {
        values.push({
          month: days[0].ObservationMonthName,
          year: days[0].ObservationYear,
          total: Math.round(d3.sum(days, function(d) {
            return d.TotalEnergyPotantialPerSqrM;
          }))
        });
    })
    .entries(data);

    lastYearValues = values.filter(e => e.year  == 2017).map(e => e.total);
    timeAxisValues = values.filter(e => e.year  == 2017).map(e => e.month + " " + (e.year % 2000));

    d3.nest().key(function(d) {
      return d.month;
    })
    .rollup(function (months) {
      last5YearsAvgValues.push(Math.round(d3.mean(months, function(d) { return d.total; })));
    })
    .entries(values);

    drawChart(timeAxisValues, lastYearValues, last5YearsAvgValues);
  });
}

var addEnergyPotential = function (data) {
  data.forEach(function(d) {
      var observationDate = new Date(d["Observation period"].split('/')[0]);
      d.ObservationYear = observationDate.getFullYear();
      d.ObservationMonth = observationDate.getFullYear() + " " + observationDate.getMonth();
      d.ObservationMonthName = monthNames[observationDate.getMonth()];
      d.TotalEnergyPotantialPerSqrM = houseHoldFunction(d, 0, 45)
  });
}

var houseHoldFunction = function (irradiation, zenithAngle, tiltAngle) {
  var DNI = irradiation.BNI * Math.cos(zenithAngle);
  var DHI = irradiation.DHI * 0.5 * Math.cos(tiltAngle);

  var totalIrradiation = DNI + DHI;
  var totalEnergyPerSqrM = totalIrradiation * PANEL_EFFICIENCY_AVG * DC_TO_AC_EFFICIENCY;

  return totalEnergyPerSqrM;
}

var drawChart = function(timeAxisValues, lastYearValues, last5YearsAvgValues) {
  Highcharts.chart('home-container', {
    chart: {
      type: 'column'
    },
    title: {
      text: 'Mothly average power generation in Wh/m2'
    },
    
    xAxis: {
      categories: timeAxisValues
    },
    yAxis: {
      title: {
        text: 'Wh/m2'
      }
    },
    tooltip: {
      shared: true,
      valueSuffix: ' Wh/m2'
    },
    credits: {
      enabled: false
    },
    plotOptions: {
      areaspline: {
        fillOpacity: 0.5
      }
    },
    series: [{
      name: 'Last year',
      data: lastYearValues
    }, {
      name: 'Last 5 years',
      data: last5YearsAvgValues
    }]
  });
}