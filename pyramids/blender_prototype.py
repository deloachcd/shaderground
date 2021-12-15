#!/usr/bin/env python3

import bpy
import bmesh
import math
import mathutils


def define_vertex_creator(z, mesh):
    return lambda x, y: bmesh.ops.create_vert(bm=mesh, co=mathutils.Vector(x, y, const_z))


def subdivide_pyramid(lx, ux, ly, uy, vertex):
    width = ux - lx
    height = uy - ly
    # lpv -> lower peak vertex
    lpv = vertex(width/2, height/4)
    rpv = vertex(width/2, 3*height/4)
    # ulc -> Upper Left Corner, etc.
    llc = vertex(lx, ly)
    ulc = vertex(lx, uy)
    lrc = vertex(ux, ly)
    urc = vertex(ux, uy)
    # draw edges for outside box
    draw_edge(llc, ulc)
    draw_edge(llc, lrc)
    draw_edge(urc, ulc)
    draw_edge(urc, lrc)
    # draw edges for inner pyramid
    draw_edge(lpv, rpv)
    draw_edge(llc, lpv)
    draw_edge(lrc, lpv)
    draw_edge(ulc, upv)
    draw_edge(urc, upv)


def draw_edge(v1, v2):
    bmesh.ops.connect_verts(bm=active_mesh, verts=(v1, v2))


def draw_plane_subdivisions(x_origin, y_origin, vertex):
    # tweaking these should change the subdivision behavior
    N_ROWS = 10
    N_COLS = 5

    # dirived values
    ROW_HEIGHT = 1.0/N_ROWS
    COL_WIDTH = 1.0/N_COLS

    # working on top plane
    for i in range(N_ROWS):
        # iteration on y access
        lower_y = i * ROW_HEIGHT
        upper_y = lower_y + ROW_HEIGHT
        odd_row = i % 2 == 1
        if odd_row:
            h_corner_offset = COL_WIDTH/2 if odd_row else 0.0
            subdivide_pyramid(0.0, h_corner_offset, lower_y, upper_y)
        else:
            h_corner_offset = 0.0
        for j in range(N_COLS):
            left_x = (j * COL_WIDTH) + h_corner_offset
            right_x = left_x + (h_corner_offset if (odd_row and j == N_COLS-1)
                                                else ROW_HEIGHT)
            subdivide_pyramid(left_x, left_x, lower_y, upper_y)


def main():
    # active mesh to bmesh instance
    mesh = bpy.context.object.data
    bm_inst = bmesh.new()
    bm_inst.from_mesh(mesh)

    # find largest z value for our vertices
    bmesh_x_min = bm_inst.verts.co.x
    bmesh_y_min = bm_inst.verts.co.y
    bmesh_z_max = bm_inst.verts.co.z
    for v in bm.verts:
        if v.co.x < bmesh_x_min:
            bmesh_x_min = v.co.x

        if v.co.y < bmesh_y_min:
            bmesh_y_min = v.co.y

        if v.co.z > bmesh_z_max:
            bmesh_z_max = v.co.z
    vcreator = define_vertex_creator(bmesh_z_max, bmesh)
    draw_plane_subdivisions(bmesh_x_min, bmesh_y_min, vcreator)
