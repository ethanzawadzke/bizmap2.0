<script>
    import { onMount } from "svelte";
    import mapboxgl from "mapbox-gl";
    import Map from "./Map.svelte";
    import "mapbox-gl/dist/mapbox-gl.css";
    import chroma from "chroma-js";
    import { mapState } from "./store.js";
    import { get } from 'svelte/store';
    
    console.log("hello");

    const datasetId = 'clhtts6vu32zj2pobovnqn7tk';
    const accessToken = 'pk.eyJ1IjoiZXRoYW56YXdhZHprZSIsImEiOiJjbDdvNDllbHUyODI2M3VvM29ieWkwMWpjIn0.64VWitRTyHE-LheRQ3gCyg';

    const url = `https://api.mapbox.com/datasets/v1/ethanzawadzke/${datasetId}/features?limit=50&access_token=${accessToken}`;

    let isLoading = false;

    export let map;

    let MapboxCircle;

    onMount(async () => {
        const module = await import('mapbox-gl-circle');
        MapboxCircle = module.default;
    });

    function selectCircleTool() {
        mapState.update(state => {
            state.toolMode = "Circle";
            return state;
        });
    }

    function selectPaintTool() {
        mapState.update(state => {
            state.toolMode = "Paint";
            return state;
        });
    }

    // Reactive statement to redraw the map when necessary
    $: redrawMap();
    async function redrawMap() {
        clearLayers();
        await drawLayer($mapState.choroSettings.selectedLayerTitle);
    }

    // Clear all map layers
        function clearLayers() {
            if (map) {
                map.removeLayer("choro-data-layer");
            }
        }

    // Handle dropdown change event
    async function handleDropdownChange(event) {
        mapState.update(state => {
            state.choroSettings.selectedLayerTitle = event.target.value;
            return state;
        });
        clearLayers();
        await drawLayer($mapState.choroSettings.selectedLayerTitle);
    }

    function generateColors(numColors) {
        return chroma.scale([$mapState.choroSettings.startColor, $mapState.choroSettings.endColor]).colors(numColors);
    }

    function drawLayer(layerTitle) {
        return new Promise((resolve, reject) => {
            if (layerTitle !== "None") {
                const url = `https://api.mapbox.com/datasets/v1/ethanzawadzke/${datasetId}/features?limit=50&access_token=${accessToken}`;
                
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        let minPop = Infinity;
                        let maxPop = -Infinity;
                        for (let feature of data.features) {
                            let pop = feature.properties[$mapState.choroSettings.selectedLayerTitle]; // updated reference to selectedLayerTitle
                            minPop = Math.min(minPop, pop);
                            maxPop = Math.max(maxPop, pop);
                        }
                        return [minPop, maxPop];
                    })
                    .then(range => {
                        let [minPop, maxPop] = range;
                        let colorStops = [];
                        let colors = generateColors($mapState.choroSettings.colorSteps); // updated reference to colorSteps
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
                                    'fill-color': ['interpolate', ['linear'], ['get', $mapState.choroSettings.selectedLayerTitle], ...colorStops], // updated reference to selectedLayerTitle
                                    'fill-opacity': 0.8
                                }
                            });

                            // Add legend
                            let legend = document.getElementById('legend');
                            legend.innerHTML = `<h4>${layerTitle}</h4>`;
                            for (let i = 0; i < colorStops.length; i+=2) {
                                let pop = colorStops[i];
                                let color = colorStops[i+1];
                                legend.innerHTML +=
                                    `<i style="background:${color};width:10px;height:10px;display:inline-block;"></i> ${pop.toFixed(2)}<br>`;
                            }

                            // Draw the painted counties from the store after adding the layer and the legend
                            let paintExpression = ['match', ['get', 'GEO_ID']];

                            for (const [geoId, color] of Object.entries($mapState.toolPaintCountySettings.paintedCounties)) {
                                paintExpression.push(geoId, color);
                            }

                            // If no match, fall back to original choropleth color scheme
                            paintExpression.push(['interpolate', ['linear'], ['get', $mapState.choroSettings.selectedLayerTitle], ...colorStops]);

                            map.setPaintProperty('choro-data-layer', 'fill-color', paintExpression);

                            resolve();
                    });
                console.log(`Drawing layer: ${layerTitle}`);
            }
        });
    }

    onMount(() => {
        // Make a GET request to fetch the dataset information
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const properties = data.features[0].properties;
                const propertyNames = Object.keys(properties);
                const numericProperties = propertyNames.filter(name => {
                    return typeof properties[name] === 'number';
                });

                // Update the layerTitles value in the store
                mapState.update(state => {
                    state.choroSettings.layerTitles = ["None"].concat(numericProperties);
                    return state;
                });
            })
            .catch(error => {
                console.error('Error fetching dataset information:', error);
            });
    })
</script>

<div id="legend" class="legend"></div>

<div class="options-container">
    <select class="layer-select" bind:value={$mapState.choroSettings.selectedLayerTitle} on:change={handleDropdownChange}>
        {#each $mapState.choroSettings.layerTitles as layerTitle}
            <option value={layerTitle}>{layerTitle}</option>
        {/each}
    </select>

    <div class="choro-options">
        <label for="color-steps-input">Color Steps:</label>
        <input id="color-steps-input" type="number" bind:value={$mapState.choroSettings.colorSteps} on:input={redrawMap} />

        <label for="start-color-input">Color 1:</label>
        <input id="start-color-input" type="color" bind:value={$mapState.choroSettings.startColor} on:input={redrawMap} />

        <label for="end-color-input">Color 2:</label>
        <input id="end-color-input" type="color" bind:value={$mapState.choroSettings.endColor} on:input={redrawMap}  />
    </div>

    <div class="circle-drawing-tools">
        <button on:click={selectCircleTool}>Circle Drawing Tool</button>
        <input id="radius-input" type="number" bind:value={$mapState.toolCircleSettings.radius} placeholder="Enter radius..." />
        <input id="color-picker" type="color" bind:value={$mapState.toolCircleSettings.color} />
    </div>

    <div class="painting-tools">
        <button on:click={selectPaintTool}>Paint Tool</button>
        <input id="paint-color-picker" type="color" 
            bind:value={$mapState.toolPaintCountySettings.color} 
            on:change={() => mapState.update(value => ({ ...value, toolPaintCountySettings: { ...value.toolPaintCountySettings, color: $mapState.toolPaintCountySettings.color }}))}
        />
    </div>
</div>




<style>
    .options-container {
        display: flex;
        flex-direction: column;
        bottom: 0;
        left: 0;
        gap: 1rem;
        background-color: white;
        padding: 1rem;
    }

    .choro-options {
        display: flex;
        flex-direction: column;
        align-items: start;
    }

    .legend {
        background-color: #fff;
        border-radius: 3px;
        bottom: 30px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
        padding: 10px;
        position: absolute;
        right: 10px;
        z-index: 1;
    }

    .layer-select {
        top: 10px;
        left: 10px;
        z-index: 1;
    }

    label {
    display: block;
    font-size: 12px;
    margin-top: .5rem;
    }

    #start-color-input, #end-color-input {
    border: none;
    border-radius: 5px;
    height: 2rem;
    cursor: pointer;
    transition: box-shadow 0.3s ease;
    }

    #start-color-input:focus, #end-color-input:focus {
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    }

    #color-steps-input {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 0.5rem;
    width: 3rem;
    }

    #color-steps-input:focus {
    border-color: #5c6bc0;
    outline: none;
    }


</style>