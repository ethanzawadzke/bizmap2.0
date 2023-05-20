<script>
    import { mapState } from "$lib/store.js";
    import LayerSelect from "./LayerSelect.svelte";
    import ChoroOptions from "./ChoroOptions.svelte";
    import CircleTool from "./CircleTool.svelte";
    import PaintTool from "./PaintTool.svelte";
    import ServiceLineToggles from "./ServiceLineToggles.svelte";
    import LayerTable from "./LayerTable.svelte";
</script>

<div class="sidebar">
    <LayerSelect />

    <ChoroOptions />

    <CircleTool />

    <PaintTool />

    <ServiceLineToggles />

    <LayerTable />
</div>

<div id="legend" class="legend"></div>

<style>
    .sidebar {
        display: flex;
        flex-direction: column;
        bottom: 0;
        left: 0;
        background-color: white;
        padding-top: 1rem;
        padding-bottom: 1rem;
    }

    .legend {
        background-color: #fff;
        border-radius: 3px;
        bottom: 30px;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        font: 12px/20px 'Helvetica Neue', Arial, Helvetica, sans-serif;
        padding: 10px;
        position: absolute;
        right: 10px;
        z-index: 1;
    }

    .layer-select {
        top: 10px;
        left: 10px;
        z-index: 1;
    }

    label {
        display: block;
        font-size: 12px;
        margin-top: .5rem;
    }

    #start-color-input, #end-color-input {
        border: none;
        border-radius: 5px;
        height: 2rem;
        cursor: pointer;
        transition: box-shadow 0.3s ease;
    }

    #start-color-input:focus, #end-color-input:focus {
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    }

    #color-steps-input {
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 0.5rem;
        width: 3rem;
    }

    #color-steps-input:focus {
        border-color: #5c6bc0;
        outline: none;
    }
</style>