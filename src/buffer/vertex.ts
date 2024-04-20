import { Vertex } from "../common";

export class VertexBuffers {
  private _label: string;
  private _device: GPUDevice;
  private _pointBuffer: GPUBuffer | undefined;
  private _billboardBuffer: GPUBuffer | undefined;

  constructor(device: GPUDevice, label: string) {
    this._device = device;
    this._label = label;
  }

  public async initialize(vertices: Vertex[]) {
    const data: number[] = [];
    for (let i = 0; i < vertices.length; ++i) {
      const { position, velocity, texCoord, isObstacle } = vertices[i];
      data.push(
        ...position,
        ...velocity,
        ...texCoord,
        isObstacle,
        0 // padding
      );
    }

    const verticesValues = new Float32Array(data);
    this._pointBuffer = this._device.createBuffer({
      label: `${this._label} point vertex buffer`,
      size: verticesValues.byteLength,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
    });

    this._device.queue.writeBuffer(this._pointBuffer, 0, verticesValues);

    this._billboardBuffer = this._device.createBuffer({
      label: `${this._label} billboard vertex buffer`,
      size: verticesValues.byteLength * 6,
      usage:
        GPUBufferUsage.VERTEX |
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC |
        GPUBufferUsage.COPY_DST,
    });
  }

  public get point() {
    if (!this._pointBuffer)
      console.error(
        `${this._label} vertex buffers should be initialized first!`
      );
    return this._pointBuffer!;
  }

  public get billboard() {
    if (!this._billboardBuffer)
      console.error(
        `${this._label} vertex buffers should be initialized first!`
      );
    return this._billboardBuffer!;
  }
}
