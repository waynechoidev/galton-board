var Z=Object.defineProperty;var ee=(a,e,n)=>e in a?Z(a,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):a[e]=n;var y=(a,e,n)=>(ee(a,typeof e!="symbol"?e+"":e,n),n);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))l(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const u of i.addedNodes)u.tagName==="LINK"&&u.rel==="modulepreload"&&l(u)}).observe(document,{childList:!0,subtree:!0});function n(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function l(o){if(o.ep)return;o.ep=!0;const i=n(o);fetch(o.href,i)}})();var te=`struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) texCoord: vec2f,
  @location(2) isObstacle: f32,
};

struct Vertex {
  @location(0) position: vec2f,
  @location(1) velocity: vec2f,
  @location(2) texCoord: vec2f,
  @location(3) isObstacle: f32,
};

struct Constant {
  @location(0) objectColor: vec3f,
  @location(1) objectRadius: f32,
  @location(2) obstacleColor: vec3f,
  @location(3) obstacleRadius: f32,
  @location(4) bgColor: vec3f,
  @location(5) layersOfObstacle: f32,
  @location(6) numOfObstacle: f32,
}

@group(0) @binding(0) var<storage, read_write> inputVertex: array<Vertex>;
@group(0) @binding(1) var<storage, read_write> outputVertex: array<Vertex>;
@group(0) @binding(2) var<uniform> constant: Constant;

@compute @workgroup_size(256)
fn computeSomething(
    @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
) {
    let startIndex = i32(global_invocation_id.x);

    var pos = array<vec2f, 6>(
        vec2(-1.0, 1.0),
        vec2(1.0, 1.0),
        vec2(-1.0, -1.0),
        vec2(-1.0, -1.0),
        vec2(1.0, 1.0),
        vec2(1.0, -1.0),
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

    var size:f32 = constant.objectRadius;
    if(input.isObstacle == 1.0)
    {
        size = constant.obstacleRadius;
    }

    for (var i = 0; i < 6; i++) {
        outputVertex[startIndex * 6 + i] = Vertex(input.position + pos[i] * size, input.velocity, tex[i], input.isObstacle);
    }
}`,oe=`struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) texCoord: vec2f,
  @location(2) isObstacle: f32,
};

struct Vertex {
  @location(0) position: vec2f,
  @location(1) velocity: vec2f,
  @location(2) texCoord: vec2f,
  @location(3) isObstacle: f32,
};

struct Constant {
  @location(0) objectColor: vec3f,
  @location(1) objectRadius: f32,
  @location(2) obstacleColor: vec3f,
  @location(3) obstacleRadius: f32,
  @location(4) bgColor: vec3f,
  @location(5) layersOfObstacle: f32,
  @location(6) numOfObstacle: f32,
}

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
}`,ne=`struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) texCoord: vec2f,
  @location(2) isObstacle: f32,
};

struct Vertex {
  @location(0) position: vec2f,
  @location(1) velocity: vec2f,
  @location(2) texCoord: vec2f,
  @location(3) isObstacle: f32,
};

struct Constant {
  @location(0) objectColor: vec3f,
  @location(1) objectRadius: f32,
  @location(2) obstacleColor: vec3f,
  @location(3) obstacleRadius: f32,
  @location(4) bgColor: vec3f,
  @location(5) layersOfObstacle: f32,
  @location(6) numOfObstacle: f32,
}

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
}`,ie=`struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) texCoord: vec2f,
  @location(2) isObstacle: f32,
};

struct Vertex {
  @location(0) position: vec2f,
  @location(1) velocity: vec2f,
  @location(2) texCoord: vec2f,
  @location(3) isObstacle: f32,
};

struct Constant {
  @location(0) objectColor: vec3f,
  @location(1) objectRadius: f32,
  @location(2) obstacleColor: vec3f,
  @location(3) obstacleRadius: f32,
  @location(4) bgColor: vec3f,
  @location(5) layersOfObstacle: f32,
  @location(6) numOfObstacle: f32,
}

@vertex fn vs(
  input:Vertex
) -> OurVertexShaderOutput { 
  var vsOutput: OurVertexShaderOutput;
  vsOutput.position = vec4f(input.position, 0.0, 1.0);
  vsOutput.texCoord = input.texCoord;
  vsOutput.isObstacle = input.isObstacle;
  return vsOutput;
}`,re=`struct OurVertexShaderOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) texCoord: vec2f,
  @location(2) isObstacle: f32,
};

struct Vertex {
  @location(0) position: vec2f,
  @location(1) velocity: vec2f,
  @location(2) texCoord: vec2f,
  @location(3) isObstacle: f32,
};

struct Constant {
  @location(0) objectColor: vec3f,
  @location(1) objectRadius: f32,
  @location(2) obstacleColor: vec3f,
  @location(3) obstacleRadius: f32,
  @location(4) bgColor: vec3f,
  @location(5) layersOfObstacle: f32,
  @location(6) numOfObstacle: f32,
}

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
        return vec4f(constant.bgColor, 1);
    }

}`;class D{constructor(e,n){y(this,"_label");y(this,"_device");y(this,"_pointBuffer");y(this,"_billboardBuffer");this._device=e,this._label=n}async initialize(e){const n=[];for(let o=0;o<e.length;++o){const{position:i,velocity:u,texCoord:B,isObstacle:_}=e[o];n.push(...i,...u,...B,_,0)}const l=new Float32Array(n);this._pointBuffer=this._device.createBuffer({label:`${this._label} point vertex buffer`,size:l.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),this._device.queue.writeBuffer(this._pointBuffer,0,l),this._billboardBuffer=this._device.createBuffer({label:`${this._label} billboard vertex buffer`,size:l.byteLength*6,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST})}get point(){return this._pointBuffer||console.error(`${this._label} vertex buffers should be initialized first!`),this._pointBuffer}get billboard(){return this._billboardBuffer||console.error(`${this._label} vertex buffers should be initialized first!`),this._billboardBuffer}}const ae=a=>{const e=new Float32Array(a);for(let n=0;n<a;n++)e[n]=Math.random()<.5?-1:1;return e},se=a=>a*(a+1)/2,S=document.documentElement.clientHeight*.6,R=S,P=256,c=22,q=se(c),U=[.97,.92,.8],E=[.545,.271,.075],ce=async()=>{var z;const a=await((z=navigator.gpu)==null?void 0:z.requestAdapter()),e=await(a==null?void 0:a.requestDevice());if(!e){alert("need a browser that supports WebGPU");return}const n=document.querySelector("#board");n.style.width=`${R}px`,n.style.backgroundColor=`rgb(${U.map(t=>Math.round(t*255)).join(",")})`,n.style.border=`2px rgb(${E.map(t=>Math.round(t*255)).join(",")}) solid`;const l=document.querySelector("#result"),o=[];for(let t=0;t<c+1;t++){const r=document.createElement("span");r.className="slot",r.style.borderLeft=`0.5px rgb(${E.map(s=>Math.round(s*255)).join(",")}) solid`,t===c&&(r.style.borderRight=`0.5px rgb(${E.map(s=>Math.round(s*255)).join(",")}) solid`);const f=document.createElement("span");f.className="res",r.append(f),o.push(f),l.append(r)}const i=document.querySelector("canvas");i.style.width=`${R}px`,i.style.height=`${S}px`,i.width=R*2,i.height=S*2;const u=navigator.gpu.getPreferredCanvasFormat(),B=i.getContext("webgpu");B.configure({device:e,format:u});const _=[];for(let t=0;t<P;++t)_.push({position:[0,1+t*.01],velocity:[0,-1],texCoord:[0,0],isObstacle:0});const p=new D(e,"object");await p.initialize(_);const b=[],g=.088;for(let t=1;t<=c;++t)if(t%2===1){b.push({position:[0,.9-g*(t-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1});for(let r=0;r<Math.floor(t/2);r++)b.push({position:[0+.08*(r+1),.9-g*(t-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1}),b.push({position:[0-.08*(r+1),.9-g*(t-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1})}else for(let r=0;r<Math.floor(t/2);r++)b.push({position:[.04+.08*r,.9-g*(t-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1}),b.push({position:[-.04-.08*r,.9-g*(t-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1});const m=new D(e,"obstacle");await m.initialize(b);const G=e.createBuffer({label:"probabilities uniform buffer",size:P*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),w=e.createBuffer({label:"resultCriteria uniform buffer",size:c*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),$=b.slice(-c).map(t=>t.position[0]).sort((t,r)=>t-r);e.queue.writeBuffer(w,0,new Float32Array($));const T=e.createBuffer({label:"result buffer",size:(c+1)*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),O=e.createBuffer({label:"result buffer",size:(c+1)*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),v=e.createBuffer({label:"constant uniform buffer",size:16*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(v,0,new Float32Array([1,0,0,.01,...E,.025,...U,c,q,0,0,0]));const V=e.createBuffer({label:"time uniform buffer",size:2*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),j=e.createComputePipeline({label:"compute movement pipeline",layout:"auto",compute:{module:e.createShaderModule({label:"movement compute shader",code:oe})}}),A=e.createComputePipeline({label:"compute result pipeline",layout:"auto",compute:{module:e.createShaderModule({label:"result compute shader",code:ne})}}),x=e.createComputePipeline({label:"compute billboard pipeline",layout:"auto",compute:{module:e.createShaderModule({label:"billboard compute shader",code:te})}}),L=e.createRenderPipeline({label:"main pipeline",layout:"auto",vertex:{module:e.createShaderModule({label:"main vertex shader",code:ie}),buffers:[{arrayStride:8*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,offset:0,format:"float32x2"},{shaderLocation:1,offset:2*Float32Array.BYTES_PER_ELEMENT,format:"float32x2"},{shaderLocation:2,offset:4*Float32Array.BYTES_PER_ELEMENT,format:"float32x2"},{shaderLocation:3,offset:6*Float32Array.BYTES_PER_ELEMENT,format:"float32"}]}]},fragment:{module:e.createShaderModule({label:"main fragment shader",code:re}),targets:[{format:u}]},primitive:{topology:"triangle-list"}}),I=e.createBindGroup({label:"compute movement bind group",layout:j.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:p.point}},{binding:1,resource:{buffer:m.point}},{binding:2,resource:{buffer:G}},{binding:3,resource:{buffer:v}},{binding:4,resource:{buffer:V}}]}),W=e.createBindGroup({label:"compute result bind group",layout:A.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:p.point}},{binding:1,resource:{buffer:v}},{binding:2,resource:{buffer:w}},{binding:3,resource:{buffer:T}}]}),H=e.createBindGroup({label:"compute billboard bind group",layout:x.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:p.point}},{binding:1,resource:{buffer:p.billboard}},{binding:2,resource:{buffer:v}}]}),k=e.createBindGroup({label:"compute obstacle billboard bind group",layout:x.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:m.point}},{binding:1,resource:{buffer:m.billboard}},{binding:2,resource:{buffer:v}}]}),K=e.createBindGroup({label:"main bind group",layout:L.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:v}}]}),M=e.createCommandEncoder({label:"encoder"}),C=M.beginComputePass({label:"compute billboard pass"});C.setPipeline(x),C.setBindGroup(0,k),C.dispatchWorkgroups(1,1),C.end();const X=M.finish();e.queue.submit([X]);let F=0;async function Y(){const t=performance.now(),r=t-F;F=t,e.queue.writeBuffer(V,0,new Float32Array([r])),e.queue.writeBuffer(G,0,ae(P));const f=e.createCommandEncoder({label:"encoder"}),s=f.beginComputePass({label:"compute movement pass"});s.setPipeline(j),s.setBindGroup(0,I),s.dispatchWorkgroups(1,1),s.setPipeline(A),s.setBindGroup(0,W),s.dispatchWorkgroups(1,1),s.setPipeline(x),s.setBindGroup(0,H),s.dispatchWorkgroups(1,1),s.end();const d=f.beginRenderPass({label:"main pass",colorAttachments:[{view:B.getCurrentTexture().createView(),clearValue:[...U,1],loadOp:"clear",storeOp:"store"}]});d.setPipeline(L),d.setBindGroup(0,K),d.setVertexBuffer(0,p.billboard),d.draw(P*6),d.setVertexBuffer(0,m.billboard),d.draw(q*6),d.end(),f.copyBufferToBuffer(T,0,O,0,O.size);const J=f.finish();e.queue.submit([J]),await O.mapAsync(GPUMapMode.READ);const N=new Float32Array(O.getMappedRange().slice(0));O.unmap();const Q=Math.max.apply(null,Array.from(N));for(let h=0;h<c+1;h++)o[h].style.height=`${N[h]/Q*50}px`;requestAnimationFrame(Y)}Y()};ce();
