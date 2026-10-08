import { Pump } from "basehub/react-pump";
import { FileText, ExternalLink, ChevronRight } from "lucide-react";
import Link from "next/link";
import { draftMode } from "next/headers";

export const metadata = {
  title: "Documentation",
  description: "API reference and developer documentation",
};

export default async function DocsPage() {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <Pump
      draft={isDraftMode}
      queries={[
        {
          pages: {
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
                  sidebarOverrides: {
                    title: true,
                    markAsNew: true,
                  },
                },
              },
            },
          },
          settings: {
            metadata: {
              sitename: true,
            },
          },
        },
      ]}
    >
      {async ([data]) => {
        "use server";

        const pages = data.pages?.items || [];

        return (
          <div className="mx-auto max-w-5xl space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10">
                <FileText className="size-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Technical documentation for developers. Learn how to integrate,
                customize, and extend the platform to fit your needs.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap gap-2">
              {pages.slice(0, 3).map((page) => (
                <Link
                  key={page._id}
                  href={`/docs/${page._slug}`}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
                >
                  {page._title}
                  <ChevronRight className="size-3" />
                </Link>
              ))}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                GitHub
                <ExternalLink className="size-3" />
              </a>
            </div>

            {/* Pages Grid */}
            <div className="grid gap-4 sm:grid-cols-4">
              {pages.map((page) => (
                <Link
                  key={page._id}
                  href={`/docs/${page._slug}`}
                  className="group relative rounded-xl border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {page._title}
                  </h3>
                  {page.articles?.items && page.articles.items.length > 0 && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {page.articles.items.length} article
                      {page.articles.items.length !== 1 ? "s" : ""}
                    </p>
                  )}
                  <div className="mt-4 space-y-1">
                    {page.articles?.items?.slice(0, 3).map((article) => (
                      <div
                        key={article._id}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <ChevronRight className="size-3" />
                        <span className="truncate">
                          {article.sidebarOverrides?.title || article._title}
                        </span>
                        {article.sidebarOverrides?.markAsNew && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            New
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </Link>
              ))}
            </div>

            {/* Empty State */}
            {pages.length === 0 && (
              <div className="rounded-xl border border-dashed bg-muted/50 p-8 text-center">
                <FileText className="mx-auto size-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-medium">No documentation yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add pages and articles in BaseHub to get started.
                </p>
              </div>
            )}
          </div>
        );
      }}
    </Pump>
  );
}
