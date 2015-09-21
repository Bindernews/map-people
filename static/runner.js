
// The google map
var map;

// List of markers
var markers = [];

function initialize() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center: new google.maps.LatLng(43.08448883056196, -77.68009766936302),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    });
    
    updateMarkers();
    
    // When the user right-clicks pop up a window for them to enter
    // their information.
    google.maps.event.addListener(map, "rightclick", function (event) {
        var lat = event.latLng.lat();
        var lng = event.latLng.lng();
        // populate yor box/field with lat, lng
        document.getElementById('lat').value = lat;
        document.getElementById('lng').value = lng;
        showAddForm(true);
    });
    
    // When they click 'Submit' send the data to the server
    document.getElementById('submit_add_form').addEventListener('click', function(event) {
        createNewPoint();
    }, true);
    
    // When they click the X close the add form
    document.getElementById('close_add_form').addEventListener('click', function(event) {
        showAddForm(false);
    }, true);
}

function updateMarkers() {
    // clear all current markers
    for(var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
    
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
        
        markers.push(marker);
    }
}


/**
 * Shows the add form
 */
function showAddForm(visible) {
    var form = document.getElementById('add-form');
    if (visible) {
        // make it visible
        form.style.visibility = 'visible';
    } else {
        form.style.visibility = 'hidden';
    }
}

/**
 * Sends the data to create a new point and handles the responses.
 */
function createNewPoint() {
    var URL = '/data/newpoint/json';
    
    function getInput(id) {
        var elem = document.getElementById(id);
        return elem.value;
    }
    
    var postData = {
        lat: getInput('lat'),
        lng: getInput('lng'),
        name: getInput('person_name'),
        workplace: getInput('workplace'),
        tags: getInput('tags'),
    };
    
    console.log('Sending JSON');
    
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            console.log('response = ' + xmlhttp.responseText);
            var res = JSON.parse(xmlhttp.responseText);
            if (res.error) {
                document.getElementById('error').textContent = res.error;
            } else {
                showAddForm(false);
                updateMarkers();
            }
        }
    }
    
    xmlhttp.open('POST', URL, true);
    xmlhttp.setRequestHeader('Content-type', 'application/json');
    xmlhttp.send(JSON.stringify(postData));
}

google.maps.event.addDomListener(window, 'load', initialize);
