<script>
    import { onMount } from "svelte";
    import { mapState } from "$lib/store.js";

    function selectPaintTool () {
        if ($mapState.toolMode === "Paint") {
            mapState.update(value => ({ 
            ...value, 
            toolMode: "None"
            }));
        } else {
            mapState.update(value => ({ 
            ...value, 
            toolMode: "Paint" 
            }));    
        }
    }

    function erasePaint () {
        if ($mapState.toolMode === "Erase") {
            mapState.update(value => ({ 
            ...value, 
            toolMode: "None"
            }));
        } else {
            mapState.update(value => ({ 
            ...value, 
            toolMode: "Erase" 
            }));    
        }
    }
</script>

<section class="sidebar-section">
    <button 
        class:active={$mapState.toolMode === "Paint"}  
        checked={$mapState.toolMode === "Paint"} 
        on:click={selectPaintTool}>
        Paint Tool
    </button>
    <button 
        class:active={$mapState.toolMode === "Erase"}  
        checked={$mapState.toolMode === "Erase"} 
        on:click={erasePaint} >
        Erase
    </button>
    <input 
        id="paint-color-picker" 
        type="color" 
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