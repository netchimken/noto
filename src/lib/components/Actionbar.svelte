<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';

  type Action = {
    name: string
    class?: HTMLAttributes<HTMLDivElement>['class']
  } & (
    { func: (action: string) => void }
    |
    { href: string }
  )

  interface Props extends HTMLAttributes<HTMLDivElement> {
    actions: (Action | undefined | null)[]
  }

  let { actions, class: classes }: Props = $props();
</script>

<div class={[
  "flex flex-row space-x-2 text-xs text-muted select-none",
  classes
]}>
  <p>&lsqb;</p>
  {#each actions as action, i}
    {#if action}
      {#if i > 0}<p>/</p>{/if}

      {#if 'func' in action}
        <button 
          onclick={() => action.func(action.name)}
        >
          {action.name}
        </button>
      {:else if 'href' in action}
        <a class="hover:text-base hover:cursor-pointer" href={action.href}>{action.name}</a>
      {/if}
    {/if}
  {/each}
  <p>&rsqb;</p>
</div>