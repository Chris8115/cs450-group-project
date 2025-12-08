import { useEffect, useState } from "react";
import { csv } from "d3-fetch";

export default function useSpotifyData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    csv(process.env.PUBLIC_URL + "/data/spotify.csv").then((raw) => {
      const parsed = raw.map((d) => ({
        ...d,
        acousticness: +d.acousticness,
        danceability: +d.danceability,
        duration_ms: +d.duration_ms,
        energy: +d.energy,
        instrumentalness: +d.instrumentalness,
        key: +d.key,
        liveness: +d.liveness,
        loudness: +d.loudness,
        mode: +d.mode,
        speechiness: +d.speechiness,
        tempo: +d.tempo,
        time_signature: +d.time_signature,
        valence: +d.valence,
        popularity: +d.popularity,
      }));

      const SAMPLE_SIZE = 20000;

      const sampled =
        parsed.length > SAMPLE_SIZE
          ? parsed.sort(() => 0.5 - Math.random()).slice(0, SAMPLE_SIZE)
          : parsed;

      setData(sampled);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
