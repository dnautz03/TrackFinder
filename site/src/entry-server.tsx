import { renderToString } from 'react-dom/server'
import App from './App'
import DownloadPage from './DownloadPage'
import TryPage from './TryPage'

/** Used at build time to prerender each page into its HTML file. */
export function render(page = 'home') {
  return renderToString(page === 'download' ? <DownloadPage /> : page === 'try' ? <TryPage /> : <App />)
}
