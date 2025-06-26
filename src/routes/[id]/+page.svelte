<script lang="ts">
  import { goto } from '$app/navigation';
  import { initAPI } from '$lib/api/client/index.js';
  import Actionbar from "$lib/components/Actionbar.svelte";
  import Markdown from '$lib/components/Markdown.svelte';
  import Navbar from "$lib/components/Navbar.svelte";
  import { getApp } from "$lib/util/app";
  import { clientEnv } from '$lib/util/env.js';
  import moment from "moment";

  const api = initAPI(fetch);
  const app = getApp();

  let { data } = $props();
  let id = $derived(data.id);
  let note = $derived(data.note);

  let author = $derived(app().author);
</script>

<svelte:head>
  <title>{clientEnv.PUBLIC_BRAND} - {note.title ? `${note.title} (#${id})` : `#${id}`}</title>
</svelte:head>

<Navbar
  title={note.authorName}
  href={"/~" + note.authorName}
>
  <p class="text-xs text-muted">
    &lpar;{moment(note.updatedAt ?? note.createdAt).format(
      "MMM Do YYYY, h:mma",
    )}&rpar;
  </p>

  {#if author}
    <Actionbar
      actions={note && note.authorName === author.name
        ? [
            { name: "edit", href: '/' + note.id + '/edit' },
            { name: "delete", async func() {
              const yes = confirm('are you sure you want to delete this note?');

              if (yes) {
                const res = await api.note[':id'].$delete({ param: { id } });
                if (!res.ok) return alert(res.status + res.statusText);

                goto("/~" + note.authorName, { replaceState: true });
              }
            } },
          ]
        : [{ name: "me", href: "/~" + author.name }]}
    />
  {/if}
</Navbar>

<Markdown class="max-w-[560px] w-[100%]" content={note.content} />