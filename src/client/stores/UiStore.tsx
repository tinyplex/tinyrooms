import {useCallback, useEffect} from 'react';
import {
  useCreateStore,
  useDelValueCallback,
  useProvideStore,
  useSetValueCallback,
  useValue,
  useValueListener,
} from 'tinybase/debug/ui-react';
import {createStore} from 'tinybase';
import {getConnection} from '../common';

const UI_STORE_ID = 'ui';

const USERNAME_VALUE = 'username';
const ONLINE_VALUE = 'online';
const ROOM_ID_VALUE = 'roomId';

/**
 * The app's UI state
 */
export const UiStore = () => {
  // Create Store
  const uiStore = useCreateStore(createStore);

  useProvideStore(UI_STORE_ID, uiStore);

  // Update room if hash changes, and vice-versa
  const handleHash = useCallback(
    () => uiStore.setValue(ROOM_ID_VALUE, location.hash.slice(1)),
    [uiStore],
  );
  useEffect(() => {
    handleHash();
    addEventListener('hashchange', handleHash);
    return () => removeEventListener('hashchange', handleHash);
  }, [handleHash]);
  useValueListener(
    ROOM_ID_VALUE,
    (_stateStore, _valueId, roomId) =>
      history.replaceState(null, '', '#' + roomId),
    [],
    false,
    uiStore,
  );

  // Update Store if on/offline changes
  useEffect(() => {
    const [connection, destroyConnection] = getConnection(
      undefined,
      'ping',
      (state) => uiStore.setValue(ONLINE_VALUE, state == 'open'),
    );
    uiStore.setValue(ONLINE_VALUE, connection.readyState == connection.OPEN);
    return destroyConnection;
  }, [uiStore]);

  // Update Store if authenticated username changes
  useEffect(() => {
    const fetchUsername = () =>
      fetch('/parties/username').then((response) =>
        response
          .json()
          .then((username: any) =>
            username
              ? uiStore.setValue(USERNAME_VALUE, username)
              : uiStore.delValue(USERNAME_VALUE),
          ),
      );
    fetchUsername();
    const interval = setInterval(fetchUsername, 10000);
    return () => clearInterval(interval);
  }, [uiStore]);

  return null;
};

export const useUiUsername = () =>
  useValue(USERNAME_VALUE, UI_STORE_ID) as string;

export const useUiDelUsernameCallback = () =>
  useDelValueCallback(USERNAME_VALUE, UI_STORE_ID);

export const useUiOnline = () => useValue(ONLINE_VALUE, UI_STORE_ID) as boolean;

export const useUiRoomId = () => useValue(ROOM_ID_VALUE, UI_STORE_ID) as string;

export const useUiSetRoomId = (roomId: string) =>
  useSetValueCallback(ROOM_ID_VALUE, () => roomId, [roomId], UI_STORE_ID);

export const useUiSetRoomIdCallback = () =>
  useSetValueCallback(
    ROOM_ID_VALUE,
    (roomId: string) => roomId ?? '',
    [],
    UI_STORE_ID,
  );
