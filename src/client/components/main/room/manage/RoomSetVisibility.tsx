import {
  LOCAL,
  RoomType,
  getRoomOtherVisibility,
  useRoomOwner,
  useRoomSetVisibilityCallback,
  useRoomVisibility,
} from '../../../../stores/rooms';
import {PRIVATE, PUBLIC} from '../../../../../common';
import React from 'react';
import {SelectButton} from '../../../common/ToggleButton';
import {useUiUsername} from '../../../../stores/UiStore';

export const RoomSetVisibility = ({
  roomType,
  roomId,
}: {
  readonly roomType: RoomType;
  readonly roomId: string;
}) => {
  const roomVisibility = useRoomVisibility(roomId);
  const disabled =
    useUiUsername() !== useRoomOwner(roomId) || roomType == LOCAL;
  const buttonTitle =
    `This is a ${roomVisibility} room. ` +
    (roomVisibility == PRIVATE
      ? 'Only this ' + (roomType == LOCAL ? 'browser' : 'user') + ' can see it.'
      : 'Any logged-in user can join it.') +
    (disabled ? '' : ' Click to change visibility.');
  const message =
    `Change the visibility of room from ${roomVisibility}` +
    ` to ${getRoomOtherVisibility(roomVisibility)}?`;

  return (
    <SelectButton
      buttonTitle={buttonTitle}
      modalTitle="Change visibility"
      message={message}
      currentValue={roomVisibility}
      values={[PRIVATE, PUBLIC]}
      labels={['Private', 'Public']}
      classNames={['private', 'public']}
      disabled={disabled}
      onChange={useRoomSetVisibilityCallback(roomId) as any}
    />
  );
};
