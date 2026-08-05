import type { Metadata } from "next";
import { API_BASE_URL } from "@/lib/api";
import FanClubClient from "./FanClubClient";

type Props = { params: { authorId: string } };

async function getFanClub(authorId: string) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(API_BASE_URL + "/api/fanclub/" + authorId, {
        next: { revalidate: 60 },
      });
      if (!res.ok) return null;
      return res.json();
    } catch {
      if (attempt === 1) return null;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getFanClub(params.authorId);

  if (!data?.author) {
    return { title: "Fan Club không tồn tại – VStory" };
  }

  const author = data.author;
  const club = data.club;

  return {
    title: `${club?.name || "Fan Club"} của ${author.name} – VStory`,
    description: club?.description || `Fan Club của tác giả ${author.name} trên VStory`,
    alternates: {
      canonical: "https://vstory.vn/fanclub/" + params.authorId,
    },
    openGraph: {
      title: `${club?.name || "Fan Club"} của ${author.name} – VStory`,
      description: club?.description || `Fan Club của tác giả ${author.name} trên VStory`,
      url: "https://vstory.vn/fanclub/" + params.authorId,
      siteName: "VStory",
      type: "website",
    },
  };
}

export default async function FanClubPage({ params }: Props) {
  const data = await getFanClub(params.authorId);

  return <FanClubClient authorId={params.authorId} initialData={data} />;
}
