<script lang="ts">
  import { initAPI } from "$lib/api/client";
  import Actionbar from "$lib/components/Actionbar.svelte";
  import Navbar from "$lib/components/Navbar.svelte";
  import Paginator from '$lib/components/Paginator.svelte';
  import {
    AppContextDataSchema,
    getApp,
    type AppContextData,
  } from "$lib/util/app.js";
  import moment from "moment";

  let { data } = $props();

  const api = initAPI(fetch);
  const app = getApp();
  const me = $derived(app().author);

  let author = $state<AppContextData["author"]>(data.author);
  const count = 9;
  let page = $state(1);

  const getPage = async (no: number) => {
    const res = await api.author[':id'].notes.$get({
      param: {
        id: author ? '' + author.id : '~' + data.name
      },
      query: {
        count: '' + count,
        page: '' + no,
      },
    });

    if (res.ok) {
      const data = await res.json();

      return {
        notes: data.notes,
        pages: data.pages,
      };
    } else return null;
  };

  let pagesData = $state<Awaited<ReturnType<typeof getPage>>>();

  $effect(() => {
    getPage(page).then(d => pagesData = d);
  })
</script>

<Navbar title={"~" + data.name}>
  <Actionbar
    actions={data.name === me?.name
      ? [
          { name: "compose", href: "/compose" },
          // { name: "export", func() {} },
        ]
      : [{ name: "me", href: "/~" + me?.name }]}
  />
</Navbar>

<div class="max-w-[560px] h-[80vh] w-full flex flex-col items-center space-y-8 py-8">
  {#if !pagesData}
    <p class="text-muted">loading...</p>
  {:else}
    {@const pages = pagesData.pages}
    {@const notes = pagesData.notes}

    <Paginator {pages} bind:page />

    {#each notes as note, i}
      {@const date = moment(note.createdAt).format("MMM Do YYYY, h:mma")}

      <a
        class="w-full flex flex-row justify-between items-center group"
        href={"/" + note.id}
      >
        <div class="flex flex-col">
          <p class="group-hover:underline">{note.title ?? date}</p>
          {#if note.title}<p class="text-xs text-muted">&lpar;{date}&rpar;</p>{/if}
        </div>

        <p class="text-muted">#{note.id}</p>
      </a>
    {/each}
  {/if}
</div>
