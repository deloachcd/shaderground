#ifdef GL_ES
precision mediump float;
#endif

uniform float    u_time;
uniform vec4     u_date;

uniform mat4 u_modelViewProjectionMatrix;

attribute vec4   a_position;
varying vec4     v_position;

#ifdef MODEL_VERTEX_NORMAL
attribute vec3   a_normal;
varying vec3     v_normal;
#endif

float rand(vec2 co) {
    // generate a random value based on the seconds in the day that have
    // passed when loading the shader
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * (u_date.z * 3674.2));
}

void main(void) {
    v_position = a_position;

#ifdef MODEL_VERTEX_NORMAL
    v_normal = a_normal;
    if (v_normal == vec3(0.0, 1.0, 0.0)) {
        // vertex on top plane - this is where we get to work

        // 'coord' allows us to interface with the top of our mesh as a 2D canvas
        // with normallized coordinates
        vec2 coord = v_position.xz;
        // I lifted these values straight from the OBJ mesh data, don't know if
        // there's a 'cleaner' way to do this but hey, it works.
        coord.x += 6.053;
        coord.y += 6.1318;
        coord.x /= 6.053 + 6.051;
        coord.y /= 6.13 + 6.002;

        // these determine the rendering behavior
        const float ROW_HEIGHT = 0.1;
        const int N_COLS = 5;
        const float ADJUST = 0.0001;
        const float TOLERANCE = 0.001;
        float COL_WIDTH = 1.0/float(N_COLS);
        int N_ROWS = int(floor(1.0/ROW_HEIGHT));

        // sector corresponds to number of rows/columns in
        float h_offset = (mod(floor(coord.y*ROW_HEIGHT*100.0),2.0)/2.0)*COL_WIDTH;
        int h_sector = int(floor(((coord.x+h_offset)+ADJUST)/COL_WIDTH));
        int v_sector = int(floor((coord.y+ADJUST)/ROW_HEIGHT));

        // procedurally get anchor point
        float pyramid_width;
        float center_shift;
        if (h_offset != 0.0 && (h_sector == 0 || h_sector == N_COLS) ) {
            pyramid_width = COL_WIDTH/2.0;
            if (h_sector == 0) {
                center_shift = 0.0;
            } else {
                center_shift = h_offset;
            }
        } else {
            pyramid_width = COL_WIDTH;
            if (h_offset == 0.0) {
                center_shift = 0.0;
            } else {
                center_shift = h_offset;
            }
        }

        vec2 anchor = vec2((float(h_sector)*COL_WIDTH)+(pyramid_width/2.0)-center_shift,
                            float(v_sector)*ROW_HEIGHT + ROW_HEIGHT/2.0);
        float sector_x = mod(coord.x, COL_WIDTH);
        float sector_y = mod(coord.y, ROW_HEIGHT);
        float height = 0.0;
        float shifted_time = rand(anchor) * u_time;
        float t_seed = mod(shifted_time, 2.0);
        if (t_seed > 1.0) {
            t_seed = 2.0-t_seed;
        }
        if (!(mod(coord.y, ROW_HEIGHT) < 0.01)) {
            height = 1.0;
        }
        if (distance(coord, vec2(coord.x, 0.0)) > 0.01 &&
                distance(coord, vec2(coord.x, 1.0)) > 0.01 &&
                distance(coord, vec2(0.0, coord.y)) > 0.01 &&
                distance(coord, vec2(1.0, coord.y)) > 0.01) {
            v_position.y += t_seed * height;
        }
    }
#endif

    gl_Position = u_modelViewProjectionMatrix * v_position;
}
