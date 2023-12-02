import {
  EditableUsernameView,
  useUserName,
  useUserProvider,
  useUserProviderUsername,
} from '../../stores/UserStore';
import React from 'react';
import {useModal} from '../common/Modal';

export const User = () => {
  const provider = useUserProvider();
  const providerUsername = useUserProviderUsername();
  const name = useUserName();

  const [Modal, showModal, hideModal] = useModal();

  return (
    <>
      <button
        className={provider + ' ' + providerUsername}
        onClick={showModal}
        title="This is the current user. Click to change the profile nickname."
      >
        {name}
      </button>
      <Modal title="Edit nickname" onDefault={hideModal}>
        <p>Edit your user&apos;s nickname for this app.</p>
        <div id="buttons">
          <EditableUsernameView />
          <button onClick={hideModal}>OK</button>
        </div>
      </Modal>
    </>
  );
};
