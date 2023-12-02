import {
  Request as CfRequest,
  Connection,
  ConnectionContext,
  Lobby,
  Party,
} from 'partykit/server';
import {
  FORBIDDEN_CODE,
  FORBIDDEN_MESSAGE,
  OWNER_VALUE,
  PUBLIC,
  VISIBILITY_VALUE,
} from '../common';
import {Id, Value} from 'tinybase';
import {MESSAGE_PREFIX, STORAGE_PREFIX, STORE_PATH} from '../config';
import {
  TinyBasePartyKitServer,
  TinyBasePartyKitServerConfig,
  broadcastTransactionChanges,
} from 'tinybase/persisters/persister-partykit-server';
import {getTokenContent, newResponse} from './common';

/**
 * This PartyKit server is responsible for storing (and collaborating on)
 * individual rooms. It serves the /room/<roomId>/ URLs.
 *
 * Rooms stored here have a few essential values: the owner's username, the
 * room's visibility, and its name. Otherwise, the content of this can be
 * anything that's required as the data structure of a 'room' - such as the
 * position of shapes on a canvas.
 *
 * To save to this server, a client must be a room's owner (if it is private) or
 * logged in (if it is public). The owner cannot be changed, and the visibility
 * can only be changed by the owner.
 */
export default class RoomServer extends TinyBasePartyKitServer {
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

  static async onBeforeRequest(
    request: CfRequest,
    lobby: Lobby,
  ): Promise<CfRequest | Response> {
    return (await getTokenContent(lobby, request)) != null
      ? request
      : newResponse(403);
  }

  static async onBeforeConnect(
    request: CfRequest,
    lobby: Lobby,
  ): Promise<CfRequest | Response> {
    return RoomServer.onBeforeRequest(request, lobby);
  }

  async onRequest(request: CfRequest): Promise<Response> {
    const [isPublic, owner, username] = await getPolicy(this, request);
    if ((!isPublic && owner !== username) || !username) {
      return newResponse(403);
    }
    return super.onRequest(request);
  }

  async onConnect(connection: Connection, {request}: ConnectionContext) {
    const [, , username] = await getPolicy(this, request);
    connection.setState({username});
    await validateConnections(this);
  }

  async onMessage(
    message: string,
    connection: Connection<{username: string}>,
  ): Promise<void> {
    await validateConnections(this);
    if (connection.readyState == WebSocket.OPEN) {
      await super.onMessage(message, connection);
      await validateConnections(this);
    }
  }

  async canSetValue(
    valueId: string,
    _value: Value,
    initialSave: boolean,
    requestOrConnection: CfRequest | Connection,
  ): Promise<boolean> {
    if (valueId == OWNER_VALUE) {
      return false;
    }
    if (valueId == VISIBILITY_VALUE && !initialSave) {
      const [, owner] = await getPolicy(this);
      return (
        owner ==
        (requestOrConnection as Connection<{username: string}>).state?.username
      );
    }
    return true;
  }
}

const getPolicy = async (that: RoomServer, request?: CfRequest) => {
  const username = request ? await getTokenContent(that.party, request) : '';
  let owner = await that.party.storage.get(getValueStorageKey(OWNER_VALUE));
  if (owner == null && username) {
    await that.party.storage.put(getValueStorageKey(OWNER_VALUE), username);
    owner = username;
    setTimeout(
      () => broadcastTransactionChanges(that, [{}, {owner} as {owner: string}]),
      100,
    );
  }
  return [
    (await that.party.storage.get(getValueStorageKey(VISIBILITY_VALUE))) ==
      PUBLIC,
    owner,
    username,
  ];
};

const getValueStorageKey = (valueId: Id) => STORAGE_PREFIX + 'v' + valueId;

const validateConnections = async (that: RoomServer): Promise<void> => {
  const [isPublic, owner] = await getPolicy(that);
  [...that.party.getConnections<{username: string}>()].forEach((connection) => {
    const {username} = connection.state ?? {};
    if (!isPublic && owner !== username) {
      connection.setState(null);
      connection.send(FORBIDDEN_MESSAGE);
      connection.close(FORBIDDEN_CODE);
    }
  });
};
