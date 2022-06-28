<script lang="ts">
   export let label: string
   let _for: string
   export { _for as for }
   let _class = ''
   export { _class as class }
   export let labelClass = 'w-24 xs:w-28'
</script>

<div class="margin-border nm-input-group {_class}">
   <label class="{labelClass} py-3 px-2 xs:px-3" for={_for}>{label}</label>
   <slot />
</div>

<style lang="scss">
   .nm-input-group {
      @apply flex flex-row items-stretch rounded-2xl nm-inset-slate-100-xs;
   }
   .nm-input-group > label {
      @apply text-slate-600 whitespace-nowrap flex-none;
   }
   .nm-input-group :global(input) {
      //background-color: theme('colors.slate.50');
      @apply ring-slate-50 w-full min-w-0 outline-none rounded-r-lg nm-inset-slate-100;
      border: 0em;
   }
   .nm-input-group :global(input:focus) {
      @apply nm-inset-slate-50/* nm-inset-white*/;
   }
   .margin-border {
      border: 0.5rem solid transparent;
   }
</style>
