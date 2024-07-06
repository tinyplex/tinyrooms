import {useCallback} from 'react';
import {nanoid} from 'nanoid';
import {Row} from 'tinybase';
import {
  useCell,
  useDelRowCallback,
  useDelTableCallback,
  useHasRow,
  useRowIds,
  useSetCellCallback,
  useSetValueCallback,
  useStore,
  useValue,
} from 'tinybase/ui-react';
import {
  CREATED_CELL,
  NAME_VALUE,
  OWNER_VALUE,
  PRIVATE,
  PUBLIC,
  ROOMS_TABLE,
  STATE_CELL,
  TYPE_CELL,
  VISIBILITY_VALUE,
} from '../../common';
import {ConnectionState, FORBIDDEN, OPEN} from '../common';
import {useUiSetRoomIdCallback} from './UiStore';

export type RoomState = ConnectionState | typeof CREATING;
export type RoomType = typeof LOCAL | typeof CLOUD;
export type RoomVisibility = typeof PUBLIC | typeof PRIVATE;

export const CREATING = 'creating';

export const LOCAL = 'local';
export const CLOUD = 'cloud';

export const ROOM_STORE_ID_PREFIX = 'room/';

export const CLOUD_ROOMS_STORE_PARTY = 'rooms';
export const CLOUD_ROOM_STORE_PARTY = 'room';

export const INITIAL_JSON_CELL = 'initialJson';

const LOCAL_ROOMS_STORE_ID = 'local';
const CLOUD_ROOMS_STORE_ID = 'cloud';

export const useRoomsStore = (roomType: RoomType) =>
  useStore(getRoomsStoreId(roomType));

export const useRoomsAllSortedIdsTypes = (): [id: string, type: RoomType][] => {
  const localRoomsStore = useRoomsStore(LOCAL);
  const cloudRoomsStore = useRoomsStore(CLOUD);
  return (
    [
      ...useRowIds(ROOMS_TABLE, localRoomsStore).map((id) => [
        id,
        localRoomsStore?.getRow(ROOMS_TABLE, id),
      ]),
      ...useRowIds(ROOMS_TABLE, cloudRoomsStore).map((id) => [
        id,
        cloudRoomsStore?.getRow(ROOMS_TABLE, id),
      ]),
    ] as [id: string, id: Row][]
  )
    .sort(([, row1], [, row2]) =>
      row1[CREATED_CELL] > row2[CREATED_CELL] ? 1 : -1,
    )
    .map(([id, row]) => [id, row[TYPE_CELL] as RoomType]);
};

export const useRoomsHasRoom = (roomType: RoomType, roomId: string) =>
  useHasRow(ROOMS_TABLE, roomId, getRoomsStoreId(roomType));

export const useRoomsRemoveAllCallback = (roomType: RoomType) =>
  useDelTableCallback(ROOMS_TABLE, getRoomsStoreId(roomType));

export const useRoomJoinCallback = (
  roomType: RoomType,
  getRoomId: () => string,
  then?: (roomId: string) => void,
) => {
  const roomsStore = useStore(getRoomsStoreId(roomType));
  const otherRoomsStore = useStore(getRoomsStoreId(getRoomOtherType(roomType)));
  return useCallback(() => {
    const roomId = getRoomId();
    roomsStore?.setRow(ROOMS_TABLE, roomId, {
      [TYPE_CELL]: roomType,
      [STATE_CELL]: roomType == LOCAL ? OPEN : CREATING,
      [CREATED_CELL]: Date.now(),
      [INITIAL_JSON_CELL]: JSON.stringify([
        {},
        {
          [NAME_VALUE]:
            'Room ' +
            (1 +
              roomsStore.getRowCount(ROOMS_TABLE) +
              (otherRoomsStore?.getRowCount(ROOMS_TABLE) ?? 0)),
          [VISIBILITY_VALUE]: PRIVATE,
        },
      ]),
    });
    then?.(roomId);
    return roomId;
  }, [getRoomId, roomsStore, otherRoomsStore, roomType, then]);
};

export const useRoomsLeaveCallback = (
  roomType: RoomType,
  roomId: string,
  then?: () => void,
) => {
  const deleteRoom = useDelRowCallback(
    ROOMS_TABLE,
    roomId,
    getRoomsStoreId(roomType),
  );
  return useCallback(() => {
    deleteRoom();
    localStorage.removeItem(getRoomStoreId(roomId));
    then?.();
  }, [deleteRoom, roomId, then]);
};

