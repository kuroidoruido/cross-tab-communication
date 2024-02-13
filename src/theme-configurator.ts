import { Theme } from './model';
import { SharedState } from './shared-state-2';

export function displayThemeConfigurator() {
  const baseElement = document.querySelector('#theme-configurator')!;
  const themeState = new SharedState('THEME', {
    border: 'gray',
    background: 'white',
    foreground: 'transparent',
    text: 'black',
  } satisfies Theme);
  baseElement.innerHTML = `<textarea>${JSON.stringify(
    themeState.getState(),
    undefined,
    2
  )}</textarea>`;
  baseElement
    .querySelector('textarea')!
    .addEventListener('blur', ({ target }) => {
      themeState.setState(
        JSON.parse((target as { value: string } | null)?.value ?? '')
      );
    });
  themeState.subscribe(({ data }) => {
    const textarea = document.querySelector('#theme-configurator textarea')!;
    textarea.textContent = JSON.stringify(data, undefined, 2);
  })
}
