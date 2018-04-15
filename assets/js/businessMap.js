const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const PANEL_EFFICIENCY_AVG = 0.153;
const DC_TO_AC_EFFICIENCY = 0.85;
var clujPolygon;
var craiovaPolygon;
var suceavaPolygon;
var monthIndex = 0;

function initMap(data) {
  var map = new google.maps.Map(document.getElementById('business-map'), {
    center: {lat: 46.770439, lng: 23.591423},
    mapTypeId: 'terrain',
    gestureHandling: 'greedy',
    zoom: 10
    
  });
  
  var legend = document.getElementById('legend');
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(legend);
  
  d3.csv("/data/cluj_contur2.csv", function (data) {
    data.forEach(function (d) {
      d.lat = parseFloat(d.lat);
      d.lng = parseFloat(d.lng);
    });
    
    clujPolygon = new google.maps.Polygon({
      paths: data,
      strokeColor: '#ffa000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#ffdf00',
      fillOpacity: 0.35
    });
    clujPolygon.setMap(map);
  });
  
  d3.csv("/data/craiova_contur.csv", function (data) {
    data.forEach(function (d) {
      d.lat = parseFloat(d.lat);
      d.lng = parseFloat(d.lng);
    });
    
    craiovaPolygon = new google.maps.Polygon({
      paths: data,
      strokeColor: '#ffa000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#ffdf00',
      fillOpacity: 0.35
    });
    craiovaPolygon.setMap(map);
  });
  
  d3.csv("/data/suceava_contur.csv", function (data) {
    data.forEach(function (d) {
      d.lat = parseFloat(d.lat);
      d.lng = parseFloat(d.lng);
    });
    
    suceavaPolygon = new google.maps.Polygon({
      paths: data,
      strokeColor: '#ffa000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#ffdf00',
      fillOpacity: 0.35
    });
    suceavaPolygon.setMap(map);
  });
  
  var infowindowCluj = new google.maps.InfoWindow();
  
  function getContent(month, year, total) {
    return infoCluj = '<div id="content">' +
      '<div id="siteNotice">' +
      'Cluj Napoca' +
      '</div>' +
      '<div id="bodyContent" style="padding: 10px 0 10px 0; display: grid">' +
      '<div style="display: inline-flex">' +
      '<img src="../../assets/img/event.png"  style="height: 30px;"/>' +
      '<p style="margin-left: 10px; margin-top: 5px; font-size: 20px; align-self: center">' + month + ' ' + year + '</p>' +
      '</div>' +
      '<div style="display: inline-flex">' +
      '<img src="../../assets/img/feature1.png"  style="height: 30px;"/>' +
      '<p style="margin-left: 10px; margin-top: 5px; font-size: 20px; align-self: center">' + total / 1000 + ' (KWh / m2)' + '</p>' +
      '</div>' +
      '</div>' +
      '</div>';
  }
  
  
  var markerCluj = new google.maps.Marker({
    position: {lat: 46.770439, lng: 23.591423},
    title: 'Cluj Napoca'
  });
  
  markerCluj.addListener('click', function () {
    infowindowCluj.open(map, markerCluj);
  });
  
  changePeriod();
  
  
  function changePeriod() {
    var valuesCluj = [];
    var valuesCraiova = [];
    var valuesSuceava = [];
    
    d3.csv("/data/ClujCenter_5y_Daily.csv", function (data) {
      addEnergyPotential(data);
      
      d3.nest().key(function (d) {
        return d.ObservationMonth;
      })
        .rollup(function (days) {
          valuesCluj.push({
            month: days[0].ObservationMonthName,
            year: days[0].ObservationYear,
            total: Math.round(d3.sum(days, function (d) {
              return d.TotalEnergyPotantialPerSqrM;
            }))
          });
        })
        .entries(data);
    });
    
    d3.csv("/data/CraiovaCenter_5y_Daily.csv", function (data) {
      addEnergyPotential(data);
      
      d3.nest().key(function (d) {
        return d.ObservationMonth;
      })
        .rollup(function (days) {
          valuesCraiova.push({
            month: days[0].ObservationMonthName,
            year: days[0].ObservationYear,
            total: Math.round(d3.sum(days, function (d) {
              return d.TotalEnergyPotantialPerSqrM;
            }))
          });
        })
        .entries(data);
    });
    
    d3.csv("/data/SuceavaCenter_5y_Daily.csv", function (data) {
      addEnergyPotential(data);
      
      d3.nest().key(function (d) {
        return d.ObservationMonth;
      })
        .rollup(function (days) {
          valuesSuceava.push({
            month: days[0].ObservationMonthName,
            year: days[0].ObservationYear,
            total: Math.round(d3.sum(days, function (d) {
              return d.TotalEnergyPotantialPerSqrM;
            }))
          });
        })
        .entries(data);
    });
    
    setInterval(function () {
      monthIndex++;
      markerCluj.setMap(map);
      infowindowCluj.setContent(getContent(valuesCluj[monthIndex % 64].month, valuesCluj[monthIndex % 64].year, valuesCluj[monthIndex % 64].total));
      console.log(valuesCluj[monthIndex % 64].month + " -> Cluj: " + valuesCluj[monthIndex % 64].total +
        ", Craiova: " + valuesCraiova[monthIndex % 64].total +
        ", Suceava: " + valuesSuceava[monthIndex % 64].total);
      clujPolygon.setOptions({fillColor: calculateColor(valuesCluj[monthIndex % 64].total)});
      craiovaPolygon.setOptions({fillColor: calculateColor(valuesCraiova[monthIndex % 64].total)});
      suceavaPolygon.setOptions({fillColor: calculateColor(valuesSuceava[monthIndex % 64].total)});
    }, 1000);
  }
  
  function calculateColor(radiationValue) {
    var min = 2000;
    var max = 35000;
    var percent = 255 - Math.floor(parseInt((radiationValue - min) * 100) / (max - min) * 2.55);
    var g = percent.toString(16) < 16 ? "00" : percent.toString(16);
    var r = "ff"
    var b = "00";
    return "#" + r + g + b;
  }
  
  var addEnergyPotential = function (data) {
    data.forEach(function (d) {
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
  
}
$("#designer").hide();

$( "#dashboardBtn" ).click(function() {
  $("#mapview").hide();
  $("#designer").show();
});
$( "#mapLink" ).click(function() {
  $("#designer").hide();
  $("#mapview").show();
});