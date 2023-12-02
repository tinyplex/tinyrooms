import {
  CLOUD,
  LOCAL,
  getNewRoomId,
  useRoomJoinCallback,
} from '../../../stores/rooms';
import {CLOUD_DESCRIPTION, LOCAL_DESCRIPTION} from '../../../common';
import React, {useCallback} from 'react';
import {useUiSetRoomIdCallback, useUiUsername} from '../../../stores/UiStore';
import {useModal} from '../../common/Modal';

export const RoomCreate = () => {
  const [Modal, showModal, hideModal] = useModal();

  const setRoomId = useUiSetRoomIdCallback();
  const then = useCallback(
    (roomId: string) => {
      hideModal();
      setRoomId(roomId);
    },
    [hideModal, setRoomId],
  );

  const createLocalRoom = useRoomJoinCallback(LOCAL, getNewRoomId, then);
  const createCloudRoom = useRoomJoinCallback(CLOUD, getNewRoomId, then);

  const username = useUiUsername();

  const createLocalOrShowModal = useCallback(
    () => (username ? showModal() : createLocalRoom()),
    [username, showModal, createLocalRoom],
  );

  return (
    <>
      <button onClick={createLocalOrShowModal} className="create">
        Create room
      </button>
      <Modal title="Create room" onCancel={hideModal}>
        <p>What type of room would you like to create?</p>
        <div id="buttons">
          <button onClick={createLocalRoom} className="local">
            Local room
          </button>
          <button onClick={createCloudRoom} className="cloud open">
            Cloud room
          </button>
        </div>

        <p>{LOCAL_DESCRIPTION}</p>
        <p>
          {CLOUD_DESCRIPTION} You can convert rooms from one type to the other
          whenever you are logged in.
        </p>
      </Modal>
    </>
  );
};
