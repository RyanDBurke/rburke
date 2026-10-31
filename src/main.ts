import { ViteSSG } from 'vite-ssg/single-page'
import App from './App.vue'
import '@fontsource-variable/playfair-display'
import '@fontsource/press-start-2p'
import './style.css'

export const createApp = ViteSSG(App)
