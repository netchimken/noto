<script lang="ts">
  import { initAPI } from '$lib/api/client/index.js';
  import Actionbar from "$lib/components/Actionbar.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import PostSeeker from '$lib/components/PostSeeker.svelte';
  import { app } from '$lib/util/app.svelte.js';
  import { clientEnv } from '$lib/util/env.js';
  import { getPage } from '$lib/util/notes.js';
  
  const api = initAPI(fetch);
  let { data } = $props();

  const me = $derived(app.author);

  let special = $state(false);
  let page = $derived(data.page);
  let author = $derived(page.author);
  let pageNo = $state(1);

  $effect(() => {
    getPage(api, {
      ...(author ? { authorId: author.id } : { authorName: data.name }),
      tags: special
        ? undefined
        : [
          ['equals', null],
          ['equals', []],
          ['hasEvery', ['~me']]
        ],
    })
    .then(p => p 
      ? page = { 
        ...page, 
        pinned: p.pinned, 
        pages: p.pages, 
        notes: p.notes 
      } 
      : null
    );
  });
</script>

<svelte:head>
  <title>{clientEnv.PUBLIC_BRAND} ~ {data.name}</title>
</svelte:head>

<Navbar title={"~" + data.name}>
  {#if me}
    <Actionbar
      actions={
        data.name === me?.name
        ? [
            { name: "compose", href: "/compose" },
            { name: "home", href: "/" },
          ]
        : [
          { name: "home", href: "/" },
          { name: "me", href: "/~" + me.name },
        ]
      }
    />
  {/if}
</Navbar>

<PostSeeker {page} {pageNo} showTags />

{#if data.name === me?.name}
  <button class="text-sm" onclick={() => special = !special}>[ {special ? 'hide' : 'show'} tagged ]</button>
{/if}