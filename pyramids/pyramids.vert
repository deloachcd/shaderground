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

const int LEFT_SECTOR = 0;
const int BOTTOM_SECTOR = 1;
const int RIGHT_SECTOR = 2;
const int TOP_SECTOR = 3;
const int X_AXIS = 0;
const int Z_AXIS = 1;

float rand(vec2 co) {
    // generate a random value based on the seconds in the day that have
    // passed when loading the shader
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * (u_date.z * 3674.2));
}

float get_theta(float axis_val, float height) {
    return asin(axis_val * sqrt((axis_val*axis_val)+(height*height)));
}

vec3 rotate_vector(vec3 vector, float theta, int axis) {
    mat3 matrix;
    if (axis == X_AXIS) {
        matrix = mat3(1.0,         0.0,         0.0,
                      0.0,  cos(theta), -sin(theta),
                      0.0,  sin(theta),  cos(theta));
    } else if (axis == Z_AXIS) {
        matrix = mat3(cos(theta), -sin(theta), 0.0,
                      sin(theta),  cos(theta), 0.0,
                             0.0,         0.0, 1.0);
    } else {
        // you shouldn't get here, so just return identity matrix
        matrix = mat3(1.0);
    }
    return matrix * vector;
}

vec3 get_vertex_normal(float pyramid_height, float pyramid_width, vec2 coord) {
    float diagonal = pyramid_height/(2.0*pyramid_width);
    float sector_x = mod(coord.x, pyramid_width);
    float sector_y = mod(coord.y, pyramid_height);
    float height = 0.0;
    int sector;
    int rotation_axis;
    float sign_theta;
    float axis_value;

    const int LEFT_SECTOR = 0;
    const int BOTTOM_SECTOR = 1;
    const int RIGHT_SECTOR = 2;
    const int TOP_SECTOR = 3;
    const int X_AXIS = 0;
    const int Z_AXIS = 1;
    // bottom fourth
    if (sector_y < pyramid_height/4.0) {
        // left side
        if (sector_x < pyramid_width/2.0) {
            if (sector_y < diagonal*sector_x) {
                height = sector_y / (pyramid_height/4.0);
                sector = BOTTOM_SECTOR;
            } else {
                height = sector_x / (pyramid_width/2.0);
                sector = LEFT_SECTOR;
            }
        // right side
        } else {
            float adjusted_x = (sector_x-(pyramid_width/2.0));
            if (sector_y < (diagonal*adjusted_x*-1.0)+(pyramid_height/4.0)) {
                height = sector_y / (pyramid_height/4.0);
                sector = BOTTOM_SECTOR;
            } else {
                height = ((adjusted_x*-1.0)/(pyramid_width/2.0)) + 1.0;
                sector = RIGHT_SECTOR;
            }
        }
    // middle section
    } else if ((sector_y > pyramid_height/4.0) && sector_y < 3.0*pyramid_height/4.0) {
        //height = 0.75;
        if (sector_x < pyramid_width/2.0) {
            height = sector_x / (pyramid_width/2.0);
            sector = LEFT_SECTOR;
        } else {
            float adjusted_x = (sector_x-(pyramid_width/2.0));
            height = ((adjusted_x*-1.0)/(pyramid_width/2.0)) + 1.0;
            sector = RIGHT_SECTOR;
        }
    // top fourth
    } else {
        // left side
        if (sector_x < pyramid_width/2.0) {
            if (sector_y > (diagonal*sector_x*-1.0) + pyramid_height) {
                float adjusted_y = (sector_y-(3.0*pyramid_height/4.0));
                height = ((adjusted_y*-1.0)/(pyramid_height/4.0)) + 1.0;
                sector = TOP_SECTOR;
            } else {
                height = sector_x / (pyramid_width/2.0);
                sector = LEFT_SECTOR;
            }
        // right side
        } else {
            float adjusted_x = (sector_x-(pyramid_width/2.0));
            if (sector_y > (diagonal*adjusted_x)+(3.0*pyramid_height/4.0)) {
                float adjusted_y = (sector_y-(3.0*pyramid_height/4.0));
                height = ((adjusted_y*-1.0)/(pyramid_height/4.0)) + 1.0;
                sector = TOP_SECTOR;
            } else {
                height = ((adjusted_x*-1.0)/(pyramid_width/2.0)) + 1.0;
                sector = RIGHT_SECTOR;
            }
        }
    }

    if (sector == LEFT_SECTOR) {
        rotation_axis = Z_AXIS;
        sign_theta = 1.0;
        axis_value = sector_x;
    } else if (sector == BOTTOM_SECTOR) {
        rotation_axis = X_AXIS;
        sign_theta = -1.0;
        axis_value = sector_y;
    } else if (sector == RIGHT_SECTOR) {
        rotation_axis = Z_AXIS;
        sign_theta = -1.0;
        axis_value = sector_x;
    } else if (sector == TOP_SECTOR) {
        rotation_axis = X_AXIS;
        sign_theta = 1.0;
        axis_value = sector_y;
    }
    float theta;
    // correct value of theta, computed through hypotenuse value + law of sines
    //theta = sign_theta * asin(axis_value * sqrt((height*height) + (axis_value*axis_value)));
    // cheaper approximation of theta that might be good enough
    theta = sign_theta * asin((axis_value*axis_value) + (0.5*axis_value*height));

    vec3 normal;
    if (sector == LEFT_SECTOR) {
        normal = vec3(-1.0, 0.0, 0.0);
    } else if (sector == BOTTOM_SECTOR) {
        normal = vec3(0.0, 0.0, -1.0);
    } else if (sector == RIGHT_SECTOR) {
        normal = vec3(1.0, 0.0, 0.0);
    } else if (sector == TOP_SECTOR) {
        normal = vec3(0.0, 0.0, 1.0);
    }

    // compute normal vector from theta
    //normal = rotate_vector(vec3(0.0, 1.0, 0.0), theta + 1.0, rotation_axis);

    return normal;
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
        //coord.x += 6.053;
        coord.x += 6.0919;
        coord.y += 6.0919;
        // TODO figure out what's going on here
        //coord.x /= 12.1838;
        //coord.y /= 12.1838;
        coord.x /= 12.104;
        coord.y /= 12.104;

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
        //v_normal = get_vertex_normal(ROW_HEIGHT, pyramid_width, coord);
        v_normal = vec3(0.0, rand(coord.yx), rand(coord.xy));

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
