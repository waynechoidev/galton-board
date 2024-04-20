(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))u(t);new MutationObserver(t=>{for(const n of t)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&u(i)}).observe(document,{childList:!0,subtree:!0});function r(t){const n={};return t.integrity&&(n.integrity=t.integrity),t.referrerPolicy&&(n.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?n.credentials="include":t.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function u(t){if(t.ep)return;t.ep=!0;const n=r(t);fetch(t.href,n)}})();var G=`struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) texCoord: vec2f,
};

struct Vertex {
  @location(0) position: vec2f,
  @location(1) velocity: vec2f,
  @location(2) texCoord: vec2f,
};

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
}`,w=`struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) texCoord: vec2f,
};

struct Vertex {
  @location(0) position: vec2f,
  @location(1) velocity: vec2f,
  @location(2) texCoord: vec2f,
};

@group(0) @binding(0) var<storage, read_write> inputVertex: array<Vertex>;
@group(0) @binding(1) var<uniform> delta: f32;

@compute @workgroup_size(256)
fn computeSomething(
    @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
) {
    let index = global_invocation_id.x;
    let speed:f32 = 0.0001;

    let input = inputVertex[index];

    inputVertex[index] = Vertex(input.position + input.velocity * speed * delta, input.velocity, input.texCoord);
}`,R=`struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) texCoord: vec2f,
};

struct Vertex {
  @location(0) position: vec2f,
  @location(1) velocity: vec2f,
  @location(2) texCoord: vec2f,
};

@vertex fn vs(
  input:Vertex
) -> OurVertexShaderOutput { 
  var vsOutput: OurVertexShaderOutput;
  vsOutput.position = vec4f(input.position, 0.0, 1.0);
  vsOutput.texCoord = input.texCoord;
  return vsOutput;
}`,T=`struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) texCoord: vec2f,
};

struct Vertex {
  @location(0) position: vec2f,
  @location(1) velocity: vec2f,
  @location(2) texCoord: vec2f,
};

@fragment fn fs(input: OurVertexShaderOutput) -> @location(0) vec4f {

    let dist:f32 = length(input.texCoord - vec2f(0.5, 0.5));

    if(dist <= 0.5)
    {
        return vec4f(1.0, 0.0, 0.0, 1.0);
    } else 
    {
        return vec4f(0.0);
    }

}`;const d=document.documentElement.clientHeight,b=Math.min(document.documentElement.clientWidth,d/2),E=1,F=async()=>{var O;const s=await((O=navigator.gpu)==null?void 0:O.requestAdapter()),e=await(s==null?void 0:s.requestDevice());if(!e){alert("need a browser that supports WebGPU");return}const r=document.querySelector("canvas");r.style.width=`${b}px`,r.style.height=`${d}px`,r.width=b,r.height=d;const u=navigator.gpu.getPreferredCanvasFormat(),t=r.getContext("webgpu");t.configure({device:e,format:u});const n=[];for(let o=0;o<E;++o)n.push({position:[0,1],velocity:[0,-1],texCoord:[0,0]});const i=[];for(let o=0;o<n.length;++o){const{position:m,velocity:a,texCoord:c}=n[o];i.push(...m,...a,...c)}const p=new Float32Array(i),v=e.createBuffer({label:"point vertex buffer",size:p.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(v,0,p);const g=e.createBuffer({label:"billboard vertex buffer",size:p.byteLength*6,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),x=e.createBuffer({label:"screen uniform buffer",size:2*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(x,0,new Float32Array([b,d]));const h=e.createBuffer({label:"time uniform buffer",size:2*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),y=e.createComputePipeline({label:"compute movement pipeline",layout:"auto",compute:{module:e.createShaderModule({label:"billboard compute shader",code:w})}}),P=e.createComputePipeline({label:"compute billboard pipeline",layout:"auto",compute:{module:e.createShaderModule({label:"billboard compute shader",code:G})}}),V=e.createRenderPipeline({label:"main pipeline",layout:"auto",vertex:{module:e.createShaderModule({label:"main vertex shader",code:R}),buffers:[{arrayStride:6*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,offset:0,format:"float32x2"},{shaderLocation:1,offset:2*Float32Array.BYTES_PER_ELEMENT,format:"float32x2"},{shaderLocation:2,offset:4*Float32Array.BYTES_PER_ELEMENT,format:"float32x2"}]}]},fragment:{module:e.createShaderModule({label:"main fragment shader",code:T}),targets:[{format:u,blend:{color:{srcFactor:"one",dstFactor:"one",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one",operation:"add"}}}]},primitive:{topology:"triangle-list"}}),C=e.createBindGroup({label:"compute movement bind group",layout:y.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:v}},{binding:1,resource:{buffer:h}}]}),S=e.createBindGroup({label:"compute billboard bind group",layout:P.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:v}},{binding:1,resource:{buffer:g}},{binding:2,resource:{buffer:x}}]});let _=0;function B(){const o=performance.now(),m=o-_;_=o,e.queue.writeBuffer(h,0,new Float32Array([m]));const a=e.createCommandEncoder({label:"encoder"}),c=a.beginComputePass({label:"compute movement pass"});c.setPipeline(y),c.setBindGroup(0,C),c.dispatchWorkgroups(1,1),c.end();const l=a.beginComputePass({label:"compute billboard pass"});l.setPipeline(P),l.setBindGroup(0,S),l.dispatchWorkgroups(1,1),l.end();const f=a.beginRenderPass({label:"main pass",colorAttachments:[{view:t.getCurrentTexture().createView(),clearValue:[0,0,0,1],loadOp:"clear",storeOp:"store"}]});f.setPipeline(V),f.setVertexBuffer(0,g),f.draw(E*6),f.end();const U=a.finish();e.queue.submit([U]),requestAnimationFrame(B)}B()};F();
