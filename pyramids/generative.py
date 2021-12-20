#!/usr/bin/env python3

import bpy
import bmesh
import math
import mathutils

h = 0.1
verts = [
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
    #(0, 1, 3, 2),
    (4, 5, 7, 6),
    # sides
    (0, 4, 5, 1),
    (1, 3, 7, 5),
    (2, 3, 7, 6),
    (0, 2, 6, 4)
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
v_counter = len(verts)


class Vertex:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

    def as_tuple(self):
        return (self.x, self.y, self.z)


def draw_pyramid(v0, v1, v2, v3):
    # v0 -> upper left  v2 -> upper right
    # v1 -> bottom left v3 -> bottom right
    global verts
    global v_counter

    # check if we're going to be re-using any existing
    # corner vertices as elements
    e = []  # elements
    for i in range(4):
        vi = eval(f"v{i}")
        if (vi == verts[i]):
            e.append(i)
        else:
            e.append(v_counter)
            verts.append(vi.as_tuple())
            v_counter+=1

    height = v0.y - v1.y  # ex. ROW_HEIGHT
    width = v2.x - v0.x   # ex. COL_WIDTH

    v4 = (width/2, 3*height/4, 0.0)
    v5 = (width/2,   height/4, 0.0)
    verts.append(v4)
    e.append(v_counter)
    v_counter+=1
    verts.append(v5)
    e.append(v_counter)
    v_counter+=1

    faces.append((e[0], e[2], e[4]))
    faces.append((e[1], e[3], e[5]))
    faces.append((e[0], e[4], e[5], e[1]))
    faces.append((e[2], e[4], e[5], e[3]))


def main():
    mesh_name = "Pyramid Plane"
    mesh_data = bpy.data.meshes.new(mesh_name)

    ## TODO subdivide the mesh here
    N_ROWS = 10
    N_COLS = 5
    ROW_HEIGHT = 1.0/N_ROWS
    COL_WIDTH = 1.0/N_COLS

    draw_pyramid(Vertex(      0.0, ROW_HEIGHT, 0.0),
                 Vertex(      0.0,        0.0, 0.0),
                 Vertex(COL_WIDTH, ROW_HEIGHT, 0.0),
                 Vertex(COL_WIDTH,        0.0, 0.0))

    #for i in range(N_ROWS):
    #    lower_y = i * ROW_HEIGHT
    #    upper_y = lower_y + ROW_HEIGHT
    #    odd_row = i % 2 == 1
    #    if odd_row:
    #        h_corner_offset = COL_WIDTH/2 if odd_row else 0.0
    #        subdivide_pyramid(mesh, 0.0, h_corner_offset, lower_y, upper_y, z_origin)
    #    else:
    #        h_corner_offset = 0.0
    #    for j in range(N_COLS):
    #        left_x = (j * COL_WIDTH) + h_corner_offset
    #        right_x = x_min + left_x + (h_corner_offset
    #                                    if (odd_row and j == N_COLS-1)
    #                                    else ROW_HEIGHT)
    #        subdivide_pyramid(left_x, right_x, lower_y, upper_y)

    # mesh should have its components completed at this point
    mesh_data.from_pydata(verts, edges, faces)
    bm = bmesh.new()
    bm.from_mesh(mesh_data)
    bm.to_mesh(mesh_data)
    bm.free()
    mesh_obj = bpy.data.objects.new(mesh_data.name, mesh_data)
    bpy.context.collection.objects.link(mesh_obj)


if __name__ == "__main__":
    main()
