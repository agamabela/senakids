import { getVideos } from "@/app/admin/actions";
import TvClient from "./TvClient";

export default async function TvPage() {
  let videos = [];
  try {
    videos = await getVideos();
  } catch (e) {
    videos = [];
  }
  return <TvClient videos={videos} />;
}
