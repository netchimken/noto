<script lang="ts">
  import { clientEnv } from '$lib/util/env';
  import type { HTMLAttributes } from "svelte/elements";

  interface Props extends HTMLAttributes<HTMLDivElement> {
    title?: string;
    href?: string;
  }

  let { class: classes, children, title, href, ...others }: Props = $props();
</script>

<div class="w-full py-5">
  <div class="space-y-1">
    <h1 class="text-xl font-medium">
      {#if href}
        <a {href}>{title || clientEnv.PUBLIC_BRAND}</a>
      {:else}
        {title || clientEnv.PUBLIC_BRAND}
      {/if}
    </h1>
  </div>
  <div class={["space-y-2", classes]} {...others}>
    {#if children}
      {@render children()}
    {/if}
  </div>
</div>
