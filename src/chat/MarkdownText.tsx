import { MarkdownTextPrimitive } from "@assistant-ui/react-markdown";
import type { ComponentPropsWithoutRef } from "react";
import { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";

type AnchorProps = ComponentPropsWithoutRef<"a"> & { node?: unknown };

function SafeLink({ node: _ignoredNode, href, children, ...rest }: AnchorProps) {
  if (!href) return <span>{children}</span>;
  return (
    <a {...rest} href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

const REMARK_PLUGINS = [remarkGfm];
const DISALLOWED_ELEMENTS = ["img"];
const COMPONENTS = { a: SafeLink };

export function MarkdownText() {
  return (
    <MarkdownTextPrimitive
      className="chat-markdown"
      remarkPlugins={REMARK_PLUGINS}
      skipHtml
      urlTransform={defaultUrlTransform}
      disallowedElements={DISALLOWED_ELEMENTS}
      components={COMPONENTS}
    />
  );
}
