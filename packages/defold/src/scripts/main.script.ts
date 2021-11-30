// Module import example
import { Template } from "../modules/template";

// Debugging support
import * as lldebugger from "lldebugger.debug";
lldebugger.start();

interface props {
    excitement: number,
    doOnce: boolean,
    template: Template
}
go.property("excitement", 100);

export function init(this: props): void {
    msg.post("@render:", "use_fixed_projection", { near: -1, far: 1, zoom: 2 })
}

export function update(this: props, _dt: number): void {
    
}

export function on_message(this: props, message_id: hash, _message: string, _sender: url): void {
    
}
