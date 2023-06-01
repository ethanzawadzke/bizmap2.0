<script>
    import { onMount } from 'svelte';
    import { mapState } from '$lib/store.js';

    function toggleHandleServiceLineChange(event) {
        const checkboxValue = event.target.value;
        
        console.log(`Toggling ${checkboxValue}`);

        mapState.update(state => {
            if (!state.handleServiceLineChange) {
                return { ...state, handleServiceLineChange: true };
            }
            return state; // if handleServiceLineChange is already true, return the state as is
        });

        mapState.update(state => {
            let newState = {...state};

            if (newState.serviceLines[checkboxValue]) {
                newState.serviceLines[checkboxValue].enabled = !newState.serviceLines[checkboxValue].enabled;
            }
            
            return newState;
        });
    }

    let serviceLinesData = [];

    // Subscribe to the store to get the latest data
    mapState.subscribe(($mapState) => {
        serviceLinesData = Object.entries($mapState.serviceLines).map(([key, value]) => ({
            id: key,
            enabled: value.enabled,
            color: value.color
        }));
    });

</script>

<section class="sidebar-section">
    <form>
        {#each serviceLinesData as serviceLine}
            <input type="checkbox" bind:checked={serviceLine.enabled} id={serviceLine.id} name="checkboxGroup" value={serviceLine.id} on:change={toggleHandleServiceLineChange}>
            <label for={serviceLine.id}>
                <span class="color-square" style="background-color: {serviceLine.color}"></span>
                {serviceLine.id}
            </label><br>
        {/each}
    </form>
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

    .checkbox-item {
        display: flex;
        align-items: center;
        padding: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .color-square {
        display: inline-block;
        width: 10px;
        height: 10px;
    }
</style>