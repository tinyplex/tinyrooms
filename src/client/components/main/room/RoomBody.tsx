import {Provider} from 'tinybase/debug/ui-react';
import React from 'react';
import {Shapes} from '../../../_shapes/Shapes';
import {useRoomStore} from '../../../stores/rooms';

export const RoomBody = ({roomId}: {readonly roomId: string}) => {
  const roomStore = useRoomStore(roomId);

  return (
    <div id="roomBody">
      <Provider store={roomStore}>
        <Shapes />
      </Provider>
    </div>
  );
};
