import {
  Connection,
  ConnectionContext,
  FetchLobby,
  Party,
  Request,
  Server,
} from 'partykit/server';
import {getTokenContent, newResponse, setCookie} from './common';

/**
 * This PartyKit server is responsible for handling top-level API calls, such as
 * getting the logged in username (from a JWT cookie), logging users out, and a
 * long-running 'ping' socket to help clients identify if they are online.
 */
export default class MainServer implements Server {
  constructor(readonly party: Party) {}

  readonly options = {
    hibernate: false,
  };

  static async onFetch(request: Request, lobby: FetchLobby): Promise<Response> {
    const username = await getTokenContent(lobby, request);
    const url = new URL(request.url);

    if (url.pathname == '/parties/username') {
      return newResponse(200, JSON.stringify(username));
    }

    if (url.pathname == '/parties/logout') {
      return newResponse(200, '', setCookie('token', ''));
    }

    return newResponse(404);
  }

  static async onBeforeRequest(): Promise<Request | Response> {
    return newResponse(404);
  }

  static async onBeforeConnect(
    connection: Connection,
    {request}: ConnectionContext,
  ): Promise<Request | Response> {
    if (connection.url && new URL(connection.url).pathname == '/party/ping') {
      return request;
    }
    return newResponse(404);
  }
}
