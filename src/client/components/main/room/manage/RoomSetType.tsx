import {
  CLOUD,
  LOCAL,
  RoomType,
  getRoomOtherType,
  useRoomSetTypeCallback,
} from '../../../../stores/rooms';
import {CLOUD_DESCRIPTION, LOCAL_DESCRIPTION} from '../../../../common';
import {
  useUiSetRoomIdCallback,
  useUiUsername,
} from '../../../../stores/UiStore';
import React from 'react';
import {SelectButton} from '../../../common/ToggleButton';

export const RoomSetType = ({
  roomType,
  roomId,
}: {
  readonly roomType: RoomType;
  readonly roomId: string;
}) => {
  const disabled = !useUiUsername();

  const buttonTitle =
    `This is a ${roomType} room. ` +
    (roomType == LOCAL ? LOCAL_DESCRIPTION : CLOUD_DESCRIPTION) +
    (disabled ? '' : ' Click to change type.');
  const message =
    `Change the type of room from ${roomType} to ${getRoomOtherType(
      roomType,
    )}? ` + (roomType == LOCAL ? CLOUD_DESCRIPTION : LOCAL_DESCRIPTION);
  const handleChange = useRoomSetTypeCallback(
    roomType,
    roomId,
    useUiSetRoomIdCallback(),
  ) as any;

  return (
    <SelectButton
      buttonTitle={buttonTitle}
      modalTitle="Change type"
      message={message}
      currentValue={roomType}
      values={[LOCAL, CLOUD]}
      labels={['Local', 'Cloud']}
      classNames={['local', 'cloud open']}
      disabled={disabled}
      onChange={handleChange}
    />
  );
};
