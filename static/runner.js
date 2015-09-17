var map;

function initialize() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 2,
        center: new google.maps.LatLng(2.8,-187.3),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    });

    // grab the data from the server
    // use json instead of jsonp
    var xmlhttp = new XMLHttpRequest();
    var url = '/data/json'

    // create callback
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var myArr = JSON.parse(xmlhttp.responseText);
            placeMarkers(myArr);
        }
    };
    xmlhttp.open('GET', url, true);
    xmlhttp.send();
    
    google.maps.event.addListener(map, "rightclick", mapRightClick);
}

// Loop through the results array and place a marker for each
// set of coordinates.
function placeMarkers(results) {
    for (var i = 0; i < results.people.length; i++) {
        var person = results.people[i];
        var latLng = new google.maps.LatLng(person.lat, person.lng);
        var marker = new google.maps.Marker({
            position: latLng,
            map: map
        });
        // Create an InfoWindow to show content
        var infoWindow = new google.maps.InfoWindow({
            content: person.name + ':<br/>Works at: ' + person.workplace
                     + '<br/>Interested in: ' + person.tags,
        } ); // end infoWindow

        // Create event to open the InfoWindow when marker is clicked.
        marker.addListener( 'click', function() {
            infoWindow.open(map, marker);
        });
    }
}

function mapRightClick(event) {
    var lat = event.latLng.lat();
    var lng = event.latLng.lng();
    // populate yor box/field with lat, lng
    window.open('/static/newpoint.html?lat=' + lat + '&lng=' + lng);
}

google.maps.event.addDomListener(window, 'load', initialize);
