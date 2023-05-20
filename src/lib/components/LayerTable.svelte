<script>
    import { onMount } from 'svelte';
    import { mapState } from '$lib/store.js';
    import { zoomToFeature } from '$lib/utils/mapUtils.js';

    let data = [];
    let sortKey = 'county';  // default sort key
    let sortAsc = true;  // default sort order
    let sortedData = [];  // array to hold the sorted data

    const fetchData = async () => {
        // fetch data from Mapbox API
        const response = await fetch('https://api.mapbox.com/datasets/v1/ethanzawadzke/clhtts6vu32zj2pobovnqn7tk/features?access_token=pk.eyJ1IjoiZXRoYW56YXdhZHprZSIsImEiOiJjbDdvNDllbHUyODI2M3VvM29ieWkwMWpjIn0.64VWitRTyHE-LheRQ3gCyg');
        const json = await response.json();

        data = json.features.map(feature => {
        let coordinates;
        switch (feature.geometry.type) {
            case 'Point':
                coordinates = feature.geometry.coordinates;
                break;
            case 'Polygon':
                const polygonCoordinates = feature.geometry.coordinates[0];
                const sumLng = polygonCoordinates.reduce((acc, coord) => acc + coord[0], 0);
                const sumLat = polygonCoordinates.reduce((acc, coord) => acc + coord[1], 0);
                const centerLng = sumLng / polygonCoordinates.length;
                const centerLat = sumLat / polygonCoordinates.length;
                coordinates = [centerLng, centerLat];
                break;
            // Handle other geometry types if needed
            default:
                coordinates = null;
        }

        return {
            id: feature.id,
            county: feature.properties.NAME,
            state: feature.properties.STATE,
            datapoint: feature.properties[$mapState.choroSettings.selectedLayerTitle],
            coordinates: coordinates
            // and so on for the other fields...
        };
    });



        /* console.log("Data fetched from Mapbox API:");
        console.log(data); */
    };

    const sortData = (key) => {
        console.log("Sorting data by: " + key);
        if (sortKey === key) {
            sortAsc = !sortAsc;
        } else {
            sortKey = key;
            sortAsc = true;
        }
    };

    // Sort data whenever data, sortKey, or sortAsc changes
    $: sortedData = [...data].sort((a, b) => {
            if (a[sortKey] < b[sortKey]) return sortAsc ? -1 : 1;
            if (a[sortKey] > b[sortKey]) return sortAsc ? 1 : -1;
            return 0;
        });

    onMount(fetchData);  // fetch data initially

    // re-fetch data whenever $mapState.choroSettings.selectedLayerTitle changes
    $: fetchData(), $mapState.choroSettings.selectedLayerTitle;
</script>

<section class="sidebar-section">
  <table>
      <thead>
          <tr>
              <th><button on:click={() => sortData('county')}>County</button></th>
              <th><button on:click={() => sortData('state')}>State</button></th>
              <th><button on:click={() => sortData('datapoint')}>Datapoint</button></th>
              <!-- and so on... -->
          </tr>
      </thead>
      <tbody>
          {#each sortedData as row (row.id)}
              <tr on:click={() => zoomToFeature(row.coordinates)}>
                  <td>{row.county}</td>
                  <td>{row.state}</td>
                  <td>{row.datapoint}</td>
                  <!-- and so on... -->
              </tr>
          {/each}
      </tbody>
  </table>
</section>

<style>
  .sidebar-section {
        border-bottom: 1px solid black;
        padding-bottom: 1rem;
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        align-items: start;
        height: 100%;
        overflow-y: scroll;
    }

    table {
      height: 100%;
    }
</style>