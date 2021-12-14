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

float get_pixel_height (float pyramid_height, float pyramid_width, vec2 coord) {
    float diagonal = pyramid_height/(2*pyramid_width);
    float sector_x = mod(coord.x, pyramid_width);
    float sector_y = mod(coord.y, pyramid_height);
    float height = 0.0;

    // bottom fourth
    if (sector_y < pyramid_height/4) {
        // left side
        if (sector_x < pyramid_width/2) {
            if (sector_y < diagonal*sector_x) {
                height = sector_y / (pyramid_height/4);
            } else {
                height = sector_x / (pyramid_width/2);
            }
        // right side
        } else {
            float adjusted_x = (sector_x-(pyramid_width/2));
            if (sector_y < (diagonal*adjusted_x*-1)+(pyramid_height/4)) {
                height = sector_y / (pyramid_height/4);
            } else {
                height = ((adjusted_x*-1)/(pyramid_width/2)) + 1.0;
            }
        }
    // middle section
    } else if ((sector_y > pyramid_height/4) && sector_y < 3*pyramid_height/4) {
        //height = 0.75;
        if (sector_x < pyramid_width/2) {
            height = sector_x / (pyramid_width/2);
        } else {
            float adjusted_x = (sector_x-(pyramid_width/2));
            height = ((adjusted_x*-1)/(pyramid_width/2)) + 1.0;
        }
    // top fourth
    } else {
        // left side
        if (sector_x < pyramid_width/2) {
            if (sector_y > (diagonal*sector_x*-1) + pyramid_height) {
                float adjusted_y = (sector_y-(3*pyramid_height/4));
                height = ((adjusted_y*-1)/(pyramid_height/4)) + 1.0;
            } else {
                height = sector_x / (pyramid_width/2);
            }
        // right side
        } else {
            float adjusted_x = (sector_x-(pyramid_width/2));
            if (sector_y > (diagonal*adjusted_x)+(3*pyramid_height/4)) {
                float adjusted_y = (sector_y-(3*pyramid_height/4));
                height = ((adjusted_y*-1)/(pyramid_height/4)) + 1.0;
            } else {
                height = ((adjusted_x*-1)/(pyramid_width/2)) + 1.0;
            }
        }
    }
    return height;
}

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
        vec2 coord = v_position.zx;
        // I lifted these values straight from the OBJ mesh data, don't know if
        // there's a 'cleaner' way to do this but hey, it works.
        coord.x += 6.053;
        coord.y += 6.1318;
        coord.x /= 6.053 + 6.051;
        coord.y /= 6.13 + 6.002;

        // these determine the rendering behavior
        const float ROW_HEIGHT = 0.1;
        const float MIN_LEN = 0.08;
        const int N_COLS = 5;
        const float ADJUST = 0.0001;
        const float TOLERANCE = 0.001;
        float COL_WIDTH = 1.0/float(N_COLS);
        int N_ROWS = int(floor(1.0/ROW_HEIGHT));

        // sector corresponds to number of rows/columns in
        float h_offset = (mod(floor(coord.y*ROW_HEIGHT*100),2)/2.0)*COL_WIDTH;
        int h_sector = int(floor(((coord.x+h_offset)+ADJUST)/COL_WIDTH));
        int v_sector = int(floor((coord.y+ADJUST)/ROW_HEIGHT));

        // procedurally get anchor point
        float pyramid_width;
        float center_shift;
        if (h_offset != 0.0 && (h_sector == 0 || h_sector == N_COLS) ) {
            pyramid_width = COL_WIDTH/2;
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

        vec2 anchor = vec2((h_sector*COL_WIDTH)+(pyramid_width/2)-center_shift,
                            v_sector*ROW_HEIGHT + ROW_HEIGHT/2);
        float sector_x = mod(coord.x, COL_WIDTH);
        float sector_y = mod(coord.y, ROW_HEIGHT);
        float diagonal = ROW_HEIGHT/(2*COL_WIDTH);
        float height;
        float shifted_time = rand(anchor) * u_time;
        float t_seed = mod(shifted_time, 2.0);
        if (t_seed > 1.0 ) {
            t_seed = 2.0-t_seed;
        }
        if (h_offset == 0.0 || h_sector == 0 || h_sector == N_COLS) {
            height = get_pixel_height(ROW_HEIGHT, pyramid_width, coord);
        } else {
            height = get_pixel_height(ROW_HEIGHT, pyramid_width, vec2(coord.x+h_offset, coord.y));
        }
        //v_position.y += rand(coord) * 10 * t_seed;
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
