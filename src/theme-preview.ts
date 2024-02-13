import { Theme } from './model';
import { SharedState } from './shared-state-2';

export function displayThemePreview(baseElementId: string) {
  const baseElement = document.getElementById(baseElementId)!;
  const themeState = new SharedState<Theme>('THEME');
  let initialTheme = themeState.getState();
  if (initialTheme) {
    setCssTheme(baseElement, initialTheme);
  }
  themeState.subscribe(({ data }) => {
    setCssTheme(baseElement, data);
  });
}

function setCssTheme(element: HTMLElement, theme: Theme | undefined) {
  element.style.setProperty('--theme--color--border', theme?.border ?? '');
  element.style.setProperty(
    '--theme--color--background',
    theme?.background ?? ''
  );
  element.style.setProperty(
    '--theme--color--foreground',
    theme?.foreground ?? ''
  );
  element.style.setProperty('--theme--color--text', theme?.text ?? '');
}
