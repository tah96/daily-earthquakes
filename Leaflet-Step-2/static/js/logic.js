var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"

d3.json(queryURL, function (data) {
    console.log(data);
    createFeaturesEq(data.features)
});

var file = "static/js/PB2002_boundaries.json"
d3.json(file, function (data2) {
    console.log(data2)
    createFeaturesPlates(data2.features)
});

parameters = []

function createFeaturesEq(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeatureEq(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><ul><b><u>Info</u></b>" +
        "<li>Magnitude: " + feature.properties.mag + "</li>" +
        "<li>Type: " + feature.properties.magType + "</li>" +
        "<li>Occurance Date/Time: " + new Date(feature.properties.time) + "</li>" +
        "</ul>");
    };
  
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    function markerSize(magnitude) {
        return magnitude * 3;
    };

    function chooseColor(magnitude) {
        switch (true) {
        case magnitude < 1:
            return "#2AAD27";
        case magnitude < 2:
            return "#FFD326";
        case magnitude < 3:
            return "#CAC428";
        case magnitude < 4:
            return "#CB8427";
        default:
            return "#CB2B3E"
        };
    };
    
    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
        }, 
        style: function(feature) {
            return {
              color: "white",
              // Call the chooseColor function to decide which color to color our neighborhood (color based on borough)
              fillColor: chooseColor(feature.properties.mag),
              fillOpacity: 0.75,
              weight: 0.5,
              radius: markerSize(feature.properties.mag)
            };
        },
        onEachFeature: onEachFeatureEq
    });
    console.log(earthquakes);
    parameters.push(earthquakes);
};

function createFeaturesPlates(plateData) {
    
    var myStyle = {
        "color": "Red"
    };
    
    var boundaries = L.geoJSON(plateData, {
        style: myStyle
    });
    

    // var plate_boundaries = []
    // plateData.forEach(feature => {
    //     var pl_coordinates = feature.geometry.coordinates
    //     plate_boundaries.push(pl_coordinates)
    // });
    // //console.log(plate_boundaries);

    // var plate_bounds = L.polyline(plate_boundaries, {
    //     color: 'red'
    // });

    parameters.push(boundaries);
};

console.log(parameters);

function createMaps(parameters) {

    // Define LightMap layer
    
    var lightLayerBase = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "light-v10",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    var baseMaps = {
        "Day Map": lightLayerBase,
        "Night Map": darkmap
    };

    var overlayMaps = {
        Earthquakes: parameters[0],
        Plates: parameters[1]
    };


    var myMap = L.map("map", {
        center: [
          37.09, -95.71
        ],
        zoom: 5,
        layers: [lightLayerBase, parameters[0]]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "legend");
        var limits = ["<1", "1-2", "2-3", "3-4", "4+"]
        var colors = ["#2AAD27","#FFD326", "#CAC428", "#CB8427", "#CB2B3E"];
        var labels = [];

        var legendInfo = "<h1>Magnitude</h1>"; 

        div.innerHTML = legendInfo;

        limits.forEach(function(limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\">" + limits[index] + "</li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };
    legend.addTo(myMap);
};

createMaps(parameters);
