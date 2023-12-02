import {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react';

export const SHAPES = 'shapes';
export const DRAGGED = 'dragged';

export const useDraggable = <Initial>(
  getInitial: () => Initial,
  onDrag: (event: {dx: number; dy: number; initial: Initial}) => void,
  onDragStop: () => void,
) => {
  const [start, setStart] = useState<{
    x: number;
    y: number;
    initial: Initial;
  } | null>();

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      setStart({
        x: event.clientX,
        y: event.clientY,
        initial: getInitial(),
      });
      event.stopPropagation();
    },
    [getInitial],
  );
  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (start != null) {
        onDrag({
          dx: event.clientX - start.x,
          dy: event.clientY - start.y,
          initial: start.initial,
        });
      }
      event.stopPropagation();
    },
    [onDrag, start],
  );
  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      setStart(null);
      onDragStop();
      event.stopPropagation();
    },
    [onDragStop],
  );

  const ref = useRef<Element>(null);
  useLayoutEffect(() => {
    const {current} = ref;
    current?.addEventListener('mousedown', handleMouseDown as any);
    return () =>
      current?.removeEventListener('mousedown', handleMouseDown as any);
  }, [ref, handleMouseDown]);
  useEffect(() => {
    if (start != null) {
      addEventListener('mousemove', handleMouseMove);
      addEventListener('mouseup', handleMouseUp);
      return () => {
        removeEventListener('mousemove', handleMouseMove);
        removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [start, handleMouseMove, handleMouseUp]);

  return ref;
};
