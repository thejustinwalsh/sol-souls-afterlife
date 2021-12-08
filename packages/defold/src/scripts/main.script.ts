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

  const pos = go.get_position('/spawner');
  const player = collectionfactory.create('/spawner#avatarfactory', pos, vmath.quat(), null, 0.5) as Record<
    string,
    hash
  >;
  pprint(player);
  msg.post(player[hash('/body') as string], 'spawn', {
    body: 'body_green',
    cheeks: 'cheeks_pink',
    eyes: 'eyes_happy',
    glasses: 'glasses_monacle',
    hair: 'hair_cat_ears_synth',
    hands: 'hands_wand',
    mouth: 'mouth_shy_guy',
  });
  msg.post(player[hash('/avatar') as string], 'spawn', { follow: player['/avatar'], body: player['/body'] });

  this.players.push(player);
}

export function update(this: props): void {
  if (this.html5) {
    let message = {};
    const raw = html5.run('window.DefoldApp.out()');
    if (raw !== '') message = JSON.decode(raw) as Record<string, unknown>;

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
