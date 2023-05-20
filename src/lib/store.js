import { writable } from 'svelte/store';

export const mapState = writable({
    map: null,
    handleLayerChange: false,
    handleCountyChange: false,
    handleServiceLineChange: false,
    handleColorChange: false,
    choroSettings: {
        layerTitles: ["None"],
        selectedLayerTitle: "None",
        colorSteps: 8,
        startColor: "#f7fbff",
        endColor: "#08306b",
    },
    toolMode: "None",
    toolCircleSettings: {
        radius: null,
        color: "#ff0000",
        circles: {}
    },
    toolPaintCountySettings: {
        color: "#ff0000",
        paintedCounties: {}
    },
    serviceLines: {
        'OTP': {
            enabled: false,
            color: '#2d5093',
            sourcelayer: 'DTX_list_-_DTX_FINAL-19nx7m',
            tilesetId: 'ethanzawadzke.ao961pfm',
        },
        'OBOT': {
            enabled: false,
            color: '#864241',
            sourcelayer: 'Business_Unit_personal_-_Shee-6l8chx',
            tilesetId: 'ethanzawadzke.de1ir845',
        },
        'Coleman': {
            enabled: false,
            color: '#9b8e49',
            sourcelayer: 'Business_Unit_personal_-_Shee-6l8chx',
            tilesetId: 'ethanzawadzke.de1ir845',
        },
        'DTX': {
            enabled: false,
            color: '#0c8040',
            sourcelayer: 'Business_Unit_personal_-_Shee-6l8chx',
            tilesetId: 'ethanzawadzke.de1ir845',
        },
        'RTC': {
            enabled: false,
            color: '#9824e5',
            sourcelayer: 'Business_Unit_personal_-_Shee-6l8chx',
            tilesetId: 'ethanzawadzke.de1ir845',
        },
        'MHP': {
            enabled: false,
            color: '#24c2e5',
            sourcelayer: 'Business_Unit_personal_-_Shee-6l8chx',
            tilesetId: 'ethanzawadzke.de1ir845',
        },
        'OBOT Competitors': {
            enabled: false,
            color: '#ff0000',
            sourcelayer: 'OBOT_Competiors_-8g2bza',
            tilesetId: 'ethanzawadzke.a9bcsbgf',
        },
        'OTP Competitors': {
            enabled: false,
            color: '#641200',
            sourcelayer: 'OBOT_Competitors_-_OTP_Compet-0l1w5r',
            tilesetId: 'ethanzawadzke.60r3z6aa',
        },
    },
});

