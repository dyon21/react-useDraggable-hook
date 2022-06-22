import typescript from 'rollup-plugin-typescript2'
import dts from 'rollup-plugin-dts'

const config = [
  {
    input: 'src/lib/useDraggable.ts',
    output: [{ file: 'dist/index.js' }],
    plugins: [typescript()],
  },
  {
    input: 'src/lib/useDraggable.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
]
export default config
