import { renderToString } from 'react-dom/server'
import App from './App'

/** Used at build time to prerender the page into dist/index.html. */
export function render() {
  return renderToString(<App />)
}
