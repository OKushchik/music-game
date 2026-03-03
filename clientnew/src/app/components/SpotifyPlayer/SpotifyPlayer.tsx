type Track = {
  name: string;
  artist: string;
  releaseDate: string;
  spotifyUrl: string;
};
function toSpotifyEmbed(url: string) {
  const m = url?.match(/spotify\.com\/(track|album|playlist|artist)\/([a-zA-Z0-9]+)/);
  if (m) return `https://open.spotify.com/embed/${m[1]}/${m[2]}`;

  const m2 = url?.match(/^spotify:(track|album|playlist|artist):([a-zA-Z0-9]+)/);
  if (m2) return `https://open.spotify.com/embed/${m2[1]}/${m2[2]}`;

  return null;
}


export function SpotifyPlayer({ track }: { track: Track }) {
  const embed = toSpotifyEmbed(track?.spotifyUrl);

  if (!embed) return <p>SOMETHING WRONG</p>;

  return (
    <div>
      <iframe
        src={embed}
        width="100%"
        height="80"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        style={{ borderRadius: 12, border: 0, marginTop: 8 }}
        title="Spotify player"
      />
    </div>
  );
}
