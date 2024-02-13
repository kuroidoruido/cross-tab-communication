export type State<T> = Readonly<T>;
export type SharedStateListener<T> = (event: { data: State<T> }) => void;

export class SharedState<T extends State<T>> {
  private state: T | undefined;
  private channel: BroadcastChannel;
  private listenersChannel: BroadcastChannel;

  constructor(private stateName: string, private defaultState?: T) {
    this.channel = new BroadcastChannel(this.stateName);
    this.listenersChannel = new BroadcastChannel(this.stateName + '_listeners');
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

  private listenStateChange() {
    this.channel.addEventListener('message', ({ data }) => {
      this.setState(JSON.parse(data.newValue));
    });
    setInterval(() => {
      this.initWithStorageState();
    }, 1_000);
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
      this.listenersChannel.postMessage(state);
      this.channel.postMessage(
        new SharedStateChangeEvent(this.stateName, oldState, newState)
      );
    }
  }

  subscribe(listener: SharedStateListener<T>) {
    this.listenersChannel.addEventListener('message', listener);
  }

  unsubscribe(listener: SharedStateListener<T>) {
    this.listenersChannel.removeEventListener('message', listener);
  }
}

class SharedStateChangeEvent {
  public static readonly TYPE = 'shared-state-change';
  public readonly type = SharedStateChangeEvent.TYPE;

  constructor(
    public readonly key: string,
    public readonly oldValue: string,
    public readonly newValue: string
  ) {}
}
