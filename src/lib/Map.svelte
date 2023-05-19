<!-- src/lib/Map.svelte -->
<script>
    import { onMount } from "svelte";
    import mapboxgl from "mapbox-gl";
    import "mapbox-gl/dist/mapbox-gl.css";
    import { get } from 'svelte/store';
    import { mapState } from "./store.js";

    export let map;

    let MapboxCircle;

    onMount(async () => {
        const module = await import('mapbox-gl-circle');
        MapboxCircle = module.default;
    });

    let mapDiv;

    onMount(() => {
        mapboxgl.accessToken = 'pk.eyJ1IjoiZXRoYW56YXdhZHprZSIsImEiOiJjbDdvNDllbHUyODI2M3VvM29ieWkwMWpjIn0.64VWitRTyHE-LheRQ3gCyg';
        map = new mapboxgl.Map({
            container: mapDiv, // HTML element, not the string 'mapDiv'
            style: 'mapbox://styles/mapbox/streets-v12', // style URL
            center: [-74.5, 40], // starting position [lng, lat]
            zoom: 9 // starting zoom
        });

        map.on('load', function() {
            map.addSource('counties-dataset', {
                type: 'vector',
                url: 'mapbox://ethanzawadzke.clhtts6vu32zj2pobovnqn7tk-91mdg'
            });

            map.addLayer({
                'id': 'test-layer-outline',
                'type': 'line',
                'source': 'counties-dataset',
                'source-layer': 'counties-dataset', // usually the name of your dataset
                'paint': {
                    'line-color': '#000000',
                    'line-width': .5,
                    'line-opacity': .5
                }
            });

            /* map.on('click', 'choro-data-layer', function(e) {
                let properties = e.features[0].properties;

                let description = '';
                for (let property in properties) {
                    if (typeof properties[property] === 'number') {
                        description += `<strong>${property}:</strong> ${properties[property]}<br>`;
                    }
                }

                new mapboxgl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(description)
                    .addTo(map);
            }); */

            map.on('click', function(e) {
                if (get(mapState).toolMode === "Circle") {  // Check for current toolMode
                    const circle = new MapboxCircle(e.lngLat, $mapState.toolCircleSettings.radius, {
                        editable: true,
                        fillColor: $mapState.toolCircleSettings.color
                    }).addTo(map);

                    const circleObject = {
                        id: Date.now(), // generate a unique id based on current time
                        circle: circle
                    };

                    mapState.update(state => {
                        state.toolCircleSettings.circles = [...state.toolCircleSettings.circles, circleObject];
                        return state;
                    });
                } else if (get(mapState).toolMode === "Paint") {
                    // get id of clicked feature
                    var features = map.queryRenderedFeatures(e.point, { layers: ['choro-data-layer'] });
                    console.log(features);
                    if (!features.length) {
                        return;
                    }
                    var feature = features[0];

                    // create a new expression that matches the feature id to assign the new color
                    var paintExpression = ["match", ["get", "GEO_ID"]];
                    paintExpression.push(feature.properties.GEO_ID);
                    paintExpression.push($mapState.toolPaintCountySettings.color);
                    // fallback value, if id doesn't match (preserves the existing colors)
                    paintExpression.push(map.getPaintProperty('choro-data-layer', 'fill-color'));

                    map.setPaintProperty('choro-data-layer', 'fill-color', paintExpression);
                }
            });

        });
    })

</script>

<div bind:this={mapDiv} id="map" style="width: 100%; height: 100vh;"></div>
