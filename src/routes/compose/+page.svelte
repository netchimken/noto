<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import { initAPI } from '$lib/api/client';
  import Actionbar from "$lib/components/Actionbar.svelte";
  import Composer from '$lib/components/Composer.svelte';
  import Navbar from "$lib/components/Navbar.svelte";
  import { getApp } from "$lib/util/app";

  const api = initAPI(fetch);
  const app = getApp();

  let me = $derived(app().author);
  let value = $state<string>();
  let disabled = $state(false);

  beforeNavigate((e) => {
    if (!disabled && value) {
      if (!confirm("are you sure? you have changes that will be lost.")) e.cancel()
    }
  })
</script>

<Navbar title={me?.name} href={me?.name ? "/~" + me.name : undefined}>
  <Actionbar
    actions={[
      { name: "me", href: "/~" + me?.name },
      // { name: "settings", href: "/settings" },
    ]}
  />
</Navbar>

<Composer
  {disabled}
  bind:value

  onformdata={async e => {
    e.preventDefault();
    disabled = true;

    let content = e.formData.get('content');
    if (!content || typeof content !== 'string') return;

    const res = await api.note.create.$post({ json: { content } });
    if (!res.ok) alert("failed to send note");
    else {
      const note = await res.json();
      await goto('/' + note.id);
    }

    disabled = false;
  }}
/>
