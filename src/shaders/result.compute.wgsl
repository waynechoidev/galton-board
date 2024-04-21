#include "common.wgsl"

@group(0) @binding(0) var<storage, read_write> objects: array<Vertex>;
@group(0) @binding(1) var<uniform> constant: Constant;
@group(0) @binding(2) var<storage, read> resultCriteria: array<f32>;
@group(0) @binding(3) var<storage, read_write> resultBuffer: array<f32>;

@compute @workgroup_size(256)
fn computeSomething(
    @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
) {
    let index = global_invocation_id.x;
    let object = objects[index];
    let x = object.position.x;

    if(object.position.y < -1.0){
        if(x < resultCriteria[0])
        {
            resultBuffer[0] = resultBuffer[0] + 1;
        }
        for(var i = 1; i < i32(constant.layersOfObstacle); i++)
        {   
            if(x > resultCriteria[i-1] && x < resultCriteria[i])
            {
                resultBuffer[i] = resultBuffer[i] + 1;
            }
        }
        if(x > resultCriteria[i32(constant.layersOfObstacle) + 1])
        {
            resultBuffer[i32(constant.layersOfObstacle) + 1] = resultBuffer[i32(constant.layersOfObstacle) + 1] + 1;
        }
        let newPosition = vec2f(0, 1);
        let newVelocity = vec2f(0, -1);
        objects[index] = Vertex(newPosition, newVelocity, object.texCoord, object.isObstacle);
    }
}
