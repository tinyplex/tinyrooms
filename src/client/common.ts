import {FORBIDDEN_CODE, FORBIDDEN_MESSAGE} from '../common';
import {MESSAGE_PREFIX, STORE_PATH} from '../config';
import PartySocket from 'partysocket';
import {Store} from 'tinybase/store';
import {createLocalPersister} from 'tinybase/persisters/persister-browser';
import {createPartyKitPersister} from 'tinybase/persisters/persister-partykit-client';
import {useEffect} from 'react';
import {useUiUsername} from './stores/UiStore';

declare const PARTYKIT_HOST: string;

export type ConnectionState =
  | typeof OPEN
  | typeof CLOSE
  | typeof ERROR
  | typeof FORBIDDEN;

type HandledEvent = typeof OPEN | typeof MESSAGE | typeof CLOSE | typeof ERROR;

const MESSAGE = 'message';
export const OPEN = 'open';
export const CLOSE = 'close';
export const ERROR = 'error';
export const FORBIDDEN = 'forbidden';

export const LOCAL_DESCRIPTION =
  'A local room will be saved only on this browser.';
export const CLOUD_DESCRIPTION =
  'A cloud room will be saved to your online account ' +
  '(though you can also create and work on it when you are offline).';

export const getOauthUrl = (
  step: 0 | 1,
  params: {state?: string; code?: string},
) =>
  '/parties/auth/github?' +
  new URLSearchParams({
    step: step.toString(),
    uri: location.origin + location.pathname + delParams('state', 'code'),
    ...params,
  }).toString();

export const redirect = (url: string) => location.replace(url);

export const addParam = (key: string, value: string) => {
  const params = new URLSearchParams(location.search);
  params.set(key, value);
  return '?' + params.toString();
};

export const delParams = (...keys: string[]) => {
  const params = new URLSearchParams(location.search);
  keys.forEach((key) => params.delete(key));
  return params.size > 0 ? '?' + params.toString() : '.';
};

export const getConnection = (
  party: string | undefined,
  room: string,
  handleState?: (state: ConnectionState) => void,
): [connection: PartySocket, destroyConnection: () => void] => {
  const connection = new PartySocket({host: PARTYKIT_HOST, party, room});
  const cleanups: (() => void)[] = [];

  if (handleState) {
    const handleClose = ({code}: {code: any}) => {
      handleState(code == FORBIDDEN_CODE ? FORBIDDEN : CLOSE);
    };

    const handleEvents = {
      [OPEN]: () => handleState(OPEN),
      [MESSAGE]: ({data}: {data: any}) => {
        if (data == FORBIDDEN_MESSAGE) {
          handleClose({code: FORBIDDEN_CODE});
          connection.close();
        }
      },
      [ERROR]: () => handleState(ERROR),
      [CLOSE]: handleClose,
    } as {[state in HandledEvent]: (data: any) => void};

    ([OPEN, MESSAGE, CLOSE, ERROR] as const).forEach((event) => {
      connection.addEventListener(event, handleEvents[event]);
      cleanups.push(() =>
        connection.removeEventListener(event, handleEvents[event]),
      );
    });
  }

  return [connection, () => cleanups.forEach((cleanup) => cleanup())];
};

export const usePersisters = (
  store: Store,
  localStorageName: string,
  cloudParty?: string,
  cloudRoom?: string,
  onCloudState?: (state: ConnectionState) => void,
) => {
  const username = useUiUsername();
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const localPersister = createLocalPersister(store, localStorageName);
    cleanups.push(localPersister.destroy);
    localPersister.startAutoLoad(...store.getContent()).then(() => {
      localPersister.startAutoSave().then(() => {
        if (cloudParty && cloudRoom && username) {
          const [connection, destroyConnection] = getConnection(
            cloudParty,
            cloudRoom,
            onCloudState,
          );
          const remotePersister = createPartyKitPersister(store, connection, {
            storePath: STORE_PATH,
            storeProtocol: location.protocol.slice(0, -1) as 'http' | 'https',
            messagePrefix: MESSAGE_PREFIX,
          });
          cleanups.push(remotePersister.destroy, destroyConnection);
          remotePersister
            .startAutoLoad(...store.getContent())
            .then(remotePersister.startAutoSave);
        }
      });
    });
    return () => cleanups.forEach((cleanup) => cleanup());
  }, [store, localStorageName, cloudParty, cloudRoom, onCloudState, username]);
};
