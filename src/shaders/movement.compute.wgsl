#include "common.wgsl"

@group(0) @binding(0) var<storage, read_write> inputVertex: array<Vertex>;
@group(0) @binding(1) var<uniform> delta: f32;

@compute @workgroup_size(256)
fn computeSomething(
    @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
) {
    let index = global_invocation_id.x;
    let speedFactor:f32 = 0.1;

    let input = inputVertex[index];
    let velocity = vec2f(0.0, -1.0) * input.speed;
    
    inputVertex[index] = Vertex(input.position + velocity * speedFactor * delta, input.texCoord, input.color, input.speed);
}
