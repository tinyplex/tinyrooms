import React from 'react';
import {RoomLeave} from './RoomLeave';
import {RoomSetType} from './RoomSetType';
import {RoomSetVisibility} from './RoomSetVisibility';
import {RoomType} from '../../../../stores/rooms';

export const RoomManage = ({
  roomType,
  roomId,
}: {
  readonly roomType: RoomType;
  readonly roomId: string;
}) => (
  <div id="roomManage">
    <RoomSetVisibility roomType={roomType} roomId={roomId} />
    <RoomSetType roomType={roomType} roomId={roomId} />
    <RoomLeave roomType={roomType} roomId={roomId} />
  </div>
);
