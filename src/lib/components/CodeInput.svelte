<script lang="ts">
  import type { EventHandler, HTMLFieldsetAttributes } from 'svelte/elements';

  interface Props extends HTMLFieldsetAttributes {
    digits?: number,
    name?: string
  }

  const { 
    class: classes, 
    digits, 
    name, 
    ...others 
  }: Props = $props();

  let input!: HTMLInputElement;

  const onChange: EventHandler<Event, HTMLInputElement> = (e) => {
    const parent = e.currentTarget.parentElement;
    if (!parent) return;

    let value = "";
    for (const child of parent.children) {
      const element = (child as HTMLInputElement);
      value += element.value;
      element.value = element.value.toUpperCase();
    }

    input.value = value;
  }

  function onPaste(data: string, element: HTMLInputElement | null) {
    if (!element) return;

    element.value = data.substring(0, 1);

    const nextSibling = element.nextElementSibling as HTMLInputElement | null;

    if (data.length > 1 && nextSibling) {
      const newData = new DataTransfer();
      newData.setData("text/plain", data.substring(1))

      nextSibling.focus();

      onPaste(data.substring(1), nextSibling);
    }
  }
</script>

<input bind:this={input} {name} class="hidden" />

<fieldset class={[ "space-x-3 disabled:text-disabled", classes]} {...others}>
  {#each new Array(digits) as _}
    <input 
      class="w-8 text-2xl text-center" 
      maxlength={1} 
      type="text" 
      placeholder="0"
      autocomplete="off"
      required

      onpaste={e => {
        e.preventDefault();

        if (!e.clipboardData) return;
        const data = e.clipboardData.getData("text/plain");
        if (!data) return;

        onPaste(data, e.currentTarget);
        onChange(e);
      }}

      oninput={e => {
        if (e.currentTarget.value) {
          const nextSibling = e.currentTarget.nextElementSibling as HTMLInputElement | null;
          nextSibling?.focus();
        }

        onChange(e);
      }}

      onkeydown={e => {
        const previousSibiling = e.currentTarget.previousElementSibling as HTMLInputElement | null;

        if (previousSibiling && e.key === 'Backspace') {
          e.preventDefault()

          if (e.currentTarget.value) {
            e.currentTarget.value = "";
          } else {
            previousSibiling.value = "";
            previousSibiling.focus();
          }
        }

        onChange(e);
      }}
    />
  {/each}
</fieldset>