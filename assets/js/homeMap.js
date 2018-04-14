function initMap() {
  var point = {lat: 46.773024, lng: 23.589494};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: point
  });
  var marker = new google.maps.Marker({
    position: point,
    map: map
  });
}
