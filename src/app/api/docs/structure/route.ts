import { basehub } from "basehub";
import { draftMode } from "next/headers";

export async function GET() {
  const { isEnabled: isDraftMode } = await draftMode();

  try {
    const data = await basehub({ draft: isDraftMode }).query({
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
              sidebarOverrides: {
                title: true,
                markAsNew: true,
              },
              children: {
                items: {
                  _id: true,
                  _title: true,
                  _slug: true,
                  sidebarOverrides: {
                    title: true,
                    markAsNew: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return Response.json(data);
  } catch (error) {
    console.error("Failed to fetch docs structure:", error);
    return Response.json({ pages: { items: [] } }, { status: 500 });
  }
}
