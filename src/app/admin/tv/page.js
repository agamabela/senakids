import { getVideos } from "../actions";
import TvAdmin from "./TvAdmin";

export const dynamic = "force-dynamic";

export default async function TvPage() {
  let videos = [];
  try {
    videos = await getVideos();
  } catch (e) {
    videos = [];
  }
  return <TvAdmin initialVideos={videos} />;
}
