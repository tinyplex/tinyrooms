import {ConfirmButton} from '../common/ConfirmButton';
import React from 'react';
import {useUiOnline} from '../../stores/UiStore';
import {useUserLogoutCallback} from '../../stores/UserStore';

const WARNING =
  'Are you sure you want to logout? ' +
  'You will lose access to your cloud rooms.';
const WARNING_OFFLINE =
  ' You are also offline, so any local changes to cloud stores will be lost.';

export const Logout = () => (
  <ConfirmButton
    buttonTitle="Logout from this user account."
    className="logout"
    label="Logout"
    message={WARNING + (useUiOnline() ? '' : WARNING_OFFLINE)}
    onConfirm={useUserLogoutCallback()}
  />
);
