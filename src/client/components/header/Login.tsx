import {GITHUB_LOGIN, TEST_LOGIN} from '../../../config';
import {
  useGitHubUserLoginCallback,
  useTestUserLoginCallback,
} from '../../stores/UserStore';
import React from 'react';
import {useModal} from '../common/Modal';
import {useUiOnline} from '../../stores/UiStore';

export const Login = () => {
  const [Modal, showModal, hideModal] = useModal();

  const loginAsAlice = useTestUserLoginCallback('Alice');
  const loginAsBob = useTestUserLoginCallback('Bob');
  const loginAsCarol = useTestUserLoginCallback('Carol');
  const loginWithGitHub = useGitHubUserLoginCallback();

  return (
    <>
      <button className="login" disabled={!useUiOnline()} onClick={showModal}>
        Login
      </button>
      <Modal title="Login" onCancel={hideModal}>
        {TEST_LOGIN ? (
          <>
            <p>Login with one of these test accounts.</p>
            <div id="buttons">
              <button onClick={loginAsAlice} className="test alice">
                Alice
              </button>
              <button onClick={loginAsBob} className="test bob">
                Bob
              </button>
              <button onClick={loginAsCarol} className="test carol">
                Carol
              </button>
            </div>
          </>
        ) : null}
        {TEST_LOGIN && GITHUB_LOGIN ? <hr /> : null}
        {GITHUB_LOGIN ? (
          <>
            <p>Login with your GitHub account.</p>
            <button
              onClick={loginWithGitHub}
              className="github"
              title="This app uses GitHub to get your name and avatar."
            >
              GitHub
            </button>
          </>
        ) : null}
      </Modal>
    </>
  );
};
