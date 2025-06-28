<script lang="ts">
  import "../app.css";

  import { afterNavigate, goto } from "$app/navigation";
  import {
    AppContextDataSchema,
    setAppContext,
    type AppContextData,
  } from "$lib/util/app";
  import { initAPI } from "$lib/api/client";
  import { page } from "$app/state";
  import { onMount } from "svelte";

  let { children } = $props();

  const api = initAPI(fetch);

  let app = $state<AppContextData>({
    author: null,
  });
  setAppContext(() => app);

  const checkAuth = async () => {
    const res = await api.author.me.$get();

    if (res?.ok) {
      app.author = AppContextDataSchema.shape.author.parse(await res.json());

      if (page.url.pathname === "/login")
        goto("/compose", { replaceState: true });
      return;
    }
  };

  // check for valid session
  onMount(checkAuth);
  afterNavigate(checkAuth);
</script>

<div class="w-full h-auto px-8 pb-8 flex flex-col items-center">
  {@render children()}
</div>
