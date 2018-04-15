d3.csv("/data/cluj_contur2.csv", function(data) {
  data.forEach(function (d) {
    d.lat = parseFloat(d.lat);
    d.lng = parseFloat(d.lng);
  });
  if(data){
    initMap(data)
  }
});
  
  
  function initMap(data) {
    console.log(data);
    var map = new google.maps.Map(document.getElementById('business-map'), {
    center: {lat: 46.770439, lng: 23.591423},
    mapTypeId: 'terrain',
    zoom: 10
  
  });
  
  // var triangleCoords = data;
  
  var bermudaTriangle = new google.maps.Polygon({
    paths: data,
    strokeColor: '#40ff88',
    strokeOpacity: 0.8,
    strokeWeight: 3,
    fillColor: '#3d64ff',
    fillOpacity: 0.35
  });
  bermudaTriangle.setMap(map);
}

function changePeriod() {
  for(var i = 0; i <= 64; i++){
    setTimeout(function () {
      calculateColor();
    },500)
  }
}

function calculateColor() {

}