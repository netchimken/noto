<script lang="ts">
  import { goto } from '$app/navigation';
  import { initAPI } from '$lib/api/client';
  import Actionbar from '$lib/components/Actionbar.svelte';
  import Navbar from "$lib/components/Navbar.svelte";
  import { app } from '$lib/util/app.svelte';
  import { clientEnv } from '$lib/util/env';

  const api = initAPI(fetch);
  let author = $derived(app.author);
</script>

<svelte:head>
  <title>{clientEnv.PUBLIC_BRAND} - settings</title>
</svelte:head>

{#if author}
  <Navbar title={author.name} href={'/~' + author.name}>
    <Actionbar 
      actions={[
        { name: "me", href: '/~' + author.name },
        { name: "compose", href: '/compose' }
      ]}
    />
  </Navbar>
  
  <div class="text-sm max-w-[500px] h-[80vh] w-full flex flex-col items-center space-y-8 py-8">
    <div class="w-full flex flex-row justify-between items-center">
      <h1 class="text-xl font-semibold">Account</h1>

      <button
        onclick={async () => {
          const yes = confirm("you'll have to sign back in; are you sure?");

          if (yes) {
            const res = await api.auth.logout.$delete();
            if (!res.ok) return alert(`${res.status} - ${res.statusText}`);

            app.author = null;
            goto('/');
          }
        }}
      >[ logout ]</button>
    </div>

    <div class="w-full flex flex-col space-y-2">
      <div class="w-full flex flex-row justify-between items-center">
        <h1 class="font-semibold text-muted">{author.email}</h1>

        <button
          onclick={async () => {
            const email = prompt("enter a new email");

            if (email && confirm("change to: " + email)) {
              const res = await api.author.me.email.$patch({ query: { email } });
              if (!res.ok) return alert(`${res.status} - ${res.statusText}`);

              if (author) author.email = email;
            }
          }}
        >[ edit email ]</button>
      </div>

      <div class="w-full flex flex-row justify-between items-center">
        <h1 class="font-semibold text-muted">{author.name}</h1>

        <button
          onclick={async () => {
            const name = prompt("enter a new name");

            if (name) {
              const res = await api.author.me.name.$patch({ query: { name } });
              if (!res.ok) return alert(`${res.status} - ${res.statusText}`);

              if (author) author.name = name;
            }
          }}
        >[ edit name ]</button>
      </div>
    </div>

    {#if author.admin}
      <div class="w-full flex flex-row justify-between items-center">
        <h1 class="text-xl font-semibold">Admin</h1>

        <div class="text-sm">
          <button
            onclick={async () => {
              const email = prompt("enter an email");
              const name = prompt("enter a name");

              if (email && name) {
                const res = await api.author.create.$post({ query: { email, name } });
                if (!res.ok) return alert(`${res.status} - ${res.statusText}`);

                alert(`created user '${name}' with email '${email}'`);
              }
            }}
          >[ create author ]</button>
        </div>
      </div>
    {/if}
  </div>
{/if}