import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { clamp, getNearestScale } from './utils'

export interface IOptions {
  /** use Event.preventDefault with the touchmove events */
  prevent?: boolean
  /** listen touch events */
  touch?: boolean
  /** listen mouse events */
  mouse?: boolean
  /** dragging direction */
  direction?: 'vertical' | 'horizontal' | 'both'
  /** set css transform */
  setCSS?: boolean
  /** max dragging distance */
  maxDistance?: {
    x?: { max?: number; min?: number }
    y?: { max?: number; min?: number }
  }
  /** position step size */
  stepSize?: number | {
    x: number
    y: number
  }
  /** start callback */
  onStart?: (
    target: React.RefObject<HTMLElement>,
    position: [number, number],
    setPosition: (position: [number, number], transition?: string) => void
  ) => void
  /** move callback */
  onMove?: (
    target: React.RefObject<HTMLElement>,
    position: [number, number],
    setPosition: (position: [number, number], transition?: string) => void
  ) => void
  /** end callback */
  onEnd?: (
    target: React.RefObject<HTMLElement>,
    position: [number, number],
    setPosition: (position: [number, number], transition?: string) => void
  ) => void
}
export type TUseDraggable = <T extends HTMLElement>(
  options?: IOptions
) => {
  /** target element ref  */
  target: React.RefObject<T>
  /** position state [x, y] */
  position: [number, number]
  /** function to set a new position value. */
  setPosition: (position: [number, number], transition?: string) => void
}
const defaultOptions = {
  prevent: true,
  touch: true,
  mouse: true,
  direction: 'both',
  maxDistance: {
    x: { max: Infinity, min: -Infinity },
    y: { max: Infinity, min: -Infinity },
  },
  stepSize: 0,
  setCSS: true,
  onStart: function () {},
  onMove: function () {},
  onEnd: function () {},
}
const useDraggable: TUseDraggable = <T extends HTMLElement>(
  options?: IOptions
) => {
  const opts = useMemo(() => {
    return {
      ...defaultOptions,
      ...options,
    }
  }, [options])

  const target = useRef<T>(null)
  const startXY = useRef<[number, number]>([0, 0])
  const prevPosition = useRef<[number, number]>([0, 0])
  const dragging = useRef<boolean>(false)
  const [position, setPosition] = useState<[number, number]>([0, 0])

  const setTransform = useCallback(
    (position: [number, number], transition?: string) => {
      if (opts.stepSize) {
        position = [
          getNearestScale(position[0], typeof opts.stepSize === 'object' ? opts.stepSize.x : opts.stepSize),
          getNearestScale(position[1], typeof opts.stepSize === 'object' ? opts.stepSize.y : opts.stepSize),
        ]
      }
      prevPosition.current = position
      setPosition(position)
      if (target.current && opts.setCSS) {
        if (transition) {
          target.current.style.transition = transition
        } else {
          target.current.style.transition = ''
        }
        target.current.style.transform = `translate3d(${position[0]}px, ${position[1]}px, 0)`
      }
    },
    [opts.setCSS, opts.stepSize]
  )
  const handleStart = useCallback(
    (e: TouchEvent | MouseEvent) => {
      const [prevX, prevY] = prevPosition.current
      let [x, y] = prevPosition.current
      if (e instanceof window.TouchEvent && opts.touch) {
        dragging.current = true
        x = e.touches[0].clientX - prevX
        y = e.touches[0].clientY - prevY
      } else if (
        e instanceof window.MouseEvent &&
        e.button === 0 &&
        opts.mouse
      ) {
        dragging.current = true
        x = e.clientX - prevX
        y = e.clientY - prevY
      } else return
      startXY.current = [x, y]
      opts.onStart(target, [x, y], setTransform)
    },
    [opts, setTransform]
  )
  const handleMove = useCallback(
    (e: TouchEvent | MouseEvent) => {
      if (!dragging.current) return
      if (opts.prevent) {
        e.preventDefault()
      }
      const [startX, startY] = startXY.current
      let [x, y] = prevPosition.current
      if (e instanceof window.TouchEvent && opts.touch) {
        x = e.touches[0].clientX - startX
        y = e.touches[0].clientY - startY
      } else if (
        e instanceof window.MouseEvent &&
        e.button === 0 &&
        opts.mouse
      ) {
        x = e.clientX - startX
        y = e.clientY - startY
      } else return

      if (opts.stepSize) {
        x = getNearestScale(x, typeof opts.stepSize === 'object' ? opts.stepSize.x : opts.stepSize)
        y = getNearestScale(y, typeof opts.stepSize === 'object' ? opts.stepSize.y : opts.stepSize)
      }

      x =
        opts.direction === 'vertical'
          ? 0
          : clamp(x, [
              opts.maxDistance?.x?.min ?? -Infinity,
              opts.maxDistance?.x?.max ?? Infinity,
            ])
      y =
        opts.direction === 'horizontal'
          ? 0
          : clamp(y, [
              opts.maxDistance?.y?.min ?? -Infinity,
              opts.maxDistance?.y?.max ?? Infinity,
            ])
      opts.onMove(target, [x, y], setTransform)
      setTransform([x, y])
    },
    [dragging, opts, setTransform]
  )
  const handleEnd = useCallback(
    (e: TouchEvent | MouseEvent) => {
      if (
        (e instanceof window.TouchEvent && opts.touch) ||
        (e instanceof window.MouseEvent && e.button === 0 && opts.mouse)
      ) {
        dragging.current = false
        opts.onEnd(target, prevPosition.current, setTransform)
      }
    },
    [opts, setTransform]
  )

  useEffect(() => {
    const node = target.current
    if (node) {
      if (opts.touch) {
        node.addEventListener('touchstart', handleStart)
        node.addEventListener('touchmove', handleMove, {
          passive: !opts.prevent,
        })
        document.addEventListener('touchcancel', handleEnd)
        document.addEventListener('touchend', handleEnd)
      }
      if (opts.mouse) {
        node.addEventListener('mousedown', handleStart)
        document.addEventListener('mousemove', handleMove)
        document.addEventListener('mouseup', handleEnd)
      }
    }
    return () => {
      if (node) {
        if (opts.touch) {
          node.removeEventListener('touchstart', handleStart)
          node.removeEventListener('touchmove', handleMove)
          document.removeEventListener('touchcancel', handleEnd)
        }
        if (opts.mouse) {
          node.removeEventListener('mousedown', handleStart)
          document.removeEventListener('mousemove', handleMove)
          document.removeEventListener('mouseup', handleEnd)
        }
      }
    }
  }, [target, opts, handleStart, handleMove, handleEnd])

  return { target, position, setPosition: setTransform }
}

export default useDraggable
