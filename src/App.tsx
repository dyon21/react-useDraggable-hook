import './App.css'
import useDraggable from './useDraggable'

function App() {
  const { target, position } = useDraggable<HTMLDivElement>()
  return (
    <div className="App">
      <div className="test-element" ref={target}>
        Draggable element
      </div>
      <div
        className="test-element2"
        style={{ transform: `translate(${-position[0]}px, ${-position[1]}px)` }}
      >
        Reflected element
      </div>
    </div>
  )
}

export default App
