import React from 'react';
import {createStore} from 'tinybase';
import {useCreateStore, useProvideStore, useRowIds} from 'tinybase/ui-react';
import {ROOMS_TABLE} from '../../common';
import {usePersisters} from '../common';
import {
  CLOUD,
  CLOUD_ROOMS_STORE_PARTY,
  getRoomsStoreId,
  INITIAL_JSON_CELL,
  RoomType,
} from './rooms';
import {RoomStore} from './RoomStore';
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
