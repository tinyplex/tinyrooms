import React, {useCallback, useEffect, useState} from 'react';

export const useModal = (): [typeof Modal, () => void, () => void] => {
  const [modal, setModal] = useState(false);
  const showModal = useCallback(() => setModal(true), []);
  const hideModal = useCallback(() => setModal(false), []);

  return [modal ? Modal : (Null as any), showModal, hideModal];
};

const Modal = ({
  title,
  onDefault,
  onCancel,
  children,
}: {
  readonly title: string;
  readonly onDefault?: () => void;
  readonly onCancel?: () => void;
  readonly children: React.ReactNode;
}) => {
  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (event.code == 'Escape' && onCancel) {
        event.preventDefault();
        onCancel();
      }
      if (event.code == 'Enter' && onDefault) {
        event.preventDefault();
        onDefault();
      }
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [onCancel, onDefault]);
  return (
    <div id="overlay">
      <div id="modal">
        {onCancel ? <button onClick={onCancel} className="cancel" /> : null}
        <b>{title}</b>
        {children}
      </div>
    </div>
  );
};

const Null = () => null;
