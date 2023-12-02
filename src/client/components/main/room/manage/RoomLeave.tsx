import {
  RoomType,
  useRoomsLeaveCallback,
  useRoomsSetTopRoomIdCallback,
} from '../../../../stores/rooms';
import {ConfirmButton} from '../../../common/ConfirmButton';
import React from 'react';

const LEAVE_ROOM_LABEL = 'Leave';
const LEAVE_ROOM_WARNING =
  'Are you sure you want to leave this room? ' +
  'You will lose access and all the data within it.';

export const RoomLeave = ({
  roomType,
  roomId,
}: {
  readonly roomType: RoomType;
  readonly roomId: string;
}) => {
  const handleConfirm = useRoomsLeaveCallback(
    roomType!,
    roomId,
    useRoomsSetTopRoomIdCallback(),
  );

  return (
    <ConfirmButton
      buttonTitle="Leave this room and remove it from your list."
      label={LEAVE_ROOM_LABEL}
      message={LEAVE_ROOM_WARNING}
      onConfirm={handleConfirm}
      className={'leave ' + roomType}
    />
  );
};
