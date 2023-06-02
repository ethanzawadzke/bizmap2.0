import { mapState } from "$lib/store.js";
import { accessToken, datasetId } from "./mapboxConfig.js";
import chroma from "chroma-js";
import { sources } from "./sources.js";
import mapboxgl from "mapbox-gl";

let map;

const unsubscribeMap = mapState.subscribe(state => {
    map = state.map;
});

export function clearLayers() {
    if (map) {
        if (map.getLayer("choro-data-layer")) {
            map.removeLayer("choro-data-layer");
        } 
    }
}

export function generateColors(numColors) {
    let startColor, endColor;

    const unsubscribe = mapState.subscribe(state => {
        startColor = state.choroSettings.startColor;
        endColor = state.choroSettings.endColor;
    });

    const colors = chroma.scale([startColor, endColor]).colors(numColors);

    unsubscribe(); // Remember to unsubscribe when done

    return colors;
}

export function drawLayer(layerTitle) {
    return new Promise((resolve, reject) => {
        if (layerTitle !== "None") {
            let selectedLayerTitle, colorSteps;

            const unsubscribe = mapState.subscribe(state => {
                selectedLayerTitle = state.choroSettings.selectedLayerTitle;
                colorSteps = state.choroSettings.colorSteps;
            });

            const url = `https://api.mapbox.com/datasets/v1/ethanzawadzke/${datasetId}/features?limit=50&access_token=${accessToken}`;

            fetch(url)
                .then(response => response.json())
                .then(data => {
                    let minPop = Infinity;
                    let maxPop = -Infinity;
                    for (let feature of data.features) {
                        let pop = feature.properties[selectedLayerTitle];
                        minPop = Math.min(minPop, pop);
                        maxPop = Math.max(maxPop, pop);
                    }
                    return [minPop, maxPop];
                })
                .then(range => {
                    let [minPop, maxPop] = range;
                    let colorStops = [];
                    let colors = generateColors(colorSteps);
                    for (let i = 0; i < colors.length; i++) {
                        let pop = minPop + (maxPop - minPop) * (i / (colors.length - 1));
                        colorStops.push(pop, colors[i]);
                    }
                    return colorStops;
                })
                .then(colorStops => {
                    map.addLayer({
                        'id': 'choro-data-layer',
                        'type': 'fill',
                        'source': 'counties-dataset',
                        'source-layer': 'counties-dataset',
                        'paint': {
                            'fill-color': ['step', ['get', selectedLayerTitle], '#fff', ...colorStops],
                            'fill-opacity': 0.8
                        }
                    }, 'road-street');
                    
                    mapState.subscribe(state => {
                        let paintExpression = ['match', ['get', 'GEO_ID']];
                        const paintedCounties = state.toolPaintCountySettings.paintedCounties;
                        const selectedLayerTitle = state.choroSettings.selectedLayerTitle;

                        /* if (mapState.toolMode != "erase") {
                            for (const [geoId, color] of Object.entries(paintedCounties)) {
                                paintExpression.push(geoId, color);
                            }
                        } */

                        //if mapState.toolPaintCountySettings.paintedCounties is not empty
                        if (Object.keys(paintedCounties).length > 0) {
                            for (const [geoId, color] of Object.entries(paintedCounties)) {
                                paintExpression.push(geoId, color);
                            }
                        } else {
                            paintExpression.push('000', '#ffffff');
                        }
                        
                        // If no match, fall back to original choropleth color scheme
                        paintExpression.push(['step', ['get', selectedLayerTitle], '#fff', ...colorStops]);

                        map.setPaintProperty('choro-data-layer', 'fill-color', paintExpression);

                        // Update legend
                        let legend = document.getElementById('legend');
                        legend.innerHTML = `<h4>${layerTitle}</h4>`;
                        for (let i = 0; i < colorStops.length; i += 2) {
                            let pop = colorStops[i];
                            let color = colorStops[i + 1];
                            legend.innerHTML +=
                                `<i style="background:${color};width:10px;height:10px;display:inline-block;"></i> ${pop.toFixed(2)}<br>`;
                        }

                        resolve();
                    }).unsubscribe(); // unsubscribe right after getting the values

                    resolve();
                });


            console.log(`Drawing layer: ${layerTitle}`);

            unsubscribe(); // We need to unsubscribe from the store when we're done
        }
    });
}   

