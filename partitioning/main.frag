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
    const float MAX_LEN = 0.1;
    const float MIN_LEN = 0.08;
    const int N_COLS = 5;

    int N_ROWS = int(floor(1.0/MAX_LEN));
    vec2 corners[66]; // N_ROWS+1 * N_COLS+1 -- must be updated if these change!

    // 2D prototype
    vec2 coord = gl_FragCoord.xy/u_resolution;

    // main logic
    const float ADJUST = 0.0001;
    const float TOLERANCE = 0.001;
    float COL_WIDTH = 1.0/float(N_COLS);

    // sector corresponds to number of rows/columns in
    float h_offset = (mod(floor(coord.y*MAX_LEN*100),2)/2.0)*COL_WIDTH;
    int h_sector = int(floor(((coord.x+h_offset)+ADJUST)/COL_WIDTH));
    int v_sector = int(floor((coord.y+ADJUST)/MAX_LEN));

    float alpha = 0.0;
    float r = 0.0;
    float g = 0.0;
    float b = 0.0;
    // draw verticals
    if (values_match((h_sector*COL_WIDTH) + h_offset,
                     coord.x, TOLERANCE)) {
        alpha = 1.0;
    }
    // draw horizontals
    if (values_match(v_sector*MAX_LEN, coord.y, TOLERANCE)) {
        alpha = 1.0;
    }
    // draw verticals
    if ((values_match((floor((coord.x+ADJUST)/COL_WIDTH)*COL_WIDTH) + h_offset,
                      coord.x, TOLERANCE) &&
         values_match((floor((coord.y+ADJUST)/MAX_LEN)*MAX_LEN),
                      coord.y, TOLERANCE))) {
        g = 0.0;
    }

    float placeholder;
    int i, j, k;
    float x, y;
    float y_offset;
    for (i=0; i<=N_ROWS; i++) {
        y = float(i) * MAX_LEN;
        y_offset = (mod(floor(y*MAX_LEN*100),2)/2.0)*COL_WIDTH;
        // array writing
        if (y_offset != 0.0) {
            //corners[arr2d_index(i, 0, N_ROWS+1)] = vec2(0.0, y);
            //corners[arr2d_index(i, N_COLS, N_ROWS+1)] = vec2(1.0, y);
        }
        // highlighting
        if (h_offset != 0.0) {
            // float corners[];
            // arr2d_index(int row, int col, int colsize)
            if (vectors_match(coord, vec2(0.0, y), TOLERANCE*10)) {
                g = 1.0;
            } else if (vectors_match(coord, vec2(1.0, y), TOLERANCE*10)) {
                g = 1.0;
            }
        }
        for (j=0; j<=N_COLS; j++) {
            x = (j*COL_WIDTH) + h_offset;
            // write anchor point
            corners[arr2d_index(i, j, N_ROWS+1)] = vec2(x, y);
            if (vectors_match(coord, vec2(x, y), TOLERANCE*10)) {
                g = 1.0;
            }
        }
    }
    //int h_sector = int(floor((coord.x+ADJUST)/COL_WIDTH));
    //int v_sector = int(floor((coord.y+ADJUST)/MAX_LEN));
    if (int(mod(h_sector, 2.0)) == 0) {
        b += 0.5;
    }
    if (int(mod(v_sector, 2.0)) == 0) {
        b += 0.5;
    }
    //if (vectors_match(coord, corners[arr2d_index(h_sector, 1, N_ROWS+1)],
    //                  TOLERANCE*100)) {
    //    b = 1.0;
    //}

    r = rand(coord);

    //gl_FragColor = vec4(coord.x, 0.0, coord.y, 1.0);
    gl_FragColor = vec4(r, 0.0, b, 1.0);
    //gl_FragColor = vec4(r, g, b, alpha);
}
