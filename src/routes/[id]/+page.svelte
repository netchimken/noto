<script lang="ts">
  import { goto } from '$app/navigation';
  import { initAPI } from '$lib/api/client/index.js';
  import Actionbar, { type Action } from "$lib/components/Actionbar.svelte";
  import Markdown from '$lib/components/Markdown.svelte';
  import Navbar from "$lib/components/Navbar.svelte";
  import { getApp } from "$lib/util/app";
  import { formatDate } from '$lib/util/date.js';
  import { clientEnv } from '$lib/util/env.js';
  import { concatArr } from '$lib/util/helpers.js';

  const api = initAPI(fetch);
  const app = getApp();

  let { data } = $props();
  let id = $derived(data.id);
  let note = $derived(data.note);

  let me = $derived(app().author);
</script>

<svelte:head>
  <title>{clientEnv.PUBLIC_BRAND} - {note.title ? `${note.title} (#${id})` : `#${id}`}</title>
</svelte:head>

<Navbar
  title={note.author.name}
  href={"/~" + note.author.name}
>
  <p class="text-xs text-muted" title={note.updatedAt ? `edited on ${formatDate(note.updatedAt)}` : undefined}>
    &lpar;{formatDate(note.createdAt)}{note.updatedAt ? ' - edited' : ''}&rpar;
  </p>

  {#if me}
    <Actionbar
      actions={
        note && note.author.name === me.name
        ? concatArr<Action>(
            { name: me.pinned !== note.id ? "pin" : "unpin", 
              async func(type) {
                const unpin = type === 'unpin';
                const yes = confirm(`are you sure you want to ${type} this note?`);

                if (yes) {
                  const res = await api.author.me.pinned.$patch({ query: { 
                    id: unpin ? undefined : '' + note.id 
                  }});
                  if (!res.ok) return alert(res.status + res.statusText);

                  // update local author
                  me.pinned = unpin ? null : note.id;
                }
              } 
            },
            { name: "edit", href: '/' + note.id + '/edit' },
            { name: "delete", 
              async func() {
                const yes = confirm('are you sure you want to delete this note?');

                if (yes) {
                  const res = await api.note[':id'].$delete({ param: { id } });
                  if (!res.ok) return alert(res.status + res.statusText);

                  goto("/~" + note.author.name, { replaceState: true });
                }
              } 
            },
          )
        : [{ name: "me", href: "/~" + me.name }]}
    />
  {/if}
</Navbar>

<Markdown class="max-w-[560px] w-[100%]" content={note.content} tags={true} />