<script lang="ts">
  let classes: string = "";
  export let title: string = "";
  export let description: string = "";
  export let icon: string = "";

  export { classes as class };
</script>

<div class={`${classes} flex flex-col items-center justify-center`}>
  <img class="mb-4 h-[50px] w-[50px]" src={icon} alt="feature icon" />
  <h3 class="mb-4 text-lg font-bold italic">{title}</h3>
  <p class="text-xl">{description}</p>
</div>
