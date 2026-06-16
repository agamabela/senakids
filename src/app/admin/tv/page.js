import { getVideos } from "../actions";
import TvAdmin from "./TvAdmin";

export default async function TvPage() {
  const videos = await getVideos();
  return <TvAdmin initialVideos={videos} />;
}
