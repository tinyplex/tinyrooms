import React from 'react';
import {createStore} from 'tinybase';
import {useCreateStore, useProvideStore} from 'tinybase/ui-react';
import {EditableValueView} from 'tinybase/ui-react-dom';
import {NAME_VALUE} from '../../common';
import {usePersisters} from '../common';
import {
  CLOUD,
  CLOUD_ROOM_STORE_PARTY,
  getRoomStoreId,
  RoomType,
  useRoomSetStateCallback,
} from './rooms';

export const RoomStore = ({
  roomType,
  roomId,
  initialJson,
}: {
  readonly roomType: RoomType;
  readonly roomId: string;
  readonly initialJson: string;
}) => {
  const roomStoreId = getRoomStoreId(roomId);
  const roomStore = useCreateStore(() => {
    const store = createStore();
    if (initialJson) {
      store.setJson(initialJson);
    }
    return store;
  }, [roomStoreId, initialJson]);
  const setRoomState = useRoomSetStateCallback(roomType, roomId);
  useProvideStore(roomStoreId, roomStore);
  usePersisters(
    roomStore,
    roomStoreId,
    ...((roomType == CLOUD
      ? [CLOUD_ROOM_STORE_PARTY, roomId, setRoomState]
      : []) as any),
  );
  return null;
};

export const EditableRoomNameView = ({roomId}: {readonly roomId: string}) => (
  <EditableValueView
    className="roomName"
    store={getRoomStoreId(roomId)}
    valueId={NAME_VALUE}
    showType={false}
  />
);
