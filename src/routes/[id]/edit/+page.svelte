<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { initAPI } from '$lib/api/client/index.js';
  import Actionbar from "$lib/components/Actionbar.svelte";
  import Composer from '$lib/components/Composer.svelte';
  import Navbar from "$lib/components/Navbar.svelte";
  import { getApp } from "$lib/util/app";

  let { data } = $props();

  const api = initAPI(fetch);
  const app = getApp();

  let me = $derived(app().author);
  let value = $state(data.note.content);
  let disabled = $state(false);

  beforeNavigate((e) => {
    if (!disabled && value !== data.note.content) {
      if (!confirm("are you sure? you have changes that will be lost.")) e.cancel()
    }
  })
</script>

<Navbar title={me?.name} href={me?.name ? "/~" + me.name : undefined}>
  <Actionbar
    actions={[
      { name: "me", href: "/~" + me?.name },
      { name: "settings", href: "/settings" },
    ]}
  />
</Navbar>

<Composer 
  bind:value
  bind:disabled

  onformdata={async e => {
    e.preventDefault();

    let content = e.formData.get('content');
    if (!content || typeof content !== 'string') return;

    disabled = true;

    const res = await api.note[':id'].$patch({ param: { id: data.note.id.toString() }, json: { content } });
    if (!res.ok) alert("failed to edit note");
    else {
      const note = await res.json();
      await goto('/' + note.id);
    }

    disabled = false;
  }}
>
  editing <a class="text-info hover:underline" href={'/' + data.note.id}>note #{data.id}</a>
</Composer>