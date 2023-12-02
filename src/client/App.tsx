import {CLOUD, LOCAL} from './stores/rooms';
import {UiStore, useUiUsername} from './stores/UiStore';
import {Header} from './components/header/Header';
import {Main} from './components/main/Main';
import {Provider} from 'tinybase/debug/ui-react';
import React from 'react';
import {RoomsStore} from './stores/RoomsStore';
import {StoreInspector} from 'tinybase/debug/ui-react-dom';
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
      <StoreInspector />
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
