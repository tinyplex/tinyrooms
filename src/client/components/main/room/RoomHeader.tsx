import {EditableRoomNameView} from '../../../stores/RoomStore';
import React from 'react';
import {RoomManage} from './manage/RoomManage';
import {RoomType} from '../../../stores/rooms';

export const RoomHeader = ({
  roomType,
  roomId,
}: {
  readonly roomType: RoomType;
  readonly roomId: string;
}) => {
  return (
    <div id="roomHeader">
      <EditableRoomNameView roomId={roomId} />
      <RoomManage roomType={roomType} roomId={roomId} />
    </div>
  );
};
