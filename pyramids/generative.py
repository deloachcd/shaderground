#!/usr/bin/env python3

import bpy
import bmesh
import math
import mathutils

h = 0.1
vertices = [
    (0.0, 1.0, 0.0),
    (0.0, 0.0, 0.0),
    (1.0, 1.0, 0.0),
    (1.0, 0.0, 0.0),
    (0.0, 1.0,  -h),
    (0.0, 0.0,  -h),
    (1.0, 1.0,  -h),
    (1.0, 0.0,  -h)
]

faces = [
    # top/bottom face
    (0, 1, 2),
    (1, 2, 3),
    (4, 5, 6),
    (5, 6, 7),
    # sides
    (0, 1, 4),
    (1, 4, 5),
    (1, 5, 7),
    (3, 1, 7),
    (3, 6, 7),
    (2, 3, 6),
    (0, 2, 4),
    (2, 4, 6)
]

edges = [
    (0, 1),
    (1, 5),
    (5, 4),
    (4, 0),
    (1, 3),
    (3, 7),
    (7, 5),
    (3, 2),
    (7, 6),
    (2, 6),
    (0, 2),
    (4, 6)
]


def main():
    mesh_name = "Pyramid Plane"
    mesh_data = bpy.data.meshes.new(mesh_name)
    mesh_data.from_pydata(vertices, edges, faces)

    bm = bmesh.new()
    bm.from_mesh(mesh_data)

    bm.to_mesh(mesh_data)
    bm.free()
    mesh_obj = bpy.data.objects.new(mesh_data.name, mesh_data)
    bpy.context.collection.objects.link(mesh_obj)


if __name__ == "__main__":
    main()
