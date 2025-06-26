<script lang="ts">
  import type { EventHandler, HTMLAttributes } from "svelte/elements";
  import { onMount } from "svelte";

  interface Props extends HTMLAttributes<HTMLFormElement> {
    value?: string;
    disabled?: boolean;
  }

  let {
    class: classes,
    children,
    value = $bindable(),
    disabled = $bindable(),
    ...others
  }: Props = $props();

  let words = $state(0);
  let form!: HTMLFormElement;
  let textarea!: HTMLTextAreaElement;

  const onUpdate = (element: HTMLTextAreaElement) => {
    // ref: https://stackoverflow.com/a/48460773
    element.style.height = "";
    element.style.height = element.scrollHeight + "px";

    words = element.value.split(/[\s]/).filter((p) => p.trim() !== "").length;
  };

  onMount(() => {
    if (textarea) onUpdate(textarea);
  });
</script>

<form
  bind:this={form}
  class={["max-w-[560px] w-[100%] max-h-80% space-y-4", classes]}
  {...others}
>
  <fieldset class="flex flex-col items-center space-y-1">
    <fieldset class="w-full flex flex-row justify-between text-muted">
      <p>{words} words</p>
      <button type="submit">send</button>
    </fieldset>

    <p class="text-sm text-muted">
      {#if children}
        {@render children()}
      {:else}
        <a
          class="text-info hover:underline"
          href="https://www.markdownguide.org/cheat-sheet/"
          target="_blank"
        >
          markdown
        </a>
        works here!
      {/if}
    </p>
  </fieldset>

  <textarea
    bind:this={textarea}
    bind:value
    class="w-full max-h-[80vh] outline-none resize-none scrollbar"
    placeholder="type something..."
    name="content"
    {disabled}
    
    oninput={(e) => onUpdate(e.currentTarget)}
  ></textarea>
</form>
