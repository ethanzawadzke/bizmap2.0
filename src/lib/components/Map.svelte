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
            projection: 'mercator',
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
            });

            map.addSource('SUD RTCs and Outpatient Heatmap', {
                type: 'geojson',
                data: 'https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/Texas%20Data%20Sets%20for%20MAP%20%20-%20Copy%20of%20SUD%20RTC%20and%20Outpatient.geojson',
            });

            map.addSource('Prospective Real Estate (Select last)', {
                type: 'geojson',
                data: 'https://raw.githubusercontent.com/ethanzawadzke/supreme-octo-engine/main/Texas%20Data%20Sets%20for%20MAP%20%20-%20Sheet5.geojson'
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
            if ($mapState.toolMode === "Circle" && !$mapState.contextMenuOpen) {
                console.log('Drawing new circle...')
                console.log('contextMenuOpen:', $mapState.contextMenuOpen)
                const circle = new MapboxCircle(e.lngLat, convertMilesToMeters($mapState.toolCircleSettings.radius), {
                        editable: true,
                        fillColor: $mapState.toolCircleSettings.color
                    }).addTo(map, null);

                    const circleObject = {
                        id: Date.now(),
                        circle: circle
                    };

                    const popup = new mapboxgl.Popup({ 
                        className: 'no-padding no-arrow', 
                        closeOnClick: true, 
                        closeButton: false,
                        anchor: 'bottom-left', 
                        offset: [0, 0]  
                    });

                    circleObject.circle.on('contextmenu', function(e) {
                        e.preventDefault();
                        console.log('Opening context menu...')
                        mapState.update(state => {
                            state.contextMenuOpen = true;
                            return state;
                        });
                        console.log('Context menu open:', $mapState.contextMenuOpen);


                        const deleteButton = document.createElement('button');
                        deleteButton.textContent = 'Delete';
                        deleteButton.style.cssText = `
                            display: block;
                            background-color: white;
                            color: black;
                            padding: 5px 10px;
                            border: none;
                            text-align: left;
                            cursor: pointer;
                            width: 100%;
                            box-sizing: border-box;
                        `;
                        deleteButton.onmouseover = function() {
                            this.style.backgroundColor = '#0078D7';
                            this.style.color = 'white';
                        };
                        deleteButton.onmouseout = function() {
                            this.style.backgroundColor = 'white';
                            this.style.color = 'black';
                        };
                        deleteButton.onclick = function() {
                            circleObject.circle.remove();
                            mapState.update(state => {
                                delete state.toolCircleSettings.circles[circleObject.id];
                                return state;
                            });

                            console.log('Removing popup...')
                            popup.remove(); // Close the popup when we delete the circle
                            mapState.update(state => {
                                state.contextMenuOpen = false;
                                return state;
                            });
                            console.log('Context menu status:', $mapState.contextMenuOpen);
                        };

                        popup.on('close', function() {
                            console.log('Closing popup...')
                            mapState.update(state => {
                                state.contextMenuOpen = false;
                                return state;
                            });// Also close the context menu when it is closed without clicking the delete button
                            console.log('Context menu status:', $mapState.contextMenuOpen);
                        });

                        popup.setLngLat(e.lngLat)
                            .setDOMContent(deleteButton)
                            .addTo(map);
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
                let choroFeatures = map.queryRenderedFeatures(e.point, { layers: ['choro-data-layer'] });
                let psychFeatures = map.queryRenderedFeatures(e.point, { layers: ['Psychiatric Hospitals-data-layer'] });
                let genFeatures = map.queryRenderedFeatures(e.point, { layers: ['General Hospitals-data-layer'] });
                let sudFeatures = map.queryRenderedFeatures(e.point, { layers: ['SUD RTCs and Outpatient-data-layer'] });
                let realFeatures = map.queryRenderedFeatures(e.point, { layers: ['Prospective Real Estate (Select last)-data-layer'] });

                if (!choroFeatures.length && !psychFeatures.length && !genFeatures.length && !sudFeatures.length && !realFeatures.length) {
                    return;
                }

                let properties;
                let header;
                if (choroFeatures.length > 0) {
                    properties = choroFeatures[0].properties;
                } else if (psychFeatures.length > 0) {
                    properties = psychFeatures[0].properties;
                } else if (genFeatures.length > 0) {
                    properties = genFeatures[0].properties;
                } else if (sudFeatures.length > 0) {
                    properties = sudFeatures[0].properties;
                } else {
                    properties = realFeatures[0].properties;
                }

                if (properties['DBA NAME']) {
                    header = `<h2>${properties['DBA NAME']}</h2>`;
                } else if (properties.NAME) {
                    header = `<h2>${properties.NAME}</h2>`;
                } else if (properties['LEGAL NAME']) {
                    header = `<h2>${properties['LEGAL NAME']}</h2>`;
                } else if (properties['API ADDRESS']) {
                    header = `<h2>${properties['API ADDRESS']}</h2>`;
                } else {
                    header = "<h2>Unknown</h2>";
                }

                let description = '';
                for (let property in properties) {
                    description += `<strong>${property}:</strong> ${properties[property]}<br>`;
                }

                // Update the content and position of the existing popup instance
                popup.setLngLat(e.lngLat)
                    .setHTML(header + description)
                    .addTo(map);
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