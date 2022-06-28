<script lang="ts">
   let _class = ''
   export { _class as class }
   export let src: ArrayBuffer
   export let mediaType: string
   $: _src = URL.createObjectURL(new Blob([(src as Uint8Array).buffer], { type: mediaType }))
</script>

<img class={`${_class}`} src={_src} />
