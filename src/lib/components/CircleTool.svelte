<script>
    import { onMount } from "svelte";
    import { mapState } from "$lib/store.js";

    function selectCircleTool () {
        mapState.update(value => ({ ...value, toolMode: "Circle" }));
    }
</script>

<section class="sidebar-section">
    <button on:click={selectCircleTool}>Circle Drawing Tool</button>
    <input id="radius-input" type="number" bind:value={$mapState.toolCircleSettings.radius} placeholder="Enter radius..." />
    <input id="color-picker" type="color" bind:value={$mapState.toolCircleSettings.color} />
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