mapboxgl.accessToken =
  "pk.eyJ1Ijoid2FhYWFhMSIsImEiOiJjbGNwY3Y1dTkwMXBoM29scWMwbDh1MWpmIn0.TSTxqAJ2YFqiSin1IUJYZg";
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/waaaaa1/cldkd2bfv002901t9yp51x6kh",
  zoom: 12,
  center: [-3.433396, 56.40563]
});

map.on("idle", () => {
  if (
    !map.getLayer("Car Parks Point") ||
    !map.getLayer("Charging Station") ||
    !map.getLayer("City Center Car Park Area") ||
    !map.getLayer("School Location Heatmap") ||
    !map.getLayer("School Scope")
  ) {
    return;
  }

  const toggleableLayerIds = [
    "Car Parks Point",
    "Charging Station",
    "City Center Car Park Area",
    "School Location Heatmap",
    "School Scope"
  ];

  for (const id of toggleableLayerIds) {
    // Skip layers that already have a button set up.
    if (document.getElementById(id)) {
      continue;
    }

    // Create a link.
    const link = document.createElement("a");
    link.id = id;
    link.href = "#";
    link.textContent = id;
    link.className = "active";

    // Show or hide layer when the toggle is clicked.
    link.onclick = function (e) {
      const clickedLayer = this.textContent;
      e.preventDefault();
      e.stopPropagation();

      const visibility = map.getLayoutProperty(clickedLayer, "visibility");

      // Toggle layer visibility by changing the layout object's visibility property.
      if (visibility === "visible") {
        map.setLayoutProperty(clickedLayer, "visibility", "none");
        this.className = "";
      } else {
        this.className = "active";
        map.setLayoutProperty(clickedLayer, "visibility", "visible");
      }
    };

    const layers = document.getElementById("menu");
    layers.appendChild(link);
  }
});

//search control
const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl, 
  marker: false, 
  placeholder: "Search for places in Perth and Kinross", // Placeholder text for the search bar
  proximity: {
    longitude: 56.40563,
    latitude: -3.433396
  } 
});
//navigation
map.addControl(geocoder, "top-left");
map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

//charging station

map.on("click", (event) => {
  const features = map.queryRenderedFeatures(event.point);
  if (!features.length) {
    return;
  }
  const feature = features[0];
  if (feature.properties.CHARGE != null) {
    const popup = new mapboxgl.Popup({
      offset: [0, -15],
      className: "my-popup"
    })

      .setLngLat(feature.geometry.coordinates)
      .setHTML(
        `<p>Charging method: ${feature.properties.CHARGE}</p>
    <p>Charging Speed: ${feature.properties.CH_SPEED}</p>`
      )
      .addTo(map);
  }
});
//citycenter carpark
map.on("mousemove", (event) => {
  if (map.getSource("hover") !== undefined) {
    map.removeLayer("dz-hover");
    map.removeSource("hover");
  }
  map.addSource("hover", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] }
  });
  map.addLayer({
    id: "dz-hover",
    type: "line",
    source: "hover",
    layout: {},
    paint: {
      "line-color": "black",
      "line-width": 4
    }
  });
  followbox = document.getElementById("features");
  followbox.style.display = "none";
  followbox.style.position = "absolute";
  followbox.style.width = "100px";
  followbox.style.height = "60px";
  followbox.style.backgroundColor = "#b0c4de";
  followbox.style.textAlign = "center";
  const dzone = map.queryRenderedFeatures(event.point, {
    layers: ["City Center Car Park Area"]
  });
  if (!dzone.length) {
    // console.log("error move");
    return;
  }
  const src = map.getSource("hover");
  // console.log(src);
  src.setData({
    type: "FeatureCollection",
    features: dzone.map(function (f) {
      if (f.geometry.type == "Polygon") {
        return { type: "Feature", geometry: f.geometry };
      } else {
        return;
      }
    })
  });
  const feature = dzone[0];
  // console.log(feature);
  if (feature.properties.ZONE != null) {
    followbox.innerHTML = `<h3>Zone ${feature.properties.ZONE}</h3>`;
    var s = getMouseCoord();
    followbox.style.left = s.X + "px";
    followbox.style.top = 5 + s.Y + "px";
    followbox.style.display = "block";
    followbox.style.zIndex = 99;
    // console.log(followbox)
  }
  function getMouseCoord(even) {
    //Processing compatibility：  Event objects
    e = even || window.event;
    var X = e.offsetX; //Relative to parent element
    var Y = e.offsetY;
    var screenX = e.clientX; //Current visual area
    var screenY = e.clientY;
    var pageX = e.pageX; //The whole page
    var pageY = e.pageY;
    return {
      X,
      Y,
      screenX,
      screenY,
      pageX,
      pageY
    };
  }

});

//navigation
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  }),
  'bottom-right'
);

//legend
map.on("load", () => {
  const layers = ["Car Parks Point", "Zone 1", "Zone 2", "Zone 3"];
  const colors = ["#f254d5", "#bcf8b4", "#59cf4a", "#3a643b"];
  // create legend
  const legend_bg = document.getElementById("lg-bg");
  const legend_wd = document.getElementById("lg-wd");
  layers.forEach((layer, i) => {
    const color = colors[i];
    const key_bg = document.createElement("div");
    //place holder
    key_bg.className = "legend-key-bg";
    if (layer == "Car Parks Point") {
      key_bg.id = "legend-key-bg-car";
    }
    key_bg.style.backgroundColor = color;
    // key_bg.innerHTML = `${layer}`;
    legend_bg.appendChild(key_bg);

    const key_word = document.createElement("div");
    key_word.className = "legend-key-wd";
    if (layer == "Car Parks Point") {
      key_word.id = "legend-key-wd-car";
    }
    key_word.innerHTML = `${layer}`;
    legend_wd.appendChild(key_word);
  });
});


function openNav() {
  document.getElementById("mySidebar").style.width = "25%";
  document.getElementById("main").style.marginLeft = "25%";
  document.getElementById("map").style.width = "75%";
  document.getElementById("map").style.marginLeft = "0";
  document.getElementById("legend").style.marginLeft = "26%";
  newfelltable();
}


function closeNav() {
  
  document.getElementById("mySidebar").style.width = "0";
  document.getElementById("main").style.marginLeft = "0";
  document.getElementById("map").style.width = "100%";
  document.getElementById("map").style.marginLeft = "0";
  document.getElementById("legend").style.marginLeft = "1%";
}

function newfelltable() {
  const levelsfells = map.queryRenderedFeatures(event.point,{
    layers: ["School Location Heatmap"]
    // Layers: "School_Locations"
  });
   
  var theTable = document.getElementById("fellsTableBody");
  theTable.innerHTML = "";
  console.log(levelsfells[0]);
  for (let i = 0; i < levelsfells.length; i++) {
    // console.log(levelsfells[i]);
    if (levelsfells[i].properties.Name == undefined) {
    } else {
      
      var newRow = theTable.insertRow(theTable.length);
      // var newRow0 = theTable.insertRow(theTable.length);0
      var fellname = newRow.insertCell(0);
      var fellheight = newRow.insertCell(1);
      fellname.innerHTML = levelsfells[i].properties.Name;
      fellheight.innerHTML = levelsfells[i].properties.Type;
      fellname.style.lineHeight = "30px"
    }
  }
}