export function handleServiceLine() {
    console.log("Handling service line change");
    const unsubscribe = mapState.subscribe(state => {
        if (state.handleServiceLineChange) {
            for (const [serviceLine, settings] of Object.entries(state.serviceLines)) {
                if (settings.enabled) {
                    if (map.getLayer(`${serviceLine}-data-layer`)) {
                        map.removeLayer(`${serviceLine}-data-layer`);
                    }
                    
                    if (settings.keyword === "heatmap") {
                        map.addLayer(
                            {
                                'id': 'test',
                                'type': 'heatmap',
                                'source': 'SUD RTCs and Outpatient Heatmap',
                                'maxzoom': 9,
                                'paint': {
                                    // Increase the heatmap weight based on frequency and property magnitude
                                    'heatmap-weight': [
                                        'interpolate',
                                        ['linear'],
                                        ["+", ['get', 'BEDS'], ['get', 'SLOTS']],
                                        0,
                                        0,
                                        550, // Change to your maximum sum of beds and slots
                                        1
                                    ],
                                    // Increase the heatmap color weight weight by zoom level
                                    // heatmap-intensity is a multiplier on top of heatmap-weight
                                    'heatmap-intensity': [
                                        'interpolate',
                                        ['linear'],
                                        ['zoom'],
                                        0,
                                        1,
                                        9,
                                        3
                                    ],
                                    // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                                    // Begin color ramp at 0-stop with a 0-transparancy color
                                    // to create a blur-like effect.
                                    'heatmap-color': [
                                        'interpolate',
                                        ['linear'],
                                        ['heatmap-density'],
                                        0,
                                        'rgba(33,102,172,0)',
                                        0.2,
                                        'rgb(103,169,207)',
                                        0.4,
                                        'rgb(209,229,240)',
                                        0.6,
                                        'rgb(253,219,199)',
                                        0.8,
                                        'rgb(239,138,98)',
                                        1,
                                        'rgb(178,24,43)'
                                    ],
                                    // Adjust the heatmap radius by zoom level
                                    'heatmap-radius': [
                                        'interpolate',
                                        ['linear'],
                                        ['zoom'],
                                        0,
                                        10,
                                        9,
                                        20
                                    ],
                                    // Transition from heatmap to circle layer by zoom level
                                    'heatmap-opacity': [
                                        'interpolate',
                                        ['linear'],
                                        ['zoom'],
                                        7,
                                        1,
                                        9,
                                        3
                                    ]
                                }
                            },
                            'waterway-label'
                        );
                    }


                    if (settings.keyword === 'sud/outpatient') {
                        map.addLayer({
                            'id': `${serviceLine}-data-layer`,
                            'type': 'circle',
                            'source': `${serviceLine}`,
                            'source-layer': settings.sourcelayer,
                            'paint': {
                                'circle-color': settings.color,
                                'circle-opacity': 1,
                                'circle-stroke-width': 1,
                                'circle-stroke-color': '#fff',
                                'circle-radius': [
                                    'interpolate',
                                    ['linear'],
                                    ["+", ['get', 'BEDS'], ['get', 'SLOTS']],
                                    0, 2, // Minimum number of beds+slots corresponds to a minimum radius
                                    500, 50 // Maximum number of beds+slots corresponds to a maximum radius
                                ]
                            }
                        }, 'test-layer-outline');
                    } else if (settings.keyword === "realestate") {
                        map.addLayer({
                            'id': `${serviceLine}-data-layer`,
                            'type': 'circle',
                            'source': `${serviceLine}`,
                            'paint': {
                                'circle-color': settings.color,
                                'circle-opacity': 1,
                                'circle-stroke-width': 1,
                                'circle-stroke-color': '#fff',
                                'circle-radius': 10
                            }
                        }, null); 
                    } else {
                        map.addLayer({
                            'id': `${serviceLine}-data-layer`,
                            'type': 'circle',
                            'source': `${serviceLine}`,
                            'source-layer': settings.sourcelayer,
                            'paint': {
                                'circle-color': settings.color,
                                'circle-opacity': 1,
                                'circle-stroke-width': 1,
                                'circle-stroke-color': '#fff',
                                'circle-radius': [
                                    'interpolate',
                                    ['linear'],
                                    ['get', 'BEDS'],
                                    0, 2, // Minimum number of beds corresponds to a minimum radius
                                    300, 30 // Maximum number of beds corresponds to a maximum radius
                                ]
                            }
                        }, 'test-layer-outline'); 
                    }
                    

                    if (settings.cluster) {
                        map.addLayer({
                            'id': `${serviceLine}-cluster`,
                            'type': 'circle',
                            'source': `${serviceLine}`,
                            'filter': ['has', 'point_count'],
                            'paint': {
                                'circle-color': [
                                    'step', 
                                    ['get', 'point_count'], 
                                    `${settings.color}`, 
                                    50, 
                                    `${settings.color}`, 
                                    100, 
                                    `${settings.color}`
                                ],
                                'circle-opacity': 1,
                                'circle-radius': [
                                    'step', 
                                    ['get', 'point_count'], 
                                    10,
                                    12.5,
                                    20, 
                                    25,
                                    40, 
                                    50, 
                                    60, 
                                    100, 
                                    80
                                ]
                            }
                        });

                        if (settings.keyword === 'sud/outpatient') {
                            map.addLayer({
                                'id': `${serviceLine}-beds-layer`,
                                'type': 'symbol',
                                'source': `${serviceLine}`,
                                'source-layer': settings.sourcelayer,
                                'layout': {
                                    'text-field': ['concat', ['get', 'BEDS'], ' Beds\n', ['get', 'SLOTS'], ' Slots'],
                                    'text-size': 12,
                                    'symbol-placement': 'point',
                                },
                                'paint': {
                                    'text-color': '#000'
                                }
                            }, null);
                        } else {
                            map.addLayer({
                                'id': `${serviceLine}-beds-layer`,
                                'type': 'symbol',
                                'source': `${serviceLine}`,
                                'source-layer': settings.sourcelayer,
                                'layout': {
                                    'text-field': ['concat', ['get', 'BEDS'], '\nbeds'],
                                    'text-size': 12,
                                    'symbol-placement': 'point',
                                },
                                'paint': {
                                    'text-color': '#000'
                                }
                            }, null);
                        }

                        

                        map.addLayer({
                            id: `${serviceLine}-cluster-count`,
                            type: 'symbol',
                            source: `${serviceLine}`,
                            filter: ['has', 'point_count'],
                            layout: {
                                'text-field': ['concat', ['get', 'point_count_abbreviated'], `\n${settings.keyword}`],
                                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                                'text-size': 12,
                                'symbol-placement': 'point',
                            }
                        }, null);
                    }
                    
                } else {
                    if (map.getLayer(`${serviceLine}-data-layer`)) {
                        map.removeLayer(`${serviceLine}-data-layer`);
                    }
                    if (map.getLayer(`${serviceLine}-cluster`)) {
                        map.removeLayer(`${serviceLine}-cluster`);
                    }
                    //remove cluster count
                    if (map.getLayer(`${serviceLine}-cluster-count`)) {
                        map.removeLayer(`${serviceLine}-cluster-count`);
                    }
                    if (map.getLayer(`${serviceLine}-beds-layer`)) {
                        map.removeLayer(`${serviceLine}-beds-layer`);
                    }
                    //remove heatmap if not enabed
                    if (map.getLayer('test')) {
                        map.removeLayer('test');
                    }

                }
            }
        }
    });
    unsubscribe();
}



