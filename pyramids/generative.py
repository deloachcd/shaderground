#!/usr/bin/env python3

import bpy
import bmesh
import mathutils
import os

h = 0.01
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
    # bottom face
    (4, 6, 7, 5),
    # sides
    (0, 4, 5, 1),
    (5, 7, 3, 1),
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


def draw_pyramid(lower_x, upper_x, lower_y, upper_y):
    v0 = Vertex(lower_x, upper_y, 0.0)
    v1 = Vertex(lower_x, lower_y, 0.0)
    v2 = Vertex(upper_x, upper_y, 0.0)
    v3 = Vertex(upper_x, lower_y, 0.0)

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

    v4 = (lower_x+(width/2), lower_y+(3*height/4), 0.0)
    v5 = (lower_x+(width/2),   lower_y+(height/4), 0.0)
    verts.append(v4)
    e.append(v_counter)
    v_counter+=1
    verts.append(v5)
    e.append(v_counter)
    v_counter+=1

    faces.append((e[4], e[2], e[0]))
    faces.append((e[1], e[3], e[5]))
    faces.append((e[1], e[5], e[4], e[0]))
    faces.append((e[4], e[5], e[3], e[2]))


def main():
    global h
    global verts
    global faces
    global edges
    global v_counter

    # name for generated mesh
    mesh_name = "Pyramid Plane"

    N_ROWS = 10
    N_COLS = 5
    ROW_HEIGHT = 1.0/N_ROWS
    COL_WIDTH = 1.0/N_COLS

    for i in range(N_ROWS):
        # 'lower' and 'upper' y values
        ly = i * ROW_HEIGHT
        uy = ly + ROW_HEIGHT
        if i % 2 == 0:
            # odd row - horizontal offset makes partitioning a bit more complex
            x_offset = COL_WIDTH/2
            # draw left side half width pyramid first
            draw_pyramid(0.0, x_offset, ly, uy)
            # draw full-width pyramids
            for j in range(N_COLS-1):
                lx = (j * COL_WIDTH) + x_offset
                ux = lx + + COL_WIDTH
                draw_pyramid(lx, ux, ly, uy)
            # draw right side half width pyramid
            draw_pyramid(1.0 - x_offset, 1.0, ly, uy)
        else:
            # even row - paritioning is luckily much simpler
            for j in range(N_COLS):
                lx = j * COL_WIDTH
                rx = lx + COL_WIDTH
                draw_pyramid(lx, rx, ly, uy)

    # center our mesh, and scale it
    for i, vert in enumerate(verts):
        size_mesh = 12.1838
        verts[i] = ((vert[0]-0.5)*size_mesh, (vert[1]-0.5)*size_mesh, vert[2]*size_mesh)

    # mesh should have its components completed at this point, blender specific stuff
    # happens here

    # delete default blender stuff
    bpy.ops.object.select_all(action='DESELECT')
    bpy.data.objects['Cube'].select_set(True)
    bpy.ops.object.delete()
    bpy.data.objects['Camera'].select_set(True)
    bpy.ops.object.delete()
    bpy.data.objects['Light'].select_set(True)
    bpy.ops.object.delete()

    mesh_data = bpy.data.meshes.new(mesh_name)
    mesh_data.from_pydata(verts, edges, faces)
    bm = bmesh.new()
    bm.from_mesh(mesh_data)
    bm.to_mesh(mesh_data)
    bm.free()
    mesh_obj = bpy.data.objects.new(mesh_data.name, mesh_data)
    bpy.context.collection.objects.link(mesh_obj)

    # export to OBJ
    blend_file_path = bpy.data.filepath
    directory = os.path.dirname(blend_file_path)
    target_file = os.path.join(directory, 'meshes/generated_plane.obj')
    bpy.ops.export_scene.obj(filepath=target_file)


if __name__ == "__main__":
    main()
