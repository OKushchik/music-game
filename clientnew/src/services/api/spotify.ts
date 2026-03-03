import { $host } from '../index';

export const getSpotifyPlaylist = async (playlist: string) => {
  try {
    const { data } = await $host.get(`/spotify/playlist/${playlist}`, { withCredentials: true });
    return data;
  } catch (err: any) {
    throw err;
  }
}
