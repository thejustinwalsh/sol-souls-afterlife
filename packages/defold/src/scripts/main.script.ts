// Debugging support
import * as lldebugger from "lldebugger.debug";
lldebugger.start();

interface props {
  players: Array<Record<string, hash>>;
}

export function init(this: props) {
  this.players = [];

  const pos = go.get_position("/spawner");
  const player = collectionfactory.create("/spawner#avatarfactory", pos, vmath.quat(), null, 0.5) as Record<string, hash>;
  pprint(player);
  msg.post(player[hash("/body") as string], "spawn");
  msg.post(player[hash("/avatar") as string], "follow", { target: player["/avatar"]});
  this.players.push(player);
}