//Define access token
mapboxgl.accessToken = 'pk.eyJ1IjoibWlzc3l6MjEiLCJhIjoiY2xyNW84dXNlMDh3cDJrcGIwMTJnbXp4NyJ9.iiAXKwL46ofLjtf_quFs-A'; 

//Initialize map
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-79.43, 43.68], // Initial center coordinates
    zoom: 10, // Initial zoom level
    minZoom: 9,
    maxZoom: 15
});

//Add search control to map overlay
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

    
    map.addSource('nei-population', {
        type: 'geojson',
        data: 'https:///MissyZhang.github.io/GGR472-lab3/main/data/neighbourhood-crime-rates.geojson' 
    });

    //Add layer to the map
    map.addLayer({
        'id': 'population-fill',
        'type': 'fill',
        'source': 'nei-population',
        'paint':  {
            // Define fill color based on population
            'fill-color': [
                'step', 
                ['get', 'POPULATION_2023'], 
                '#fafa6e', // Colour assigned to any values < first step
                13000, '#68c981', // Colours assigned to values >= each step
                19000, '#239f8a',
                25000, '#1a737c',
                30000, '#2a4858'
            ],
            // Define opacity based on zoom level
            'fill-opacity': [
                'interpolate', ['linear'], ['zoom'],
                9, 0.9, // For zoom level 9, opacity is 0.9
                15, 0.4 // For zoom level 15, opacity is 0.4
            ],
            'fill-outline-color': 'white'
        }
    });

});

/*--------------------------------------------------------------------
CREATE LEGEND
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

    const item = document.createElement('div'); 
    const key = document.createElement('span'); 

    key.className = 'legend-key'; 
    key.style.backgroundColor = colour; 

    const value = document.createElement('span'); 
    value.innerHTML = `${label}`; 

    item.appendChild(key); //add the key (colour cirlce) to the legend row
    item.appendChild(value); //add the value to the legend row

    legend.appendChild(item); //add row to the legend
});


/*--------------------------------------------------------------------
ADD INTERACTIVITY
--------------------------------------------------------------------*/

// 1) Add event listener which returns map view to full screen on button click using flyTo method
document.getElementById('returnbutton').addEventListener('click', () => {
    map.flyTo({
        center: [-79.43, 43.68], // Coordinates of the center
        zoom: 10,
        essential: true
    });
});


// 2) Change display of legend based on check box
let legendcheck = document.getElementById('legendcheck');
// Add event listener to the checkbox
legendcheck.addEventListener('click', () => {
    if (legendcheck.checked) {
        legendcheck.checked = true;
        legend.style.display = 'block'; // Display the legend
    }
    else {
        legend.style.display = "none";
        legendcheck.checked = false;
    }
});

// 3) Add event listener to the map for click events on the 'population-fill' layer
// 3.1) Return the name of the area in the console
map.on('click', 'population-fill', (e) => {

    console.log(e);   
    let neiname = e.features[0].properties.AREA_NAME; // Extract the name of the area from the clicked feature's properties
    console.log(neiname); // Log the name of the area to the console

});

// 3.2) Event listener for changing cursor on mouse enter
map.on('mouseenter', 'population-fill', () => {
    map.getCanvas().style.cursor = 'pointer'; //Switch cursor to pointer when mouse is over population-fill layer
});
// 3.3) Event listener for changing cursor on mouse leave
map.on('mouseleave', 'population-fill', () => {
    map.getCanvas().style.cursor = ''; //Switch cursor back when mouse leaves population-fill layer
});

// 3.4) Event listener for showing popup on click
map.on('click', 'population-fill', (e) => {
    new mapboxgl.Popup() //Declare new popup object on each click
        .setLngLat(e.lngLat) //Use method to set coordinates of popup based on mouse click location
        .setHTML("<b>Neighborhood:</b> " + e.features[0].properties.AREA_NAME + "<br>" +
            "<b>Population:</b> " + e.features[0].properties.POPULATION_2023) //Use click event properties to write text for popup
        .addTo(map); //Show popup on map
});


// 4) Filter data layer to show selected population range from dropdown selection
// Variable to store the selected population value
let populationValue;
// Event listener for changes in the population dropdown
document.getElementById("populationFieldset").addEventListener('change',(e) => {   
    populationValue = document.getElementById('population').value; // Get the selected population value from the dropdown

    console.log(populationValue); // Useful for testing whether correct values are returned from dropdown selection

    if (populationValue == 'All') {
        map.setFilter('population-fill', null); // Show all polygons
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








