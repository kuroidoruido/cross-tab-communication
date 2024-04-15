export type State<T> = Readonly<T>;
export type SharedStateListener<T> = (event: { data: State<T> }) => void;

export class SharedState<T extends State<T>> {
  private state: T | undefined;
  private channel: BroadcastChannel;

  constructor(private stateName: string, private defaultState?: T) {
    this.channel = new BroadcastChannel(this.stateName);
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
        this.setState(JSON.parse(storageState));
      } catch {
        this.setState(this.defaultState);
      }
    } else {
      this.setState(this.defaultState);
    }
  }

  private listenStateChange() {
    this.channel.addEventListener('message', ({ data }) => {
      this.setState(data);
    });
    // only for storage edition from devtools
    setInterval(this.initWithStorageState.bind(this), 3_000);
  }

  getState(): T | undefined {
    return this.state;
  }

  setState(state: T | undefined) {
    const oldState = JSON.stringify(this.state);
    const newState = JSON.stringify(state);
    if (oldState !== newState) {
      this.state = state;
      localStorage.setItem(this.stateName, newState);
      this.channel.postMessage(state);
    }
  }

  subscribe(listener: SharedStateListener<T>) {
    this.channel.addEventListener('message', listener);
  }

  unsubscribe(listener: SharedStateListener<T>) {
    this.channel.removeEventListener('message', listener);
  }
}
