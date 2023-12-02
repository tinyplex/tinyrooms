import {
  CREATING,
  RoomType,
  useRoomName,
  useRoomState,
} from '../../../stores/rooms';
import {FORBIDDEN} from '../../../common';
import React from 'react';
import {useUiSetRoomId} from '../../../stores/UiStore';

export const RoomLink = ({
  roomType,
  roomId,
  currentRoomId,
}: {
  readonly roomType: RoomType;
  readonly roomId: string;
  readonly currentRoomId: string;
}) => {
  const roomState = useRoomState(roomType, roomId);
  const roomName = useRoomName(roomId) ?? '\u00A0';

  const classes: string[] = [roomType, roomState];
  if (roomId == currentRoomId) {
    classes.push('current');
  }

  const handleClick = useUiSetRoomId(roomId);

  return roomState == CREATING || roomState == FORBIDDEN ? null : (
    <li onClick={handleClick} className={classes.join(' ')}>
      {roomName}
    </li>
  );
};
