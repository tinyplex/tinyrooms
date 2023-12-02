import {CREATED_CELL, ROOMS_TABLE, STATE_CELL, TYPE_CELL} from '../common';
import {
  Request as CfRequest,
  Connection,
  ConnectionContext,
  Lobby,
  Party,
} from 'partykit/server';
import {MESSAGE_PREFIX, STORAGE_PREFIX, STORE_PATH} from '../config';
import {
  TinyBasePartyKitServer,
  TinyBasePartyKitServerConfig,
} from 'tinybase/persisters/persister-partykit-server';
import {getTokenContent, newResponse} from './common';

/**
 * This PartyKit server is responsible for maintaining a list of all the rooms
 * each user owns. It serves the /rooms/<userId>/ URLs.
 *
 * It has a single table containing the rooms, by Id. Each has 'type' (which
 * is always 'cloud' here on the server), 'state', and 'created' cells.
 */
export default class RoomsServer extends TinyBasePartyKitServer {
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
    return lobby.id === (await getTokenContent(lobby, request))
      ? request
      : newResponse(403);
  }

  static async onBeforeConnect(
    request: CfRequest,
    lobby: Lobby,
  ): Promise<CfRequest | Response> {
    return RoomsServer.onBeforeRequest(request, lobby);
  }

  async onRequest(request: CfRequest): Promise<Response> {
    return super.onRequest(request);
  }

  async onConnect(connection: Connection, {request}: ConnectionContext) {
    const username = await getTokenContent(this.party, request);
    connection.setState({username});
  }

  async canSetTable(tableId: string): Promise<boolean> {
    return tableId == ROOMS_TABLE;
  }

  async canSetCell(
    _tableId: string,
    _rowId: string,
    cellId: string,
  ): Promise<boolean> {
    return (
      cellId == TYPE_CELL || cellId == STATE_CELL || cellId == CREATED_CELL
    );
  }

  async canSetValue(): Promise<boolean> {
    return false;
  }
}
