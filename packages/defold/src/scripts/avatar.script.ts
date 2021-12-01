import * as camera from "orthographic.camera";

interface props {
    correction: vmath.vector3,
    target?: vmath.vector3,
    speed: number,
    id?: hash,
    following: boolean,

}

type message = {
    normal: vmath.vector3;
    distance: number;
    group: hash;
    other_group: hash;
    other_id: hash;
    enter?: boolean;
    target?: hash;
  };

go.property("speed", 120);

export function init(this: props): void {
    msg.post(".", "acquire_input_focus");
    
    this.correction = vmath.vector3(0, 0, 0);
    this.target = undefined;

    this.following = false;
}

export function update(this: props, dt: number): void {
    if (!this.following && this.id !== undefined) {
        print("camera.follow", this.id);
        camera.follow(null, this.id, { horizontal: true, immediate: true });
        this.following = true;
    }

    if (!this.target) return;
    
    const pos = go.get_position(".");
    const distance = this.target - pos as vmath.vector3;
    if (vmath.length_sqr(distance) >= 1) {
        const dir = vmath.normalize(this.target - pos as vmath.vector3);
        go.set_position(pos + dir * dt * this.speed as vmath.vector3);
    }
    else {
        this.target = undefined;
    }
}

export function on_input(this: props, action_id: hash, action: { x: number, y: number }): void {
    if (action_id === hash("touch")) {
        this.target = camera.screen_to_world(null, vmath.vector3(action.x, action.y, 0));
    }
}

export function on_message(this: props, message_id: hash, message: message): void {
    if (message_id === hash("contact_point_response") && message.group == hash("tile")) {
        if (message.distance > 0) {
            const proj = vmath.project(this.correction, (message.normal * message.distance) as vmath.vector3);
            if (proj < 1) {
                const comp = ((message.distance - message.distance * proj) * message.normal) as vmath.vector3;
                go.set_position((go.get_position() + comp) as vmath.vector3); 
                this.correction = (this.correction + comp) as vmath.vector3;
                this.target = undefined;
            }
        }
    }
    else if (message_id === hash("follow") && message.target) {
        this.id = message.target;
    } 
}
