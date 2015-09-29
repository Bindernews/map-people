
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
    
    // When they click 'Submit' send the data to the server.
    document.getElementById('submit_add_form').addEventListener('submit', function(event) {
        // Prevent the page from reloading
        event.preventDefault();
        // Try to create the new point
        createNewPoint();
        return false;
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

function attachInfo(marker, message) {
    var infoWindow = new google.maps.InfoWindow({
        content: message
    });
    marker.addListener('click', function () {
        infoWindow.open(marker.get('map'), marker);
    });
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
        
        var message = person.name + ':<br/>Works at: ' + person.workplace
                     + '<br/>Interested in: ' + person.tags;
        attachInfo(marker, message);
        
        markers.push(marker);
    }
}

function resetAddForm() {
    document.getElementById('name').value = '';
    document.getElementById('email').value = '';
    document.getElementById('workplace').value = '';
    document.getElementById('tags').value = '';
}

/**
 * Shows the add form
 */
function showAddForm(visible) {
    var form = document.getElementById('add-form');
    if (visible) {
        // don't show an when they first open the popup window
        document.getElementById('error').textContent = '';
        // make it visible
        resetAddForm();
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
        name: getInput('name'),
        email: getInput('email'),
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
