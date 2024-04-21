var te=Object.defineProperty;var oe=(t,e,o)=>e in t?te(t,e,{enumerable:!0,configurable:!0,writable:!0,value:o}):t[e]=o;var y=(t,e,o)=>(oe(t,typeof e!="symbol"?e+"":e,o),o);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function o(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerPolicy&&(r.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?r.credentials="include":n.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function a(n){if(n.ep)return;n.ep=!0;const r=o(n);fetch(n.href,r)}})();var ne=`struct OurVertexShaderOutput {
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
  @location(4) layersOfObstacle: f32,
  @location(5) numOfObstacle: f32,
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
  @location(4) layersOfObstacle: f32,
  @location(5) numOfObstacle: f32,
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
  @location(4) layersOfObstacle: f32,
  @location(5) numOfObstacle: f32,
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
  @location(4) layersOfObstacle: f32,
  @location(5) numOfObstacle: f32,
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
  @location(4) layersOfObstacle: f32,
  @location(5) numOfObstacle: f32,
}

@group(0) @binding(0) var<uniform> constant: Constant;

@fragment fn fs(input: OurVertexShaderOutput) -> @location(0) vec4f {

    let dist:f32 = length(input.texCoord - vec2f(0.5, 0.5));

    var color:vec3f = constant.objectColor;
    if(input.isObstacle == 1.0) {
        color = constant.obstacleColor;
    }

    if(dist > 0.5)
    {
        discard;
    }
    
    return vec4f(color, 1.0);
}`;class ${constructor(e,o){y(this,"_label");y(this,"_device");y(this,"_pointBuffer");y(this,"_billboardBuffer");this._device=e,this._label=o}async initialize(e){const o=[];for(let n=0;n<e.length;++n){const{position:r,velocity:s,texCoord:d,isObstacle:b}=e[n];o.push(...r,...s,...d,b,0)}const a=new Float32Array(o);this._pointBuffer=this._device.createBuffer({label:`${this._label} point vertex buffer`,size:a.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),this._device.queue.writeBuffer(this._pointBuffer,0,a),this._billboardBuffer=this._device.createBuffer({label:`${this._label} billboard vertex buffer`,size:a.byteLength*6,usage:GPUBufferUsage.VERTEX|GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST})}get point(){return this._pointBuffer||console.error(`${this._label} vertex buffers should be initialized first!`),this._pointBuffer}get billboard(){return this._billboardBuffer||console.error(`${this._label} vertex buffers should be initialized first!`),this._billboardBuffer}}const le=t=>{const e=new Float32Array(t);for(let o=0;o<t;o++)e[o]=Math.random()<.5?-1:1;return e},ce=t=>t*(t+1)/2,x=Math.min(document.documentElement.clientHeight*.7,document.documentElement.clientWidth*.95),f=x,S=256,u=22,N=ce(u),q=[.97,.92,.8],O=[.545,.271,.075],U=document.querySelector("#board");U.style.width=`${f}px`;U.style.backgroundColor=`rgb(${q.map(t=>Math.round(t*255)).join(",")})`;U.style.border=`2px rgb(${O.map(t=>Math.round(t*255)).join(",")}) solid`;const D=x*.3,I=document.querySelector("#result");I.style.height=`${D}px`;const R=[];for(let t=0;t<u+1;t++){const e=document.createElement("span");e.className="slot",e.style.borderLeft=`0.5px rgb(${O.map(a=>Math.round(a*255)).join(",")}) solid`,t===u&&(e.style.borderRight=`0.5px rgb(${O.map(a=>Math.round(a*255)).join(",")}) solid`),e.style.width=`${f*.039}px`;const o=document.createElement("span");o.className="res",o.style.fontSize=`${f*.04}px`,e.append(o),R.push(o),I.append(e)}const B=document.querySelector("#funnel");B.style.borderTop=`${x*.05}px rgb(${O.map(t=>Math.round(t*255)).join(",")}) solid`;B.style.borderLeft=`${f*.1}px transparent solid`;B.style.borderRight=`${f*.1}px transparent solid`;B.style.width=`${f*.15}px`;B.style.marginTop=`${f*0}px`;const h=document.querySelector("canvas");h.style.width=`${f}px`;h.style.height=`${x}px`;h.width=f*5;h.height=x*5;const ue=async()=>{var z;const t=await((z=navigator.gpu)==null?void 0:z.requestAdapter()),e=await(t==null?void 0:t.requestDevice());if(!e){alert("need a browser that supports WebGPU");return}const o=navigator.gpu.getPreferredCanvasFormat(),a=h.getContext("webgpu");a.configure({device:e,format:o});const n=[];for(let i=0;i<S;++i)n.push({position:[0,1+i*.01],velocity:[0,-1],texCoord:[0,0],isObstacle:0});const r=new $(e,"object");await r.initialize(n);const s=[],d=.088;for(let i=1;i<=u;++i)if(i%2===1){s.push({position:[0,.9-d*(i-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1});for(let l=0;l<Math.floor(i/2);l++)s.push({position:[0+.08*(l+1),.9-d*(i-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1}),s.push({position:[0-.08*(l+1),.9-d*(i-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1})}else for(let l=0;l<Math.floor(i/2);l++)s.push({position:[.04+.08*l,.9-d*(i-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1}),s.push({position:[-.04-.08*l,.9-d*(i-1)],velocity:[0,0],texCoord:[0,0],isObstacle:1});const b=new $(e,"obstacle");await b.initialize(s);const w=e.createBuffer({label:"probabilities uniform buffer",size:S*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),G=e.createBuffer({label:"resultCriteria uniform buffer",size:u*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),W=s.slice(-u).map(i=>i.position[0]).sort((i,l)=>i-l);e.queue.writeBuffer(G,0,new Float32Array(W));const T=e.createBuffer({label:"result buffer",size:(u+1)*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST}),v=e.createBuffer({label:"result buffer",size:(u+1)*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),g=e.createBuffer({label:"constant uniform buffer",size:12*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});e.queue.writeBuffer(g,0,new Float32Array([1,0,0,.01,...O,.025,u,N,0,0]));const j=e.createBuffer({label:"time uniform buffer",size:2*Float32Array.BYTES_PER_ELEMENT,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),V=e.createComputePipeline({label:"compute movement pipeline",layout:"auto",compute:{module:e.createShaderModule({label:"movement compute shader",code:ie})}}),M=e.createComputePipeline({label:"compute result pipeline",layout:"auto",compute:{module:e.createShaderModule({label:"result compute shader",code:re})}}),_=e.createComputePipeline({label:"compute billboard pipeline",layout:"auto",compute:{module:e.createShaderModule({label:"billboard compute shader",code:ne})}}),L=e.createRenderPipeline({label:"main pipeline",layout:"auto",vertex:{module:e.createShaderModule({label:"main vertex shader",code:ae}),buffers:[{arrayStride:8*Float32Array.BYTES_PER_ELEMENT,attributes:[{shaderLocation:0,offset:0,format:"float32x2"},{shaderLocation:1,offset:2*Float32Array.BYTES_PER_ELEMENT,format:"float32x2"},{shaderLocation:2,offset:4*Float32Array.BYTES_PER_ELEMENT,format:"float32x2"},{shaderLocation:3,offset:6*Float32Array.BYTES_PER_ELEMENT,format:"float32"}]}]},fragment:{module:e.createShaderModule({label:"main fragment shader",code:se}),targets:[{format:o}]},primitive:{topology:"triangle-list"}}),H=e.createBindGroup({label:"compute movement bind group",layout:V.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:r.point}},{binding:1,resource:{buffer:b.point}},{binding:2,resource:{buffer:w}},{binding:3,resource:{buffer:g}},{binding:4,resource:{buffer:j}}]}),k=e.createBindGroup({label:"compute result bind group",layout:M.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:r.point}},{binding:1,resource:{buffer:g}},{binding:2,resource:{buffer:G}},{binding:3,resource:{buffer:T}}]}),K=e.createBindGroup({label:"compute billboard bind group",layout:_.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:r.point}},{binding:1,resource:{buffer:r.billboard}},{binding:2,resource:{buffer:g}}]}),X=e.createBindGroup({label:"compute obstacle billboard bind group",layout:_.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:b.point}},{binding:1,resource:{buffer:b.billboard}},{binding:2,resource:{buffer:g}}]}),J=e.createBindGroup({label:"main bind group",layout:L.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:g}}]}),A=e.createCommandEncoder({label:"encoder"}),C=A.beginComputePass({label:"compute billboard pass"});C.setPipeline(_),C.setBindGroup(0,X),C.dispatchWorkgroups(1,1),C.end();const Q=A.finish();e.queue.submit([Q]);let F=0;async function Y(){const i=performance.now(),l=i-F;F=i,e.queue.writeBuffer(j,0,new Float32Array([l])),e.queue.writeBuffer(w,0,le(S));const P=e.createCommandEncoder({label:"encoder"}),c=P.beginComputePass({label:"compute movement pass"});c.setPipeline(V),c.setBindGroup(0,H),c.dispatchWorkgroups(1,1),c.setPipeline(M),c.setBindGroup(0,k),c.dispatchWorkgroups(1,1),c.setPipeline(_),c.setBindGroup(0,K),c.dispatchWorkgroups(1,1),c.end();const p=P.beginRenderPass({label:"main pass",colorAttachments:[{view:a.getCurrentTexture().createView(),clearValue:[...q,1],loadOp:"clear",storeOp:"store"}]});p.setPipeline(L),p.setBindGroup(0,J),p.setVertexBuffer(0,b.billboard),p.draw(N*6),p.setVertexBuffer(0,r.billboard),p.draw(S*6),p.end(),P.copyBufferToBuffer(T,0,v,0,v.size);const Z=P.finish();e.queue.submit([Z]),await v.mapAsync(GPUMapMode.READ);const E=new Float32Array(v.getMappedRange().slice(0));v.unmap();const ee=Math.max.apply(null,Array.from(E));for(let m=0;m<u+1;m++)R[m].style.height=`${E[m]/ee*D}px`,E[m]&&(R[m].innerHTML=E[m].toString());requestAnimationFrame(Y)}Y()};ue();
