<script>
    import { onMount } from "svelte";
    import { mapState } from "$lib/store.js";
    import { accessToken, datasetId } from "$lib/utils/mapboxConfig.js";
    import chroma from "chroma-js";

    const url = `https://api.mapbox.com/datasets/v1/ethanzawadzke/${datasetId}/features?limit=50&access_token=${accessToken}`;

    onMount(async () => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            const properties = data.features[0].properties;
            const propertyNames = Object.keys(properties);
            const numericProperties = propertyNames.filter(name => {
                return typeof properties[name] === 'number';
            });

            // Update the layerTitles value in the store
            mapState.update(state => {
                return { 
                    ...state, 
                    choroSettings: { 
                        ...state.choroSettings, 
                        layerTitles: ["None"].concat(numericProperties) 
                    }
                };
            });
        } catch (error) {
            console.error('Error fetching dataset information:', error);
        }
    });


    function toggleHandleLayerChange() {
        console.log("Toggling handleLayerChange");
        mapState.update(state => {
            if (!state.handleLayerChange) {
                return { 
                    ...state, 
                    handleLayerChange: true 
                };
            }
            return state; // if handleLayerChange is already true, return the state as is
        });
    }
</script>

<section class="sidebar-section">
    <select class="layer-select" bind:value={$mapState.choroSettings.selectedLayerTitle} on:change={toggleHandleLayerChange}>
        {#each $mapState.choroSettings.layerTitles as layerTitle}
            <option value={layerTitle}>{layerTitle}</option>
        {/each}
    </select>
</section>

<style>
    .sidebar-section {
        border-bottom: 1px solid black;
        padding-bottom: 1rem;
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        align-items: start;
    }
</style>