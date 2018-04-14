var marker = null;

function initMap() {
  var point = {lat: 46.773024, lng: 23.589494};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: point,
    gestureHandling: 'greedy'
  });
  
  map.addListener('click', function (event) {
    if (marker) {
      marker.setMap(null);
    }
    marker = new google.maps.Marker({
      position: { lat: event.latLng.lat(), lng: event.latLng.lng() },
      map: map
    });
    computePotentialOnDemand(event.latLng.lat(), event.latLng.lng());
  });
}
