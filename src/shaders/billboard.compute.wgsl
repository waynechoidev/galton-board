#include "common.wgsl"

@group(0) @binding(0) var<storage, read_write> inputVertex: array<Vertex>;
@group(0) @binding(1) var<storage, read_write> outputVertex: array<Vertex>;
@group(0) @binding(2) var<uniform> size: vec2f;

@compute @workgroup_size(256)
fn computeSomething(
    @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
) {
    let screenRatio = size.x/size.y;
    
    let scale:f32 = 0.02;

    let startIndex = i32(global_invocation_id.x);

    var pos = array<vec2f, 6>(
        vec2(-1.0, 1.0 * screenRatio),
        vec2(1.0, 1.0 * screenRatio),
        vec2(-1.0, -1.0 * screenRatio),
        vec2(-1.0, -1.0 * screenRatio),
        vec2(1.0, 1.0 * screenRatio),
        vec2(1.0, -1.0 * screenRatio),
    );

    var tex = array<vec2f, 6>(
        vec2(0.0, 0.0),
        vec2(1.0, 0.0),
        vec2(0.0, 1.0),
        vec2(0.0, 1.0),
        vec2(1.0, 0.0),
        vec2(1.0, 1.0),
    );

    let input = inputVertex[startIndex];

    for (var i = 0; i < 6; i++) {
        outputVertex[startIndex * 6 + i] = Vertex(input.position + pos[i] * scale, input.velocity, tex[i]);
    }
}
