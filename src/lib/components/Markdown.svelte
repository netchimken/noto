<script lang="ts">
  import { env } from '$env/dynamic/public';
  import { getTags, TagRegex } from '$lib/api/util/parsers';
  import { Marked } from "marked";
  import markedMoreLists from "marked-more-lists";
  import markedShiki from 'marked-shiki';
  import sanitize from "sanitize-html";
  import { codeToHtml } from 'shiki';
  import type { HTMLAttributes } from 'svelte/elements';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    content: string
    tags?: boolean
  }

  const { 
    content, 
    tags,
    class: classes, 
    ...others 
  }: Props = $props();
</script>

<div
  class={[
    "markdown",
    classes
  ]}
  
  {...others}
>
  {#await new Marked()
    .use(markedMoreLists())
    .use(markedShiki({
      async highlight(code, lang) {
        return await codeToHtml(code, {
          lang,
          theme: 'github-dark-dimmed',
        });
      },
    }))
    .parse(content
      .replace(/\n{2}(?=\n)/g, '\n\n<br/>\n') // fix newlines / linebreaks
      .replace(/(?<=<[\s\S]*)[“”](?=[\s\S]*>)/g, `"`) // replace typographic quotes with neutral quotes in tags
      .replace(TagRegex, c => tags 
        ? getTags(c)
          .filter(t => !(
            t.startsWith('~')
          ))
          .map(t => `<a class="tag" href="/+${t}">${'#' + t}</a>`)
          .join(' ') 
        : c
      )
    )
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
            span: ['style'],
          },
          allowedStyles: {
            '*': {
              color: [/^#(0x)?[0-9a-f]+$/i, /^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/]
            }
          },
          allowedClasses: {
            '*': [
              /^text(-[\w]+)$/,
              'not-prose',
              'tag'
            ]
          }
        }
      )
    }
  {/await}
</div>