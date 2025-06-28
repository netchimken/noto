<script lang="ts">
  import { initAPI } from '$lib/api/client/index.js';
  import Actionbar from "$lib/components/Actionbar.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Paginator from '$lib/components/Paginator.svelte';
  import { Marked } from "marked";
  import sanitize from "sanitize-html";
  import {
    getApp,
    type AppContextData,
  } from "$lib/util/app.js";
  import { formatDate } from '$lib/util/date.js';
  import { clientEnv } from '$lib/util/env.js';
  import { getPage } from '$lib/util/notes.js';
  import NotePanel from '$lib/components/NotePanel.svelte';
  
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

  const parseTitle = (title: string) => {
    return sanitize(
      new Marked().parse(title, { async: false }),
      {
        allowedTags: ['span', 'code', 'b', 'i'],
        allowedAttributes: { span: ['style'] },
        allowedStyles: {
          '*': {
            color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/]
          }
        }
      }
    )
  }
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

<div class="max-w-[560px] h-[80vh] w-full flex flex-col items-center space-y-8 py-8">
  {#if !page}
    <p class="text-muted">loading...</p>
  {:else if page.pages === 0}
    <p class="text-muted">author has no notes</p>
  {:else}
    {@const pages = page.pages}
    {@const notes = page.notes}

    {#if pinned}
      {@const date = formatDate(pinned.createdAt)}

      <div class="w-full space-x-1">
        <p class="text-sm text-muted">pinned</p>
        <a
          class="w-full flex flex-row justify-between items-center group"
          href={"/" + pinned.id}
        >
          <p class="markdown w-full group-hover:underline text-ellipsis overflow-hidden whitespace-nowrap">
            {@html pinned.title ? parseTitle(pinned.title) : date}
          </p>
        </a>
      </div>
    {/if}

    <Paginator {pages} bind:page={pageNo} />

    {#each notes as note, i}
      <NotePanel {note} />
    {/each}
  {/if}
</div>
