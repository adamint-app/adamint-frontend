<script lang="ts">
   import Clipboard from 'svelte-clipboard'
   const shortenAddress = (addr: string, leave: number) =>
      addr.slice(0, leave) + '…' + addr.slice(addr.length - leave, addr.length)
   export let address: string
   export let len: number
</script>

<Clipboard
   text={address}
   let:copy
   on:copy={() => {
      alert('Address copied to clipboard')
   }}
>
   <div class="cursor-pointer font-mono whitespace-nowrap" on:click={copy}>
      {shortenAddress(address, len)}
   </div>
</Clipboard>
