#include "common.wgsl"

@fragment fn fs(input: OurVertexShaderOutput) -> @location(0) vec4f {

    let dist:f32 = length(input.texCoord - vec2f(0.5, 0.5));

    if(dist <= 0.5)
    {
        return vec4f(1.0, 0.0, 0.0, 1.0);
    } else 
    {
        return vec4f(0.0);
    }

}