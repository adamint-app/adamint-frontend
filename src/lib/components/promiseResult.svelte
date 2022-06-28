<script lang="ts">
   export let txPromise: Promise<unknown>
   export let txRunning = false
   $: txRunning =
      (txPromise
         .then(() => {
            txRunning = false
         })
         .catch(() => {
            txRunning = false
         }),
      true)
   const resetTxPromise = async () => {
      try {
         await txPromise
      } finally {
         txPromise = Promise.reject<string>()
      }
   }
</script>

{#await txPromise then result}
   <slot {result} {resetTxPromise} name="success" />
{:catch error}
   {#if error}
      <slot {error} {resetTxPromise} name="error" />
   {/if}
{/await}
