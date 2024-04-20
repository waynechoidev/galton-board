#include "common.wgsl"

@group(0) @binding(0) var<uniform> constant: Constant;

@fragment fn fs(input: OurVertexShaderOutput) -> @location(0) vec4f {

    let dist:f32 = length(input.texCoord - vec2f(0.5, 0.5));

    var color:vec3f = constant.objectColor;
    if(input.isObstacle == 1.0) {
        color = constant.obstacleColor;
    }

    if(dist <= 0.5)
    {
        return vec4f(color, 1.0);
    } else 
    {
        return vec4f(0.0);
    }

}