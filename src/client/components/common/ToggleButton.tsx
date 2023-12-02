import React, {SyntheticEvent, useCallback, useMemo} from 'react';
import {useModal} from './Modal';

export const SelectButton = ({
  buttonTitle,
  modalTitle,
  message,
  currentValue,
  values,
  labels,
  classNames,
  disabled,
  onChange,
}: {
  readonly buttonTitle: string;
  readonly modalTitle: string;
  readonly message: string;
  readonly currentValue: string;
  readonly values: string[];
  readonly labels: string[];
  readonly classNames: string[];
  readonly disabled?: boolean;
  readonly onChange: (value: string) => void;
}) => {
  const [Modal, showModal, hideModal] = useModal();

  const currentIndex = useMemo(
    () => values.indexOf(currentValue),
    [values, currentValue],
  );

  const handleChange = useCallback(
    (event: SyntheticEvent<HTMLButtonElement>) => {
      hideModal();
      onChange(event.currentTarget.dataset.value ?? '');
    },
    [hideModal, onChange],
  );

  return (
    <>
      <button
        disabled={disabled}
        onClick={showModal}
        className={classNames[currentIndex]}
        title={buttonTitle}
      >
        {labels[currentIndex]}
      </button>
      {disabled ? null : (
        <Modal title={modalTitle} onDefault={hideModal} onCancel={hideModal}>
          <p>{message}</p>
          <div className="buttons">
            {values.map((value, key) =>
              value === currentValue ? (
                <button
                  key={value}
                  className={classNames[key] + ' current'}
                  onClick={hideModal}
                >
                  {labels[key]}
                </button>
              ) : (
                <button
                  key={value}
                  className={classNames[key]}
                  data-value={value}
                  onClick={handleChange}
                >
                  {labels[key]}
                </button>
              ),
            )}
          </div>
        </Modal>
      )}
    </>
  );
};
