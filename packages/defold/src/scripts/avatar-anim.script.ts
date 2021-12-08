// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface props {}

const SPRITES = ['#body', '#cheeks', '#eyes', '#glasses', '#hair', '#hands', '#mouth'];

const TRAITS = ['body', 'cheeks', 'eyes', 'glasses', 'hair', 'hands', 'mouth'];

export function on_message(this: props, message_id: hash, message: unknown): void {
  if (message_id === hash('spawn')) {
    const data = message as Record<string, string>;
    Object.keys(data).forEach((key) => {
      if (TRAITS.includes(key)) {
        msg.post(`#${key}`, 'play_animation', { id: hash(data[key]) });
      }
    });
    go.animate('.', 'position', go.PLAYBACK_LOOP_PINGPONG, vmath.vector3(0, 5, 0), go.EASING_INOUTSINE, 3);
  } else if (message_id === hash('flip')) {
    const { x } = message as { x: number };
    if (x < 0) SPRITES.forEach((s) => sprite.set_hflip(s, true));
    if (x > 0) SPRITES.forEach((s) => sprite.set_hflip(s, false));
  }
}
