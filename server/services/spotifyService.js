const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

let basicToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (basicToken && Date.now() < tokenExpiresAt) {
    return basicToken;
  }

  const client_id = process.env.SPOTIFY_CLIENT_ID;
  const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
  const token = Buffer.from(`${client_id}:${client_secret}`).toString('base64');

  const res = await axios.post(
    'https://accounts.spotify.com/api/token',
    qs.stringify({ grant_type: 'client_credentials' }),
    {
      headers: {
        'Authorization': `Basic ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  basicToken = res.data.access_token;
  tokenExpiresAt = Date.now() + res.data.expires_in * 1000 - 60_000;
  return basicToken;
}

getAccessToken().then(
  (token) => console.log('Spotify access token obtained', token),
  (err) => console.error('Failed to obtain Spotify access token', err)
)

async function spotifyFetch(endpoint) {
  const token = await getAccessToken();

  const res = await axios.get(`https://api.spotify.com/v1/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

module.exports = {
  search: (query) => spotifyFetch(`search?q=${encodeURIComponent(query)}&type=artist,track,album`),
  getArtist: (id) => spotifyFetch(`artists/${id}`),
  getTopTracks: (id) => spotifyFetch(`artists/${id}/top-tracks?market=US`),
  getAlbums: (id) => spotifyFetch(`artists/${id}/albums?include_groups=album,single&market=US`),
};
// const axios = require('axios');
// const qs = require('qs');
// const SpotifyToken = require('./SpotifyToken'); // модель из предыдущего шага
//
// class SpotifyService {
//   constructor(clientId, clientSecret, redirectUri) {
//     this.clientId = clientId;
//     this.clientSecret = clientSecret;
//     this.redirectUri = redirectUri;
//
//     this.clientToken = null;
//     this.clientTokenExpiresAt = 0;
//   }
//
//   // ------------------- Client Credentials -------------------
//   async getClientToken() {
//     if (this.clientToken && Date.now() < this.clientTokenExpiresAt) {
//       return this.clientToken;
//     }
//
//     const basic = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
//
//     const res = await axios.post(
//       'https://accounts.spotify.com/api/token',
//       qs.stringify({ grant_type: 'client_credentials' }),
//       { headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' } }
//     );
//
//     this.clientToken = res.data.access_token;
//     this.clientTokenExpiresAt = Date.now() + res.data.expires_in * 1000 - 60_000;
//
//     return this.clientToken;
//   }
//
//   // ------------------- User Auth -------------------
//   getAuthUrl(scopes = ['user-read-private', 'user-read-email']) {
//     return `https://accounts.spotify.com/authorize?${qs.stringify({
//       client_id: this.clientId,
//       response_type: 'code',
//       redirect_uri: this.redirectUri,
//       scope: scopes.join(' '),
//     })}`;
//   }
//
//   async saveUserToken(userId, code) {
//     const res = await axios.post(
//       'https://accounts.spotify.com/api/token',
//       qs.stringify({
//         grant_type: 'authorization_code',
//         code,
//         redirect_uri: this.redirectUri,
//         client_id: this.clientId,
//         client_secret: this.clientSecret,
//       }),
//       { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
//     );
//
//     const expiresAt = Date.now() + res.data.expires_in * 1000 - 60_000;
//
//     const doc = await SpotifyToken.findOneAndUpdate(
//       { userId },
//       {
//         accessToken: res.data.access_token,
//         refreshToken: res.data.refresh_token,
//         expiresAt,
//       },
//       { upsert: true, new: true }
//     );
//
//     return doc;
//   }
//
//   async refreshUserToken(userId) {
//     const tokenDoc = await SpotifyToken.findOne({ userId });
//     if (!tokenDoc) throw new Error('No Spotify token found for this user');
//
//     const res = await axios.post(
//       'https://accounts.spotify.com/api/token',
//       qs.stringify({
//         grant_type: 'refresh_token',
//         refresh_token: tokenDoc.refreshToken,
//         client_id: this.clientId,
//         client_secret: this.clientSecret,
//       }),
//       { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
//     );
//
//     tokenDoc.accessToken = res.data.access_token;
//     tokenDoc.expiresAt = Date.now() + res.data.expires_in * 1000 - 60_000;
//     await tokenDoc.save();
//
//     return tokenDoc.accessToken;
//   }
//
//   // ------------------- Fetch Wrapper -------------------
//   async fetch(endpoint, userId) {
//     let token;
//
//     if (userId) {
//       let tokenDoc = await SpotifyToken.findOne({ userId });
//       if (!tokenDoc) throw new Error('No token for this user');
//
//       if (Date.now() > tokenDoc.expiresAt) {
//         token = await this.refreshUserToken(userId);
//       } else {
//         token = tokenDoc.accessToken;
//       }
//     } else {
//       token = await this.getClientToken();
//     }
//
//     const res = await axios.get(`https://api.spotify.com/v1/${endpoint}`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//
//     return res.data;
//   }
// }
//
// module.exports = SpotifyService;
