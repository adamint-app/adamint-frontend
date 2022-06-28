<!-- https://codemyui.com/pure-css-neumorphic-design-toggle-switch/ -->
<script lang="ts">
   export let width = '110px'
   export let indicatorWidth = '50px'
   export let height = '40px'
   export let color: string
   export let shadow: string
   export let highlight: string
   export let value: boolean
</script>

<label
   class="label rounded-3xl"
   style="
   --switch-width: {width};
   --indicator-width: {indicatorWidth};
   --switch-height: {height};
   --shadow-color: {shadow};
   --highlight-color: {highlight};"
>
   <!-- <div class="mr-4"><slot name="off" /></div> -->
   <div class="toggle relative">
      <span class="absolute left-0 ml-2 mt-[calc(var(--switch-height)-2em)]">
         <slot name="on" />
      </span>
      <span class="absolute right-0 mr-2 mt-[calc(var(--switch-height)-2em)]"
         ><slot name="off" />
      </span>
      <input class="toggle-state" type="checkbox" bind:checked={value} />
      <div class="indicator {color}" />
   </div>
   <!-- <div class="ml-4"><slot name="on" /></div> -->
</label>

<style lang="scss">
   .label {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      //color: #394a56;
   }

   .toggle {
      isolation: isolate;
      position: relative;
      height: var(--switch-height);
      width: var(--switch-width);
      border-radius: 15px;
      overflow: hidden;
      box-shadow: -8px -4px 8px 0px var(--highlight-color), 8px 4px 12px 0px var(--shadow-color),
         4px 4px 4px 0px var(--shadow-color) inset, -4px -4px 4px 0px var(--highlight-color) inset;
   }

   .toggle-state {
      display: none;
   }

   .indicator {
      height: 100%;
      //width: 200%;
      width: var(--indicator-width);
      // background: #ecf0f3;
      border-radius: 15px;
      transform: translate3d(0px, 0, 0);
      transition: transform 0.4s cubic-bezier(0.85, 0.05, 0.18, 1.35);
      box-shadow: -8px -4px 8px 0px var(--highlight-color), 8px 4px 12px 0px var(--shadow-color);
   }

   .toggle-state:checked ~ .indicator {
      transform: translate3d(calc(var(--switch-width) - var(--indicator-width)), 0, 0);
   }
</style>
