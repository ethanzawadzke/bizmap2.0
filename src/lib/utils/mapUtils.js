import { mapState } from "$lib/store.js";
import { accessToken, datasetId } from "./mapboxConfig.js";
import chroma from "chroma-js";
import { sources } from "./sources.js";

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
                    }, 'test-layer-outline');
                    
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
                        paintExpression.push(['interpolate', ['linear'], ['get', selectedLayerTitle], ...colorStops]);

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

export function handleServiceLine () {
    console.log("Handling service line change");
    const unsubscribe = mapState.subscribe(state => {
        if (state.handleServiceLineChange) {
            for (const [serviceLine, settings] of Object.entries(state.serviceLines)) {
                if (settings.enabled) {
                    map.addLayer({
                        'id': `${serviceLine}-data-layer`,
                        'type': 'circle',
                        'source': `${serviceLine}`,
                        'source-layer': settings.sourcelayer,
                        'paint': {
                            'circle-color': settings.color,
                            'circle-opacity': 1
                        }
                    }, 'test-layer-outline');
                } else {
                    if (map.getLayer(`${serviceLine}-data-layer`)) {
                        map.removeLayer(`${serviceLine}-data-layer`);
                    }
                }
            }
        }
    });

    unsubscribe();
}

export const zoomToFeature = (coordinates) => {
    map.flyTo({ center: coordinates, zoom: 10 });  // adjust zoom level as needed
};