export function createPopup(map, popup, e) {
    //log top layer
    console.log(map.queryRenderedFeatures(e.point));


    let layers = ['choro-data-layer', 'Psychiatric Hospitals', 'General Hospitals', 'SUD RTCs and Outpatient'];
    let features = map.queryRenderedFeatures(e.point, { layers: layers });

    if (!features.length) {
        return;
    }

    let feature = features[0]; // the topmost feature
    let properties = feature.properties;
    let description = '';
    let header = `<h2>${feature.properties.NAME}</h2>`; // Adjust this line to reflect the properties of your circle layer
    for (let property in properties) {
        description += `<strong>${property}:</strong> ${properties[property]}<br>`;
    }

    // Update the content and position of the existing popup instance
    popup.setLngLat(e.lngLat)
        .setHTML(header + description)
        .addTo(map);
}

let currentPopup = null;

export const zoomToFeature = (coordinates) => {
    if (currentPopup) {
        currentPopup.remove();
        currentPopup = null;
    }

    const popup = new mapboxgl.Popup({ offset: 25 });

    // Fly to the new coordinates first
    map.flyTo({ center: coordinates, zoom: 7 });  // adjust zoom level as needed

    // Wait for the 'moveend' event before creating the popup
    map.once('moveend', () => {
        const e = {
            lngLat: {
                lng: coordinates[0],
                lat: coordinates[1]
            },
            point: map.project(new mapboxgl.LngLat(coordinates[0], coordinates[1]))
        };
        createPopup(map, popup, e);
        currentPopup = popup;
    });
};

export const convertMilesToMeters = (miles) => {
    return miles * 1609.34;
}

