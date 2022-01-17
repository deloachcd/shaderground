#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_date;


float rand(vec2 co) {
    // generate a random value based on the seconds in the day that have
    // passed when loading the shader
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * (u_date.z * 3674.2));
}

bool values_match(float v1, float v2, float tolerance) {
    return v1 < v2 + tolerance && v1 > v2 - tolerance;
}

bool vectors_match(vec2 v1, vec2 v2, float tolerance) {
    return v1.x < v2.x + tolerance && v1.x > v2.x - tolerance &&
                v1.y < v2.y + tolerance && v1.y > v2.y - tolerance;
}

int arr2d_index(int row, int col, int colsize) {
    return (colsize * row) + col;
}

void main() {
    // constants for generating grid
    const float ROW_HEIGHT = 0.1;
    const float MIN_LEN = 0.08;
    const int N_COLS = 5;

    int N_ROWS = int(floor(1.0/ROW_HEIGHT));
    vec2 anchors[66]; // N_ROWS+1 * N_COLS+1 -- must be updated if these change!

    // 2D prototype
    vec2 coord = gl_FragCoord.xy/u_resolution;

    // main logic
    const float ADJUST = 0.0001;
    const float TOLERANCE = 0.001;
    float COL_WIDTH = 1.0/float(N_COLS);

    // sector corresponds to number of rows/columns in
    float h_offset = (mod(floor(coord.y*ROW_HEIGHT*100.0),2.0)/2.0)*COL_WIDTH;
    int h_sector = int(floor(((coord.x+h_offset)+ADJUST)/COL_WIDTH));
    int v_sector = int(floor((coord.y+ADJUST)/ROW_HEIGHT));

    float alpha = 0.0;
    float r = 0.0;
    float g = 0.0;
    float b = 0.0;
    // draw verticals
    if (values_match((float(h_sector)*COL_WIDTH) + h_offset,
                     coord.x, TOLERANCE)) {
        alpha = 1.0;
    }
    // draw horizontals
    if (values_match(float(v_sector)*ROW_HEIGHT, coord.y, TOLERANCE)) {
        alpha = 1.0;
    }

    float placeholder;
    int i, j, k;
    float x, y;
    float pt_offset;
    float x_adj, y_adj;
    for (i=0; i<=N_ROWS; i++) {
        y = float(i) * ROW_HEIGHT;
        pt_offset = (mod(floor(y*ROW_HEIGHT*100.0),2.0)/2.0)*COL_WIDTH;
        for (j=0; j<=N_COLS; j++) {
            x = (float(j)*COL_WIDTH) + pt_offset;
            x_adj = COL_WIDTH/2.0;
            y_adj = ROW_HEIGHT/2.0;
            if (pt_offset == 0.0) {
                anchors[arr2d_index(j, i, N_ROWS+1)] = vec2(x + x_adj, y + y_adj);
            } else {
                if (j == 0) {
                    x_adj = COL_WIDTH/4.0;
                } else if (j == N_COLS) {
                    x_adj = (3.0/4.0)*COL_WIDTH;
                } else {
                    x_adj = COL_WIDTH/2.0;
                }
                y_adj = ROW_HEIGHT/2.0;
                anchors[arr2d_index(j, i, N_ROWS+1)] = vec2(x - x_adj, y + y_adj);
            }
        }
    }

    // sector marking
    if (int(mod(float(h_sector), 2.0)) == 0) {
        b += 0.5;
    }
    if (int(mod(float(v_sector), 2.0)) == 0) {
        b += 0.5;
    }

    // green channel highlighting
    vec2 anchor = anchors[arr2d_index(h_sector, v_sector, N_ROWS+1)]; // center of sector
    //if (vectors_match(coord, anchor, TOLERANCE*5.0)) {
    //    g = 1.0;
    //}
    float sector_x = mod(coord.x, COL_WIDTH);
    float sector_y = mod(coord.y, ROW_HEIGHT);
    float diagonal = ROW_HEIGHT/(2.0*COL_WIDTH);
    float sector_sign;
    // bottom fourth
    if (sector_y < ROW_HEIGHT/4.0) {
        // left side
        if (sector_x < COL_WIDTH/2.0) {
            if (sector_y < diagonal*sector_x) {
                g = 0.5;
            }
        // right side
        } else {
            float adjusted_x = (sector_x-(COL_WIDTH/2.0));
            if (sector_y < (diagonal*adjusted_x*-1.0)+(ROW_HEIGHT/4.0)) {
                g = 0.5;
            }
        }
    // middle section
    } else if ((sector_y > ROW_HEIGHT/4.0) && sector_y < 3.0*ROW_HEIGHT/4.0) {
        //g = 0.75;
    // top fourth
    } else {
        // left side
        if (sector_x < COL_WIDTH/2.0) {
            if (sector_y > (diagonal*sector_x*-1.0) + ROW_HEIGHT) {
                g = 0.5;
            }
        // right side
        } else {
            float adjusted_x = (sector_x-(COL_WIDTH/2.0));
            if (sector_y > (diagonal*adjusted_x)+(3.0*ROW_HEIGHT/4.0)) {
                g = 0.5;
            }
        }
    }

    r = 0.25;rand(coord);

    //gl_FragColor = vec4(mod(coord.x*u_time, 1.0), 0.0, coord.y, alpha);
    //gl_FragColor = vec4(r, g, b, alpha);
    gl_FragColor = vec4(r, g, b, 1.0);
}
