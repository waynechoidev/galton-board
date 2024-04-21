struct OurVertexShaderOutput {
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