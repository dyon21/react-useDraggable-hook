# react-useDraggable-hook

![npm](https://img.shields.io/npm/v/use-draggable-hook?style=flat-square)
![license](https://img.shields.io/npm/l/use-draggable-hook?style=flat-square)

> 用于使 DOM 元素可跟随鼠标拖拽位移的 React Hooks.  
> A React Hooks for making DOM elements translate with dragging

## Usage

``` typescript
import useDraggable from 'use-draggable-hook'

function App() {
  const { target } = useDraggable<HTMLDivElement>()

  return (
    <div className="App">
      <div className="test-element" ref={target}>
        Draggable element
      </div>
    </div>
  )
}

export default App

```
## Interface
```typescript
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
    x: { max: number; min: number }
    y: { max: number; min: number }
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
  setPosition: (position: [number, number], transition: string) => void
}

```
