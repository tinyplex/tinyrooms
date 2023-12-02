import {FetchLobby, Party, Request} from 'partykit/server';
import jwt from '@tsndr/cloudflare-worker-jwt';

export const GET = 'GET';
export const PUT = 'PUT';
export const POST = 'POST';

const TOKEN = 'token';

export const newResponse = (
  status: number,
  body: string | null = null,
  headers: HeadersInit = {},
) => new Response(body, {status, headers});

export const redirect = (location: string, headers: HeadersInit = {}) =>
  new Response('', {status: 302, headers: {...headers, location}});

export const setCookie = (key: string, value: string): HeadersInit => ({
  'set-cookie': `${key}=${value};samesite=strict;httponly;path=/`,
});

export const getCookies = (request: Request): {[key: string]: string} => {
  const cookies: {[key: string]: string} = {};
  (request.headers.get('cookie') ?? '').split(',').forEach((header) => {
    header.split(';').forEach((part) => {
      const [key, value] = part.split('=');
      if (key) {
        cookies[key] = value;
      }
    });
  });
  return cookies;
};

export const getTokenHeaders = async (
  party: Party,
  username: string,
): Promise<HeadersInit> => {
  const now = Math.floor(Date.now() / 1000);
  const token = await jwt.sign(
    {username, iat: now, exp: now + 7200},
    party.env.jwtSecret as string,
  );
  return setCookie(TOKEN, token);
};

export const getTokenContent = async (
  lobbyOrParty: FetchLobby | Party,
  request: Request,
): Promise<string | null> => {
  const token = getCookies(request)[TOKEN];
  return token &&
    (await jwt.verify(token, lobbyOrParty.env.jwtSecret as string))
    ? jwt.decode(token).payload?.username
    : null;
};
