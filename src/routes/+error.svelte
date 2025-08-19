<script lang="ts">
  import { page } from '$app/state';
  import Actionbar from '$lib/components/Actionbar.svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import { app } from '$lib/util/app.svelte';

  let me = $derived(app.author);
</script>

<Navbar title={me?.name} href={me?.name ? "/~" + me.name : undefined}>
  <Actionbar
    actions={
      me
      ? [
        { name: "me", href: "/~" + me?.name },
        { name: "settings", href: "/settings" },
      ]
      : [{ name: "home", href: '/' }]
    }
  />
</Navbar>

<div class="h-[80vh] flex flex-col justify-center items-center">
  <h1 class="text-2xl">{page.status}</h1>
  <p>{page.error?.message}</p>
</div>