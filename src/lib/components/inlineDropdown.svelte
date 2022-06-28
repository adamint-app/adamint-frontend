<script>
   import { slide } from 'svelte/transition'

   export let isExpanded = false

   function clickHandler() {
      isExpanded = !isExpanded
   }
</script>

<button class="w-full" on:click={clickHandler}><slot {isExpanded} name="button" /></button>
{#if isExpanded}
   <div transition:slide>
      <slot />
   </div>
{/if}
