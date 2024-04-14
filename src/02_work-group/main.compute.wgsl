@group(0) @binding(0) var<storage, read_write> workgroupResult: array<vec3u>;
@group(0) @binding(1) var<storage, read_write> localResult: array<vec3u>;
@group(0) @binding(2) var<storage, read_write> globalResult: array<vec3u>;

@compute @workgroup_size(2, 3, 4) fn computeSomething(
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_id) local_invocation_id : vec3<u32>,
    @builtin(global_invocation_id) global_invocation_id : vec3<u32>,
    @builtin(local_invocation_index) local_invocation_index: u32,
    @builtin(num_workgroups) num_workgroups: vec3<u32>
) {
// workgroup_index is similar to local_invocation_index except for
// workgroups, not threads inside a workgroup.
// It is not a builtin so we compute it ourselves.

let workgroup_index =  
    workgroup_id.x +
    workgroup_id.y * num_workgroups.x +
    workgroup_id.z * num_workgroups.x * num_workgroups.y;

// global_invocation_index is like local_invocation_index
// except linear across all invocations across all dispatched
// workgroups. It is not a builtin so we compute it ourselves.

let global_invocation_index =
    workgroup_index * 4 * 3 * 2 +
    local_invocation_index;

// now we can write each of these builtins to our buffers.
workgroupResult[global_invocation_index] = workgroup_id;
localResult[global_invocation_index] = local_invocation_id;
globalResult[global_invocation_index] = global_invocation_id;
}