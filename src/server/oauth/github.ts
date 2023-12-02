import {User} from '../UserServer';
import {redirect} from '../common';

type Env = {[key: string]: any};

const PROVIDER = 'github';
const HEADERS = {
  'user-agent': 'PartyKit',
  accept: 'application/vnd.github+json',
};

export const getGitHubProvider = (
  env: Env,
): [
  redirectToAuthorize: (state: string, uri: string) => Response,
  getUser: (code: string) => Promise<User>,
] => {
  const redirectToAuthorize = (state: string, uri: string) =>
    redirect(
      'https://github.com/login/oauth/authorize?' +
        new URLSearchParams({
          scope: 'gist',
          type: 'user_agent',
          client_id: env.githubClientId,
          state,
          redirect_uri: uri,
        }).toString(),
    );

  const getUser = async (code: string): Promise<User> => {
    const {access_token: accessToken} = (await (
      await fetch(
        'https://github.com/login/oauth/access_token/?' +
          new URLSearchParams({
            client_id: env.githubClientId,
            client_secret: env.githubClientSecret,
            code,
          }).toString(),
        {method: 'POST', headers: HEADERS},
      )
    ).json()) as any;
    const {
      login: providerUsername,
      name,
      avatar_url: avatar,
    } = (await (
      await fetch('https://api.github.com/user', {
        headers: {
          ...HEADERS,
          authorization: `Bearer ${accessToken}`,
        },
      })
    ).json()) as any;

    return {
      username: '',
      provider: PROVIDER,
      providerUsername,
      name,
      avatar,
      accessToken,
    };
  };

  return [redirectToAuthorize, getUser];
};
