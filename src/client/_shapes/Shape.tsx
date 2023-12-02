import {DRAGGED, SHAPES, useDraggable} from './common';
import React, {RefObject, useCallback} from 'react';
import {
  RowProps,
  useRow,
  useSetPartialRowCallback,
  useSetValueCallback,
} from 'tinybase/debug/ui-react';

export const Shape = ({rowId}: RowProps) => {
  const {x, y, w, h, color} = useRow(SHAPES, rowId);

  const style = {
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
    background: color + '',
  };

  const ref = useDraggable(
    useCallback(() => [x, y] as [number, number], [x, y]),
    useSetPartialRowCallback(
      SHAPES,
      rowId,
      ({
        dx,
        dy,
        initial: [x, y],
      }: {
        dx: number;
        dy: number;
        initial: [number, number];
      }) => ({x: x + dx, y: y + dy}),
    ),
    useSetValueCallback(DRAGGED, () => true),
  ) as RefObject<HTMLDivElement>;

  return <div ref={ref} className="shape" style={style} />;
};
