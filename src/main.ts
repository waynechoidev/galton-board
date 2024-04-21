import compute_billboard from "./shaders/billboard.compute.wgsl";
import compute_movement from "./shaders/movement.compute.wgsl";
import compute_result from "./shaders/result.compute.wgsl";
import main_vert from "./shaders/main.vert.wgsl";
import main_frag from "./shaders/main.frag.wgsl";
import { Vertex } from "./common";
import { VertexBuffers } from "./buffer/vertex";
import { sumUpToN, generateRandomProbabilities } from "./utils";

const HEIGHT = document.documentElement.clientHeight * 0.7;
const WIDTH = HEIGHT;
const NUM_OF_PARTICLE = 256;
const LAYERS_OF_OBSTACLE = 22;
const NUM_OF_OBSTACLE = sumUpToN(LAYERS_OF_OBSTACLE);
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
      position: [0, 1 + i * 0.01],
      velocity: [0, -1],
      texCoord: [0, 0],
      isObstacle: 0,
    });
  }
  const objectBuffers = new VertexBuffers(device, "object");
  await objectBuffers.initialize(objectVertices);

  const obstacleVertices: Vertex[] = [];
  const height = 0.088;
  for (let i = 1; i <= LAYERS_OF_OBSTACLE; ++i) {
    if (i % 2 === 1) {
      obstacleVertices.push({
        position: [0, 0.9 - height * (i - 1)],
        velocity: [0, 0],
        texCoord: [0, 0],
        isObstacle: 1,
      });
      for (let j = 0; j < Math.floor(i / 2); j++) {
        obstacleVertices.push({
          position: [0 + 0.08 * (j + 1), 0.9 - height * (i - 1)],
          velocity: [0, 0],
          texCoord: [0, 0],
          isObstacle: 1,
        });
        obstacleVertices.push({
          position: [0 - 0.08 * (j + 1), 0.9 - height * (i - 1)],
          velocity: [0, 0],
          texCoord: [0, 0],
          isObstacle: 1,
        });
      }
    } else {
      for (let j = 0; j < Math.floor(i / 2); j++) {
        obstacleVertices.push({
          position: [0.04 + 0.08 * j, 0.9 - height * (i - 1)],
          velocity: [0, 0],
          texCoord: [0, 0],
          isObstacle: 1,
        });
        obstacleVertices.push({
          position: [-0.04 - 0.08 * j, 0.9 - height * (i - 1)],
          velocity: [0, 0],
          texCoord: [0, 0],
          isObstacle: 1,
        });
      }
    }
  }
  const obstacleBuffers = new VertexBuffers(device, "obstacle");
  await obstacleBuffers.initialize(obstacleVertices);

  // Storage Buffer

  const probabilitiesBuffer = device.createBuffer({
    label: "probabilities uniform buffer",
    size: NUM_OF_PARTICLE * Float32Array.BYTES_PER_ELEMENT,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  });

  const resultCriteriaUniformBuffer = device.createBuffer({
    label: "resultCriteria uniform buffer",
    size: LAYERS_OF_OBSTACLE * Float32Array.BYTES_PER_ELEMENT,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  });
  const resultCriteriaData = obstacleVertices
    .slice(-LAYERS_OF_OBSTACLE)
    .map((vertex) => vertex.position[0])
    .sort((a, b) => a - b);
  device.queue.writeBuffer(
    resultCriteriaUniformBuffer,
    0,
    new Float32Array(resultCriteriaData)
  );

  const resultBuffer = device.createBuffer({
    label: "result buffer",
    size: (LAYERS_OF_OBSTACLE + 1) * Float32Array.BYTES_PER_ELEMENT,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  });
  const readResultBuffer = device.createBuffer({
    label: "result buffer",
    size: (LAYERS_OF_OBSTACLE + 1) * Float32Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  // Uniform Buffers

  const constantUniformBuffer = device.createBuffer({
    label: "constant uniform buffer",
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
      LAYERS_OF_OBSTACLE, //
      NUM_OF_OBSTACLE, // numOfObstacle
      ...[0, 0], // padding
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
        label: "movement compute shader",
        code: compute_movement,
      }),
    },
  });

  const computeResultPipeline = device.createComputePipeline({
    label: "compute result pipeline",
    layout: "auto",
    compute: {
      module: device.createShaderModule({
        label: "result compute shader",
        code: compute_result,
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
      { binding: 2, resource: { buffer: probabilitiesBuffer } },
      { binding: 3, resource: { buffer: constantUniformBuffer } },
      { binding: 4, resource: { buffer: deltaUniformBuffer } },
    ],
  });

  const computeResultBindGroup = device.createBindGroup({
    label: "compute result bind group",
    layout: computeResultPipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: objectBuffers.point } },
      { binding: 1, resource: { buffer: constantUniformBuffer } },
      { binding: 2, resource: { buffer: resultCriteriaUniformBuffer } },
      { binding: 3, resource: { buffer: resultBuffer } },
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
  async function render() {
    const time = performance.now();
    const delta: number = time - previousFrameTime;
    previousFrameTime = time;

    device.queue.writeBuffer(deltaUniformBuffer, 0, new Float32Array([delta]));
    device.queue.writeBuffer(
      probabilitiesBuffer,
      0,
      generateRandomProbabilities(NUM_OF_PARTICLE)
    );

    const encoder = device.createCommandEncoder({
      label: "encoder",
    });

    const computePass = encoder.beginComputePass({
      label: "compute movement pass",
    });
    computePass.setPipeline(computeMovementPipeline);
    computePass.setBindGroup(0, computeMovementBindGroup);
    computePass.dispatchWorkgroups(1, 1);

    computePass.setPipeline(computeResultPipeline);
    computePass.setBindGroup(0, computeResultBindGroup);
    computePass.dispatchWorkgroups(1, 1);

    computePass.setPipeline(computeBillboardPipeline);
    computePass.setBindGroup(0, computeBillboardBindGroup);
    computePass.dispatchWorkgroups(1, 1);
    computePass.end();

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
    mainPass.draw(NUM_OF_OBSTACLE * 6);
    mainPass.end();

    encoder.copyBufferToBuffer(
      resultBuffer,
      0,
      readResultBuffer,
      0,
      readResultBuffer.size
    );

    // Finish encoding and submit the commands
    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);

    await readResultBuffer.mapAsync(GPUMapMode.READ);
    const result = new Float32Array(readResultBuffer.getMappedRange().slice(0));
    readResultBuffer.unmap();

    console.log(result);

    requestAnimationFrame(render);
  }

  render();
};

main();
