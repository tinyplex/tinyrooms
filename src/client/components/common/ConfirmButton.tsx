import React, {useCallback} from 'react';
import {useModal} from './Modal';

export const ConfirmButton = ({
  buttonTitle,
  label,
  message,
  onConfirm,
  className,
}: {
  readonly buttonTitle: string;
  readonly label: string;
  readonly message: string;
  readonly onConfirm: () => void;
  readonly className?: string;
}) => {
  const [Modal, showModal, hideModal] = useModal();

  const handleConfirm = useCallback(() => {
    onConfirm();
    hideModal();
  }, [onConfirm, hideModal]);

  return (
    <>
      <button onClick={showModal} className={className} title={buttonTitle}>
        {label}
      </button>
      <Modal title={label} onDefault={handleConfirm} onCancel={hideModal}>
        <p>{message}</p>
        <div id="buttons">
          <button onClick={hideModal}>Cancel</button>
          <button onClick={handleConfirm} className="default">
            Confirm
          </button>
        </div>
      </Modal>
    </>
  );
};
