#ifdef GL_ES
precision mediump float;
#endif

uniform vec3  u_light;
uniform vec2  u_resolution;
uniform float u_time;
uniform vec4  u_date;

varying vec4 v_position;

#ifdef MODEL_VERTEX_NORMAL
varying vec3    v_normal;
#endif

float rand(vec2 co) {
    // generate a random value based on the seconds in the day that have
    // passed when loading the shader
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * (u_date.z * 3674.2));
}

vec2 get_pixel_vector(float pyramid_height, float pyramid_width, vec2 coord) {
    float diagonal = pyramid_height/(2.0*pyramid_width);
    float sector_x = mod(coord.x, pyramid_width);
    float sector_y = mod(coord.y, pyramid_height);
    float height = 0.0;
    int sector;

    const int LEFT_SECTOR = 0;
    const int BOTTOM_SECTOR = 1;
    const int RIGHT_SECTOR = 2;
    const int TOP_SECTOR = 3;
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
    return vec2(float(sector), height);
}

int get_pixel_sector(float pyramid_height, float pyramid_width, vec2 coord) {
    float diagonal = pyramid_height/(2.0*pyramid_width);
    float sector_x = mod(coord.x, pyramid_width);
    float sector_y = mod(coord.y, pyramid_height);
    float height = 0.0;

    int sector;
    const int LEFT_SECTOR = 0;
    const int BOTTOM_SECTOR = 1;
    const int RIGHT_SECTOR = 2;
    const int TOP_SECTOR = 3;
    // bottom fourth
    if (sector_y < pyramid_height/4.0) {
        // left side
        if (sector_x < pyramid_width/2.0) {
            if (sector_y < diagonal*sector_x) {
                //height = sector_y / (pyramid_height/4.0);
                sector = BOTTOM_SECTOR;
            } else {
                //height = sector_x / (pyramid_width/2.0);
                sector = LEFT_SECTOR;
            }
        // right side
        } else {
            float adjusted_x = (sector_x-(pyramid_width/2.0));
            if (sector_y < (diagonal * adjusted_x * -1.0)+(pyramid_height/4.0)) {
                //height = sector_y / (pyramid_height/4.0);
                sector = BOTTOM_SECTOR;
            } else {
                //height = ((adjusted_x * -1.0)/(pyramid_width/2.0)) + 1.0;
                sector = RIGHT_SECTOR;
            }
        }
    // middle section
    } else if ((sector_y > pyramid_height/4.0) && sector_y < 3.0*pyramid_height/4.0) {
        if (sector_x < pyramid_width/2.0) {
            //height = sector_x / (pyramid_width/2.0);
            sector = LEFT_SECTOR;
        } else {
            //float adjusted_x = (sector_x-(pyramid_width/2.0));
            //height = ((adjusted_x * -1.0)/(pyramid_width/2.0)) + 1.0;
            sector = RIGHT_SECTOR;
        }
    // top fourth
    } else {
        // left side
        if (sector_x < pyramid_width/2.0) {
            if (sector_y > (diagonal * sector_x * -1.0) + pyramid_height) {
                //float adjusted_y = (sector_y-(3.0*pyramid_height/4.0));
                //height = ((adjusted_y * -1.0)/(pyramid_height/4.0)) + 1.0;
                sector = TOP_SECTOR;
            } else {
                //height = sector_x / (pyramid_width/2.0);
                sector = LEFT_SECTOR;
            }
        // right side
        } else {
            float adjusted_x = (sector_x-(pyramid_width/2.0));
            if (sector_y > (diagonal*adjusted_x)+(3.0*pyramid_height/4.0)) {
                //float adjusted_y = (sector_y-(3.0*pyramid_height/4.0));
                //height = ((adjusted_y * -1.0)/(pyramid_height/4.0)) + 1.0;
                sector = TOP_SECTOR;
            } else {
                //height = ((adjusted_x * -1.0)/(pyramid_width/2.0)) + 1.0;
                sector = RIGHT_SECTOR;
            }
        }
    }
    return sector;
}

void main(void) {
    vec3 color = vec3(0.0);

#ifdef MODEL_VERTEX_NORMAL
    vec3 n = normalize(v_normal);
    vec3 l = normalize(u_light);
    float diffuse; // = (dot(n, l) + 1.0 ) * 0.5;
#endif

#ifndef BACKGROUND
    color = vec3(1.0);
#ifdef MODEL_VERTEX_NORMAL
    if (v_normal == vec3(0.0, 1.0, 0.0)) {
        const float ROW_HEIGHT = 0.1;
        const int N_COLS = 5;
        const float ADJUST = 0.0001;
        const float TOLERANCE = 0.001;
        float COL_WIDTH = 1.0/float(N_COLS);
        int N_ROWS = int(floor(1.0/ROW_HEIGHT));

        // on top plane
        vec3 p = normalize(v_position.xyz);
        diffuse = (dot(p, l) + 1.0 ) * 0.5;
        vec2 coord = v_position.xz;
        // I lifted these values straight from the OBJ mesh data, don't know if
        // there's a 'cleaner' way to do this but hey, it works.
        coord.x += 6.0919;
        coord.y += 6.0919;
        coord.x /= 12.1838;
        coord.y /= 12.1838;
        // TODO: see if I can avoid having to do this!
        // matrix rotates coord by 180 degrees
        mat2 cheater = mat2(
            -1.0, 0.0,
             0.0, -1.0
        );
        coord *= cheater;

        float h_offset = (mod(floor(coord.y*ROW_HEIGHT*100.0),2.0)/2.0)*COL_WIDTH;
        int h_sector = int(abs(floor(((coord.x+h_offset)+ADJUST)/COL_WIDTH)));
        int v_sector = int(abs(floor((coord.y+ADJUST)/ROW_HEIGHT)));

        float pyramid_width;
        float center_shift;
        if (h_offset != 0.0 && (h_sector == 0 || h_sector == N_COLS)) {
            pyramid_width = COL_WIDTH/2.0;
            center_shift = h_offset;
        } else {
            pyramid_width = COL_WIDTH;
            center_shift = 0.0;
        }
        vec2 anchor = vec2((float(h_sector)*COL_WIDTH)+(pyramid_width/2.0)-center_shift,
                            float(v_sector)*ROW_HEIGHT + ROW_HEIGHT/2.0);

        float sector_x = mod(coord.x+center_shift, COL_WIDTH);
        float sector_y = mod(coord.y, ROW_HEIGHT);
        float diagonal = ROW_HEIGHT/(2.0*pyramid_width);
        float height;
        int sector;
        vec2 vector;
        vector = get_pixel_vector(ROW_HEIGHT, pyramid_width, vec2(coord.x+h_offset, coord.y));
        sector = int(vector.x);
        height = vector.y;

        const int LEFT_SECTOR = 0;
        const int BOTTOM_SECTOR = 1;
        const int RIGHT_SECTOR = 2;
        const int TOP_SECTOR = 3;

        if (sector == LEFT_SECTOR) {
            color = vec3(height, 0.0, 0.0);
        } else if (sector == BOTTOM_SECTOR) {
            color = vec3(height, height, 0.0);
        } else if (sector == RIGHT_SECTOR) {
            color = vec3(0.0, 0.0, height);
        } else if (sector == TOP_SECTOR){
            color = vec3(0.0, height, height);
        }

        //color = vec3(coord.x, coord.y, 0.0);
        diffuse = (dot(n, l) + 1.0 ) * 0.5;
    } else {
        diffuse = (dot(n, l) + 1.0 ) * 0.5;
    }
    color *= diffuse;
#endif
#endif

    gl_FragColor = vec4(color, 1.0);
}
