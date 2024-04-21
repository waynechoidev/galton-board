#include "common.wgsl"

@group(0) @binding(0) var<storage, read_write> objects: array<Vertex>;
@group(0) @binding(1) var<storage, read_write> obstacles: array<Vertex>;
@group(0) @binding(2) var<uniform> constant: Constant;
@group(0) @binding(3) var<uniform> delta: f32;

@compute @workgroup_size(256)
fn computeSomething(
    @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
) {
    let index = global_invocation_id.x;

    let probability:f32 = 1.0;
    let speed:f32 = 0.0005;
    let restitutionCoefficient: f32 = 0.3;
    let collisionRadius = constant.objectRadius + constant.obstacleRadius;

    let object = objects[index];

    let obstacle = obstacles[0];

    let collisionDistance = distance(object.position, obstacle.position);

    var newVelocity = object.velocity;
    var newPosition = object.position + object.velocity * speed * delta;
    let distanceVector = newPosition - vec2f(obstacle.position.x, obstacle.position.y);
    let distanceVectorLength = length(distanceVector);

    if (collisionDistance < collisionRadius) {
        let normal = distanceVector / distanceVectorLength;
        let tangent = vec2f(probability * normal.y, normal.x);
        newPosition = vec2f(obstacle.position.x, obstacle.position.y) + normal * collisionRadius + tangent * speed * delta;
        newVelocity = tangent * length(newVelocity) * restitutionCoefficient;
    } else {
        newVelocity.y -= speed * delta;
    }
    
    objects[index] = Vertex(newPosition, newVelocity, object.texCoord, object.isObstacle);
}
