import { useEffect } from "react";

/**
 * Swaps the document title, description and canonical URL for a page, and puts
 * the previous values back when the visitor leaves it.
 */
export function usePageMeta({ title, description, path }: { title: string; description: string; path: string }) {
  useEffect(() => {
    const descriptionTag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    const previous = { title: document.title, description: descriptionTag?.content, canonical: canonical?.href };

    document.title = title;
    if (descriptionTag) descriptionTag.content = description;
    if (canonical) canonical.href = `https://estroc.co.in${path}`;

    return () => {
      document.title = previous.title;
      if (descriptionTag && previous.description) descriptionTag.content = previous.description;
      if (canonical && previous.canonical) canonical.href = previous.canonical;
    };
  }, [title, description, path]);
}
