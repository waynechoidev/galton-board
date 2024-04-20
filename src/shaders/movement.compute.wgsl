#include "common.wgsl"

@group(0) @binding(0) var<storage, read_write> inputVertex: array<Vertex>;
@group(0) @binding(1) var<storage, read_write> obstacles: array<Vertex>;
@group(0) @binding(2) var<uniform> delta: f32;

@compute @workgroup_size(256)
fn computeSomething(
    @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
) {
    let index = global_invocation_id.x;
    let speed:f32 = 0.0001;

    let input = inputVertex[index];
    let obstacle = obstacles[0];
    var a = 1.0;
    if(input.position.y < obstacle.position.y) {a=0.0;}

    inputVertex[index] = Vertex(input.position + input.velocity * speed * delta * a, input.velocity, input.texCoord, input.isObstacle);
}
