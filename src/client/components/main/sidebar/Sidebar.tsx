import React from 'react';
import {RoomCreate} from './RoomCreate';
import {RoomLink} from './RoomLink';
import {Status} from './Status';
import {useRoomsAllSortedIdsTypes} from '../../../stores/rooms';
import {useUiRoomId} from '../../../stores/UiStore';

export const Sidebar = () => {
  const currentRoomId = useUiRoomId();
  return (
    <nav id="sidebar">
      <ul id="roomList">
        {useRoomsAllSortedIdsTypes().map(([roomId, roomType]) => (
          <RoomLink
            roomType={roomType}
            roomId={roomId}
            currentRoomId={currentRoomId}
            key={roomId}
          />
        ))}
      </ul>
      <hr />
      <RoomCreate />
      <Status />
    </nav>
  );
};
