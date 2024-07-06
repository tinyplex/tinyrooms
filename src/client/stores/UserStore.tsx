import React, {MouseEventHandler, useCallback} from 'react';
import {createStore} from 'tinybase';
import {useCreateStore, useProvideStore, useValue} from 'tinybase/ui-react';
import {EditableValueView} from 'tinybase/ui-react-dom';
import {redirect, usePersisters} from '../common';
import {useUiDelUsernameCallback, useUiUsername} from './UiStore';

const USER_STORE_ID = 'user';

const PROVIDER_VALUE = 'provider';
const PROVIDER_USERNAME_VALUE = 'providerUsername';
const NAME_VALUE = 'name';
const AVATAR_VALUE = 'avatar';

/**
 * The user's profile
 */
export const UserStore = () => {
  const userStore = useCreateStore(createStore);
  useProvideStore(USER_STORE_ID, userStore);
  usePersisters(userStore, USER_STORE_ID, USER_STORE_ID, useUiUsername());
  return null;
};

export const useUserProvider = () =>
  useValue(PROVIDER_VALUE, USER_STORE_ID) as string;

export const useUserProviderUsername = () =>
  useValue(PROVIDER_USERNAME_VALUE, USER_STORE_ID) as string;

export const useUserName = () => useValue(NAME_VALUE, USER_STORE_ID) as string;

export const useUserAvatar = () =>
  useValue(AVATAR_VALUE, USER_STORE_ID) as string;

export const useTestUserLoginCallback = (name: string) =>
  useCallback<MouseEventHandler<HTMLButtonElement>>(
    (event) => {
      event.currentTarget.disabled = true;
      const params = new URLSearchParams({
        name: name,
        uri: location.toString(),
      });
      redirect('/parties/auth/test?' + params.toString());
    },
    [name],
  );

export const useGitHubUserLoginCallback = () =>
  useCallback<MouseEventHandler<HTMLButtonElement>>((event) => {
    event.currentTarget.disabled = true;
    const state = Math.random().toString();
    sessionStorage.setItem('state', state);
    const params = new URLSearchParams(location.search);
    redirect(
      '/parties/auth/github?' +
        new URLSearchParams({
          step: '0',
          state,
          uri:
            location.origin +
            '/auth.html' +
            (params.size > 0 ? '?' + params.toString() : ''),
        }).toString(),
    );
  }, []);

export const useUserLogoutCallback = () => {
  const delUsername = useUiDelUsernameCallback();
  return useCallback(
    () => fetch('/parties/logout').then(delUsername).catch(delUsername),
    [delUsername],
  );
};

export const EditableUsernameView = () => (
  <EditableValueView
    className="name"
    store={USER_STORE_ID}
    valueId={NAME_VALUE}
    showType={false}
  />
);
