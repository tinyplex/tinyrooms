import React, {useRef} from 'react';
import {nanoid} from 'nanoid';
import {
  TableView,
  useHasTable,
  useSetRowCallback,
  useValue,
} from 'tinybase/ui-react';
import {DRAGGED, SHAPES} from './common';
import {Shape} from './Shape';

const random = (from: number, to: number) =>
  from + Math.floor(Math.random() * (to - from));

export const Shapes = () => {
  const ref = useRef<HTMLDivElement>(null);

  const handleAddShape = useSetRowCallback(
    SHAPES,
    () => nanoid(4),
    () => {
      const w = random(50, 200);
      const h = random(50, 200);
      const container = ref.current!;
      return {
        x: random(0, container.clientWidth - w - 2),
        y: random(70, container.clientHeight - h - 2),
        w,
        h,
        color: `rgb(${random(0, 255)},${random(0, 255)},${random(0, 255)},0.7)`,
      };
    },
    [ref.current],
  );

  const hasShapes = useHasTable(SHAPES);
  const hasDragged = useValue(DRAGGED);

  return (
    <div id="shapes" ref={ref}>
      <TableView tableId={SHAPES} rowComponent={Shape} />
      <header>
        <button onClick={handleAddShape}>Add shape</button>
        {hasShapes ? (
          hasDragged ? null : (
            <p>You can drag to move shapes around</p>
          )
        ) : (
          <p>Please add some shapes to the room</p>
        )}
      </header>
    </div>
  );
};
