import {GITHUB_LOGIN, TEST_LOGIN} from '../config';
import {Party, Request, Server} from 'partykit/server';
import UserServer, {User} from './UserServer';
import {getTokenHeaders, newResponse, redirect} from './common';
import {getGitHubProvider} from './oauth/github';

/**
 * This PartyKit server is responsible for authenticating a user, either by
 * proxying OAuth requests, or assigning test users. It serves the /auth/github/
 * and /auth/test/ URLs.
 *
 * You could add extra OAuth providers or any other authentication technique
 * here - as long as you call UserServer.createUser at the end of the flow.
 */
export default class AuthServer implements Server {
  constructor(readonly party: Party) {}

  async onRequest(request: Request): Promise<Response> {
    const params = new URL(request.url).searchParams;
    const uri = params.get('uri') ?? '/';

    if (this.party.id == 'github' && GITHUB_LOGIN) {
      const [redirectToAuthorize, getUser] = getGitHubProvider(this.party.env);
      switch (params.get('step') ?? '0') {
        case '0': {
          return redirectToAuthorize(params.get('state') ?? '', uri);
        }
        case '1': {
          const code = params.get('code');
          if (code) {
            const user = await getUser(code);
            const username = encodeURIComponent(
              user.provider + '-' + user.providerUsername,
            );
            user.username = username;
            await UserServer.createUser(this.party.context, username, user);
            return redirect(uri, await getTokenHeaders(this.party, username));
          }
        }
      }
    }

    if (this.party.id == 'test' && TEST_LOGIN) {
      const name = params.get('name') ?? 'Alice';
      const provider = 'test';
      const providerUsername = name.toLowerCase();
      const username = provider + '-' + providerUsername;
      const user: User = {
        username,
        provider,
        providerUsername,
        name,
        avatar: '',
        accessToken: '',
      };
      await UserServer.createUser(this.party.context, username, user);
      return redirect(uri, await getTokenHeaders(this.party, username));
    }

    return newResponse(404);
  }
}
