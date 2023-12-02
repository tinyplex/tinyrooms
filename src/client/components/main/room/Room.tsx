import {
  CREATING,
  LOCAL,
  useRoomState,
  useRoomStore,
  useRoomType,
} from '../../../stores/rooms';
import {useUiOnline, useUiRoomId, useUiUsername} from '../../../stores/UiStore';
import {FORBIDDEN} from '../../../common';
import React from 'react';
import {RoomBody} from './RoomBody';
import {RoomHeader} from './RoomHeader';
import {RoomJoin} from '../sidebar/RoomJoin';
import {useHasValues} from 'tinybase/debug/ui-react';

export const Room = () => {
  const roomId = useUiRoomId();
  const roomType = useRoomType(roomId);
  const roomStore = useRoomStore(roomId);
  const roomIsReady = useHasValues(roomStore);
  const roomState = useRoomState(roomType ?? LOCAL, roomId);

  const online = useUiOnline();
  const username = useUiUsername();

  return (
    <div id="room">
      {roomType ? (
        roomIsReady && roomState != CREATING && roomState != FORBIDDEN ? (
          <>
            <RoomHeader roomType={roomType} roomId={roomId} />
            <RoomBody roomId={roomId} />
          </>
        ) : null
      ) : (
        <>
          <p>Please choose or create a room from the sidebar</p>
          {roomId && online && username ? (
            <>
              <p>Or would you like to try and join room {roomId}?</p>
              <RoomJoin roomId={roomId} />
            </>
          ) : null}
        </>
      )}
    </div>
  );
};
