// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface props {}

export function on_message(this: props, message_id: hash, _data: unknown): void {
    if (message_id === hash("spawn")) {
        go.animate(".", "position", go.PLAYBACK_LOOP_PINGPONG, vmath.vector3(0, 5, 0), go.EASING_INOUTSINE, 3);
    }
}
