<script>
    import { onMount } from "svelte";
    import mapboxgl from "mapbox-gl";
    import "mapbox-gl/dist/mapbox-gl.css";
    import { mapState } from "$lib/store.js";
    import { accessToken, datasetId } from "$lib/utils/mapboxConfig.js";
    import { clearLayers, drawLayer, handleServiceLine } from "$lib/utils/mapUtils.js";
    import { sources } from "$lib/utils/sources.js";

    let map;
    let mapContainer;
    let MapboxCircle;

    function addSourcesToMap(map, sources) {
        for (const [key, value] of Object.entries(sources)) {
            map.addSource(key, {
                type: 'vector',
                url: `mapbox://${value.tilesetId}`
            });
        }
    }

    async function initMap() {
        const module = await import('mapbox-gl-circle');
        MapboxCircle = module.default;

        mapboxgl.accessToken = accessToken;
        
        const map = new mapboxgl.Map({
            container: mapContainer, 
            style: 'mapbox://styles/mapbox/streets-v12', 
            center: [-73.99283,40.750813], 
            zoom: 5
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
                'source-layer': 'counties-dataset',
                'paint': {
                    'line-color': '#000000',
                    'line-width': .5,
                    'line-opacity': .5
                }
            });

            addSourcesToMap(map, sources);
        })

        // Add your onclick listeners
        map.on('click', function(e) {
            if ($mapState.toolMode === "Circle") {
                const circle = new MapboxCircle(e.lngLat, $mapState.toolCircleSettings.radius, {
                        editable: true,
                        fillColor: $mapState.toolCircleSettings.color
                    }).addTo(map, null);

                    const circleObject = {
                        id: Date.now(),
                        circle: circle
                    };

                    mapState.update(state => {
                        state.toolCircleSettings.circles[circleObject.id] = circleObject;
                        return state;
                    });
            } else if ($mapState.toolMode === "Paint") {
                var features = map.queryRenderedFeatures(e.point, { layers: ['choro-data-layer'] });
                console.log(features);
                if (!features.length) {
                    return;
                }
                var feature = features[0];

                mapState.update(state => {
                    let updatedPaintedCounties = {...state.toolPaintCountySettings.paintedCounties};
                    updatedPaintedCounties[feature.properties.GEO_ID] = $mapState.toolPaintCountySettings.color;
                    state.toolPaintCountySettings.paintedCounties = updatedPaintedCounties;
                    console.log(state.toolPaintCountySettings.paintedCounties)
                    return state;
                });
            } else {
                map.on('click', 'choro-data-layer', function(e) {
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
                });
            }
        });

        await new Promise(resolve => map.on('load', resolve));

        return map;
    }
    
    onMount(async () => {
        map = await initMap();
        
        mapState.update(state => ({ ...state, map }));
        
        return () => {
            map.remove();
        };
    })

    function drawPaintedCounties(map, mapState, layerName = 'choro-data-layer') {
        // create a new expression that matches the feature id to assign the new color
        var paintExpression = ["match", ["get", "GEO_ID"]];

        // Loop over all painted counties and add them to the paintExpression
        for (const [geoId, color] of Object.entries(mapState.toolPaintCountySettings.paintedCounties)) {
            paintExpression.push(geoId, color);
        }

        // fallback value, if id doesn't match (preserves the existing colors)
        paintExpression.push(map.getPaintProperty(layerName, 'fill-color'));

        map.setPaintProperty(layerName, 'fill-color', paintExpression);
    }

    $: {
        if ($mapState.handleLayerChange) {
            console.log("Handling layer change");
            clearLayers();
            drawLayer($mapState.choroSettings.selectedLayerTitle);
            mapState.update(state => ({ ...state, handleLayerChange: false }));
        }
        else if ($mapState.handleCountyChange) {
            console.log("Handling paint county change");
            drawPaintedCounties(map, $mapState);
            mapState.update(state => ({ ...state, handlePaintCountyChange: false }));
        }
        // handle checkbox changes
        else if ($mapState.handleServiceLineChange) {
            console.log("Handling checkbox change");
            handleServiceLine();
            mapState.update(state => ({ ...state, handleServiceLineChange: false }));
        }
    }

</script>

<div bind:this={mapContainer} id="map" style="width: 100%; height: 100vh;"></div>