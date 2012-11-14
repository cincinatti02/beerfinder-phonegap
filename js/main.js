$(document).ready(function() {
	function setMapSize() {
		var mapCanvas = $('#map_canvas');
		mapCanvas.height($(window).innerHeight() - 51);
		mapCanvas.width($(window).innerWidth());
	}
	
	setMapSize();
	
	$(window).resize(function() {
		setMapSize();
	});
	
	$('#desktopSearch').click(function(e) {
		e.preventDefault();
		getAddressLatLongDesktop();
	});
	
	$('#mobileSearch').click(function(e) {
		e.preventDefault();
		$('#mobileSearchSection').animate({
				height : '0px'
			}, 300, 'linear');
		getAddressLatLongMobile();
	});
	
	$('#popUp').click(function(e) {
		if($('#mobileSearchSection').height() == 0) {
			$('#mobileSearchSection').animate({
				height : '100px'
			}, 300, 'linear');
		} else {
			$('#mobileSearchSection').animate({
				height : '0px'
			}, 300, 'linear');
		}
	});
	
	$('#cancelSearch').click(function(e) {
		$('#mobileSearchSection').animate({
				height : '0px'
			}, 300, 'linear');
	});	
});

var map;
var geocoder;
var markers = Array();
var infos = Array();
var geocoder;
var service;

function initialize() {
	geocoder = new google.maps.Geocoder();

	var mapOptions = {
		zoom: 4,
		center: new google.maps.LatLng(39.5, -98.35),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	
	map = new google.maps.Map(document.getElementById('map_canvas'),
		mapOptions);

}

// clear overlays function
function clearOverlays() {
    if (markers) {
        for (i in markers) {
            markers[i].setMap(null);
        }
        markers = [];
        infos = [];
    }
}

// clear infos function
function clearInfos() {
    if (infos) {
        for (i in infos) {
            if (infos[i].getMap()) {
                infos[i].close();
            }
        }
    }
}

function getAddressLatLongDesktop() {
	var address = $('#desktopInput').val();
	 $('#desktopInput').val('');

    // script uses our 'geocoder' in order to find location by address name
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) { // and, if everything is ok
            // we will center map
            var addrLocation = results[0].geometry.location;
			var lat = results[0].geometry.location.Ya;
			var lng = results[0].geometry.location.Za;
            map.setCenter(addrLocation);
			map.setZoom(10);
			findPlaces(lat,lng);			
		} else {
			alert('error');
		}
	});
}

function getAddressLatLongMobile() {
	var address = $('#mobileInput').val();
	 $('#mobileInput').val('');

    // script uses our 'geocoder' in order to find location by address name
    geocoder.geocode( { 'address': address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) { // and, if everything is ok
            // we will center map
            var addrLocation = results[0].geometry.location;
			var lat = results[0].geometry.location.Ya;
			var lng = results[0].geometry.location.Za;
            map.setCenter(addrLocation);
			map.setZoom(12);
			findPlaces(lat,lng);			
		} else {
			alert('That address is not in our database, please try a location near by.');
		}
	});
}

function findPlaces(lat,lng) {
	
    // prepare variables (filter)
    var type = 'bar';
    var radius = 8000;

    var cur_location = new google.maps.LatLng(lat,lng);

    // prepare request to Places
    var request = {
        location: cur_location,
        radius: radius,
        types: [type]
    };

    // send request
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, getPlaceDetails);
}

function getPlaceDetails(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		 // if we have found something - clear map (overlays)
        clearOverlays();

        // and create new markers by search result
        for (var i = 0; i < results.length; i++) {
            var request = {
				reference : results[i].reference
			}
			
			service = new google.maps.places.PlacesService(map);
			service.getDetails(request, createMarker);
        }	
	} else {
		alert('Sorry, nothing is found');
	}
}

/*
// create markers (from 'findPlaces' function)
function createMarkers(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {

        // if we have found something - clear map (overlays)
        clearOverlays();

        // and create new markers by search result
        for (var i = 0; i < results.length; i++) {
            createMarker(results[i]);
        }
    } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        alert('Sorry, nothing is found');
    }
}
*/

// creare single marker function
function createMarker(obj, status) {
	 if (status == google.maps.places.PlacesServiceStatus.OK) {
		// prepare new Marker object
		var image = 'img/icon.png';
		var mark = new google.maps.Marker({
			position: obj.geometry.location,
			map: map,
			title: obj.name,
			icon: image
		});
		markers.push(mark);

		// prepare info window
		var infowindow = new google.maps.InfoWindow({
			content: '<div class="text-shadow-light padding20" style="color:#222222; font-size: 13px; height: 100px; width: 200px;">' + obj.name + 
			'<br /><address>' + obj.formatted_address + '</address>'  + '<a href="tel:' + obj.formatted_phone_number + '">'
			+ obj.formatted_phone_number + '</a><br />' +
			'<a href="' + obj.url + '" target="_blank">Check us out on Google Places</a></div>'
		});

		// add event handler to current marker
		google.maps.event.addListener(mark, 'click', function() {
			clearInfos();
			infowindow.open(map,mark);
		});
		infos.push(infowindow);
	}
}

google.maps.event.addDomListener(window, 'load', initialize);










