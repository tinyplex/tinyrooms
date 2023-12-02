import {CLOUD, useRoomJoinCallback} from '../../../stores/rooms';
import React, {useCallback} from 'react';
import {
  useUiOnline,
  useUiSetRoomIdCallback,
  useUiUsername,
} from '../../../stores/UiStore';

export const RoomJoin = ({roomId}: {readonly roomId: string}) => {
  const online = useUiOnline();
  const username = useUiUsername();

  const handleJoin = useRoomJoinCallback(
    CLOUD,
    useCallback(() => roomId, [roomId]),
    useUiSetRoomIdCallback(),
  );

  return (
    <button
      disabled={!online || !username}
      onClick={handleJoin}
      className="join"
    >
      Join room
    </button>
  );
};
