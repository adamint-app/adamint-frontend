<script lang="ts">
   import { page } from '$app/stores'
   import CardanoConnector from '$lib/components/cardano/connector.svelte'
   import { each } from 'svelte/internal'
   const items = [
      ['/mint', 'Mint'],
      ['/control', 'Control'],
      ['/about', 'About']
   ]
</script>

<header>
   <nav>
      <ul
         class="my-6 mx-3 flex flex-row flex-nowrap justify-between items-center gap-2
         text-sm xs:text-base"
      >
         <a class="hidden xxs:block" href="/"
            ><img
               class="w-12 -my-3 p-1 rounded-2xl nm-button"
               class:nm-button-active={/\/(?![\w])/.test($page.url.pathname)}
               src="$assets/astromint-logo-min.svg"
            />
         </a>
         {#each items as [href, name]}
            <li>
               <a
                  class="p-2 xs:p-3 nm-button"
                  class:nm-button-active={$page.url.pathname.startsWith(href)}
                  sveltekit:prefetch
                  {href}>{name}</a
               >
            </li>
         {/each}
         <!-- <li class="w-12 -my-3 p-1" /> -->
         <CardanoConnector />
      </ul>
   </nav>
</header>

<style lang="scss">
   .nm-button {
      @apply rounded-2xl border-2 border-slate-200 text-slate-500;
   }
   .nm-button-active {
      @apply nm-inset-slate-100-sm border-transparent text-black;
   }
</style>
