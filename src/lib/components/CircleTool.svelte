<script>
    import { onMount } from "svelte";
    import { mapState } from "$lib/store.js";

    function selectCircleTool () {
        if ($mapState.toolMode === "Circle") {
            mapState.update(value => ({ 
            ...value, 
            toolMode: "None"
            }));
        } else {
            mapState.update(value => ({ 
            ...value, 
            toolMode: "Circle" 
            }));    
        }
    }
</script>

<section class="sidebar-section">
    <button 
        class:active={$mapState.toolMode === "Circle"}   
        checked={$mapState.toolMode === "Circle"} 
        on:click={selectCircleTool}>
        Circle Drawing Tool
    </button>

    <input
        id="radius-input" 
        type="number" 
        bind:value={$mapState.toolCircleSettings.radius} 
        placeholder="Enter radius..." 
    />

    <input 
        id="color-picker" 
        type="color" 
        bind:value={$mapState.toolCircleSettings.color} 
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