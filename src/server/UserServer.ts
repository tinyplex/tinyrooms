import {
  Request as CfRequest,
  Connection,
  ConnectionContext,
  Context,
  Lobby,
  Party,
} from 'partykit/server';
import {MESSAGE_PREFIX, STORAGE_PREFIX, STORE_PATH} from '../config';
import {PUT, getTokenContent, newResponse} from './common';
import {
  TinyBasePartyKitServer,
  TinyBasePartyKitServerConfig,
} from 'tinybase/persisters/persister-partykit-server';
import {Value} from 'tinybase';

export type User = {
  username: string;
  provider: 'github' | 'test';
  providerUsername: string;
  name: string;
  avatar: string;
  accessToken: string;
};

/**
 * This PartyKit server is responsible for storing each user's account. It
 * serves the /user/<userId>/ URLs.
 *
 * It has a set of values containing the user's profile information. Most of
 * this is populated by the AuthServer (via createUser) when the user first logs
 * in, but the logged-in user can subsequently change the name field.
 */
export default class UserServer extends TinyBasePartyKitServer {
  constructor(readonly party: Party) {
    super(party);
  }

  readonly options = {
    hibernate: true,
  };

  readonly config: TinyBasePartyKitServerConfig = {
    storePath: STORE_PATH,
    storagePrefix: STORAGE_PREFIX,
    messagePrefix: MESSAGE_PREFIX,
  };

  static async createUser(context: Context, username: string, user: User) {
    return await (
      await context.parties.user.get(username).fetch(STORE_PATH, {
        method: PUT,
        body: JSON.stringify([{}, user]),
      })
    ).text();
  }

  static async onBeforeRequest(
    request: CfRequest,
    lobby: Lobby,
  ): Promise<CfRequest | Response> {
    return lobby.id === (await getTokenContent(lobby, request))
      ? request
      : newResponse(403);
  }

  static async onBeforeConnect(
    request: CfRequest,
    lobby: Lobby,
  ): Promise<CfRequest | Response> {
    return UserServer.onBeforeRequest(request, lobby);
  }

  async onConnect(connection: Connection, {request}: ConnectionContext) {
    const username = await getTokenContent(this.party, request);
    connection.setState({username});
  }

  async canSetTable(): Promise<boolean> {
    return false;
  }

  async canSetValue(
    valueId: string,
    _value: Value,
    initialSave: boolean,
  ): Promise<boolean> {
    return initialSave || valueId == 'name';
  }
}
