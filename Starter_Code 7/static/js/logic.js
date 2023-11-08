// Store the API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";

function chooseColor(depth) {
  if (depth > 90) return 'red';
  else if (depth > 70) return  'orange';
  else if (depth > 50) return 'light orange';
  else if (depth > 30) return 'yellow';
  else if (depth >10) return 'green';
  else return 'blue';
};


// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {

  // Using the features array sent back in the API data, create a GeoJSON layer, and add it to the map.
  function useFeature(feature, layer) {
       layer.bindPopup(`<h3>+ ${feature.properties.place}</h3 ><hr> <h3>Depth: ${feature.geometry.coordinates[2]} km </h3> <hr>
      <h3>Magnitude: ${feature.properties.mag}</h3>`);
      }

  function markerSize(mag) {
    return (mag) * 6;
  }
  
  let earthquakes = L.geoJSON(data.features, {
    style: function(feature) {
      return {
        color: "black",
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.5,
        weight: 1.5,
        radius: markerSize(feature.properties.mag)
      }
    },
    
    onEachFeature: useFeature,
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    }
  })
  createMap(earthquakes);
});


function createMap(earthquakes) {
  // Create the base layers
  let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  })

  let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
  });

  // Create a baseMaps object
  let baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
  };

  // Create an overlays object
  let overlayMaps = {
    Earthquakes: earthquakes,
  };
  
  // Create a new map
  let myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [street, earthquakes]
  });

  // Create a layer control that contains our baseMaps
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create a legend
  let legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

    let div = L.DomUtil.create('div', 'info legend'),
        grades = [-10, 10, 30, 50, 70, 90];

    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(myMap);

}