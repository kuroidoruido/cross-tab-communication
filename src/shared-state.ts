export type State<T> = Readonly<T>;
export type SharedStateListener<T> = (event: { data: State<T> }) => void;

export class SharedState<T extends State<T>> {
  private state: T | undefined;
  private listeners: any[] = [];

  constructor(private stateName: string, private defaultState?: T) {
    if (defaultState) {
      this.state = defaultState;
    }
    this.initWithStorageState();
    this.listenStateChange();
  }

  private initWithStorageState() {
    const storageState = localStorage.getItem(this.stateName);
    if (storageState) {
      try {
        this.state = JSON.parse(storageState);
      } catch {
        this.setState(this.defaultState);
      }
    } else {
      this.setState(this.defaultState);
    }
  }

  private onStorageEvent(event: StorageEvent | SameTabStorageEvent) {
    if (event.key !== this.stateName) {
      return;
    }
    if (!event.newValue) {
      this.setInternalState(this.defaultState);
      return;
    }
    this.setInternalState(JSON.parse(event.newValue));
  }

  private listenStateChange() {
    window.addEventListener('storage', this.onStorageEvent.bind(this));
    window.addEventListener('same-tab-storage', this.onStorageEvent.bind(this));
    setInterval(() => {
      // only for storage edition from devtools
      const oldState = JSON.stringify(this.state);
      const newState = localStorage.getItem(this.stateName);
      if (oldState !== newState) {
        window.dispatchEvent(
          new SameTabStorageEvent(this.stateName, oldState, newState)
        );
      }
    }, 3_000);
  }

  getState(): T | undefined {
    return this.state;
  }

  setState(newState: T | undefined) {
    if (!newState) {
      return;
    }
    localStorage.setItem(this.stateName, JSON.stringify(newState));
    this.setInternalState(newState);
  }

  subscribe(listener: SharedStateListener<T>) {
    this.listeners.push(listener);
  }

  unsubscribe(listener: SharedStateListener<T>) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private setInternalState(newState: T | undefined) {
    const oldValue = JSON.stringify(this.state);
    const newValue = JSON.stringify(newState);
    if (oldValue !== newValue) {
      this.state = newState;
      this.listeners.forEach((listener) => listener({ data: newState }));
      window.dispatchEvent(
        new SameTabStorageEvent(this.stateName, oldValue, newValue)
      );
    }
  }
}

class SameTabStorageEvent extends Event {
  constructor(
    public readonly key: string,
    public readonly oldValue: string | null,
    public readonly newValue: string | null
  ) {
    super('same-tab-storage', { bubbles: true, composed: true });
  }
}

declare global {
  interface Window {
    addEventListener(
      eventType: 'same-tab-storage',
      listener: (event: SameTabStorageEvent) => void
    ): void;
    removeEventListener(
      eventType: 'same-tab-storage',
      listener: (event: SameTabStorageEvent) => void
    ): void;
  }
}
