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
            // Clone state to avoid directly mutating it
            let newState = {...state};

            // Toggle the "enabled" property of the corresponding service line
            if (newState.serviceLines[checkboxValue]) {
                newState.serviceLines[checkboxValue].enabled = !newState.serviceLines[checkboxValue].enabled;
            }
            
            return newState;
        });
    }

</script>

<section class="sidebar-section">
    <form>
        <input type="checkbox" id="option1" name="checkboxGroup" value="OTP" on:change={toggleHandleServiceLineChange}>
        <label for="option1">
            <span class="color-square" style="background-color: {$mapState.serviceLines.OTP.color}"></span>
            OTP
        </label><br>

        <input type="checkbox" id="option2" name="checkboxGroup" value="OBOT" on:change={toggleHandleServiceLineChange}>
        <label for="option2">
            <span class="color-square" style="background-color: {$mapState.serviceLines.OBOT.color}"></span>
            OBOT
        </label><br>

        <input type="checkbox" id="option3" name="checkboxGroup" value="Coleman" on:change={toggleHandleServiceLineChange}>
        <label for="option3">
            <span class="color-square" style="background-color: {$mapState.serviceLines.Coleman.color}"></span>
            Coleman
        </label><br>

        <input type="checkbox" id="option4" name="checkboxGroup" value="DTX" on:change={toggleHandleServiceLineChange}>
        <label for="option4">
            <span class="color-square" style="background-color: {$mapState.serviceLines.DTX.color}"></span>
            DTX
        </label><br>

        <input type="checkbox" id="option5" name="checkboxGroup" value="RTC" on:change={toggleHandleServiceLineChange}>
        <label for="option5">
            <span class="color-square" style="background-color: {$mapState.serviceLines.RTC.color}"></span>
            RTC
        </label><br>

        <input type="checkbox" id="option6" name="checkboxGroup" value="MHP" on:change={toggleHandleServiceLineChange}>
        <label for="option6">
            <span class="color-square" style="background-color: {$mapState.serviceLines.MHP.color}"></span>
            MHP
        </label><br>

        <input type="checkbox" id="option7" name="checkboxGroup" value="OBOT Competitors" on:change={toggleHandleServiceLineChange}>
        <label for="option7">
            <span class="color-square" style="background-color: {$mapState.serviceLines["OBOT Competitors"].color}"></span>
            OBOT Competitors
        </label><br>

        <input type="checkbox" id="option8" name="checkboxGroup" value="OTP Competitors" on:change={toggleHandleServiceLineChange}>
        <label for="option8">
            <span class="color-square" style="background-color: {$mapState.serviceLines["OTP Competitors"].color}"></span>
            OTP Competitors
        </label><br>
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