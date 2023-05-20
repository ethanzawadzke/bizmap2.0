<script>
    import { onMount } from "svelte";
    import { mapState } from "$lib/store.js";

    function handleColorChange() {
        mapState.update(state => {
            return { ...state, handleColorChange: true };
        });
    }
</script>

<section class="sidebar-section">
    <label for="color-steps-input">Color Steps:</label>
    <input id="color-steps-input" type="number" bind:value={$mapState.choroSettings.colorSteps}/>

    <label for="start-color-input">Color 1:</label>
    <input id="start-color-input" type="color" bind:value={$mapState.choroSettings.startColor} on:change={handleColorChange}/>

    <label for="end-color-input">Color 2:</label>
    <input id="end-color-input" type="color" bind:value={$mapState.choroSettings.endColor} on:change={handleColorChange}/>
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