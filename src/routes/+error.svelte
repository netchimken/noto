<script lang="ts">
  import { page } from '$app/state';
</script>

<div class="h-[80vh] flex flex-col justify-center items-center">
  <h1 class="text-2xl">{page.status}</h1>
  <p>{page.error?.message}</p>
</div>