export const useRoomsSetTopRoomIdCallback = () => {
  const setRoomId = useUiSetRoomIdCallback();
  const localStore = useRoomsStore(LOCAL);
  const cloudStore = useRoomsStore(CLOUD);
  return useCallback(() => {
    const localRoomId = localStore?.getSortedRowIds(
      ROOMS_TABLE,
      CREATED_CELL,
    )[0];
    const cloudRoomId = cloudStore?.getSortedRowIds(
      ROOMS_TABLE,
      CREATED_CELL,
    )[0];
    if (localStore && localRoomId && cloudStore && cloudRoomId) {
      setRoomId(
        localStore.getCell(ROOMS_TABLE, localRoomId, CREATED_CELL)! <
          cloudStore.getCell(ROOMS_TABLE, cloudRoomId, CREATED_CELL)!
          ? localRoomId
          : cloudRoomId,
      );
    } else if (cloudRoomId) {
      setRoomId(cloudRoomId);
    } else if (localRoomId) {
      setRoomId(localRoomId);
    }
  }, [setRoomId, localStore, cloudStore]);
};

export const getRoomsStoreId = (roomType: RoomType) =>
  roomType == LOCAL ? LOCAL_ROOMS_STORE_ID : CLOUD_ROOMS_STORE_ID;

// --

export const useRoomStore = (roomId: string) =>
  useStore(getRoomStoreId(roomId));

export const useRoomName = (roomId: string): string =>
  useValue(NAME_VALUE, getRoomStoreId(roomId)) as string;

export const useRoomOwner = (roomId: string): string =>
  useValue(OWNER_VALUE, getRoomStoreId(roomId)) as string;

export const useRoomVisibility = (roomId: string): RoomVisibility =>
  useValue(VISIBILITY_VALUE, getRoomStoreId(roomId)) as RoomVisibility;

export const useRoomSetTypeCallback = (
  oldRoomType: RoomType,
  oldRoomId: string,
  then?: (roomId: string) => void,
) => {
  const oldRoomsStore = useRoomsStore(oldRoomType);
  const oldRoomStore = useRoomStore(oldRoomId);
  const newRoomType = getRoomOtherType(oldRoomType);
  const newRoomsStore = useRoomsStore(newRoomType);

  const leaveOldRoom = useRoomsLeaveCallback(oldRoomType, oldRoomId);

  return useCallback(
    (roomType: RoomType) => {
      if (roomType != oldRoomType) {
        const newRoomId = getNewRoomId();
        const room = oldRoomsStore?.getRow(ROOMS_TABLE, oldRoomId) ?? {};
        oldRoomStore?.setValue(VISIBILITY_VALUE, PRIVATE);
        leaveOldRoom();
        newRoomsStore?.setRow(ROOMS_TABLE, newRoomId, {
          ...room,
          [TYPE_CELL]: newRoomType,
          [INITIAL_JSON_CELL]: oldRoomStore?.getJson() ?? '',
        });
        then?.(newRoomId);
        return newRoomId;
      }
    },
    [
      oldRoomType,
      oldRoomId,
      oldRoomsStore,
      oldRoomStore,
      newRoomType,
      newRoomsStore,
      leaveOldRoom,
      then,
    ],
  );
};

export const useRoomSetVisibilityCallback = (roomId: string) =>
  useSetValueCallback(
    VISIBILITY_VALUE,
    (visibility: RoomVisibility) => visibility,
    [],
    getRoomStoreId(roomId),
  );

export const useRoomType = (roomId: string): RoomType | null => {
  const isLocal = useHasRow(ROOMS_TABLE, roomId, LOCAL_ROOMS_STORE_ID);
  const isCloud = useHasRow(ROOMS_TABLE, roomId, CLOUD_ROOMS_STORE_ID);
  return isLocal ? LOCAL : isCloud ? CLOUD : null;
};

export const useRoomState = (roomType: RoomType, roomId: string) =>
  useCell(
    ROOMS_TABLE,
    roomId,
    STATE_CELL,
    getRoomsStoreId(roomType),
  ) as RoomState;

export const useRoomSetStateCallback = (roomType: RoomType, roomId: string) => {
  const leaveRoom = useRoomsLeaveCallback(
    roomType,
    roomId,
    useRoomsSetTopRoomIdCallback(),
  );
  return useSetCellCallback(
    ROOMS_TABLE,
    roomId,
    STATE_CELL,
    (state: RoomState) => state,
    [],
    getRoomsStoreId(roomType),
    (_, state) => {
      if (state == FORBIDDEN) {
        leaveRoom();
      }
    },
  );
};

export const getRoomStoreId = (roomId: string) => ROOM_STORE_ID_PREFIX + roomId;

export const getRoomOtherType = (roomType: RoomType): RoomType =>
  roomType == CLOUD ? LOCAL : CLOUD;

export const getRoomOtherVisibility = (
  visibility: RoomVisibility,
): RoomVisibility => (visibility == PUBLIC ? PRIVATE : PUBLIC);

export const getNewRoomId = () => nanoid(14).replace(/_/g, '-');
