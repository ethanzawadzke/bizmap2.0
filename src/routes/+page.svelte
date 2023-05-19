<script> 
    import Map from "$lib/Map.svelte"; 
    import MapLayers from "../lib/MapLayers.svelte";

    let map;
</script>

<MapLayers {map}/>
<Map bind:map={map} />