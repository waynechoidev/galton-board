import { Vertex } from "../common";

export const getVertexBuffers = async (
  device: GPUDevice,
  vertices: Vertex[]
) => {
  const data: number[] = [];
  for (let i = 0; i < vertices.length; ++i) {
    const { position, velocity, texCoord } = vertices[i];
    data.push(...position, ...velocity, ...texCoord);
  }

  const verticesValues = new Float32Array(data);
  const pointBuffer = device.createBuffer({
    label: "object vertices buffer",
    size: verticesValues.byteLength,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(pointBuffer, 0, verticesValues);

  const billboardBuffer = device.createBuffer({
    label: "object billboard vertex buffer",
    size: verticesValues.byteLength * 6,
    usage:
      GPUBufferUsage.VERTEX |
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  });

  return { point: pointBuffer, billboard: billboardBuffer };
};
