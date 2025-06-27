<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { marked } from "marked";
  import markedMoreLists from "marked-more-lists";
  import markedShiki from 'marked-shiki';
  import sanitize from "sanitize-html";
  import { codeToHtml } from 'shiki';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    content: string
  }

  const { content, class: classes, ...others }: Props = $props();
</script>

<div
  class={[
  "prose",
    "text-base",
    "prose-strong:text-base",
    "prose-headings:text-base",
    "prose-p:text-base prose-p:m-0",
    "prose-a:text-info prose-a:no-underline prose-a:hover:underline",
    "prose-li:text-base",
    "prose-pre:!bg-secondary",
    classes
  ]}
  
  {...others}
>
  {#await marked
    .use(markedMoreLists())
    .use(markedShiki({
      async highlight(code, lang) {
        return await codeToHtml(code, {
          lang,
          theme: 'github-dark-dimmed',
        });
      },
    }))
    .parse(content.replace(/\n{2}(?=\n)/g, '\n\n<br/>\n'))
    then markedContent
  }
    {@html env.PUBLIC_ALLOW_XSS 
      ? markedContent 
      : sanitize(
        markedContent,
        {
          allowedTags: sanitize.defaults.allowedTags.concat([ 'img' ]),
          allowedAttributes: {
            ...sanitize.defaults.allowedAttributes,
            span: ['style']
          },
          allowedStyles: {
            span: {
              color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/]
            }
          }
        }
      )
    }
  {/await}
</div>