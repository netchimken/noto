<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { initAPI } from '$lib/api/client';
  import type { ClientNote, SimpleClientNote } from '$lib/api/util/parsers';
  import Actionbar from '$lib/components/Actionbar.svelte';
  import Navbar from "$lib/components/Navbar.svelte";
  import NotePanel from '$lib/components/NotePanel.svelte';
  import { app } from '$lib/util/app.svelte';
  import { clientEnv } from '$lib/util/env';
  import { onMount } from 'svelte';

  const api = initAPI(fetch);

  let author = $derived(app.author);
  let email = $state<string | 1 | 0>(0);

  let notes = $state<SimpleClientNote[]>([]);
  let fetching = $state(false);
  let lastNoteId = $state<number>();

  const getNotes = async () => {
    fetching = true

    const res = await api.note.list.$post({ json: { 
      noteId: lastNoteId ? lastNoteId : undefined 
    }});
    if (!res.ok) {
      fetching = false;
      return alert("failed to get notes");
    }

    const data = await res.json();
    notes.push(...data.notes);

    const lastNote = notes.at(-1);
    if (lastNote) lastNoteId = lastNote.id; 

    fetching = false;
  }

  if (env.PUBLIC_ENABLE_HOME) {
    onMount(async () => await getNotes());
  }
</script>

<svelte:head>
  <title>{clientEnv.PUBLIC_BRAND}</title>
</svelte:head>

<Navbar>
  <Actionbar 
    actions={author
      ? [
        { name: "compose", href: '/compose' },
        { name: "me", href: '/~' + author.name },
      ]
      : [{ name: "login", href: '/login' }]
    }
  />
</Navbar>

{#if !author || !env.PUBLIC_ENABLE_HOME}

  <div class="pt-[25vh] px-8 space-y-1.5 text-center">
    <h1 class="text-xl">Welcome to <b>Noto</b></h1>
    <p class="text-muted">a semi-private "blogging" site</p>
    <br>
    <p>
      want access?
      {#if email}

        <span class="text-muted">
          {#if email === 1}
            ...
          {:else}
            {email}
          {/if}
        </span>

      {:else}

        <button 
          class="text-info cursor-pointer" 
          title="reveal email"
          onclick={async () => {
            email = 1;
            const res = await api.contact.$get();
            
            if (res.ok) email = (await res.json()).email ?? 0;
            else email = 0;
          }}
        >
          shoot me an email :&rsqb;
        </button>

      {/if}
    </p>
  </div>

{:else}

  <div class="flex flex-col w-full items-center">
    {#if !lastNoteId}
      <p>loading notes...</p>
    {:else if notes.length === 0}
      <p>no notes here yet!</p>
    {:else}
      <h3 class="text-xl font-semibold">all</h3>

      <div class="max-w-[560px] max-h-[80%] w-full flex flex-col items-center space-y-8 py-8">
        {#each notes as note}
          <NotePanel {note} showName showTags />
        {/each}
      </div>

      {#if !fetching}
        <button class="text-sm" onclick={getNotes}>[ load more ]</button>
      {/if}
    {/if}
  </div>

{/if}