// @noresolution
import * as JSON from 'lib.rxi-json';

// Debugging support
import * as lldebugger from 'lldebugger.debug';
lldebugger.start();

interface props {
  players: Array<Record<string, hash>>;
  html5: boolean;
}

export function init(this: props): void {
  this.players = [];
  this.html5 = html5 !== undefined && html5.run('window.DefoldApp') !== '';

  //* Testing spawn
  /*
  spawn.call(this, {
    local: true,
    address: '',
    traits: {
      body: 'body_base_blue',
      cheeks: 'cheeks_red',
      eyes: 'eyes_black_left_wink',
      glasses: 'glasses_hipster_blue',
      hair: 'hair_chef_hat',
      hands: 'hands_none',
      mouth: 'mouth_frown',
    },
  });
  */
}

export function update(this: props): void {
  if (this.html5) {
    let message:
      | {
          command: string;
          payload: {
            local: boolean;
            address: string;
            traits: Record<string, string>;
          };
        }
      | undefined;
    const raw = html5.run('window.DefoldApp.out()');
    if (raw !== '') message = JSON.decode(raw) as typeof message;
    if (message && message.command === 'spawn') {
      spawn.call(this, message.payload);
    }

    // TODO: Dispatch messages
    pprint(message);

    html5.run('window.DefoldApp.tick()');
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function send(this: props, command: string, payload: Record<string, unknown>) {
  if (this.html5) {
    const serialized = { command, payload };
    html5.run('window.DefoldApp.in(' + JSON.encode(serialized) + ')');
  }
}

function spawn(this: props, payload: { local: boolean; address: string; traits: Record<string, string> }) {
  const pos = go.get_position('/spawner');
  const player = collectionfactory.create('/spawner#avatarfactory', pos, vmath.quat(), null, 0.5) as Record<
    string,
    hash
  >;
  msg.post(player[hash('/body') as string], 'spawn', payload.traits);
  msg.post(player[hash('/avatar') as string], 'spawn', {
    follow: payload.local ? player['/avatar'] : undefined,
    body: player['/body'],
  });
  this.players.push(player);
}
