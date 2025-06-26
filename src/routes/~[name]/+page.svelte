<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { initAPI } from '$lib/api/client/index.js';
  import Actionbar from "$lib/components/Actionbar.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Paginator from '$lib/components/Paginator.svelte';
  import {
    getApp,
    type AppContextData,
  } from "$lib/util/app.js";
  import { getPage } from './util.js';
  import moment from "moment";

  const api = initAPI(fetch);
  let { data } = $props();

  const app = getApp();
  const me = $derived(app().author);

  let author = $derived<AppContextData["author"]>(data.author);
  let page = $state(data.page);
  let pageNo = $state(1);

  $effect(() => {
    getPage(api, pageNo, author ? { id: author.id } : { name: data.name }).then(d => page = d);
  });
</script>

<Navbar title={"~" + data.name}>
  <Actionbar
    actions={data.name === me?.name
      ? [
          { name: "compose", href: "/compose" },
          { name: "settings", href: "/settings" },
        ]
      : [{ name: "me", href: "/~" + me?.name }]}
  />
</Navbar>

<div class="max-w-[560px] h-[80vh] w-full flex flex-col items-center space-y-8 py-8">
  {#if !page}
    <p class="text-muted">loading...</p>
  {:else}
    {@const pages = page.pages}
    {@const notes = page.notes}

    <Paginator {pages} bind:page={pageNo} />

    {#each notes as note, i}
      {@const date = moment(note.createdAt).format("MMM Do YYYY, h:mma")}

      <a
        class="w-full flex flex-row justify-between items-center group"
        href={"/" + note.id}
      >
        <div class="w-[90%] flex flex-col">
          <p class="w-full pr-6 group-hover:underline text-ellipsis overflow-hidden whitespace-nowrap">{note.title ?? date}</p>
          {#if note.title}<p class="text-xs text-muted">&lpar;{date}&rpar;</p>{/if}
        </div>

        <p class="text-muted">#{note.id}</p>
      </a>
    {/each}
  {/if}
</div>
