import React from 'react';
import {Provider} from 'tinybase/ui-react';
import {Inspector} from 'tinybase/ui-react-inspector';
import {Header} from './components/header/Header';
import {Main} from './components/main/Main';
import {CLOUD, LOCAL} from './stores/rooms';
import {RoomsStore} from './stores/RoomsStore';
import {UiStore, useUiUsername} from './stores/UiStore';
import {UserStore} from './stores/UserStore';

export const App = () => {
  return (
    <Provider>
      {/* Stores */}
      <UiStore />
      <AnonymousStores />
      <AuthenticatedStores />

      {/* UI */}
      <Header />
      <Main />

      {/* Debug */}
      <Inspector />
    </Provider>
  );
};

const AnonymousStores = () => <RoomsStore roomType={LOCAL} />;

const AuthenticatedStores = () =>
  useUiUsername() ? (
    <>
      <UserStore />
      <RoomsStore roomType={CLOUD} />
    </>
  ) : null;
