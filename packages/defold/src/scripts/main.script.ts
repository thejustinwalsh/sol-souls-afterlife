// @noresolution
import * as JSON from 'lib.rxi-json';

import * as defold from 'nakama.engine.defold';
import * as nakama from 'nakama.nakama';
import * as nakama_log from 'nakama.util.log';

// Debugging support
import * as lldebugger from 'lldebugger.debug';
lldebugger.start();

// Debugging nakama
nakama_log.print();

interface props {
  players: Array<Record<string, hash>>;
  html5: boolean;
  session?: nakama.Session;
}

export function init(this: props): void {
  this.players = [];
  this.html5 = html5 !== undefined && html5.run('window.DefoldApp') !== '';

  // Create a test player when running stand-alone
  if (html5 === undefined) {
    connect.call(this, {
      id: 'super-secret-id-of-testing',
      name: 'Test123',
      token: 'a7fhbjui27bfjnswwrcvjkd',
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
  }
}

export function update(this: props): void {
  if (this.html5) {
    let message:
      | {
          command: string;
          payload: {
            id: string;
            name: string;
            token: string;
            traits: Record<string, string>;
          };
        }
      | undefined;
    const raw = html5.run('window.DefoldApp.out()');
    if (raw !== '') message = JSON.decode(raw) as typeof message;
    if (message && message.command === 'connect') {
      connect.call(this, message.payload);
    }

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

function connect(
  this: props,
  { id, name, token, traits }: { id: string; name: string; token: string; traits: Record<string, string> }
): void {
  const config = {
    host: 'nakama.tjw.dev',
    port: 7350,
    use_ssl: true,
    username: 'wg!@5kpvUY3vjuM&UbMNQB^H3j5XXeZ5',
    password: '',
    engine: defold,
  };

  const client = nakama.create_client(config);
  const body = nakama.create_api_account_custom(id, {
    ...traits,
    display_name: name,
    avatar_url: '',
  });

  nakama.sync(() => {
    const session = nakama.authenticate_custom(client, body, true, token);
    print('TOKEN = ', session.token);
    if (session.token !== null) {
      this.session = session;
      nakama.set_bearer_token(client, session.token);

      // Spawn player into world
      spawn.call(this, { local: true, traits });
    }
  });
}

function spawn(this: props, payload: { local: boolean; traits: Record<string, string> }) {
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
