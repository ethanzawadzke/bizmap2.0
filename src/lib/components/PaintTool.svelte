<script>
    import { onMount } from "svelte";
    import { mapState } from "$lib/store.js";

    function selectPaintTool() {
        mapState.update(value => ({ ...value, toolMode: "Paint" }));
    }
</script>

<section class="sidebar-section">
    <button on:click={selectPaintTool}>Paint Tool</button>
    <input id="paint-color-picker" type="color" 
        bind:value={$mapState.toolPaintCountySettings.color} 
        on:change={() => mapState.update(value => ({ ...value, toolPaintCountySettings: { ...value.toolPaintCountySettings, color: $mapState.toolPaintCountySettings.color }}))}
    />
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