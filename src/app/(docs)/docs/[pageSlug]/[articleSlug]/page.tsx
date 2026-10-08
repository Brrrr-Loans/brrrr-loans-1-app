import { Pump } from "basehub/react-pump";
import { basehub } from "basehub";
import { RichText } from "basehub/react-rich-text";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ pageSlug: string; articleSlug: string }>;
}

export async function generateStaticParams() {
  const data = await basehub().query({
    pages: {
      items: {
        _slug: true,
        articles: {
          items: {
            _slug: true,
          },
        },
      },
    },
  });

  const params: { pageSlug: string; articleSlug: string }[] = [];

  for (const page of data.pages?.items || []) {
    for (const article of page.articles?.items || []) {
      params.push({
        pageSlug: page._slug,
        articleSlug: article._slug,
      });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps) {
  const { pageSlug, articleSlug } = await params;

  const data = await basehub().query({
    pages: {
      __args: {
        filter: {
          _sys_slug: { eq: pageSlug },
        },
      },
      items: {
        _title: true,
        articles: {
          __args: {
            filter: {
              _sys_slug: { eq: articleSlug },
            },
          },
          items: {
            _title: true,
            excerpt: true,
          },
        },
      },
    },
  });

  const article = data.pages?.items?.[0]?.articles?.items?.[0];
  if (!article) return { title: "Not Found" };

  return {
    title: article._title,
    description: article.excerpt || `Documentation for ${article._title}`,
  };
}

// Rich text components for rendering BaseHub content
const richTextComponents = {
  h2: ({ children }: { children: React.ReactNode }) => (
    <h2 className="mt-10 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }: { children: React.ReactNode }) => (
    <h3 className="mt-8 scroll-m-20 text-xl font-semibold tracking-tight">
      {children}
    </h3>
  ),
  p: ({ children }: { children: React.ReactNode }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>
  ),
  ul: ({ children }: { children: React.ReactNode }) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
  ),
  ol: ({ children }: { children: React.ReactNode }) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2">{children}</ol>
  ),
  li: ({ children }: { children: React.ReactNode }) => (
    <li className="leading-7">{children}</li>
  ),
  blockquote: ({ children }: { children: React.ReactNode }) => (
    <blockquote className="mt-6 border-l-2 border-primary pl-6 italic">
      {children}
    </blockquote>
  ),
  code: ({ children }: { children: React.ReactNode }) => (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
      {children}
    </code>
  ),
  pre: ({ children }: { children: React.ReactNode }) => (
    <pre className="mb-4 mt-6 overflow-x-auto rounded-lg border bg-zinc-950 py-4 dark:bg-zinc-900">
      <code className="relative block px-4 font-mono text-sm text-zinc-50">
        {children}
      </code>
    </pre>
  ),
  a: ({ href, children }: { href?: string; children: React.ReactNode }) => (
    <a
      href={href}
      className="font-medium text-primary underline underline-offset-4 hover:no-underline"
    >
      {children}
    </a>
  ),
  strong: ({ children }: { children: React.ReactNode }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  table: ({ children }: { children: React.ReactNode }) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full">{children}</table>
    </div>
  ),
  tr: ({ children }: { children: React.ReactNode }) => (
    <tr className="m-0 border-t p-0 even:bg-muted">{children}</tr>
  ),
  th: ({ children }: { children: React.ReactNode }) => (
    <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </th>
  ),
  td: ({ children }: { children: React.ReactNode }) => (
    <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right">
      {children}
    </td>
  ),
};

export default async function ArticlePage({ params }: PageProps) {
  const { pageSlug, articleSlug } = await params;
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <Pump
      draft={isDraftMode}
      queries={[
        {
          pages: {
            __args: {
              filter: {
                _sys_slug: { eq: pageSlug },
              },
            },
            items: {
              _id: true,
              _title: true,
              _slug: true,
              articles: {
                items: {
                  _id: true,
                  _title: true,
                  _slug: true,
                  excerpt: true,
                  fullBleed: true,
                  body: {
                    json: {
                      content: true,
                    },
                  },
                  sidebarOverrides: {
                    title: true,
                    markAsNew: true,
                  },
                },
              },
            },
          },
        },
      ]}
    >
      {async ([data]) => {
        "use server";

        const page = data.pages?.items?.[0];
        if (!page) return notFound();

        const articles = page.articles?.items || [];
        const currentIndex = articles.findIndex((a) => a._slug === articleSlug);
        const article = articles[currentIndex];

        if (!article) return notFound();

        const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
        const nextArticle =
          currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

        return (
          <div
            className={cn(
              "mx-auto space-y-8",
              article.fullBleed ? "max-w-none" : "max-w-3xl"
            )}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/docs" className="hover:text-foreground transition-colors">
                Docs
              </Link>
              <ChevronRight className="size-3" />
              <Link
                href={`/docs/${page._slug}`}
                className="hover:text-foreground transition-colors"
              >
                {page._title}
              </Link>
              <ChevronRight className="size-3" />
              <span className="text-foreground font-medium">
                {article.sidebarOverrides?.title || article._title}
              </span>
            </nav>

            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">
                  {article.sidebarOverrides?.title || article._title}
                </h1>
                {article.sidebarOverrides?.markAsNew && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    New
                  </span>
                )}
              </div>
              {article.excerpt && (
                <p className="text-lg text-muted-foreground">{article.excerpt}</p>
              )}
            </div>

            {/* Content */}
            <div className="prose prose-zinc dark:prose-invert max-w-none">
              {article.body?.json?.content ? (
                <RichText
                  content={article.body.json.content}
                  components={richTextComponents}
                />
              ) : (
                <div className="rounded-xl border border-dashed bg-muted/50 p-8 text-center">
                  <p className="text-muted-foreground">
                    This article has no content yet. Add content in BaseHub.
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between border-t pt-6">
              {prevArticle ? (
                <Link
                  href={`/docs/${page._slug}/${prevArticle._slug}`}
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="size-4" />
                  <div>
                    <div className="text-xs text-muted-foreground">Previous</div>
                    <div className="font-medium group-hover:text-primary transition-colors">
                      {prevArticle.sidebarOverrides?.title || prevArticle._title}
                    </div>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {nextArticle && (
                <Link
                  href={`/docs/${page._slug}/${nextArticle._slug}`}
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
                >
                  <div>
                    <div className="text-xs text-muted-foreground">Next</div>
                    <div className="font-medium group-hover:text-primary transition-colors">
                      {nextArticle.sidebarOverrides?.title || nextArticle._title}
                    </div>
                  </div>
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
          </div>
        );
      }}
    </Pump>
  );
}
