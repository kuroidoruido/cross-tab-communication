import { displayThemeConfigurator } from './theme-configurator';
import { displayThemePreview } from './theme-preview';

import './style.css';

displayThemeConfigurator();
displayThemePreview('theme-preview-1');
displayThemePreview('theme-preview-2');

const params = new URLSearchParams(document.location.search);
if (!params.has('inIframe')) {
    const iframe = document.createElement('iframe');
    iframe.src = document.location.href+'?inIframe=true';
    iframe.width = '600px';
    iframe.height = '600px';
    document.getElementById('iframe-container')
        .appendChild(iframe)
}