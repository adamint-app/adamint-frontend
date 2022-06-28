<script lang="ts">
   import Header from '$lib/components/header.svelte'
   import '../app.css'

   // import { createApolloClient } from '$lib/services/cardanoGraphQL'
   // import { setClient } from 'svelte-apollo'
   // setClient(createApolloClient())
</script>

<div class="flex flex-col min-h-screen bg-slate-100">
   <Header />
   <main class="self-center mx-2 xs:mx-4">
      <slot />
   </main>
   <!-- <footer class="bg-slate-100">
      <p>visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit</p>
   </footer> -->
</div>
