<script lang="ts">
  interface Props {
    pages: number
    page: number
    max?: number
  }

  let {
    pages = $bindable(),
    page = $bindable(),
    max = 5
  }: Props = $props();

  let shown = $state<number[]>([1]);
  const updateShown = () => {
    const half = Math.floor(max / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(pages, start + max - 1);

    // Adjust start if we're at the end
    if (end - start < max - 1) {
      start = Math.max(1, end - max + 1);
    }

    const range = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    
    shown = range;
  }

  

  $effect(() => {
    page;
    updateShown();
  })
</script>

<div class="w-full flex flex-row justify-between text-muted items-center">
  <button onclick={() => page--} disabled={page <= 1}>[ &lt; ]</button>

  <div class="flex flex-row items-center space-x-3">
    {#if shown[0] !== 1}
      <button onclick={() => page = 1}>1</button>
      {#if 2 < shown[0]}
        <span>…</span>
      {/if}
    {/if}

    {#each shown as p}
      <button
        class={page === p ? 'active font-bold' : ''}
        onclick={() => page = p}
      >
        {p}
      </button>
    {/each}

    {#if shown.at(shown.length - 1) !== pages}
      {#if pages - 1 > (shown.at(shown.length - 1) ?? pages)}
        <span>…</span>
      {/if}
      <button onclick={() => page = pages}>{pages}</button>
    {/if}
  </div>

  <button onclick={() => page++} disabled={page >= pages}>[ &gt; ]</button>
</div>