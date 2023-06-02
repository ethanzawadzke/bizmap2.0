<script>
    import { onMount } from "svelte";
    import mapboxgl from "mapbox-gl";
    import "mapbox-gl/dist/mapbox-gl.css";
    import { mapState } from "$lib/store.js";
    import { accessToken, datasetId } from "$lib/utils/mapboxConfig.js";
    import { clearLayers, drawLayer, handleServiceLine, createPopup, convertMilesToMeters } from "$lib/utils/mapUtils.js";
    import { sources } from "$lib/utils/sources.js";
    import { append } from "svelte/internal";

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

            map.addSource('Psychiatric Hospitals', {
                type: 'geojson',
                data: 'https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/8a7cd9525aaa2a7b360e4b43c4f1c38dd12d379b/Texas%20Data%20Sets%20for%20MAP%20%20-%20Copy%20of%20Psych%20Hospitals.geojson',
                'cluster': true, // Enable clustering
                'clusterMaxZoom': 8,
                'clusterRadius': 35 // Radius of each cluster when clustering points (defaults to 50)
            });

            map.addSource('SUD RTCs and Outpatient', {
                type: 'geojson',
                data: 'https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/Texas%20Data%20Sets%20for%20MAP%20%20-%20Copy%20of%20SUD%20RTC%20and%20Outpatient.geojson',
                'cluster': true, // Enable clustering
                'clusterMaxZoom': 8,
                'clusterRadius': 50 // Radius of each cluster when clustering points (defaults to 50)
            });

            map.addSource('General Hospitals', {
                type: 'geojson',
                data: 'https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/Texas%20Data%20Sets%20for%20MAP%20%20-%20Copy%20of%20General%20Hospitals%20%20(2).geojson',
                'cluster': true, // Enable clustering
                'clusterMaxZoom': 8,
                'clusterRadius': 50
            })

            map.addSource('SUD RTCs and Outpatient Heatmap', {
                type: 'geojson',
                data: 'https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/Texas%20Data%20Sets%20for%20MAP%20%20-%20Copy%20of%20SUD%20RTC%20and%20Outpatient.geojson',
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

        let popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: true
        });

        map.on('click', function(e) {
            if ($mapState.toolMode === "Circle") {
                const circle = new MapboxCircle(e.lngLat, convertMilesToMeters($mapState.toolCircleSettings.radius), {
                        editable: true,
                        fillColor: $mapState.toolCircleSettings.color
                    }).addTo(map, null);

                    const circleObject = {
                        id: Date.now(),
                        circle: circle
                    };

                    circleObject.circle.on('contextmenu', function(e) {
                        circleObject.circle.remove();
                        mapState.update(state => {
                            delete state.toolCircleSettings.circles[circleObject.id];
                            return state;
                        });
                    });

                    circle.once('radiuschanged', function (circleObj) {
                        console.log('New radius (once!):', circleObj.getRadius());
                    });

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
            } else if ($mapState.toolMode === "Erase") {
                const features = map.queryRenderedFeatures(e.point, { layers: ['choro-data-layer'] });
                if (features.length) {
                    const { GEO_ID } = features[0].properties;  
                    mapState.update(state => {
                        delete state.toolPaintCountySettings.paintedCounties[GEO_ID];
                        console.log(state.toolPaintCountySettings.paintedCounties);
                        return state;
                    });
                }
            }   else {
                // Create popup on click
                createPopup(map, popup, e);
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
        var paintExpression;  
        
        if (Object.keys(mapState.toolPaintCountySettings.paintedCounties).length) {
            if (mapState.toolMode !== "Erase") {
            paintExpression = ["match", ["get", "GEO_ID"]];
            for (const [geoId, color] of Object.entries(mapState.toolPaintCountySettings.paintedCounties)) {
                paintExpression.push(geoId, color);   
            }    
            }   
        } else {
            paintExpression = map.getPaintProperty(layerName, 'fill-color');
        }

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
        else if ($mapState.handleTexasFacilityChange) {
            console.log("Handling checkbox change");
            handleTexasFacility();
            mapState.update(state => ({ ...state, handleServiceLineChange: false }));
        }
    }

</script>

<div bind:this={mapContainer} id="map" style="width: 100%; height: 100vh;"></div>

<style>
    h2 {
        margin: 0;
        padding: 0;
    }
</style>