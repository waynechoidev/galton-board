import compute_billboard from "./shaders/billboard.compute.wgsl";
import compute_movement from "./shaders/movement.compute.wgsl";
import main_vert from "./shaders/main.vert.wgsl";
import main_frag from "./shaders/main.frag.wgsl";
import { Vertex } from "./common";
import { VertexBuffers } from "./buffer/vertex";

const HEIGHT = document.documentElement.clientHeight;
const WIDTH = Math.min(document.documentElement.clientWidth, HEIGHT / 2);
const NUM_OF_PARTICLE = 1; //256

const main = async () => {
  // Initialize
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice()!;
  if (!device) {
    alert("need a browser that supports WebGPU");
    return;
  }

  const canvas = document.querySelector("canvas") as HTMLCanvasElement;
  canvas.style.width = `${WIDTH}px`;
  canvas.style.height = `${HEIGHT}px`;
  canvas.width = WIDTH * 2;
  canvas.height = HEIGHT * 2;

  const presentationFormat: GPUTextureFormat =
    navigator.gpu.getPreferredCanvasFormat();
  const context = canvas.getContext("webgpu") as GPUCanvasContext;
  context.configure({
    device,
    format: presentationFormat,
  });

  // Vertex Buffers
  const objectVertices: Vertex[] = [];
  for (let i = 0; i < NUM_OF_PARTICLE; ++i) {
    objectVertices.push({
      position: [0, 1],
      velocity: [0, -1],
      texCoord: [0, 0],
      isObstacle: 0,
    });
  }
  const objectBuffers = new VertexBuffers(device, "object");
  await objectBuffers.initialize(objectVertices);

  const obstacleVertices: Vertex[] = [];
  for (let i = 0; i < 1; ++i) {
    obstacleVertices.push({
      position: [0, 0.8],
      velocity: [0, 0],
      texCoord: [0, 0],
      isObstacle: 1,
    });
  }
  const obstacleBuffers = new VertexBuffers(device, "obstacle");
  await obstacleBuffers.initialize(obstacleVertices);

  // Uniform Buffers
  const constantUniformBuffer = device.createBuffer({
    label: "screen uniform buffer",
    size: 12 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(
    constantUniformBuffer,
    0,
    new Float32Array([
      ...[1, 0, 0], // object color
      0.01, // object size
      ...[1, 1, 1], // obstacle color
      0.02, // obstacle size
      ...[WIDTH, HEIGHT], // screenSize
      1, // numOfObstacle
      0, // padding
    ])
  );

  const deltaUniformBuffer = device.createBuffer({
    label: "time uniform buffer",
    size: 2 * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  // Pipelines
  const computeMovementPipeline = device.createComputePipeline({
    label: "compute movement pipeline",
    layout: "auto",
    compute: {
      module: device.createShaderModule({
        label: "billboard compute shader",
        code: compute_movement,
      }),
    },
  });

  const computeBillboardPipeline = device.createComputePipeline({
    label: "compute billboard pipeline",
    layout: "auto",
    compute: {
      module: device.createShaderModule({
        label: "billboard compute shader",
        code: compute_billboard,
      }),
    },
  });

  const mainPipeline: GPURenderPipeline = device.createRenderPipeline({
    label: "main pipeline",
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        label: "main vertex shader",
        code: main_vert,
      }),
      buffers: [
        {
          arrayStride: (2 + 2 + 2 + 1 + 1) * Float32Array.BYTES_PER_ELEMENT,
          attributes: [
            {
              shaderLocation: 0, // location = 0 in vertex shader
              offset: 0,
              format: "float32x2", // position
            },
            {
              shaderLocation: 1, // location = 1 in vertex shader
              offset: 2 * Float32Array.BYTES_PER_ELEMENT,
              format: "float32x2", // velocity
            },
            {
              shaderLocation: 2, // location = 2 in vertex shader
              offset: 4 * Float32Array.BYTES_PER_ELEMENT,
              format: "float32x2", // texCoord
            },
            {
              shaderLocation: 3, // location = 3 in vertex shader
              offset: 6 * Float32Array.BYTES_PER_ELEMENT,
              format: "float32", // isObstacle
            },
            // padding * 1
          ],
        },
      ],
    },
    fragment: {
      module: device.createShaderModule({
        label: "main fragment shader",
        code: main_frag,
      }),
      targets: [
        {
          format: presentationFormat,
          blend: {
            color: {
              srcFactor: "one",
              dstFactor: "one",
              operation: "add",
            },
            alpha: {
              srcFactor: "one",
              dstFactor: "one",
              operation: "add",
            },
          },
        },
      ],
    },

    primitive: {
      topology: "triangle-list",
    },
  });

  // Bind groups
  const computeMovementBindGroup = device.createBindGroup({
    label: "compute movement bind group",
    layout: computeMovementPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: objectBuffers.point } },
      { binding: 1, resource: { buffer: obstacleBuffers.point } },
      { binding: 2, resource: { buffer: constantUniformBuffer } },
      { binding: 3, resource: { buffer: deltaUniformBuffer } },
    ],
  });

  const computeBillboardBindGroup = device.createBindGroup({
    label: "compute billboard bind group",
    layout: computeBillboardPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: objectBuffers.point } },
      { binding: 1, resource: { buffer: objectBuffers.billboard } },
      { binding: 2, resource: { buffer: constantUniformBuffer } },
    ],
  });

  const computeObstacleBillboardBindGroup = device.createBindGroup({
    label: "compute obstacle billboard bind group",
    layout: computeBillboardPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: obstacleBuffers.point } },
      { binding: 1, resource: { buffer: obstacleBuffers.billboard } },
      { binding: 2, resource: { buffer: constantUniformBuffer } },
    ],
  });

  const mainBindGroup = device.createBindGroup({
    label: "main bind group",
    layout: mainPipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: constantUniformBuffer } }],
  });

  const encoder = device.createCommandEncoder({
    label: "encoder",
  });

  const computeBillboardPass = encoder.beginComputePass({
    label: "compute billboard pass",
  });
  computeBillboardPass.setPipeline(computeBillboardPipeline);
  computeBillboardPass.setBindGroup(0, computeObstacleBillboardBindGroup);
  computeBillboardPass.dispatchWorkgroups(1, 1);
  computeBillboardPass.end();

  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);

  let previousFrameTime = 0;
  function render() {
    const time = performance.now();
    const delta: number = time - previousFrameTime;
    previousFrameTime = time;

    device.queue.writeBuffer(deltaUniformBuffer, 0, new Float32Array([delta]));

    const encoder = device.createCommandEncoder({
      label: "encoder",
    });

    const computeMovementPass = encoder.beginComputePass({
      label: "compute movement pass",
    });
    computeMovementPass.setPipeline(computeMovementPipeline);
    computeMovementPass.setBindGroup(0, computeMovementBindGroup);
    computeMovementPass.dispatchWorkgroups(1, 1);
    computeMovementPass.end();

    const computeBillboardPass = encoder.beginComputePass({
      label: "compute billboard pass",
    });
    computeBillboardPass.setPipeline(computeBillboardPipeline);
    computeBillboardPass.setBindGroup(0, computeBillboardBindGroup);
    computeBillboardPass.dispatchWorkgroups(1, 1);
    computeBillboardPass.end();

    const mainPass = encoder.beginRenderPass({
      label: "main pass",
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: [0, 0, 0, 1],
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });
    mainPass.setPipeline(mainPipeline);
    mainPass.setBindGroup(0, mainBindGroup);
    mainPass.setVertexBuffer(0, objectBuffers.billboard);
    mainPass.draw(NUM_OF_PARTICLE * 6);

    mainPass.setVertexBuffer(0, obstacleBuffers.billboard);
    mainPass.draw(NUM_OF_PARTICLE * 6);
    mainPass.end();

    // Finish encoding and submit the commands
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);

    requestAnimationFrame(render);
  }

  render();
};

main();
