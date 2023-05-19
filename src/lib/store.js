import { writable } from 'svelte/store';

export const mapState = writable({
    choroSettings: {
        layerTitles: ["None"],
        selectedLayerTitle: "None",
        colorSteps: 9,
        startColor: "#f7fbff",
        endColor: "#08306b",
    },
    toolMode: "None",
    toolCircleSettings: {
        radius: null,
        color: "#ff0000",
        circles: []
    },
    toolPaintCountySettings: {
        color: "#ff0000",
        counties: []
    },
});