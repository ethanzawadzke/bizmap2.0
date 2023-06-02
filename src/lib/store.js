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
            cluster: false,
            enabled: false,
            color: '#2d5093',
            sourcelayer: 'DTX_list_-_DTX_FINAL-19nx7m',
            tilesetId: 'ethanzawadzke.ao961pfm',
        },
        'OBOT': {
            cluster: false,
            enabled: false,
            color: '#864241',
            sourcelayer: 'Business_Unit_personal_-_Shee-6l8chx',
            tilesetId: 'ethanzawadzke.de1ir845',
        },
        'Coleman': {
            cluster: false,
            enabled: false,
            color: '#9b8e49',
            sourcelayer: 'Business_Unit_personal_-_Shee-6l8chx',
            tilesetId: 'ethanzawadzke.de1ir845',
        },
        'DTX': {
            cluster: false,
            enabled: false,
            color: '#0c8040',
            sourcelayer: 'Business_Unit_personal_-_Shee-6l8chx',
            tilesetId: 'ethanzawadzke.de1ir845',
        },
        'RTC': {
            cluster: false,
            enabled: false,
            color: '#9824e5',
            sourcelayer: 'Business_Unit_personal_-_Shee-6l8chx',
            tilesetId: 'ethanzawadzke.de1ir845',
        },
        'MHP': {
            cluster: false,
            enabled: false,
            color: '#24c2e5',
            sourcelayer: 'Business_Unit_personal_-_Shee-6l8chx',
            tilesetId: 'ethanzawadzke.de1ir845',
        },
        'OBOT Competitors': {
            cluster: false,
            enabled: false,
            color: '#ff0000',
            sourcelayer: 'OBOT_Competiors_-8g2bza',
            tilesetId: 'ethanzawadzke.a9bcsbgf',
        },
        'OTP Competitors': {
            cluster: false,
            enabled: false,
            color: '#641200',
            sourcelayer: 'OBOT_Competitors_-_OTP_Compet-0l1w5r',
            tilesetId: 'ethanzawadzke.60r3z6aa',
        },
        "Prospective Real Estate (Select last)": {
            keyword: 'realestate',
            enabled: false,
            color: '#C70039'
        },
        "Psychiatric Hospitals": {
            keyword: 'psych',
            cluster: true,
            enabled: false,
            color: '#E79600',
            sourcelayer: '',
            tilesetId: ''
        },
        "General Hospitals": {
            keyword: 'general',
            cluster: true,
            enabled: false,
            color: '#DCD60A',
            sourcelayer: '',
            tilesetId: ''
        },
        "SUD RTCs and Outpatient": {
            keyword: 'sud/outpatient',
            cluster: true,
            enabled: false,
            color: '#BD15AB',
            sourcelayer: '',
            tilesetId: ''
        },
        "SUD RTCs and Outpatient Heatmap Test": {
            keyword: 'heatmap',
            enabled: false,
        }
    }
});

