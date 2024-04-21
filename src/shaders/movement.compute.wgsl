#include "common.wgsl"

@group(0) @binding(0) var<storage, read_write> objects: array<Vertex>;
@group(0) @binding(1) var<storage, read_write> obstacles: array<Vertex>;
@group(0) @binding(2) var<storage, read_write> probabilities: array<f32>;
@group(0) @binding(3) var<uniform> constant: Constant;
@group(0) @binding(4) var<uniform> delta: f32;

@compute @workgroup_size(256)
fn computeSomething(
    @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
) {
    let index = global_invocation_id.x;

    let speed:f32 = 0.0005;
    let restitutionCoefficient: f32 = 0.01;
    let collisionRadius = constant.objectRadius + constant.obstacleRadius;

    let object = objects[index];
    let probability:f32 = probabilities[index];

    var newVelocity = object.velocity;
    var newPosition = object.position + object.velocity * speed * delta;

    for (var i = 0; i < i32(constant.numOfObstacle); i++) {
        let obstacle = obstacles[i];
        let collisionDistance = distance(object.position, obstacle.position);

        if (collisionDistance < collisionRadius) {
            let normal = normalize(newPosition - vec2f(obstacle.position.x, obstacle.position.y));
            newPosition = vec2f(obstacle.position.x + probability * restitutionCoefficient, obstacle.position.y) + normal * collisionRadius;
            newVelocity = normalize(vec2f(probability, -1));
        } else {
            newVelocity = vec2f(0, -1);
        }
    }

    objects[index] = Vertex(newPosition, newVelocity, object.texCoord, object.isObstacle);
}
