//Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWlzc3l6MjEiLCJhIjoiY2xyNW84dXNlMDh3cDJrcGIwMTJnbXp4NyJ9.iiAXKwL46ofLjtf_quFs-A'; 

//Initialize map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-79.43, 43.68], // Initial center coordinates [longitude, latitude]
    zoom: 10, // Initial zoom level
    minZoom: 9,
    maxZoom: 15
});

//Add search control to map overlay
//Requires plugin as source in HTML body
const geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    countries: "ca"
});

document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

//Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());



//Add data source and draw initial visiualization of layer
map.on('load', () => {

    //Use GeoJSON file as vector tile creates non-unique IDs for features which causes difficulty when highlighting polygons
    map.addSource('nei-population', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/MissyZhang/GGR472-lab3/main/data/neighbourhood-crime-rates.geojson' //Link to raw github files when in development stage. Update to pages on deployment
    
    });

    //Add layer only once using case expression and feature state for opacity
    map.addLayer({
        'id': 'population-fill',
        'type': 'fill',
        'source': 'nei-population',
        'paint':  {
            'fill-color': [
                'step', // STEP expression produces stepped results based on value pairs
                ['get', 'POPULATION_2023'], // GET expression retrieves property value from 'capacity' data field
                '#fafa6e', // Colour assigned to any values < first step
                13000, '#68c981', // Colours assigned to values >= each step
                19000, '#239f8a',
                25000, '#1a737c',
                30000, '#2a4858'
            ],
            'fill-opacity': 0.8,
            'fill-outline-color': 'white'
        }
    });

});

/*--------------------------------------------------------------------
CREATE LEGEND IN JAVASCRIPT
--------------------------------------------------------------------*/
//Declare array variables for labels and colours
const legendlabels = [
    '0-13,000',
    '13,000-19,000',
    '19,000-25,000',
    '25,000-30,000',
    '>30,000'
];

const legendcolours = [
    '#fafa6e',
    '#68c981',
    '#239f8a',
    '#1a737c',
    '#2a4858'
];

//Declare legend variable using legend div tag
const legend = document.getElementById('legend');

//For each layer create a block to put the colour and label in
legendlabels.forEach((label, i) => {
    const colour = legendcolours[i];

    const item = document.createElement('div'); //each layer gets a 'row' - this isn't in the legend yet, we do this later
    const key = document.createElement('span'); //add a 'key' to the row. A key will be the colour circle

    key.className = 'legend-key'; //the key will take on the shape and style properties defined in css
    key.style.backgroundColor = colour; // the background color is retreived from teh layers array

    const value = document.createElement('span'); //add a value variable to the 'row' in the legend
    value.innerHTML = `${label}`; //give the value variable text based on the label

    item.appendChild(key); //add the key (colour cirlce) to the legend row
    item.appendChild(value); //add the value to the legend row

    legend.appendChild(item); //add row to the legend
});


/*--------------------------------------------------------------------
ADD INTERACTIVITY BASED ON HTML EVENT
--------------------------------------------------------------------*/

// 1) Add event listener which returns map view to full screen on button click using flyTo method
document.getElementById('returnbutton').addEventListener('click', () => {
    map.flyTo({
        center: [-79.43, 43.68],
        zoom: 10,
        essential: true
    });
});


// 2) Change display of legend based on check box
let legendcheck = document.getElementById('legendcheck');

legendcheck.addEventListener('click', () => {
    if (legendcheck.checked) {
        legendcheck.checked = true;
        legend.style.display = 'block';
    }
    else {
        legend.style.display = "none";
        legendcheck.checked = false;
    }
});

/*--------------------------------------------------------------------
SIMPLE CLICK EVENT
--------------------------------------------------------------------*/
map.on('click', 'population-fill', (e) => {

    console.log(e);   //e is the event info triggered and is passed to the function as a parameter (e)
    //Explore console output using Google DevTools

    let neiname = e.features[0].properties.AREA_NAME;
    console.log(neiname);

});

/*--------------------------------------------------------------------
ADD POP-UP ON CLICK EVENT
--------------------------------------------------------------------*/
map.on('mouseenter', 'population-fill', () => {
    map.getCanvas().style.cursor = 'pointer'; //Switch cursor to pointer when mouse is over provterr-fill layer
});

map.on('mouseleave', 'population-fill', () => {
    map.getCanvas().style.cursor = ''; //Switch cursor back when mouse leaves provterr-fill layer
});


map.on('click', 'population-fill', (e) => {
    new mapboxgl.Popup() //Declare new popup object on each click
        .setLngLat(e.lngLat) //Use method to set coordinates of popup based on mouse click location
        .setHTML("<b>Neighborhood:</b> " + e.features[0].properties.AREA_NAME + "<br>" +
            "<b>Population:</b> " + e.features[0].properties.POPULATION_2023) //Use click event properties to write text for popup
        .addTo(map); //Show popup on map
});


// 4) Filter data layer to show selected Province from dropdown selection
let populationValue;

document.getElementById("populationFieldset").addEventListener('change',(e) => {   
    populationValue = document.getElementById('population').value;

    console.log(populationValue); // Useful for testing whether correct values are returned from dropdown selection

    if (populationValue == 'All') {
        // Show all polygons
        map.setFilter('population-fill', null);
    } else {
        // Filter based on population range
        const populationRanges = populationValue.split('-');
        const minPopulation = parseInt(populationRanges[0]);
        const maxPopulation = populationRanges.length === 1 ? Infinity : parseInt(populationRanges[1]);

        map.setFilter(
            'population-fill',
            ['all',
                ['>=', ['get', 'POPULATION_2023'], minPopulation],
                ['<=', ['get', 'POPULATION_2023'], maxPopulation]
            ]
        );
    }

});








