import {Login} from './Login';
import {Logout} from './Logout';
import React from 'react';
import {User} from './User';
import {useUiUsername} from '../../stores/UiStore';

export const Auth = () => {
  return (
    <div id="auth">
      {useUiUsername() ? (
        <>
          <User />
          <Logout />
        </>
      ) : (
        <Login />
      )}
    </div>
  );
};
