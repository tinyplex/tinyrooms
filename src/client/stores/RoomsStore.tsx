import {
  CLOUD,
  CLOUD_ROOMS_STORE_PARTY,
  INITIAL_JSON_CELL,
  RoomType,
  getRoomsStoreId,
} from './rooms';
import {
  useCreateStore,
  useProvideStore,
  useRowIds,
} from 'tinybase/debug/ui-react';
import {ROOMS_TABLE} from '../../common';
import React from 'react';
import {RoomStore} from './RoomStore';
import {createStore} from 'tinybase';
import {usePersisters} from '../common';
import {useUiUsername} from './UiStore';

/**
 * The indexes of local and cloud rooms
 */
export const RoomsStore = ({roomType}: {roomType: RoomType}) => {
  const username = useUiUsername();
  const roomsStoreId = getRoomsStoreId(roomType);
  const roomsStore = useCreateStore(createStore);
  useProvideStore(roomsStoreId, roomsStore);
  usePersisters(
    roomsStore,
    roomsStoreId,
    ...(roomType == CLOUD ? [CLOUD_ROOMS_STORE_PARTY, username] : []),
  );
  return useRowIds(ROOMS_TABLE, roomsStore).map((roomId) => {
    const initialJson = roomsStore.getCell(
      ROOMS_TABLE,
      roomId,
      INITIAL_JSON_CELL,
    ) as string;
    if (initialJson) {
      requestAnimationFrame(() =>
        roomsStore.delCell(ROOMS_TABLE, roomId, INITIAL_JSON_CELL),
      );
    }
    return (
      <RoomStore
        roomType={roomType}
        roomId={roomId}
        key={roomId}
        initialJson={initialJson}
      />
    );
  });
};
