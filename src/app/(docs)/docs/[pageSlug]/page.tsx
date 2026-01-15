import { Pump } from "basehub/react-pump";
import { basehub } from "basehub";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";

interface PageProps {
  params: Promise<{ pageSlug: string }>;
}

export async function generateStaticParams() {
  const data = await basehub().query({
    pages: {
      items: {
        _slug: true,
      },
    },
  });

  return (
    data.pages?.items?.map((page) => ({
      pageSlug: page._slug,
    })) || []
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { pageSlug } = await params;

  const data = await basehub().query({
    pages: {
      __args: {
        filter: {
          _sys_slug: { eq: pageSlug },
        },
      },
      items: {
        _title: true,
      },
    },
  });

  const page = data.pages?.items?.[0];
  if (!page) return { title: "Not Found" };

  return {
    title: page._title,
    description: `Documentation for ${page._title}`,
  };
}

export default async function PageSlugPage({ params }: PageProps) {
  const { pageSlug } = await params;
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

        return (
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/docs" className="hover:text-foreground transition-colors">
                Docs
              </Link>
              <ChevronRight className="size-3" />
              <span className="text-foreground font-medium">{page._title}</span>
            </nav>

            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tight">{page._title}</h1>
            </div>

            {/* Articles Grid */}
            {articles.length > 0 ? (
              <div className="grid gap-4">
                {articles.map((article) => (
                  <Link
                    key={article._id}
                    href={`/docs/${page._slug}/${article._slug}`}
                    className="group flex items-start gap-4 rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {article.sidebarOverrides?.title || article._title}
                        </h3>
                        {article.sidebarOverrides?.markAsNew && (
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            New
                          </span>
                        )}
                      </div>
                      {article.excerpt && (
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed bg-muted/50 p-8 text-center">
                <FileText className="mx-auto size-12 text-muted-foreground/50" />
                <h3 className="mt-4 font-medium">No articles yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add articles to this page in BaseHub.
                </p>
              </div>
            )}
          </div>
        );
      }}
    </Pump>
  );
}
