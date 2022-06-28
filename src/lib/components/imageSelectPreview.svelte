<script lang="ts">
   import { createEventDispatcher } from 'svelte'
   import Awesome from 'svelte-awesome'
   import { timesCircle } from 'svelte-awesome/icons'

   let fileInput: HTMLInputElement
   let blobUrl: string
   let reader = new FileReader()
   function initBlob(buffer: ArrayBuffer) {
      blobUrl = URL.createObjectURL(new Blob([buffer]))
      return blobUrl
   }
   const dispatch = createEventDispatcher()
   function disposeBlob(ignoreChange = false) {
      URL.revokeObjectURL(blobUrl)
      const shouldSendUpdate = value && !ignoreChange
      // Maybe this is not needed
      blobUrl = undefined
      value = undefined
      readValue = undefined

      fileInput.value = null

      if (shouldSendUpdate) {
         dispatch('change')
      }
   }
   const onFileSelected = (e) => {
      if (!e) {
         if (value) {
            disposeBlob()
         }
         return
      }
      const selected = e.target.files[0] as File
      if (!selected) return
      disposeBlob(true)
      value = selected
      reader.readAsDataURL(value)
      reader.onload = (e) => {
         readValue = e.target.result
      }
      dispatch('change')
   }

   export let value: Blob = undefined
   export let readValue: string | ArrayBuffer = undefined
   let _class = ''
   export { _class as class }
</script>

<!-- <div class="w-1/4 sm:w-1/6 border-8 xs:border-16 border-transparent"> -->
<div
   class={`nm-flat-slate-100 grid items-center text-center cursor-pointer ${_class}`}
   on:click={() => {
      fileInput.click()
   }}
>
   <input
      style="display:none"
      type="file"
      accept=".jpg, .JPG, .jpeg, .JPEG, .png, .PNG, .svg, .SVG, .webp, .WEBP"
      on:change={(e) => onFileSelected(e)}
      bind:this={fileInput}
   />

   {#if readValue && typeof readValue === 'string'}
      <!-- <span class="flex relative">
         <span
            class="absolute bottom-0 p-1 px-2 rounded-md text-slate-50 bg-black bg-opacity-20 text-lg"
            >{sizeName}</span
         > -->
      <!-- <div
         class="absolute top-0 left-0 flex flex-row flex-grow max-w-fit min-w-fit justify-between content-end items-end"
      >
         <div class="bg-gray-500 p-3">X</div>
         <div class="bg-gray-500 p-3">X</div>
      </div> -->
      <div class="relative">
         <!-- <div class="absolute top-0 right-0 bg-gray-500 p-3" /> -->
         <button
            class="absolute top-0 right-0 rounded-full bg-slate-100"
            on:click|stopPropagation={() => disposeBlob()}
         >
            <Awesome data={timesCircle} scale={2} class="text-slate-500" />
         </button>
         <img class="w-full" src={readValue} alt="" />
      </div>

      <!-- </span> -->
   {:else if readValue && typeof readValue === 'object'}
      <!-- https://stackoverflow.com/questions/59091927/displaying-png-image-in-arraybuffer-in-react -->
      <img src={initBlob(readValue)} alt="" on:load={() => disposeBlob()} />
   {:else}
      <!-- <div class="text-lg xs:text-2xl text-slate-600">
         {sizeName}
      </div> -->
      <slot />
   {/if}
</div>

<!-- </div> -->
<style lang="scss">
   // @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.1/css/regular.min.css');
   .border-16 {
      border-width: 12px;
   }
   /* #app {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-flow: column;
   }

   .upload {
      display: flex;
      height: 50px;
      width: 50px;
      cursor: pointer;
   }
   .avatar {
      display: flex;
      height: 200px;
      width: 200px;
   } */
</style>
