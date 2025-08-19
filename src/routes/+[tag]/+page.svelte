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

  let page = $derived(data.page);
  let count = $derived(data.count);
  let pageNo = $state(1);

  $effect(() => {
    getPage(api, { count, tags: [['hasEvery', [data.tag]]] })
    .then(p => p 
      ? page = page
      : null
    );
  });
</script>

<svelte:head>
  <title>{clientEnv.PUBLIC_BRAND} - #{data.tag}</title>
</svelte:head>

<Navbar title={"#" + data.tag}>
  {#if me}
    <Actionbar
      actions={[
        { name: "home", href: "/" },
        { name: "me", href: "/~" + me.name },
      ]}
    />
  {/if}
</Navbar>

<PostSeeker {page} {pageNo} showNames />