var te=Object.defineProperty;var oe=(r,e,n)=>e in r?te(r,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):r[e]=n;var x=(r,e,n)=>(oe(r,typeof e!="symbol"?e+"":e,n),n);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))u(o);new MutationObserver(o=>{for(const a of o)if(a.type==="childList")for(const c of a.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&u(c)}).observe(document,{childList:!0,subtree:!0});function n(o){const a={};return o.integrity&&(a.integrity=o.integrity),o.referrerPolicy&&(a.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?a.credentials="include":o.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function u(o){if(o.ep)return;o.ep=!0;const a=n(o);fetch(o.href,a)}})();var ne=`struct OurVertexShaderOutput {
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
}`,ae=`struct OurVertexShaderOutput {
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
}`,se=`struct OurVertexShaderOutput {
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

}`;class D{constructor(e,n){x(this,"_label");x(this,"_device");x(this,"_pointBuffer");x(this,"_billboardBuffer");this._device=e,this._label=n}async initialize(e){const n=[];for(let o=0;o<e.length;++o){const{position:a,velocity:c,texCoord:b,isObstacle:C}=e[o];n.push(...a,...c,...b,C,0)}const u=new Float32Array(n);this._pointBuffer=this._device.createBuffer({label:`${this._label} point vertex buffer`,size:u.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),this._device.queue.writeBuffer(this._pointBuffer,0,u),this._billboardBuffer=this._device.createBuffer({label:`${this._label} billboard vertex buffer`,size:u.byteLength*6,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST})}get point(){return this._pointBuffer||console.error(`${this._label} vertex buffers should be initialized first!`),this._pointBuffer}get billboard(){return this._billboardBuffer||console.error(`${this._label} vertex buffers should be initialized first!`),this._billboardBuffer}}const ce=r=>{const e=new Float32Array(r);for(let n=0;n<r;n++)e[n]=Math.random()<.5?-1:1;return e},le=r=>r*(r+1)/2,_=document.documentElement.clientHeight*(document.documentElement.clientHeight>document.documentElement.clientWidth?.5:.7),g=_,S=256,l=22,I=le(l),U=[.97,.92,.8],h=[.545,.271,.075],ue=async()=>{var $;const r=await(($=navigator.gpu)==null?void 0:$.requestAdapter()),e=await(r==null?void 0:r.requestDevice());if(!e){alert("need a browser that supports WebGPU");return}const n=document.querySelector("#board");n.style.width=`${g}px`,n.style.backgroundColor=`rgb(${U.map(t=>Math.round(t*255)).join(",")})`,n.style.border=`2px rgb(${h.map(t=>Math.round(t*255)).join(",")}) solid`;const u=_*.2,o=document.querySelector("#result");o.style.height=`${u}px`;const a=[];for(let t=0;t<l+1;t++){const i=document.createElement("span");i.className="slot",i.style.borderLeft=`0.5px rgb(${h.map(s=>Math.round(s*255)).join(",")}) solid`,t===l&&(i.style.borderRight=`0.5px rgb(${h.map(s=>Math.round(s*255)).join(",")}) solid`);const f=document.createElement("span");f.className="res",i.append(f),a.push(f),o.append(i)}const c=document.querySelector("#funnel");c.style.borderTop=`${_*.05}px rgb(${h.map(t=>Math.round(t*255)).join(",")}) solid`,c.style.borderLeft=`${g*.1}px transparent solid`,c.style.borderRight=`${g*.1}px transparent solid`,c.style.width=`${g*.15}px`,c.style.marginTop=`${g*0}px`;const b=document.querySelector("canvas");b.style.width=`${g}px`,b.style.height=`${_}px`,b.width=g*2,b.height=_*2;const C=navigator.gpu.getPreferredCanvasFormat(),w=b.getContext("webgpu");w.configure({device:e,format:C});const G=[];for(let t=0;t<S;++t)G.push({position:[0,1+t*.01],velocity:[0,-1],texCoord:[0,0],isObstacle:0});const m=new D(e,"object");await m.initialize(G);const d=[],y=.088;for(let t=1;t<=l;++t)if(t%2===1){d.push({position:[0,.9-y*(t-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1});for(let i=0;i<Math.floor(t/2);i++)d.push({position:[0+.08*(i+1),.9-y*(t-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1}),d.push({position:[0-.08*(i+1),.9-y*(t-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1})}else for(let i=0;i<Math.floor(t/2);i++)d.push({position:[.04+.08*i,.9-y*(t-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1}),d.push({position:[-.04-.08*i,.9-y*(t-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1});const O=new D(e,"obstacle");await O.initialize(d);const T=e.createBuffer({label:"probabilities uniform buffer",size:S*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),j=e.createBuffer({label:"resultCriteria uniform buffer",size:l*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),W=d.slice(-l).map(t=>t.position[0]).sort((t,i)=>t-i);e.queue.writeBuffer(j,0,new Float32Array(W));const V=e.createBuffer({label:"result buffer",size:(l+1)*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),B=e.createBuffer({label:"result buffer",size:(l+1)*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),v=e.createBuffer({label:"constant uniform buffer",size:16*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(v,0,new Float32Array([1,0,0,.01,...h,.025,...U,l,I,0,0,0]));const A=e.createBuffer({label:"time uniform buffer",size:2*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),L=e.createComputePipeline({label:"compute movement pipeline",layout:"auto",compute:{module:e.createShaderModule({label:"movement compute shader",code:ie})}}),M=e.createComputePipeline({label:"compute result pipeline",layout:"auto",compute:{module:e.createShaderModule({label:"result compute shader",code:re})}}),P=e.createComputePipeline({label:"compute billboard pipeline",layout:"auto",compute:{module:e.createShaderModule({label:"billboard compute shader",code:ne})}}),F=e.createRenderPipeline({label:"main pipeline",layout:"auto",vertex:{module:e.createShaderModule({label:"main vertex shader",code:ae}),buffers:[{arrayStride:8*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,offset:0,format:"float32x2"},{shaderLocation:1,offset:2*Float32Array.BYTES_PER_ELEMENT,format:"float32x2"},{shaderLocation:2,offset:4*Float32Array.BYTES_PER_ELEMENT,format:"float32x2"},{shaderLocation:3,offset:6*Float32Array.BYTES_PER_ELEMENT,format:"float32"}]}]},fragment:{module:e.createShaderModule({label:"main fragment shader",code:se}),targets:[{format:C}]},primitive:{topology:"triangle-list"}}),H=e.createBindGroup({label:"compute movement bind group",layout:L.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:m.point}},{binding:1,resource:{buffer:O.point}},{binding:2,resource:{buffer:T}},{binding:3,resource:{buffer:v}},{binding:4,resource:{buffer:A}}]}),k=e.createBindGroup({label:"compute result bind group",layout:M.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:m.point}},{binding:1,resource:{buffer:v}},{binding:2,resource:{buffer:j}},{binding:3,resource:{buffer:V}}]}),K=e.createBindGroup({label:"compute billboard bind group",layout:P.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:m.point}},{binding:1,resource:{buffer:m.billboard}},{binding:2,resource:{buffer:v}}]}),X=e.createBindGroup({label:"compute obstacle billboard bind group",layout:P.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:O.point}},{binding:1,resource:{buffer:O.billboard}},{binding:2,resource:{buffer:v}}]}),J=e.createBindGroup({label:"main bind group",layout:F.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:v}}]}),Y=e.createCommandEncoder({label:"encoder"}),E=Y.beginComputePass({label:"compute billboard pass"});E.setPipeline(P),E.setBindGroup(0,X),E.dispatchWorkgroups(1,1),E.end();const Q=Y.finish();e.queue.submit([Q]);let z=0;async function N(){const t=performance.now(),i=t-z;z=t,e.queue.writeBuffer(A,0,new Float32Array([i])),e.queue.writeBuffer(T,0,ce(S));const f=e.createCommandEncoder({label:"encoder"}),s=f.beginComputePass({label:"compute movement pass"});s.setPipeline(L),s.setBindGroup(0,H),s.dispatchWorkgroups(1,1),s.setPipeline(M),s.setBindGroup(0,k),s.dispatchWorkgroups(1,1),s.setPipeline(P),s.setBindGroup(0,K),s.dispatchWorkgroups(1,1),s.end();const p=f.beginRenderPass({label:"main pass",colorAttachments:[{view:w.getCurrentTexture().createView(),clearValue:[...U,1],loadOp:"clear",storeOp:"store"}]});p.setPipeline(F),p.setBindGroup(0,J),p.setVertexBuffer(0,O.billboard),p.draw(I*6),p.setVertexBuffer(0,m.billboard),p.draw(S*6),p.end(),f.copyBufferToBuffer(V,0,B,0,B.size);const Z=f.finish();e.queue.submit([Z]),await B.mapAsync(GPUMapMode.READ);const q=new Float32Array(B.getMappedRange().slice(0));B.unmap();const ee=Math.max.apply(null,Array.from(q));for(let R=0;R<l+1;R++)a[R].style.height=`${q[R]/ee*u}px`;requestAnimationFrame(N)}N()};ue();
