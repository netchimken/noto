<script lang="ts">
  import { initAPI } from '$lib/api/client/index.js';
  import Actionbar from "$lib/components/Actionbar.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Paginator from '$lib/components/Paginator.svelte';
  import {
    getApp,
    type AppContextData,
  } from "$lib/util/app.js";
  import { formatDate } from '$lib/util/date.js';
  import { clientEnv } from '$lib/util/env.js';
  import { type ArrayType } from '$lib/util/helpers.js';
  import { getPage } from './util.js';
  
  const api = initAPI(fetch);
  let { data } = $props();

  const app = getApp();
  const me = $derived(app().author);

  let author = $derived<AppContextData["author"]>(data.author);
  let pinned = $derived(data.pinned);
  let page = $derived(data.page);
  let pageNo = $state(1);

  $effect(() => {
    getPage(api, pageNo, author ? { id: author.id } : { name: data.name })
    .then(p => p ? page = { pages: p.pages, notes: p.notes } : null);
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
            { name: "settings", href: "/settings" },
          ]
        : [{ name: "me", href: "/~" + me.name }]
      }
    />
  {/if}
</Navbar>

<div class="max-w-[560px] h-[80vh] w-full flex flex-col items-center space-y-8 py-8">
  {#if data.noNotes}
     <p class="text-muted">author has no notes</p>
  {:else if !page}
    <p class="text-muted">loading...</p>
  {:else}
    {@const pages = page.pages}
    {@const notes = page.notes}

    {#snippet noteCard(note: ArrayType<typeof notes>, showDate?: boolean)}
      {@const date = formatDate(note.createdAt)}

      <a
        class="w-full flex flex-row justify-between items-center group"
        href={"/" + note.id}
      >
        <div class="w-[90%] flex flex-col">
          <p class="w-full pr-6 group-hover:underline text-ellipsis overflow-hidden whitespace-nowrap">{note.title ?? date}</p>
          {#if showDate && note.title}<p class="text-xs text-muted">&lpar;{date}&rpar;</p>{/if}
        </div>

        <p class="text-muted">#{note.id}</p>
      </a>
    {/snippet}

    {#if pinned}
      <div class="w-full space-x-1">
        <p class="text-sm text-muted">pinned</p>
        {@render noteCard(pinned)}
      </div>
    {/if}

    <Paginator {pages} bind:page={pageNo} />

    {#each notes as note, i}
      {@render noteCard(note, true)}
    {/each}
  {/if}
</div>
