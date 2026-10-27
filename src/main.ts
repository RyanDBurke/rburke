import { ViteSSG } from 'vite-ssg/single-page'
import App from './App.vue'
import '@fontsource-variable/playfair-display'
import './style.css'

export const createApp = ViteSSG(App)
